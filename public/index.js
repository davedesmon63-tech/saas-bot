const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/chat", (req, res) => {
  const message = req.body.message.toLowerCase();

  let reply = "";

  if (message.includes("business") || message.includes("argent")) {
    reply = "💼 Crée une offre simple et vends-la sur WhatsApp ou TikTok.";
  } else if (message.includes("client") || message.includes("vente")) {
    reply = "📊 Poste du contenu court sur TikTok pour attirer des clients.";
  } else if (message.includes("idee")) {
    reply = "💡 Crée un service IA pour aider les entreprises locales.";
  } else {
    reply = "🤖 Vorax AI : pose une question sur business, argent ou marketing.";
  }

  res.json({ reply });
});

app.get("/", (req, res) => {
  res.send("🤖 Vorax AI en ligne !");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serveur OK"));
