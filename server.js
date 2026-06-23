 const express = require("express"); 
 const fs = require("fs");const axios =    require("axios");

// 🔑 CinetPay (à remplir après inscription)
const API_KEY = "TON_API_KEY";
const SITE_ID = "TON_SITE_ID";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "./db.json";

// 📦 DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// =========================
// 🔐 REGISTER
// =========================
app.post("/register", (req, res) => {
  const { userId, password } = req.body;

  const db = loadDB();

  if (db.users[userId]) {
    return res.json({ error: "Utilisateur existe déjà" });
  }

  db.users[userId] = {
    password,
    pro: false,
    count: 0
  };

  saveDB(db);

  res.json({ success: true });
});

// =========================
// 🔑 LOGIN
// =========================
app.post("/login", (req, res) => {
  const { userId, password } = req.body;

  const db = loadDB();

  const user = db.users[userId];

  if (!user) {
    return res.json({ error: "Compte introuvable" });
  }

  if (user.password !== password) {
    return res.json({ error: "Mot de passe incorrect" });
  }

  res.json({
    success: true,
    userId,
    pro: user.pro
  });
});

// =========================
// 💳 UPGRADE PREMIUM (MANUEL)
// =========================
app.post("/upgrade", (req, res) => {
  const { userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    return res.json({ error: "Utilisateur introuvable" });
  }

  db.users[userId].pro = true;

  saveDB(db);

  res.json({ success: true, message: "🔥 Premium activé avec succès" });
});

// =========================
// 💳 VIP CODE (MONÉTISATION SIMPLE)
// =========================
app.post("/vip", (req, res) => {
  const { userId, code } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    return res.json({ error: "Utilisateur introuvable" });
  }

  if (code !== "VORAX-PRO-2026") {
    return res.json({ error: "Code invalide" });
  }

  db.users[userId].pro = true;

  saveDB(db);

  res.json({ success: true, message: "🔥 VIP activé" });
});

// =========================
// 💬 CHAT
// =========================
app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase().trim();
  const userId = req.body.userId;

  if (!userId) {
    return res.json({ reply: "❌ Connecte-toi d'abord" });
  }

  const db = loadDB();
  const user = db.users[userId];

  if (!user) {
    return res.json({ reply: "❌ Utilisateur introuvable" });
  }

  // 🔵 PREMIUM
  if (user.pro) {
    const ideas = [
      "💡 TikTok business automatisé",
      "💡 Dropshipping niche",
      "💡 Agence marketing digital",
      "💡 Service IA freelance",
      "💡 Vente de services WhatsApp",
      "💡 Affiliation produits",
      "💡 Création contenu viral",
      "💡 Freelance design",
      "💡 Business e-commerce",
      "💡 Automatisation business"
    ];

    const idea = ideas[Math.floor(Math.random() * ideas.length)];

    return res.json({
      reply: "🔥 PREMIUM ACTIF\n\n" + idea
    });
  }

  // 🟢 FREE
  if (message.includes("business") || message.includes("idée")) {
    user.count++;

    let reply = "";

    if (user.count === 1) {
      reply = "💡 TikTok business\n💰 3000–15000 FCFA/jour";
    } else if (user.count === 2) {
      reply = "💡 Dropshipping\n💰 5000–20000 FCFA/jour";
    } else {
      reply = "🚫 Limite atteinte. Passe PRO 💰";
    }

    saveDB(db);
    return res.json({ reply });
  }

  res.json({ reply: "💡 Demande une idée de business" });
});

// =========================
// 🚀 START
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVEUR LANCÉ SUR PORT", PORT);
});