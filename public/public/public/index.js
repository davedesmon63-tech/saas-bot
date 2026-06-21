const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/chat", (req, res) => {
  const message = req.body.message.toLowerCase();

  let reply = "";

  if (message.includes("business") || message.includes("argent")) {
    reply = "💼 Crée une offre simple et vends-la sur WhatsApp ou TikTok.";
  } else if (message.includes("client")) {
    reply = "📊 Trouve des clients via TikTok + contenu court quotidien.";
  } else if (message.includes("idee")) {
    reply = "💡 Idée : un service IA pour aider les petites entreprises locales.";
  } else if (message.includes("motivation")) {
    reply = "🔥 Reste constant, le succès vient avec la discipline.";
  } else {
    reply = "🤖 Vorax AI : pose une question sur business, argent ou marketing.";
  }

  res.json({ reply });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Vorax AI en ligne"));
