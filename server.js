// ==============================
// 🚀 VORAX IA - SAAS + PAYMENT REAL
// ==============================

process.on("uncaughtException", (err) => console.log("🔥 ERROR:", err));
process.on("unhandledRejection", (err) => console.log("🔥 PROMISE ERROR:", err));

const express = require("express");
const fs = require("fs");
const session = require("express-session");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(session({
  secret: "vorax-payment-saas",
  resave: false,
  saveUninitialized: false
}));

/* ======================
   CONFIG PAYMENT
====================== */

const API_KEY = "TON_API_KEY";
const SITE_ID = "TON_SITE_ID";

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

/* ======================
   USERS SYSTEM
====================== */

app.post("/register", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) {
    db.users[userId] = {
      pro: false,
      messages: 0
    };
  }

  dbSave(db);

  res.json({ success: true });
});

/* ======================
   CHAT SYSTEM
====================== */

const ideas = [
  "💡 Dropshipping",
  "💡 Freelance IA",
  "💡 SaaS Business",
  "💡 TikTok Business",
  "💡 Affiliate Marketing"
];

app.post("/chat", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) return res.json({ reply: "❌ User not found" });

  // 🆓 FREE LIMIT
  if (!user.pro && user.messages >= 2) {
    return res.json({
      reply: "🚫 FREE LIMIT atteint. Passe PRO 💎 pour illimité."
    });
  }

  user.messages++;

  const idea = ideas[Math.floor(Math.random() * ideas.length)];

  dbSave(db);

  res.json({
    mode: user.pro ? "PRO" : "FREE",
    reply:
      (user.pro ? "💎 PRO MODE\n\n" : "🆓 FREE MODE\n\n") +
      idea +
      "\n\n📌 Plan : simple stratégie business"
  });
});

/* ======================
   💳 CREATE PAYMENT
====================== */

app.post("/pay", async (req, res) => {
  const { userId } = req.body;

  const transaction_id = "VORAX_" + Date.now();

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      {
        apikey: API_KEY,
        site_id: SITE_ID,
        transaction_id,
        amount: 5000,
        currency: "XOF",
        description: "VORAX PRO",
        notify_url: "https://YOUR-RENDER-URL.onrender.com/notify",
        return_url: "https://YOUR-RENDER-URL.onrender.com/success",
        customer_name: userId,
        customer_email: userId
      }
    );

    res.json({
      payment_url: response.data.data.payment_url
    });

  } catch (err) {
    console.log(err.message);
    res.json({ error: "Payment error" });
  }
});

/* ======================
   🔥 PAYMENT CONFIRMATION (IMPORTANT)
====================== */

app.post("/notify", async (req, res) => {
  const { transaction_id } = req.body;

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

      const userId = data.customer_name;

      if (db.users[userId]) {
        db.users[userId].pro = true;
        db.users[userId].messages = 0;
        dbSave(db);
      }

      console.log("💎 PRO ACTIVATED:", userId);
    }

    res.send("OK");

  } catch (err) {
    console.log(err.message);
    res.send("ERROR");
  }
});

/* ======================
   FRONTEND (SIMPLE SaaS UI)
====================== */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>VORAX IA</title>
<style>
body {
  margin:0;
  font-family:Arial;
  background:#0b0f19;
  color:white;
  text-align:center;
}

.container {
  margin-top:80px;
}

button {
  padding:15px;
  border:none;
  background:#3b82f6;
  color:white;
  border-radius:10px;
  cursor:pointer;
  margin:10px;
}
</style>
</head>

<body>

<div class="container">

  <h1>🤖 VORAX IA SAAS</h1>
  <p>FREE = 2 idées | PRO = illimité</p>

  <button onclick="chat()">Tester IA</button>
  <button onclick="pay()">Passer PRO 💎</button>

</div>

<script>

let userId = localStorage.getItem("userId") || "guest";

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

  if(data.payment_url){
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
  console.log("🚀 VORAX PAYMENT SAAS READY ON", PORT);
});