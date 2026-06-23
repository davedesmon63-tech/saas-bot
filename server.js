// ==============================
// 🚀 VORAX IA - CLEAN DEPLOY READY
// ==============================

process.on("uncaughtException", (err) => console.log("🔥 ERROR:", err));
process.on("unhandledRejection", (err) => console.log("🔥 PROMISE ERROR:", err));

const express = require("express");
const fs = require("fs");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(session({
  secret: "vorax-clean-ai",
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
   IDEAS ENGINE
====================== */

const ideas = [
  {
    title: "💡 Dropshipping",
    steps: ["Produit viral", "Shopify store", "TikTok ads"],
    example: "Achete 5€, vends 20€"
  },
  {
    title: "💡 Freelance IA",
    steps: ["ChatGPT + Canva", "Services clients", "Fiverr / WhatsApp"],
    example: "10 logos/jour = revenu rapide"
  },
  {
    title: "💡 SaaS",
    steps: ["Créer outil web", "Abonnement", "Marketing TikTok"],
    example: "100 clients = revenu stable"
  },
  {
    title: "💡 TikTok Business",
    steps: ["Niche virale", "2 vidéos/jour", "Monétisation"],
    example: "100k vues = argent"
  }
];

/* ======================
   CHAT SYSTEM
====================== */

app.post("/chat", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();
  let user = db.users[userId];

  if (!user) {
    db.users[userId] = { pro: false, messages: 0 };
    user = db.users[userId];
  }

  if (!user.pro && user.messages >= FREE_LIMIT) {
    return res.json({
      reply: "🚫 Limite FREE atteinte. Passe PRO 💎"
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

  if (!db.users[userId]) return res.json({ error: "User introuvable" });

  db.users[userId].pro = true;
  db.users[userId].messages = 0;

  dbSave(db);

  res.json({ success: true, message: "💎 PRO ACTIVÉ" });
});

/* ======================
   UI DARK SAAS
====================== */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>VORAX IA</title>
<style>
body { margin:0; font-family:Arial; background:#0a0a0a; color:white; display:flex; height:100vh; }

.sidebar { width:260px; background:#111; padding:20px; border-right:1px solid #222; }
.sidebar h2 { color:white; }

.card { background:#1a1a1a; padding:10px; margin:10px 0; border-radius:10px; color:#ccc; }

.main { flex:1; display:flex; flex-direction:column; }

.top { padding:15px; background:#111; border-bottom:1px solid #222; display:flex; justify-content:space-between; }

.badge { background:#22c55e; padding:5px 10px; border-radius:8px; font-size:12px; }

.chat { flex:1; padding:20px; overflow:auto; }

.msg { background:#1a1a1a; padding:10px; margin:10px 0; border-radius:10px; border:1px solid #222; }

.input { display:flex; padding:10px; background:#111; border-top:1px solid #222; }

input { flex:1; padding:15px; background:#1a1a1a; border:none; color:white; }

button { padding:15px; background:#3b82f6; color:white; border:none; cursor:pointer; }
</style>
</head>

<body>

<div class="sidebar">
<h2>🤖 VORAX IA</h2>
<div class="card">📊 Dashboard</div>
<div class="card">💡 Business Ideas</div>
<div class="card">💎 Free / Pro</div>
<div class="card">🚀 SaaS Mode</div>
</div>

<div class="main">

<div class="top">
<div>Dashboard</div>
<div class="badge">LIVE</div>
</div>

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
    body: JSON.stringify({ userId })
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
  console.log("🚀 VORAX IA READY ON PORT", PORT);
});