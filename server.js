const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "./db.json";

// 🧠 INIT DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// 🤖 CHAT
app.post("/chat", (req, res) => {
  const { message, userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, count: 0 };
  }

  const user = db.users[userId];

  // 🔵 PRO MODE
  if (user.pro) {
    return res.json({
      reply: "🔥 PRO ACTIF : accès illimité aux idées business"
    });
  }

  // 🟢 FREE MODE
  if (message.includes("business") || message.includes("idée")) {
    user.count++;

    let reply = "";

    if (user.count === 1) {
      reply = "💡 TikTok + affiliation produits viraux";
    } else if (user.count === 2) {
      reply = "💡 Dropshipping produits tendance";
    } else {
      reply = "🚫 Limite atteinte. Passe PRO 💰";
    }

    saveDB(db);
    return res.json({ reply });
  }

  res.json({ reply: "💡 Demande une idée de business" });
});

// 📩 DEMANDE PAIEMENT
app.post("/activate-request", (req, res) => {
  const { phone, userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, count: 0 };
  }

  db.users[userId].phone = phone;
  db.users[userId].pending = true;

  saveDB(db);

  console.log("💰 Nouvelle demande PRO :", phone);

  res.json({ success: true });
});

// 🔓 ACTIVER PRO (ADMIN / AUTOMATIQUE PLUS TARD)
app.post("/activate-pro", (req, res) => {
  const { userId } = req.body;

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: true, count: 0 };
  } else {
    db.users[userId].pro = true;
    db.users[userId].pending = false;
  }

  saveDB(db);

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SaaS STARTUP RUNNING");
});