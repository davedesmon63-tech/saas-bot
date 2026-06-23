// 🔹 IMPORTS
const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ======================
   DATABASE FUNCTIONS
====================== */
function loadDB() {
  return JSON.parse(fs.readFileSync("db.json"));
}

/* ======================
   AUTH ROUTES
====================== */
app.post("/login", (req, res) => {
  // login code
});
  /* ======================
   PAYMENT ROUTES
====================== */

// 💳 1. Lancer paiement
app.post("/pay", async (req, res) => {
  // ton code ici
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

      .premium = true;
      }

      fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

      console.log("✅ Paiement validé pour", userId);
    }

    res.send("OK");

  } catch (err) {
    console.log("❌ erreur notify", err.message);
    res.send("ERREUR");
  }
});


  
app.get("/admin/users", (req, res) => {
  const db = loadDB();

  const users = Object.entries(db.users).map(([id, data]) => ({
    id,
    ...data
  }));

  res.json(users);
});
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
});;
  }

  ;

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
} if (!userId || !db.users[userId]) {
  return res.json({ reply: "❌ Connecte-toi d'abord" });
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

// UPGRADE PREMIUM
app.post("/upgrade", (req, res) => {
  const { userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    return res.json({ error: "Utilisateur introuvable" });
  }

  db.users[userId].pro = true;

  saveDB(db);

  res.json({ success: true, message: "Premium activé" });
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

// CHAT
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