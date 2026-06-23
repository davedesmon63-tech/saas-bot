// ==============================
// 🚀 VORAX IA - FINAL SAAS PRO
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
  secret: "vorax-final-saas",
  resave: false,
  saveUninitialized: false
}));

/* ======================
   CONFIG PAYMENT
====================== */
const API_KEY = "TON_API_KEY";
const SITE_ID = "TON_SITE_ID";

// 
const BASE_URL = "https://TON-SITE.onrender.com";

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
   REGISTER
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
   IDEAS SYSTEM
====================== */

const freeIdeas = [
  "💡 Dropshipping simple (TikTok + Shopify)",
  "💡 Freelance IA (logos + texte avec IA)"
];

const proIdeas = [
  "💡 SaaS automatisé (abonnement)",
  "💡 Affiliate marketing niche",
  "💡 YouTube automation",
  "💡 TikTok faceless channel",
  "💡 Print on demand",
  "💡 AI content agency",
  "💡 Automation bots business",
  "💡 E-commerce branding",
  "💡 Crypto education page",
  "💡 Digital products (ebooks)",
  "💡 Dropshipping premium ads",
  "💡 Freelance agency scaling"
];

/* ======================
   CHAT
====================== */
app.post("/chat", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) return res.json({ reply: "❌ User not found" });

  user.messages++;

  let idea;

  if (user.pro) {
    idea = proIdeas[Math.floor(Math.random() * proIdeas.length)];
  } else {
    if (user.messages > 2) {
      return res.json({
        reply: "🚫 FREE LIMIT atteint. Passe PRO 💎 pour 12 idées business."
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
        notify_url: BASE_URL + "/notify",
        return_url: BASE_URL + "/success",
        customer_name: userId,
        customer_email: userId
      }
    );

    res.json({ payment_url: response.data.data.payment_url });

  } catch (err) {
    res.json({ error: "Payment error" });
  }
});

/* ======================
   IPN
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
    res.send("ERROR");
  }
});

/* ======================
   FRONTEND
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
  display:flex;
  height:100vh;
}

.sidebar {
  width:250px;
  background:#111827;
  padding:20px;
}

.main {
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
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

<div class="sidebar">
  <h2>🤖 VORAX IA</h2>
  <p>FREE vs PRO SaaS</p>
</div>

<div class="main">

  <h1>VORAX BUSINESS AI</h1>
  <p>FREE = 2 idées | PRO = 12 idées</p>

  <button class="free" onclick="chat()">Tester FREE</button>
  <button class="pro" onclick="pay()">Passer PRO 💎</button>

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
  console.log("🚀 VORAX IA PRO READY ON", PORT);
});