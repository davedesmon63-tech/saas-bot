// ===============================
// 🚀 VORAX CHATGPT CLONE SAAS
// ===============================

// 🛡️ SERVER SAFETY (ANTI CRASH)
process.on("uncaughtException", (err) => {
  console.log("🔥 UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("🔥 PROMISE ERROR:", err);
});

process.on("warning", (w) => {
  console.log("⚠️ WARNING:", w.message);
});

// ===============================

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
   SECURITY MIDDLEWARE
====================== */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
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
    sameSite: "lax"
  }
}));

/* ======================
   DATABASE
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
   ACCESS CHECK
====================== */

function canUse(user) {
  if (user.pro) return true;
  return (user.messages || 0) < FREE_LIMIT && user.credits > 0;
}

/* ======================
   CHAT ENGINE (SIMPLE AI LOGIC)
====================== */

app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) {
    return res.json({ reply: "❌ Utilisateur introuvable" });
  }

  if (!canUse(user)) {
    return res.json({
      reply: "🚫 Limite atteinte. Passe PRO pour débloquer VORAX 💎"
    });
  }

  user.messages = (user.messages || 0) + 1;
  user.credits = Math.max(0, (user.credits || 0) - 1);

  const responses = [
    "💡 Analyse stratégique prête",
    "🚀 Plan optimisé généré",
    "📊 Solution business calculée",
    "🧠 Réponse intelligente activée"
  ];

  const reply =
    "🤖 VORAX AI\n\n" +
    responses[Math.floor(Math.random() * responses.length)] +
    "\n\n👉 " + message +
    "\n\n⚡ Conseil : teste rapidement et optimise en live";

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
   FRONTEND (CHAT UI)
====================== */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>VORAX AI</title>
<style>
body { margin:0; font-family:Arial; background:#0b0f19; color:white; display:flex; height:100vh; }
.sidebar { width:250px; background:#111827; padding:20px; }
.chat { flex:1; display:flex; flex-direction:column; }
.messages { flex:1; padding:20px; overflow:auto; }
.input { display:flex; padding:10px; background:#111827; }
input { flex:1; padding:15px; background:#1f2937; color:white; border:none; }
button { padding:15px; background:#3b82f6; color:white; border:none; }
.msg { margin:10px 0; padding:10px; background:#1f2937; border-radius:10px; }
</style>
</head>

<body>

<div class="sidebar">
  <h2>🤖 VORAX AI</h2>
  <p>SaaS ChatGPT Clone</p>
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
}
</script>

</body>
</html>
  `);
});

/* ======================
   START SERVER
====================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 VORAX SAAS RUNNING ON PORT", PORT);
});