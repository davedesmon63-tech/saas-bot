// ==============================
// 🚀 VORAX IA - FINAL SAAS PRO
// ==============================

process.on("uncaughtException", (err) => console.log("🔥 ERROR:", err));
process.on("unhandledRejection", (err) => console.log("🔥 PROMISE ERROR:", err));

const express = require("express");
const fs = require("fs");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(session({
  secret: "vorax-final-saas",
  resave: false,
  saveUninitialized: false
}));

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
   IDEAS (12 PRO + 2 FREE)
====================== */

// 🆓 FREE (2 idées seulement)
const freeIdeas = [
  {
    title: "💡 TikTok Business",
    steps: ["Choisir niche", "Poster vidéos", "Monétiser liens"],
    example: "100k vues = argent via affiliation"
  },
  {
    title: "💡 Freelance IA",
    steps: ["ChatGPT + Canva", "Créer services", "Trouver clients"],
    example: "10 logos/jour = revenus rapides"
  }
];

// 💎 PRO (12 idées business)
const proIdeas = [
  {
    title: "💡 SaaS Startup",
    steps: ["Créer outil web", "Ajouter abonnement", "Scaler mondial"],
    example: "100 clients = revenu automatique mensuel"
  },
  {
    title: "💡 Dropshipping",
    steps: ["Produit viral", "Shopify store", "TikTok Ads"],
    example: "5€ achat → 25€ vente"
  },
  {
    title: "💡 Affiliate Marketing",
    steps: ["Lien affilié", "Traffic TikTok", "Commission"],
    example: "1 vente = 10€ à 50€"
  },
  {
    title: "💡 YouTube Automation",
    steps: ["Niche faceless", "IA scripts", "Monétisation ads"],
    example: "100k vues = revenu passif"
  },
  {
    title: "💡 SMMA Agency",
    steps: ["Apprendre ads", "Clients locaux", "Gestion réseaux"],
    example: "500€/client/mois"
  },
  {
    title: "💡 Crypto Trading",
    steps: ["Apprendre base", "Analyse marché", "Investir"],
    example: "petits gains scalables"
  },
  {
    title: "💡 Print On Demand",
    steps: ["Design t-shirts", "Shopify", "TikTok"],
    example: "0 stock = profit direct"
  },
  {
    title: "💡 App Mobile SaaS",
    steps: ["Créer app simple", "Monétiser", "Pub + abo"],
    example: "abonnement mensuel stable"
  },
  {
    title: "💡 Copywriting",
    steps: ["Apprendre persuasion", "Vendre texte", "Clients online"],
    example: "50€ par email écrit"
  },
  {
    title: "💡 Automation Bots",
    steps: ["Node.js bots", "Automatiser tâches", "Vendre service"],
    example: "gain de temps = argent"
  },
  {
    title: "💡 E-commerce Brand",
    steps: ["Créer marque", "Influenceurs", "Ads"],
    example: "marque scalable mondiale"
  },
  {
    title: "💡 Info Products",
    steps: ["Créer PDF", "Vendre online", "Marketing"],
    example: "0€ coût → 100% marge"
  }
];

/* ======================
   CHAT ENGINE
====================== */

app.post("/chat", (req, res) => {
  const { userId } = req.body;

  const db = dbLoad();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, messages: 0 };
  }

  const user = db.users[userId];

  // 🆓 FREE LIMIT = 2
  if (!user.pro && user.messages >= 2) {
    return res.json({
      reply: "🚫 FREE LIMIT atteint (2 idées). Passe PRO 💎 pour 12 idées business."
    });
  }

  user.messages++;

  let idea;

  if (user.pro) {
    idea = proIdeas[Math.floor(Math.random() * proIdeas.length)];
  } else {
    idea = freeIdeas[Math.floor(Math.random() * freeIdeas.length)];
  }

  dbSave(db);

  res.json({
    mode: user.pro ? "PRO" : "FREE",
    reply:
      (user.pro ? "💎 PRO MODE ACTIVE\n\n" : "🆓 FREE MODE\n\n") +
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

  if (!db.users[userId]) {
    return res.json({ error: "User introuvable" });
  }

  db.users[userId].pro = true;
  db.users[userId].messages = 0;

  dbSave(db);

  res.json({
    success: true,
    message: "💎 PRO ACTIVÉ → 12 BUSINESS IDEAS UNLOCKED"
  });
});

/* ======================
   UI CYBER ANIME (VORAX)
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
  font-family: Arial;
  background:#05060a;
  color:white;
}

.header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:15px;
  background:#0b0f1a;
  border-bottom:1px solid #1f2a44;
}

.logo {
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:bold;
  color:#00f2ff;
  text-shadow:0 0 10px #00f2ff;
}

.logo img {
  width:40px;
  height:40px;
  border-radius:10px;
  box-shadow:0 0 15px #00f2ff;
}

.btn {
  background:linear-gradient(90deg,#00f2ff,#7c4dff);
  padding:10px;
  border:none;
  color:white;
  border-radius:10px;
}

.container {
  display:flex;
  height:calc(100vh - 70px);
}

.sidebar {
  width:260px;
  background:#0b0f1a;
  border-right:1px solid #1f2a44;
  padding:15px;
}

.card {
  background:#111827;
  padding:10px;
  margin:10px 0;
  border-radius:10px;
  border:1px solid #1f2a44;
}

.main {
  flex:1;
  display:flex;
  flex-direction:column;
}

.chat {
  flex:1;
  padding:20px;
  overflow:auto;
}

.msg {
  background:#111827;
  padding:10px;
  margin:10px 0;
  border-radius:10px;
  border:1px solid #1f2a44;
}

.input {
  display:flex;
  padding:10px;
  background:#0b0f1a;
}

input {
  flex:1;
  padding:15px;
  background:#111827;
  border:none;
  color:white;
  border-radius:10px;
}

button {
  margin-left:10px;
  padding:15px;
  background:linear-gradient(90deg,#00f2ff,#7c4dff);
  border:none;
  color:white;
  border-radius:10px;
}
</style>

</head>

<body>

<div class="header">

  <div class="logo">
    <img src="https://i.imgur.com/4M7IWwP.gif" />
    VORAX IA
  </div>

  <button class="btn" onclick="upgrade()">💎 PRO</button>

</div>

<div class="container">

  <div class="sidebar">
    <h3>⚡ Dashboard</h3>
    <div class="card">💡 FREE = 2 IDEAS</div>
    <div class="card">💎 PRO = 12 IDEAS</div>
    <div class="card">🚀 SaaS Ready</div>
  </div>

  <div class="main">

    <div class="chat" id="chat"></div>

    <div class="input">
      <input id="msg" placeholder="Écris ton idée business..." />
      <button onclick="send()">Send</button>
    </div>

  </div>

</div>

<script>
let userId = localStorage.getItem("userId") || "guest";

async function send() {
  const res = await fetch("/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();

  document.getElementById("chat").innerHTML +=
    "<div class='msg'>" + data.reply.replace(/\\n/g,"<br>") + "</div>";
}

async function upgrade() {
  await fetch("/upgrade", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ userId })
  });

  alert("💎 PRO ACTIVÉ - 12 IDEAS UNLOCKED");
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
  console.log("🚀 VORAX FINAL SAAS READY ON", PORT);
});