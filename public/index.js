const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

/* =========================
   📦 DATABASE SIMPLE (MVP)
========================= */
let companies = {
  client1: {
    status: "active",
    name: "Boutique Ali",
    products: [
      { name: "T-shirt", price: "5000 FCFA" },
      { name: "Chaussure", price: "8000 FCFA" }
    ]
  }
};

/* =========================
   🔐 CHECK ABONNEMENT
========================= */
function isActive(clientId) {
  return companies[clientId]?.status === "active";
}

/* =========================
   🤖 CHAT BOT SAAS
========================= */
app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase();
  const clientId = req.body.clientId;

  // 🔐 blocage si pas abonné
  if (!isActive(clientId)) {
    return res.json({
      reply: "⛔ Abonnement non actif. Merci de contacter l’entreprise."
    });
  }

  const company = companies[clientId];

  let reply = "";

  if (message.includes("produit") || message.includes("catalogue")) {
    reply =
      "🛍️ Produits de " +
      company.name +
      ":\n" +
      company.products.map(p => `- ${p.name} : ${p.price}`).join("\n");
  }

  else if (message.includes("vente") || message.includes("client")) {
    reply = "📊 Conseil : publie sur TikTok + répond rapidement aux clients.";
  }

  else if (message.includes("business")) {
    reply = "💼 Le business commence avec une offre claire + une audience ciblée.";
  }

  else {
    reply = "🤖 Je suis ton assistant de vente automatique.";
  }

  res.json({ reply });
});

/* =========================
   🏠 SITE VITRINE
========================= */
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 SaaS Bot Pro</h1>
    <p>Assistant de vente automatique pour entreprises</p>
  `);
});

/* =========================
   🔧 ADMIN : ACTIVER CLIENT
========================= */
app.get("/admin/activate/:id", (req, res) => {
  const id = req.params.id;

  if (!companies[id]) {
    companies[id] = { status: "active", name: "New Company", products: [] };
  } else {
    companies[id].status = "active";
  }

  res.send("✅ Client activé : " + id);
});

/* =========================
   ❌ ADMIN : BLOQUER CLIENT
========================= */
app.get("/admin/block/:id", (req, res) => {
  const id = req.params.id;

  if (companies[id]) {
    companies[id].status = "blocked";
  }

  res.send("⛔ Client bloqué : " + id);
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SaaS Pro en ligne sur port " + PORT));
});

app.get("/", (req, res) => {
  res.send("🤖 Vorax AI en ligne !");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serveur OK"));
