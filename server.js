// ===============================
// 🚀 VORAX CHATGPT CLONE SAAS
// ===============================

const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();

/* ======================
   CONFIG SECURITY
====================== */

const FREE_LIMIT = 5;
const PRO_DAILY_LIMIT = 9999;

/* ======================
   MIDDLEWARE SECURITY
====================== */

// 🔐 anti spam / brute force
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // max req/min
  message: "⛔ Trop de requêtes"
});

app.use(limiter);

app.use(express.json());
app.use(session({
  secret: "vorax-ultra-secure-clone",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true en https prod
    sameSite: "lax"
  }
}));

/* ======================
   DATABASE SAFE
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
   AUTH SAFE
====================== */

// REGISTER
app.post("/register", async (req, res) => {
  const { userId, password } = req.body;

  const db = dbLoad();

  if (db.users[userId]) {
    return res.json({ error: "Utilisateur existe déjà" });
  }

  db.users[userId] = {
    password: await bcrypt.hash(password, 12),
    pro: false,
    messages: 0,
    credits: 10,
    createdAt: Date.now()
  };

  dbSave(db);

  res.json({ success: true });
});

// LOGIN
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
    pro: user.pro,
    credits: user.credits
  });
});

// ME
app.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ logged: false });
  }

  const db = dbLoad();
  const user = db.users[req.session.userId];

  res.json({
    logged: true,
    userId: req.session.userId,
    pro: user.pro,
    credits: user.credits
  });
});

/* ======================
   CHECK ACCESS
====================== */

function canUse(user) {
  if (user.pro) return true;
  return (user.messages || 0) < FREE_LIMIT && user.credits > 0;
}

/* ======================
   CHAT GPT-STYLE ENGINE
====================== */

app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) {
    return res.json({ reply: "❌ Utilisateur introuvable" });
  }

  // 🔐 security check
  if (!canUse(user)) {
    return res.json({
      reply: "🚫 Limite atteinte. Passe PRO pour ChatGPT illimité 💎"
    });
  }

  user.messages = (user.messages || 0) + 1;
  user.credits = Math.max(0, (user.credits || 0) - 1);

  /* ======================
     AI RESPONSE ENGINE
  ====================== */

  const systemPrompt = `
Tu es VORAX AI, un assistant intelligent type ChatGPT.
Tu aides avec business, code, marketing et SaaS.
Tu es clair, structuré et actionnable.
`;

  const responses = [
    "💡 Analyse : voici une stratégie simple et efficace",
    "🚀 Voici un plan structuré pour réussir",
    "📊 Solution optimisée pour ton cas",
    "🧠 Voici une approche intelligente et rapide"
  ];

  const reply =
    "🤖 VORAX AI\n\n" +
    responses[Math.floor(Math.random() * responses.length)] +
    "\n\n👉 Question : " + message +
    "\n\n⚡ Conseil : teste rapidement et améliore avec données réelles";

  dbSave(db);

  res.json({
    reply,
    meta: {
      messages: user.messages,
      credits: user.credits,
      pro: user.pro
    }
  });
});

/* ======================
   STRATEGY MODE (GPT UPGRADE)
====================== */

app.post("/strategy", (req, res) => {
  const { idea } = req.body;

  res.json({
    reply:
      "🧠 STRATÉGIE CHATGPT LEVEL\n\n" +
      "🎯 " + idea + "\n\n" +
      "1️⃣ Validation marché (data + trends)\n" +
      "2️⃣ Offre irrésistible (psychologie)\n" +
      "3️⃣ Acquisition (TikTok + Ads + SEO)\n" +
      "4️⃣ Automatisation (bots + IA)\n" +
      "5️⃣ Scaling international\n\n" +
      "💰 Objectif : revenu rapide + système scalable"
  });
});

/* ======================
   UPGRADE SYSTEM
====================== */

app.post("/upgrade", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) {
    return res.json({ error: "Introuvable" });
  }

  db.users[userId].pro = true;
  db.users[userId].credits = 999;

  dbSave(db);

  res.json({ success: true, message: "💎 PRO ACTIVÉ" });
});

/* ======================
   FRONTEND CHATGPT STYLE
====================== */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>VORAX GPT</title>
<style>
body {
  margin:0;
  font-family: Arial;
  background:#0d1117;
  color:white;
  display:flex;
  height:100vh;
}

.sidebar {
  width:250px;
  background:#161b22;
  padding:20px;
}

.chat {
  flex:1;
  display:flex;
  flex-direction:column;
}

.messages {
  flex:1;
  padding:20px;
  overflow:auto;
}

.input {
  display:flex;
  padding:10px;
  background:#161b22;
}

input {
  flex:1;
  padding:15px;
  border:none;
  background:#0d1117;
  color:white;
}

button {
  padding:15px;
  background:#238636;
  color:white;
  border:none;
  cursor:pointer;
}

.msg {
  background:#21262d;
  margin:10px 0;
  padding:10px;
  border-radius:10px;
}
</style>
</head>

<body>

<div class="sidebar">
  <h2>🤖 VORAX GPT</h2>
  <p>ChatGPT Clone SaaS</p>
</div>

<div class="chat">
  <div class="messages" id="messages"></div>

  <div class="input">
    <input id="msg" placeholder="Écris ton message..." />
    <button onclick="send()">Send</button>
  </div>
</div>

<script>
let userId = localStorage.getItem("userId") || "guest";

async function send() {
  const msg = document.getElementById("msg").value;

  const res = await fetch("/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ message: msg, userId })
  });

  const data = await res.json();

  document.getElementById("messages").innerHTML +=
    "<div class='msg'>🤖 " + data.reply.replace(/\\n/g,"<br>") + "</div>";

  if(data.reply.includes("stratégie")){
    const r = await fetch("/strategy", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ idea: msg })
    });

    const d = await r.json();

    document.getElementById("messages").innerHTML +=
      "<div class='msg'>🧠 " + d.reply.replace(/\\n/g,"<br>") + "</div>";
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
  console.log("🚀 VORAX CHATGPT CLONE RUNNING ON", PORT);
});