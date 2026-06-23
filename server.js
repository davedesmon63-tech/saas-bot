// ==============================
// 🚀 VORAX AI CLEAN SAAS VERSION
// ==============================

process.on("uncaughtException", (err) => console.log("🔥 ERROR:", err));
process.on("unhandledRejection", (err) => console.log("🔥 PROMISE ERROR:", err));

const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(session({
  secret: "vorax-clean-saas",
  resave: false,
  saveUninitialized: false
}));

const FREE_LIMIT = 5;

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
   BUSINESS IDEAS ENGINE
====================== */

const ideas = [
  {
    title: "💡 Dropshipping",
    steps: ["1️⃣ Produit viral", "2️⃣ Shopify store", "3️⃣ TikTok ads"],
    example: "Achete 5€, vend 20€ sur TikTok → profit rapide"
  },
  {
    title: "💡 Freelance IA",
    steps: ["1️⃣ ChatGPT + Canva", "2️⃣ Services clients", "3️⃣ WhatsApp/Fiverr"],
    example: "10 logos/jour = revenus rapides avec IA"
  },
  {
    title: "💡 SaaS Business",
    steps: ["1️⃣ Créer outil web", "2️⃣ Abonnement mensuel", "3️⃣ Marketing TikTok"],
    example: "100 clients à 10€ = 1000€/mois"
  },
  {
    title: "💡 TikTok Business",
    steps: ["1️⃣ Niche virale", "2️⃣ 2 vidéos/jour", "3️⃣ Monétisation"],
    example: "100k vues/jour = affiliation + ventes"
  }
];

/* ======================
   CHAT
====================== */

app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  const db = dbLoad();
  const user = db.users[userId];

  if (!user) return res.json({ reply: "❌ Connecte-toi" });

  if (!user.pro && user.messages >= FREE_LIMIT) {
    return res.json({
      reply: "🚫 Limite atteinte. Passe PRO 💎"
    });
  }

  user.messages++;

  const idea = ideas[Math.floor(Math.random() * ideas.length)];

  dbSave(db);

  res.json({
    reply:
      (user.pro ? "💎 PRO MODE\n\n" : "🆓 FREE MODE\n\n") +
      idea.title +
      "\n\n📌 PLAN:\n" +
      idea.steps.join("\n") +
      "\n\n💡 EXEMPLE:\n" +
      idea.example
  });
});

/* ======================
   UPGRADE
====================== */

app.post("/upgrade", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) return res.json({ error: "Introuvable" });

  db.users[userId].pro = true;
  db.users[userId].messages = 0;

  dbSave(db);

  res.json({ success: true, message: "💎 PRO ACTIVÉ" });
});

/* ======================
   UI (IMPORTANT)
====================== */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>VORAX AI</title>
<style>
body { margin:0; font-family:Arial; background:#0b0f19; color:white; display:flex; height:100vh; }
.sidebar { width:260px; background:#111827; padding:20px; }
.main { flex:1; display:flex; flex-direction:column; }
.top { padding:15px; background:#111827; }
.chat { flex:1; padding:20px; overflow:auto; }
.msg { background:#1f2937; padding:10px; margin:10px 0; border-radius:10px; }
.input { display:flex; padding:10px; background:#111827; }
input { flex:1; padding:15px; border:none; background:#1f2937; color:white; }
button { padding:15px; background:#3b82f6; color:white; border:none; }
</style>
</head>
<body>

<div class="sidebar">
<h2>🤖 VORAX AI</h2>
<p>Clean SaaS System</p>
</div>

<div class="main">

<div class="top">Dashboard</div>

<div class="chat" id="chat"></div>

<div class="input">
<input id="msg" placeholder="Écris ton idée business..." />
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

  document.getElementById("chat").innerHTML +=
    "<div class='msg'>" + data.reply.replace(/\\n/g,"<br>") + "</div>";
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
  console.log("🚀 VORAX CLEAN SAAS RUNNING ON", PORT);
});