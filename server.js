import express from 'express';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, qrcode } = pkg;
import QRCode from 'qrcode';

const app = express();
const PORT = process.env.PORT || 10000;

const users = new Map();
const ADMIN_NUMBER = '2250508017702@c.us'; // TOI = Le Boss
const PAYMENT_NUMBER = '+225 05 08 01 77 02'; // NUMERO POUR ENCAISSER

const FREE_IDEAS = [
  "*1. Vente de Jus Naturel en Bouteille* \nCoût: 15,000F \nBénéfice: 20,000F/mois \nCible: Bureaux, écoles.",
  "*2. Service Repassage à Domicile* \nCoût: 5,000F \nBénéfice: 35,000F/mois \nCible: Célibataires, travailleurs."
];

const PRO_IDEAS = [
  "*1. Food Business: Alloco + Poulet* \nCoût: 50,000F | Bénéfice: 150,000F/mois. \n*Accompagnement:* Liste 4 fournisseurs de poulet à Abidjan, modèle affiche Canva, script WhatsApp pour commandes.",
  "*2. Salon de Coiffure Mobile* \nCoût: 80,000F | Bénéfice: 200,000F/mois. \n*Accompagnement:* Pack matos de base, comment trouver clients via statut, grille tarifaire.",
  "*3. Importation Gadgets de Chine* \nCoût: 100,000F | Bénéfice: 300% \n*Accompagnement:* Lien Alibaba fiable, comment calculer douane, 3 produits qui marchent en CI.",
  "*4. Agence de Community Management* \nCoût: 0F | Bénéfice: 50,000F/client \n*Accompagnement:* Contrat type PDF, 10 idées de posts pour démarcher, tarifs 2026.",
  "*5. Formation Excel/Word à Domicile* \nCoût: 10,000F | Bénéfice: 100,000F/mois \n*Accompagnement:* Programme de cours 1 mois, où trouver étudiants, flyer.",
  "*6. Vente de Pagne et Accessoires en Ligne* \nCoût: 40,000F | Bénéfice: 120,000F/mois \n*Accompagnement:* 3 grossistes à Adjamé, légende TikTok qui vend.",
  "*7. Service de Livraison entre Amis* \nCoût: 20,000F | Bénéfice: 80,000F/mois \n*Accompagnement:* Comment gérer avec moto, app pour tracer, assurance.",
  "*8. Photographe Événementiel Débutant* \nCoût: 150,000F | Bénéfice: 250,000F/mois \n*Accompagnement:* Pack débutant appareil, comment choper mariages, devis type.",
  "*9. Marque de Savon Naturel* \nCoût: 25,000F | Bénéfice: 90,000F/mois \n*Accompagnement:* Recette de base, où acheter beurre karité, étiquette.",
  "*10. Espace de Travail/Co-working à domicile* \nCoût: 60,000F | Bénéfice: 150,000F/mois \n*Accompagnement:* Aménagement 2 pièces, comment louer aux étudiants.",
  "*11. Création de CV et Lettre de Motivation Pro* \nCoût: 0F | Bénéfice: 5,000F/CV \n*Accompagnement:* 20 modèles Canva, où poster pour avoir clients.",
  "*12. Business Plan + Pitch pour Financement* \nCoût: 0F | Bénéfice: 30,000F/dossier \n*Accompagnement:* Modèle Word, liste des 5 ONG qui financent jeunes."
];

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', async (qr) => {
    console.log('QR Code reçu. Scan-le avec WhatsApp.');
    const qrImg = await QRCode.toDataURL(qr);
    app.get('/qr', (req, res) => res.send(`<img src="${qrImg}"/>`));
});

client.on('ready', () => console.log('WhatsApp ✅ Connecté'));

client.on('message', async msg => {
    const chatId = msg.from;
    const text = msg.body.toLowerCase();
    const userPlan = users.get(chatId) || 'free';

    if (text === 'menu') {
        let reply = `*VORAX SAAS* 🚀\n\n*Plan: ${userPlan.toUpperCase()}*\n\n`;
        if (userPlan === 'free') {
            reply += `*-- 2 IDÉES GRATUITES --*\n${FREE_IDEAS.join('\n\n')}\n\n`;
            reply += `*Débloque les 12 IDEES PRO + ACCOMPAGNEMENT pour 1500F/mois.*\nTape *pro*`;
        } else {
            reply += `*-- 12 IDÉES PREMIUM + ACCOMPAGNEMENT --*\n${PRO_IDEAS.join('\n\n')}`;
        }
        msg.reply(reply);
    }

    if (text === 'pro') {
        msg.reply(`*Mode PRO : 1500F / mois* \n\n1. Fais un dépôt au : ${PAYMENT_NUMBER}\n2. Envoie-moi la capture ici\n3. Je t'active manuellement en 2min ✅\n\nTu auras les 12 business + tout l'accompagnement.`);
    }

    if (chatId === ADMIN_NUMBER && text.startsWith('!pro ')) {
        const targetNumber = text.split(' ')[1] + '@c.us';
        users.set(targetNumber, 'pro');
        client.sendMessage(targetNumber, '✅ Tu es maintenant en mode PRO. Tape *menu* pour voir les 12 idées.');
        msg.reply(`Client ${targetNumber} activé en PRO.`);
    }
});

client.initialize();
app.get('/', (req, res) => res.send('VORAX SAAS OK'));
app.get('/qr', (req, res) => res.send('Scan le QR dans les Logs Render > Live tail'));
app.listen(PORT, () => console.log(`Server on ${PORT}`));