// ==============================
// 🚀 VORAX AI - FREE / PRO SYSTEM
// ==============================

process.on("uncaughtException", (err) => console.log("🔥 ERROR:", err));
process.on("unhandledRejection", (err) => console.log("🔥 PROMISE ERROR:", err));

const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();

/* ======================
   CONFIG
====================== */

const FREE_LIMIT = 5;

/* ======================
   SECURITY
====================== */

app.use(rateLimit({ windowMs: 60 * 1000, max: 30 }));
app.use(express.json());

app.use(session({
  secret: "vorax-saas-pro-mode",
  resave: false,
  saveUninitialized: false
}));

/* ======================
   DB SAFE
====================== */

function dbLoad() {
  if (!fs.existsSync("db.json")) {
    fs.writeFileSync("db.json", JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync("db.json"));
}

function dbSave(db) {
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
}

/* ======================
   AUTH
====================== */

app.post("/register", async (req, res) => {
  const { userId, password } = req.body;

  const db = dbLoad();

  if (db.users[userId]) return res.json({ error: "Existe déjà" });

  db.users[userId] = {
    password: await bcrypt.hash(password, 10),
    pro: false,
    messages: 0
  };

  dbSave(db);
  res.json({ success: true });
});

app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) return res.json({ error: "Introuvable" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ error: "Mot de passe incorrect" });

  req.session.userId = userId;

  res.json({
    success: true,
    userId,
    pro: user.pro
  });
});

/* ======================
   💎 FREE vs PRO CHECK
====================== */

function isPro(user) {
  return user.pro === true;
}

/* ======================
   💡 BUSINESS IDEAS
====================== */

const ideas = [
  {
    title: "💡 Dropshipping",
    steps: ["1️⃣ Produit viral", "2️⃣ Shopify store", "3️⃣ TikTok ads"],
    example: "Tu achètes un produit 5€ et tu le vends 20€ via TikTok ads."
  },
  {
    title: "💡 Freelance IA",
    steps: ["1️⃣ ChatGPT + Canva", "2️⃣ Services logos/textes", "3️⃣ Clients WhatsApp"],
    example: "Tu fais 10 logos à 5€ = 50€ par jour facilement."
  },
  {
    title: "💡 SaaS",
    steps: ["1️⃣ Petit outil web", "2️⃣ Abonnement", "3️⃣ Marketing TikTok"],
    example: "100 clients à 10€ = 1000€/mois automatisé."
  },
  {
    title: "💡 TikTok Business",
    steps: ["1️⃣ Niche", "2️⃣ Vidéos virales", "3️⃣ Monétisation liens"],
    example: "100k vues/jour = affiliation + ventes automatiques."
  }
];

/* ======================
   CHAT ENGINE (FREE + PRO MODE)
====================== */

app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) return res.json({ reply: "❌ Login requis" });

  // 🆓 FREE MODE LIMIT
  if (!isPro(user) && user.messages >= FREE_LIMIT) {
    return res.json({
      mode: "FREE",
      reply: "🚫 Limite atteinte. Passe PRO pour débloquer le mode premium 💎"
    });
  }

  user.messages++;

  const idea = ideas[Math.floor(Math.random() * ideas.length)];

  dbSave(db);

  return res.json({
    mode: user.pro ? "PRO" : "FREE",

    reply:
      (user.pro ? "💎 PRO MODE ACTIVE\n\n" : "🆓 FREE MODE\n\n") +
      idea.title +
      "\n\n📌 PLAN:\n" +
      idea.steps.join("\n") +
      "\n\n💡 EXEMPLE:\n" +
      idea.example +
      "\n\n⚡ " +
      (user.pro
        ? "Accès illimité activé"
        : "Passe PRO pour débloquer plus d'idées"),

    meta: {
      messages: user.messages,
      pro: user.pro
    }
  });
});

/* ======================
   💳 UPGRADE (AUTO PRO ACTIVATION)
====================== */

app.post("/upgrade", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) {
    return res.json({ error: "Introuvable" });
  }

  // 💎 AUTO SWITCH TO PRO
  db.users[userId].pro = true;
  db.users[userId].messages = 0;

  dbSave(db);

  res.json({
    success: true,
    mode: "PRO",
    message: "💎 Abonnement activé → MODE PRO DÉBLOQUÉ AUTOMATIQUEMENT"
  });
});

/* ======================
   PAYMENT HOOK SIMPLIFIED
====================== */

app.post("/pay-success", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (db.users[userId]) {
    db.users[userId].pro = true;
    db.users[userId].messages = 0;
    dbSave(db);
  }

  res.json({
    success: true,
    message: "💎 Paiement confirmé → PRO ACTIVÉ"
  });
});

/* ======================
   HEALTH
====================== */

app.get("/", (req, res) => {
  res.send("🚀 VORAX AI FREE/PRO SYSTEM RUNNING");
});

/* ======================
   START
====================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 VORAX FREE/PRO READY ON", PORT);
});