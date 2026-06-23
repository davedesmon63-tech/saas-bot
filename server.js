// ==============================
// 🚀 VORAX SAAS CLEAN FIXED VERSION
// ==============================

process.on("uncaughtException", (err) => console.log("🔥 ERROR:", err));
process.on("unhandledRejection", (err) => console.log("🔥 PROMISE ERROR:", err));

const express = require("express");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(express.json());

/* ======================
   CONFIG
====================== */

const API_KEY = "TON_API_KEY";
const SITE_ID = "TON_SITE_ID";
const BASE_URL = "https://saas-bot-n7qk.onrender.com";
const PRICE = 5000;

/* ======================
   DB
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

function getUser(db, userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      pro: false,
      messages: 0
    };
  }
  return db.users[userId];
}

/* ======================
   REGISTER / LOGIN SIMPLE (OPTIONNEL)
====================== */

app.post("/register", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, messages: 0 };
  }

  dbSave(db);

  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) {
    return res.json({ success: false });
  }

  res.json({ success: true, pro: db.users[userId].pro });
});

/* ======================
   DASHBOARD FIX (/me)
====================== */

app.post("/me", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) {
    return res.json({ logged: false });
  }

  res.json({
    logged: true,
    user: {
      email: userId,
      premium: user.pro
    }
  });
});

/* ======================
   IDEAS
====================== */

const freeIdeas = [
  "💡 Dropshipping simple",
  "💡 Freelance IA débutant"
];

const proIdeas = [
  "💡 SaaS automatisé",
  "💡 Affiliate marketing",
  "💡 YouTube automation",
  "💡 TikTok faceless",
  "💡 Print on demand",
  "💡 AI agency",
  "💡 Bots automation",
  "💡 E-commerce scaling",
  "💡 Crypto education",
  "💡 Digital products",
  "💡 Freelance agency",
  "💡 Ads scaling system"
];

/* ======================
   CHAT
====================== */

app.post("/chat", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();
  const user = getUser(db, userId);

  user.messages++;

  let reply;

  if (user.pro) {
    reply = proIdeas[Math.floor(Math.random() * proIdeas.length)];
  } else {
    if (user.messages > 2) {
      dbSave(db);
      return res.json({
        reply: "🚫 FREE LIMIT atteint. Passe PRO 💎"
      });
    }
    reply = freeIdeas[Math.floor(Math.random() * freeIdeas.length)];
  }

  dbSave(db);

  res.json({ reply });
});

/* ======================
   PAYMENT
====================== */

app.post("/pay", async (req, res) => {
  const { userId } = req.body;

  const transaction_id = "VORAX_" + Date.now();

  const db = dbLoad();
  getUser(db, userId);
  dbSave(db);

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id,
        amount: PRICE,
        currency: "XOF",
        description: "VORAX PRO",
        customer_name: userId, // 🔥 FIX IMPORTANT
        notify_url: BASE_URL + "/notify",
        return_url: BASE_URL + "/success"
      }
    );

    res.json({ payment_url: response.data.data.payment_url });

  } catch (err) {
    res.json({ error: "Payment error" });
  }
});

/* ======================
   IPN (PRO FIX)
====================== */

app.post("/notify", async (req, res) => {
  const transaction_id = req.body.transaction_id;

  try {
    const check = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment/check",
      {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id
      }
    );

    const data = check.data.data;

    if (data.status === "ACCEPTED") {
      const db = dbLoad();

      const userId = data.customer_name; // 🔥 FIX FIABLE

      if (userId && db.users[userId]) {
        db.users[userId].pro = true;
        db.users[userId].messages = 0;
        dbSave(db);

        console.log("💎 PRO ACTIVATED:", userId);
      }
    }

    res.send("OK");

  } catch (err) {
    res.send("ERROR");
  }
});

/* ======================
   SUCCESS
====================== */

app.get("/success", (req, res) => {
  res.send("💎 Paiement réussi - PRO activé si validé");
});

/* ======================
   FRONTEND
====================== */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>VORAX SAAS</title>
</head>
<body>

<h1>🤖 VORAX SAAS</h1>

<button onclick="chat()">Tester</button>
<button onclick="pay()">PRO</button>

<script>

let userId = localStorage.getItem("userId");

if (!userId) {
  userId = "user_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("userId", userId);
}

async function chat() {
  const res = await fetch("/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  alert(data.reply);
}

async function pay() {
  const res = await fetch("/pay", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();

  if (data.payment_url) {
    window.location.href = data.payment_url;
  }
}

</script>

</body>
</html>
  `);
});

/* ======================
   START
====================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 VORAX SAAS FULL FIXED READY");
});