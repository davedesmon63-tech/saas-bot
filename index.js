const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("🤖 Ton SaaS est en ligne !");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Serveur en ligne");
});