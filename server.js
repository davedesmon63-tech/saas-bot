const express = require("express");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
const PAYDUNYA_PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
const PAYDUNYA_TOKEN = process.env.PAYDUNYA_TOKEN;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const PRICE = 2500;const { CheckoutStore } = require('paydunya-nodejs-sdk');

const paydunyaSetup = {
  masterKey: PAYDUNYA_MASTER_KEY,
  privateKey: PAYDUNYA_PRIVATE_KEY,
  token: PAYDUNYA_TOKEN,
  mode: 'test' // Passe 'live' quand tu veux encaisser pour de vrai
}; // Prix abonnement VORAX;

/* ======================
   IDEES BUSINESS
====================== */
const freeIdeas = [
  "💡 Dropshipping produits beauté | Cible: Femmes 18-35 ans Abidjan | Budget: 50000 FCFA",
  "💡 Vente de parfums huilés | Cible: Jeunes bureaux Plateau | Budget: 30000 FCFA",
  "💡 Livraison de repas fait maison | Cible: Célibataires Cocody | Budget: 100000 FCFA"
];

const proIdeas = [
  "💡 SaaS gestion tontine | Revenus: 300k/mois | Client: Associations",
  "💡 Formation IA pour vendeurs | Revenus: 500k/mois | Client: Commerçants",
  "💡 Service community manager | Revenus: 200k/mois | Client: PME",
  "💡 TikTok faceless motivation | Revenus: 400k/mois | Client: Jeunes 15-25",
  "💡 Print on demand t-shirts CI | Revenus: 250k/mois | Client: Étudiants",
  "💡 E-commerce produits locaux | Revenus: 600k/mois | Client: Diaspora",
  "💡 Bots WhatsApp automation | Revenus: 350k/mois | Client: Boutiques",
  "💡 Crypto éducation débutant | Revenus: 450k/mois | Client: Salariés"
];

/* ======================
   DB
====================== */
function dbLoad() {
  if (!fs.existsSync("db.json")) {
    fs.writeFileSync("db.json", JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync("db.json"));
}
function dbSave(db) { fs.writeFileSync("db.json", JSON.stringify(db, null, 2)); }
function getUser(db, userId) {
  if (!db.users[userId]) db.users[userId] = { password: "", pro: false, messages: 0 };
  return db.users[userId];
}

/* ======================
   AUTH
====================== */
app.post("/register", (req, res) => {
  const { userId, password } = req.body;
  const db = dbLoad();
  if (db.users[userId]) return res.json({ success: false, msg: "User existe déjà" });
  db.users[userId] = { password, pro: false, messages: 0 };
  dbSave(db);
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { userId, password } = req.body;
  const db = dbLoad();
  const user = db.users[userId];
  if (!user || user.password!== password) return res.json({ success: false });
  res.json({ success: true, pro: user.pro });
});

/* ======================
   CHAT + GENERATE
====================== */
app.post("/chat", (req, res) => {
  const { userId, message } = req.body;
  if (!userId) return res.json({ reply: "Connecte-toi d'abord" });

  const db = dbLoad();
  const user = getUser(db, userId);
  user.messages++;

  // Si gratuit et >2 messages = paywall
  if (!user.pro && user.messages > 2) {
    dbSave(db);
    return res.json({ reply: "🚫 FREE LIMIT atteint. Clique 'Activer Premium 5000 FCFA' pour illimité" });
  }

  // Choix idée random
  const pool = user.pro? proIdeas : freeIdeas;
  const reply = pool[Math.floor(Math.random() * pool.length)];
  
  dbSave(db);
  res.json({ reply });
});

/* ======================
   CINETPAY
====================== */
app.get("/api/pay", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).send("userId manquant");

  const axios = require("axios");
  const transaction_id = "VORAX_" + Date.now();

  try {
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      {
        apikey: CINETPAY_KEY,
        site_id: CINETPAY_SITE,
        transaction_id,
        amount: PRICE,
        currency: "XOF",
        description: "VORAX PRO 1 mois illimité",
        customer_name: userId,
        customer_email: userId + "@vorax.com",
        notify_url: `${BASE_URL}/api/notify`,
        return_url: `${BASE_URL}/success`
      }
    );
    res.redirect(response.data.payment_url);
  } catch (err) {
    res.send("Erreur paiement. Vérifie tes clés CinetPay dans Render");
  }
});

app.post("/api/notify", async (req, res) => {
  const axios = require("axios");
  const transaction_id = req.body.cpm_trans_id;
  try {
    const check = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment/check",
      { apikey: CINETPAY_KEY, site_id: CINETPAY_SITE, transaction_id }
    );
    if (check.data.status === "ACCEPTED") {
      const db = dbLoad();
      const userId = check.data.customer_name;
      if (db.users[userId]) {
        db.users[userId].pro = true;
        db.users[userId].messages = 0;
        dbSave(db);
        console.log("💎 PRO ACTIVÉ:", userId);
      }
    }
    res.send("OK");
  } catch {
    res.send("ERROR");
  }
});

app.get("/success", (req, res) => {
  res.send(`<h1 style="text-align:center;margin-top:100px;font-family:Arial">💎 Paiement réussi!</h1>
  <p style="text-align:center">PRO activé. Retourne sur VORAX SAAS</p>
  <p style="text-align:center"><a href="/">← Retour App</a></p>`);
});

/* ======================
   CODE VIP
====================== */
app.post("/premium", (req, res) => {
  const { userId, code } = req.body;
  const db = dbLoad();
  const user = db.users[userId];
  if (!user) return res.json({ success: false });

  if (code === "RICHMIN-2026") {
    user.pro = true;
    dbSave(db);
    return res.json({ success: true });
  }
  res.json({ success: false, msg: "Code invalide" });
});

/* ======================
   FRONTEND
====================== */
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VORAX SAAS</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial}
body{background:#0a0a0a;color:#fff;padding:15px;min-height:100vh;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.top h2{color:#00ff88;text-align:center;flex:1;font-size:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1}
.card{background:#1a1a1a;padding:15px;border-radius:12px;border:1px solid #333}.card h3{margin-bottom:12px;font-size:14px;color:#ccc}
input,button{width:100%;padding:10px;margin:5px 0;border-radius:8px;border:none;background:#2a2a2a;color:#fff;font-size:13px}
button{background:#00ff88;color:#000;font-weight:bold;cursor:pointer}button:active{transform:scale(0.98)}
.premium{background:#ffd700;color:#000}.premium h3{color:#000}.premium button{background:#000;color:#ffd700}
#chatBox{height:120px;background:#000;padding:8px;overflow-y:auto;font-size:12px;margin:8px 0;border-radius:8px;border:1px solid #333}
.footer{text-align:center;padding:15px 0;margin-top:20px;color:#666;font-size:12px;border-top:1px solid #333}
@media(max-width:500px){.grid{grid-template-columns:1fr;}}</style></head><body>
<div class="top"><span>←</span><h2>🚀 VORAX SAAS</h2><span></span></div>
<div class="grid">
<div class="card"><h3>🔐 Login</h3><input id="userIdInput" placeholder="User ID"><input id="passwordInput" type="password" placeholder="Mot de passe">
<button onclick="register()">Register</button><button onclick="login()">Login</button></div>
<div class="card"><h3>💡 Idées Business</h3><button onclick="generate()">Générer Idée</button></div>
<div class="card"><h3>💬 Chat AI</h3><div id="chatBox"></div><input id="msgInput" placeholder="Message..."><button onclick="sendMsg()">Envoyer</button></div>
<div class="card premium"><h3>⚡ Premium</h3><button onclick="pay()">Activer Premium 5000 FCFA</button>
<input id="codeInput" placeholder="Code VIP RICHMIN-2026"><button onclick="validateCode()">Valider Code</button></div></div>
<div class="footer">Created by Richmin © 2026</div>
<script>
let currentUser = localStorage.getItem("userId") || "";
const userIdInput = document.getElementById("userIdInput");
const passwordInput = document.getElementById("passwordInput");
const msgInput = document.getElementById("msgInput");
const codeInput = document.getElementById("codeInput");

async function register(){
  const res = await fetch("/register",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:userIdInput.value,password:passwordInput.value})});
  const data = await res.json();
  alert(data.success?"✅ Compte créé":"❌ "+data.msg)
}
async function login(){
  const res = await fetch("/login",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:userIdInput.value,password:passwordInput.value})});
  const data = await res.json();
  if(data.success){currentUser=userIdInput.value;localStorage.setItem("userId",currentUser);alert("✅ Connecté "+(data.pro?"- PRO":"- Free"))}
  else alert("❌ Login échoué")
}
async function generate(){
  if(!currentUser)return alert("Connecte-toi d'abord");
  addChat("⏳ Génération...");
  const res = await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:currentUser,message:"idée"})});
  const data = await res.json();
  addChat(data.reply)
}
async function sendMsg(){
  const msg = msgInput.value;
  if(!msg||!currentUser)return;
  addChat("Toi: "+msg);
  msgInput.value="";
  const res = await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:currentUser,message:msg})});
  const data = await res.json();
  addChat("IA: "+data.reply)
}
async function validateCode(){
  const res = await fetch("/premium",{method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({userId:currentUser,code:codeInput.value})});
  const data = await res.json();
  alert(data.success?"💎 PRO activé!":"❌ "+data.msg)
}
function pay(){
  if(!currentUser)return alert("Connecte-toi d'abord");
  window.location.href="/api/pay?userId="+currentUser
}
function addChat(text){
  const box=document.getElementById("chatBox");
  box.innerHTML+="<div style='margin:4px 0'>"+text+"</div>";
  box.scrollTop=box.scrollHeight
}
</script></body></html>`);
});

/* ======================
   START
====================== */
app.listen(PORT, () => console.log(`🚀 VORAX SAAS by Richmin ready on port ${PORT}`));
