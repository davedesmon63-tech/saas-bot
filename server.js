const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/chat", (req, res) => {
  const message = req.body.message.toLowerCase();

  let reply = "Je ne comprends pas 🤔";

  if (message.includes("bonjour")) {
    reply = "Salut 👋 !";
  }

  if (message.includes("argent")) {
    reply = "💰 Lance un business en ligne.";
  }

  res.json({ reply });
});

app.listen(3000, () => {
  console.log("Serveur lancé 🚀");
});