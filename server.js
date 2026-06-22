const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

// 🧠 compteur FREE global (MVP)
let freeCount = {};

// 🤖 CHAT BOT
app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase();
  const userId = req.body.userId || "guest";

  if (!freeCount[userId]) {
    freeCount[userId] = 0;
  }

  let reply = "";

  // 💡 BUSINESS / IDÉES
  if (message.includes("business") || message.includes("idée")) {

    freeCount[userId]++;

    // 🟢 IDÉE 1
    if (freeCount[userId] === 1) {
      reply = `💡 Idée 1 :
Créer une page TikTok de produits viraux.

📌 Exemple :
Tu postes des vidéos simples et tu fais de l'affiliation (Amazon / TikTok Shop).

💰 Facile à commencer sans argent.`;
    }

    // 🟢 IDÉE 2
    else if (freeCount[userId] === 2) {
      reply = `💡 Idée 2 :
Faire du dropshipping avec produits tendance.

📌 Exemple :
Tu vends sur TikTok ou WhatsApp sans stock.

🚀 Tu as terminé les idées gratuites.`;
    }

    // 🔴 BLOQUAGE + VENTE
    else {
      reply = `🚫 Limite FREE atteinte

👉 Pour continuer et obtenir :
- +50 idées de business
- niches rentables en Afrique
- scripts TikTok prêts
- stratégies complètes

💰 Abonne-toi à VORAX PRO`;
    }
  }

  // 👋 SALUT
  else if (message.includes("bonjour")) {
    reply = "Salut 👋 ! Demande-moi une idée de business 💰";
  }

  // ❓ DEFAULT
  else {
    reply = "💡 Écris : 'donne-moi une idée de business'";
  }

  res.json({ reply });
});

// 🚀 PORT RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});