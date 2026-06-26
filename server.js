import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pkg from '@whiskeysockets/baileys';
import Paydunya from 'paydunya-nodejs';

dotenv.config();
const { default: makeWASocket, useMultiFileAuthState } = pkg;

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 10000;
const PRIX_PRO = 1500;
const LIMITE_FREE = 5;

// LIGNE REMPLACEE ICI 👇 POUR VOIR L'ERREUR
mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log('MongoDB ✅'))
 .catch(err => console.log('MONGO ERREUR:', err.message));

const userSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  plan: { type: String, default: 'free' },
  requests: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

const paydunya = new Paydunya({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE
});

const commands = {
  menu: `👋 *VORAXDB BOT* | Plan: {plan}\n\n*🟢 GRATUIT:*\n!menu |!idée\n*🔥 PRO 1500F/MOIS:*\n!prompt!post!copy!bio!cv!cours!menu-resto!facture!contrat!logo!rdv!coach\nTape!pro pour débloquer tout.`,
  idee: `💡 *Idée du jour:* Vends des CV IA aux étudiants.\nPrompt: "Fais moi un CV moderne"\n*Accompagnement:* 2000F/CV.`,
  prompt: `📦 *10 Prompts Midjourney Coiffure...*\n*Accompagnement:* Vends le pack 1000F.`,
  post: `📱 *3 Posts TikTok...*\n*Accompagnement:* Poste à 19h.`,
  copy: `✍️ *Pub qui convertit...*`,
  bio: `🔥 *Bio Insta qui vend...*`,
  cv: `📄 *CV Pro généré...*`,
  cours: `📚 *Fiche Terminale...*`,
  'menu-resto': `🍲 *Menu Semaine Maquis...*`,
  facture: `🧾 *Modèle Facture...*`,
  contrat: `📑 *Contrat de Vente...*`,
  logo: `🎨 *Prompt Logo IA...*`,
  rdv: `📅 *Répondeur Auto...*`,
  coach: `🧠 *Coach IA ON...*`
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

    if (commands[text] && text!== 'menu' && text!== 'idee') {
      if (user.plan!== 'pro') return sock.sendMessage(jid, { text: `❌ PRO. Tape!pro ${PRIX_PRO}F` });
      return sock.sendMessage(jid, { text: commands[text] });
    }
    if (text === 'menu' || text === 'idee') {
      if (user.plan === 'free' && user.requests >= LIMITE_FREE) return sock.sendMessage(jid, { text: `❌ Limite Free atteinte.` });
      user.requests += 1; await user.save();
      return sock.sendMessage(jid, { text: `${commands[text]}\n_Il te reste ${LIMITE_FREE - user.requests} requêtes._` });
    }
    if (text === 'pro') {
      const invoice = paydunya.createInvoice();
      invoice.addItem('Pass Pro', 1, PRIX_PRO, PRIX_PRO);
      invoice.setTotalAmount(PRIX_PRO);
      invoice.custom_data = jid;
      await invoice.create();
      await sock.sendMessage(jid, { text: `🔥 *PASS PRO ${PRIX_PRO}F*\nPaie ici: ${invoice.invoice_url}` });
    }
  });
}
startBot();

app.post('/callback', async (req, res) => {
  const { custom_data, status } = req.body;
  if (status === 'completed') {
    await User.updateOne({ jid: custom_data }, { plan: 'pro', requests: 0 });
  }
  res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 VORAX SAAS on port ${PORT}`));