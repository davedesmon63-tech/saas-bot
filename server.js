import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import pkg from '@whiskeysockets/baileys';
import QRCode from 'qrcode-terminal';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

dotenv.config();
const { default: makeWASocket, useMultiFileAuthState } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;
const PRIX_PRO = 1500;
const LIMITE_FREE = 5;

// 1. Connexion MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB ✅ Connecté'))
  .catch(err => console.log('MONGO ERREUR:', err.message));

// 2. Schéma User
const userSchema = new mongoose.Schema({
  jid: { type: String, unique: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  ideas_used: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// 3. Lancement Bot WhatsApp
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const sock = makeWASocket({ auth: state, printQRInTerminal: false });

  sock.ev.on('connection.update', (update) => {
    const { qr, connection } = update;
    if (qr) QRCode.generate(qr, { small: true });
    if (connection === 'open') console.log('🚀 VORAX SAAS by Richmin ready on port', PORT);
  });

  sock.ev.on('creds.update', saveCreds);
}

startBot();

// 4. Route test
app.get('/', (req, res) => res.send('VORAX SAAS OK'));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));