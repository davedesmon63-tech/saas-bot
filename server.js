const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Serveur OK 🚀");
});

app.post("/chat", (req, res) => {
  try {
    const message = (req.body.message || "").toLowerCase();

    let reply = "Je ne comprends pas 🤔";

    if (message.includes("bonjour")) reply = "Salut 👋";
    if (message.includes("argent")) reply = "💰 Lance un business en ligne";
    if (message.includes("business")) reply = "📈 Trouve un problème et vends la solution";

    res.json({ reply });

  } catch (err) {
    res.json({ reply: "Erreur serveur ⚠️" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Serveur OK sur port " + PORT);
});  