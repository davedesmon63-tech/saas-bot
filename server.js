// 🔹 IMPORTS
const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();

// 🔑 CinetPay (REMPLACE PAR TES VRAIES CLÉS)
const CINETPAY_API_KEY = "TON_API_KEY";
const SITE_ID = "TON_SITE_ID";

// 🔐 SESSION
app.use(session({
  secret: "vorax-secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.json());
app.use(express.static("public"));

/* ======================
   DATABASE FUNCTIONS
====================== */
function loadDB() {
  return JSON.parse(fs.readFileSync("db.json"));
}

function saveDB(data) {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}

/* ======================
   PAYMENT ROUTES
====================== */

// 💳 1. Lancer paiement
app.post("/pay", async (req, res) => {
  const { userId } = req.body;

  const db = loadDB();
  const user = db.users[userId];

  if (!user) {
    return res.json({ error: "Utilisateur introuvable" });
  }

  const transactionId = "VORAX_" + Date.now();

  const data = {
    apikey: CINETPAY_API_KEY,
    site_id: SITE_ID,
    transaction_id: transactionId,
    amount: 5000,
    currency: "XOF",
    description: "Abonnement VORAX PRO",

    notify_url: "https://saas-bot-n7qk.onrender.com/notify",
    return_url: "https://saas-bot-n7qk.onrender.com/success",

    customer_name: userId,
    customer_email: userId
  };

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      data
    );

    res.json({
      payment_url: response.data.data.payment_url
    });

  } catch (err) {
    console.log(err.message);
    res.json({ error: "Erreur paiement" });
  }
});

// 🔥 2. CONFIRMATION PAIEMENT (WEBHOOK)
app.post("/notify", async (req, res) => {
  const { transaction_id } = req.body;

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment/check",
      {
        apikey: CINETPAY_API_KEY,
        site_id: SITE_ID,
        transaction_id: transaction_id
      }
    );

    const payment = response.data.data;

    if (payment.status === "ACCEPTED") {
      const db = loadDB();

      const userId = payment.customer_name;

      if (db.users[userId]) {
        db.users[userId].pro = true;
      }

      saveDB(db);

      console.log("✅ Paiement validé pour", userId);
    }

    res.send("OK");

  } catch (err) {
    console.log("❌ erreur notify", err.message);
    res.send("ERREUR");
  }
});

/* ======================
   AUTH ROUTES
====================== */

// REGISTER
app.post("/register", async (req, res) => {
  const { userId, password } = req.body;

  const db = loadDB();

  if (db.users[userId]) {
    return res.json({ error: "Utilisateur existe déjà" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.users[userId] = {
    password: hashedPassword,
    pro: false,
    count: 0,
    createdAt: new Date()
  };

  saveDB(db);

  res.json({ success: true });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  const db = loadDB();
  const user = db.users[userId];

  if (!user) {
    return res.json({ error: "Compte introuvable" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ error: "Mot de passe incorrect" });
  }

  req.session.userId = userId;

  res.json({
    success: true,
    userId,
    pro: user.pro
  });
});

// ME
app.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ logged: false });
  }

  const db = loadDB();
  const user = db.users[req.session.userId];

  res.json({
    logged: true,
    userId: req.session.userId,
    pro: user?.pro || false
  });
});

// DASHBOARD PROTECTION
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login.html");
  }

  res.sendFile(__dirname + "/public/dashboard.html");
});

/* ======================
   ADMIN / FEATURES
====================== */

// USERS LIST
app.get("/admin/users", (req, res) => {
  const db = loadDB();

  const users = Object.entries(db.users).map(([id, data]) => ({
    id,
    ...data
  }));

  res.json(users);
});

// UPGRADE MANUEL
app.post("/upgrade", (req, res) => {
  const { userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    return res.json({ error: "Utilisateur introuvable" });
  }

  db.users[userId].pro = true;

  saveDB(db);

  res.json({ success: true, message: "Premium activé 👑" });
});

// VIP CODE
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

  res.json({ success: true, message: "VIP activé" });
});

/* ======================
   CHAT (SAAS LOGIC)
====================== */

app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  if (!userId) {
    return res.json({ reply: "❌ Connecte-toi d'abord" });
  }

  const db = loadDB();
  const user = db.users[userId];

  if (!user) {
    return res.json({ reply: "❌ Utilisateur introuvable" });
  }

  // 👑 PREMIUM
  if (user.pro) {
    const ideas = [
      "💡 Dropshipping",
      "💡 Freelance IA",
      "💡 Marketing digital",
      "💡 Affiliation",
      "💡 TikTok business"
    ];

    const idea = ideas[Math.floor(Math.random() * ideas.length)];

    return res.json({
      reply: "🔥 PREMIUM\n\n" + idea
    });
  }

  // 🆓 FREE LIMIT
  user.count++;

  let reply = "";

  if (user.count === 1) {
    reply = "💡 Business TikTok";
  } else if (user.count === 2) {
    reply = "💡 Dropshipping";
  } else {
    reply = "🚫 Passe PRO 💰";
  }

  saveDB(db);

  res.json({ reply });
});

/* ======================
   START SERVER
====================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVEUR LANCÉ SUR PORT", PORT);
});