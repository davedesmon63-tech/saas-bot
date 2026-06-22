const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "./db.json";

// 📦 Charger la DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: {} };
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// 💾 Sauvegarder la DB
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 💬 ROUTE CHAT
app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase().trim();
  const userId = req.body.userId || "guest";

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, count: 0 };
  }

  const user = db.users[userId];

  // 🔵 PRO MODE
  if (user.pro) {
    const proIdeas = [
      "💡 TikTok boutique automatisée",
      "💡 Gestion WhatsApp Business",
      "💡 Montage vidéo TikTok",
      "💡 Dropshipping produits tendance",
      "💡 Création CV pro",
      "💡 Mini agence pub TikTok"
    ];

    const idea = proIdeas[Math.floor(Math.random() * proIdeas.length)];

    return res.json({
      reply: "🔥 PRO ACTIF\n\n" + idea
    });
  }

  // 🟢 FREE MODE
  if (message.includes("business") || message.includes("idée")) {
    user.count++;

    let reply = "";

    if (user.count === 1) {
      reply = "💡 Vendre sur TikTok\n💰 3000–15000 FCFA/jour";
    } else if (user.count === 2) {
      reply = "💡 Dropshipping\n💰 5000–20000 FCFA/jour";
    } else {
      reply = "🚫 Limite atteinte. Passe PRO 💰";
    }

    saveDB(db);
    return res.json({ reply });
  }

  res.json({ reply: "💡 Demande une idée de business" });
});

// 🚀 LANCEMENT SERVEUR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVEUR LANCÉ SUR PORT", PORT);
});