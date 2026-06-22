app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase().trim();
  const userId = req.body.userId || "guest";

  const db = loadDB();

  if (!db.users[userId]) {
    db.users[userId] = { pro: false, count: 0 };
  }

  const user = db.users[userId];

  // 🔵 PRO MODE (CORRECTEMENT PLACÉ)
  if (user.pro) {

    const proIdeas = [
      "💡 TikTok boutique automatisée + produits viraux",
      "💡 Gestion WhatsApp Business pour commerces",
      "💡 Service montage vidéo TikTok",
      "💡 Dropshipping produits tendance",
      "💡 Création CV professionnels",
      "💡 Mini agence pub TikTok",
      "💡 Affiliation produits viraux",
      "💡 Formation en ligne WhatsApp + PDF",
      "💡 Gestion Instagram entreprises",
      "💡 Bots WhatsApp pour entreprises",
      "💡 Vente de services digitaux",
      "💡 Marketing d’influence micro",
      "💡 Pages Facebook monétisées",
      "💡 E-commerce WhatsApp catalogue",
      "💡 Revente produits locaux avec marge"
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
      reply = `💡 Business :
Vendre des produits tendance sur TikTok

💰 3000–15000 FCFA/jour`;
    } 
    else if (user.count === 2) {
      reply = `💡 Business :
Dropshipping produits tendance

💰 5000–20000 FCFA/jour`;
    } 
    else {
      reply = "🚫 Limite atteinte. Passe PRO 💰";
    }

    saveDB(db);
    return res.json({ reply });
  }

  res.json({ reply: "💡 Demande une idée de business" });
});