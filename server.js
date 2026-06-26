import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import pkg from '@whiskeysockets/baileys';

dotenv.config();
const { default: makeWASocket, useMultiFileAuthState } = pkg;
const require = createRequire(import.meta.url);
const Paydunya = require('paydunya-nodejs');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const PRIX_PRO = 1500; // 🌚
const LIMITE_FREE = 5; // 5 requêtes total en free

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB ✅'));

const userSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  plan: { type: String, default: 'free' },
  requests: { type: Number, default: 0 }, // Compteur global Free
});
const User = mongoose.model('User', userSchema);

const paydunya = new Paydunya({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE
});

// 12 IDÉES PRO + 2 FREE
const commands = {
  menu: `👋 *VORAXDB BOT* | Plan: {plan}\n\n*🟢 GRATUIT:*\n!menu |!idée\n*🔥 PRO 1500F/MOIS:*\n!prompt!post!copy!bio!cv!cours!menu-resto!facture!contrat!logo!rdv!coach\nTape!pro pour débloquer tout.`,

  idee: `💡 *Idée du jour:* Vends des CV IA aux étudiants.\nPrompt: "Fais moi un CV moderne pour un étudiant en commerce"\n*Accompagnement:* Poste ça dans les groupes Ecole Sup. 2000F/CV.`,

  prompt: `📦 *10 Prompts Midjourney Niche Coiffure:*\n1. "logo salon afro moderne, gold, minimaliste"... \n*Accompagnement:* Vends le pack 10 prompts à 1000F sur WhatsApp.`,

  post: `📱 *3 Posts TikTok qui vendent:*\n1. HOOK: "Arrête de scroller si tu veux..." \n*Accompagnement:* Poste à 19h. 1/jour = 10k vues en 2 semaines.`,

  copy: `✍️ *Pub qui convertit:* \n"Tu vends mais personne n’achète? Copie ce texte: [TEXTE]"\n*Accompagnement:* Envoie ça aux vendeuses de pagnes.`,

  bio: `🔥 *Bio Insta qui vend:* \n"Je t’aide à | Résultat | 👇 Commande ici"\n*Accompagnement:* Mets ton lien Paydunya direct dans la bio.`,

  cv: `📄 *CV Pro généré.*\nColle tes infos ici: Nom, Poste, Exp... \n*Accompagnement:* Service 2000F. Cible les étudiants.`,

  cours: `📚 *Fiche Terminale Maths:* \nChapitre: Dérivées. Exo corrigé... \n*Accompagnement:* Vends l’abonnement 5000F/mois aux parents.`,

  'menu-resto': `🍲 *Menu Semaine Maquis:*\nLundi: Poulet... \n*Accompagnement:* Propose 5000F/mois aux maquis pour gérer leur com.`,

  facture: `🧾 *Modèle Facture PDF:*\n[Entreprise] [Montant]...\n*Accompagnement:* Vends à 500F aux commerçants du marché.`,

  contrat: `📑 *Contrat de Vente:* \nEntre M. et Mme... \n*Accompagnement:* Pack 10 contrats = 10k pour les freelances.`,

  logo: `🎨 *Prompt Logo IA:* \n"logo boutique cosmétique, rose gold, luxe"\n*Accompagnement:* Service 3000F/logo.`,

  rdv: `📅 *Répondeur Auto:* \n"Bonjour, je suis occupée. Je te réponds à 18h."\n*Accompagnement:* SAV auto pour coiffeuses 1500F/mois.`,

  coach: `🧠 *Coach IA ON:* \nDemande-moi: "Comment vendre plus?" \n*Accompagnement:* Le plus vendable. Les gens paient pour parler.`
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase().replace('!', '');

    let user = await User.findOne({ jid });
    if (!user) user = await User.create({ jid });

    // 1. COMMANDE PRO
    if (commands[text] && text!== 'menu' && text!== 'idee') {
      if (user.plan!== 'pro') {
        return sock.sendMessage(jid, { text: `❌ Commande PRO.\nPasse Pro ${PRIX_PRO}F/mois: Tape!pro` });
      }
      return sock.sendMessage(jid, { text: commands[text] });
    }

    // 2. COMMANDES FREE avec compteur
    if (text === 'menu' || text === 'idee') {
      if (user.plan === 'free' && user.requests >= LIMITE_FREE) {
        return sock.sendMessage(jid, { text: `❌ Limite Free: ${LIMITE_FREE} requêtes atteinte.\nTape!pro ${PRIX_PRO}F pour illimité.` });
      }
      user.requests += 1;
      await user.save();
      return sock.sendMessage(jid, { text: `${commands[text]}\n\n_Il te reste ${LIMITE_FREE - user.requests} requêtes Free._` });
    }

    // 3. PAIEMENT PRO
    if (text === 'pro') {
      const invoice = paydunya.createInvoice();
      invoice.addItem('Pass Pro VoraxDB', 1, PRIX_PRO, PRIX_PRO);
      invoice.setTotalAmount(PRIX_PRO);
      invoice.setDescription("Abonnement Pro 1 mois");
      invoice.return_url = 'https://google.com';
      invoice.custom_data = jid; // TRÈS IMPORTANT pour activer après paiement

      await invoice.create();
      await sock.sendMessage(jid, { text: `🔥 *PASS PRO ${PRIX_PRO}F/MOIS*\n12 outils IA + Accompagnement Business\nPaie ici: ${invoice.invoice_url}` });
    }
  });
}
startBot();

// 4. CALLBACK PAYDUNYA
app.post('/callback', async (req, res) => {
  const { custom_data, status } = req.body; // custom_data = jid
  if (status === 'completed') {
    await User.updateOne({ jid: custom_data }, { plan: 'pro', requests: 0 });
    console.log(`User ${custom_data} est passé Pro ✅`);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Serveur ${PORT}`));