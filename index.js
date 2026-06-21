app.post("/chat", (req, res) => {
  const message = req.body.message.toLowerCase();

  let reply = "";

  // 🧠 Business
  if (message.includes("business") || message.includes("argent")) {
    reply = "💼 Pour gagner de l’argent : crée une offre simple et vends-la sur WhatsApp ou TikTok.";
  }

  // 📣 Marketing
  else if (message.includes("client") || message.includes("vente")) {
    reply = "📊 Trouve des clients en publiant du contenu court sur TikTok + propose une solution simple.";
  }

  // 💡 Idées
  else if (message.includes("idee") || message.includes("projet")) {
    reply = "💡 Idée : un service IA pour aider les petites entreprises à écrire leurs messages de vente.";
  }

  // 🔥 Motivation
  else if (message.includes("motivation")) {
    reply = "🔥 Le succès vient de la constance. Construis petit, mais chaque jour.";
  }

  // 🤖 défaut
  else {
    reply = "🤖 Vorax AI gratuit : pose-moi une question sur business, argent, ou marketing.";
  }

  res.json({ reply });
});