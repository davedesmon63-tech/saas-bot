require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB ✅ Connecté'))
  .catch(err => console.log('MONGO ERREUR:', err.message));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const sock = makeWASocket({ auth: state, printQRInTerminal: false });
  
  sock.ev.on('connection.update', (update) => {
    const { qr } = update;
    if (qr) {
      QRCode.generate(qr, { small: true });
    }
  });
  
  sock.ev.on('creds.update', saveCreds);
}

startBot();

app.get('/', (req, res) => res.send('VORAX SAAS OK'));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));