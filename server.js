const express = require("express");
const fs = require("fs");

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
// 💬 CHAT (CORRIGÉ)
// =========================
app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase().trim();

  // 🔥 IMPORTANT : userId obligatoire
  const userId = req.body.userId;

  if (!userId) {
    return res.json({ reply: "❌ Connecte-toi d'abord" });
  }

  const db = loadDB();

  if (!db.users[userId]) {
    return res.json({ reply: "❌ Utilisateur introuvable" });
  }

  const user = db.users[userId];

  // 🔵 PRO MODE
  if (user.pro) {
    const ideas = [
      "💡 TikTok boutique automatisée",
      "💡 WhatsApp Business service",
      "💡 Montage vidéo TikTok",
      "💡 Dropshipping produits tendance",
      "💡 Création CV professionnels",
      "💡 Marketing digital freelance",
      "💡 Affiliation produits viraux",
      "💡 Mini agence TikTok",
      "💡 Vente de services digitaux",
      "💡 E-commerce WhatsApp"
    ];

    const idea = ideas[Math.floor(Math.random() * ideas.length)];

    return res.json({
      reply: "🔥 PRO ACTIF\n\n" + idea
    });
  }

  // 🟢 FREE MODE
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
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVEUR LANCÉ SUR PORT", PORT);
});