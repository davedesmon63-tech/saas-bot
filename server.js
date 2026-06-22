const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "./db.json";


// 🧠 INIT / LOAD DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}


// 💾 SAVE DB
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}


// =========================
// 🤖 CHAT BOT
// =========================
app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, count: 0 };
  }

  const user = db.users[userId];

  // 🔵 PRO MODE
  if (user.pro) {
    return res.json({
      reply: "🔥 PRO ACTIF : accès illimité aux idées business + stratégies avancées"
    });
  }

  // 🟢 FREE MODE (limité à 2 idées)
  if (message && (message.toLowerCase().includes("business") || message.toLowerCase().includes("idée"))) {

    user.count++;

    let reply = "";

    if (user.count === 1) {
      reply = `💡 Business :
Vendre des produits tendance sur TikTok

📈 Pourquoi ça marche :
- faible concurrence locale
- forte demande
- rapide à démarrer

💰 Revenu possible : 3000–15000 FCFA/jour`;
    } 
    else if (user.count === 2) {
      reply = `💡 Business :
Dropshipping de produits tendance

📈 Pourquoi ça marche :
- pas de stock
- facile à lancer
- forte demande

💰 Revenu possible : 5000–20000 FCFA/jour`;
    } 
    else {
      reply = "🚫 Limite atteinte. Passe PRO pour +50 idées business 💰";
    }

    saveDB(db);
    return res.json({ reply });
  }

  res.json({ reply: "💡 Demande une idée de business pour commencer" });
});


// =========================
// 📩 DEMANDE PAIEMENT
// =========================
app.post("/activate-request", (req, res) => {
  const { phone, userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, count: 0 };
  }

  db.users[userId].phone = phone;
  db.users[userId].pending = true;

  saveDB(db);

  console.log("💰 Nouvelle demande PRO :", phone);

  res.json({ success: true });
});


// =========================
// 🔓 ACTIVER PRO (ADMIN)
// =========================
app.post("/activate-pro", (req, res) => {
  const { userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: true, count: 0 };
  } else {
    db.users[userId].pro = true;
    db.users[userId].pending = false;
  }

  saveDB(db);

  res.json({ success: true });
});


// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SaaS STARTUP RUNNING ON PORT", PORT);
});