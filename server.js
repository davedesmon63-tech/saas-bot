// ==============================
// 🚀 VORAX SAAS CLEAN VERSION
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
    db.users[userId] = { pro: false, messages: 0 };
  }
  return db.users[userId];
}

/* ======================
   IDEAS
====================== */

const freeIdeas = [
  "💡 Dropshipping simple (TikTok + Shopify)",
  "💡 Freelance IA (logos & textes)"
];

const proIdeas = [
  "💡 SaaS automatisé",
  "💡 Affiliate marketing",
  "💡 YouTube automation",
  "💡 TikTok faceless",
  "💡 Print on demand",
  "💡 AI agency",
  "💡 Automation bots",
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

  let idea;

  if (user.pro) {
    idea = proIdeas[Math.floor(Math.random() * proIdeas.length)];
  } else {
    if (user.messages > 2) {
      dbSave(db);
      return res.json({
        reply: "🚫 FREE LIMIT atteint. Passe PRO 💎"
      });
    }
    idea = freeIdeas[Math.floor(Math.random() * freeIdeas.length)];
  }

  dbSave(db);

  res.json({
    mode: user.pro ? "PRO" : "FREE",
    reply: (user.pro ? "💎 PRO MODE\n\n" : "🆓 FREE MODE\n\n") + idea
  });
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
        customer_id: userId,
        notify_url: BASE_URL + "/notify",
        return_url: BASE_URL + "/success"
      }
    );

    res.json({ payment_url: response.data.data.payment_url });

  } catch (err) {
    console.log(err.message);
    res.json({ error: "Payment error" });
  }
});

/* ======================
   IPN (IMPORTANT)
====================== */

app.post("/notify", async (req, res) => {
  console.log("IPN RECEIVED:", req.body);

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

      const userId = data.customer_id || data.customer_name;

      if (userId) {
        const user = getUser(db, userId);
        user.pro = true;
        user.messages = 0;
        dbSave(db);

        console.log("💎 PRO ACTIVATED:", userId);
      }
    }

    res.send("OK");

  } catch (err) {
    console.log("IPN ERROR:", err.message);
    res.send("ERROR");
  }
});

/* ======================
   SUCCESS PAGE
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
<style>
body {
  margin:0;
  font-family:Arial;
  background:#0b0f19;
  color:white;
  text-align:center;
  padding-top:100px;
}

button {
  padding:15px;
  margin:10px;
  border:none;
  border-radius:10px;
  cursor:pointer;
}

.free { background:#3b82f6; color:white; }
.pro { background:#22c55e; color:white; }
</style>
</head>

<body>

<h1>🤖 VORAX SAAS</h1>
<p>FREE = 2 idées | PRO = 12 idées</p>

<button class="free" onclick="chat()">Tester FREE</button>
<button class="pro" onclick="pay()">Passer PRO 💎</button>

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
  console.log("🚀 VORAX SAAS CLEAN READY ON", PORT);
});