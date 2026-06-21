const express = require("express");
const app = express();

app.use(express.json());

app.post("/chat", async (req, res) => {
  const message = req.body.message;

  // Réponse simple (IA simulée pour commencer)
  let reply = "";

  if (message.toLowerCase().includes("business")) {
    reply = "💼 Conseil : crée une offre simple et vends-la sur WhatsApp.";
  } else if (message.toLowerCase().includes("argent")) {
    reply = "💰 Astuce : propose un abonnement mensuel à tes clients.";
  } else {
    reply = "🤖 Je suis ton assistant IA Vorax. Pose-moi une question business.";
  }

  res.json({ reply });
});

app.get("/", (req, res) => {
  res.send("🤖 IA Vorax en ligne !");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Serveur en ligne");
});