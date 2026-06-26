const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { CheckoutStore } = require('paydunya-nodejs-sdk');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text({type: '*/*'}));

const PORT = process.env.PORT || 3000;
const PRICE = 2500;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// FAKE DB - Remplace par MongoDB/Postgres après
let subscribers = {}; // { "phone": {active: true, expires: timestamp, paydunya_ref: "..."} }

const paydunyaSetup = {
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: 'test'
};

// 2 IDÉES GRATUITES
const freeIdeas = [
  {
    id: 1, title: "Vente de parfums huilés", marge: "200-300%", budget: "25k-40k FCFA",
    etapes: ["1. ACHAT: 6 fragrances chez grossiste Adjamé...", "2. TEST: 20 personnes...", "3. VENTE: Statut WhatsApp...", "4. FIDÉLITÉ: 5 achetés = 1 offert", "5. SCALE: Recrute apprenti"],
    modeles: "script_vente.txt", contact: "Mamadou +225 07 XX"
  },
  {
    id: 2, title: "Formation WhatsApp Business", marge: "90%", budget: "0 FCFA",
    etapes: ["1. CONTENU: PDF 5 pages...", "2. PACK: 3 vidéos 2min...", "3. VENTE: Statut...", "4. LIVRAISON: Envoie PDF...", "5. UPSSELL: Groupe VIP"],
    modeles: "template_pdf.pdf", contact: "Drive lien"
  }
];

// 10 IDÉES PRO - 5 étapes + modèles + contacts
const proIdeas = [
  {id: 3, title: "Dropshipping beauté", etapes: ["1. FOURNISSEURS: CJDropshipping...", "2. BOUTIQUE: Shopify 1$...", "3. PUB: TikTok Ads...", "4. SAV: Remboursement >20j", "5. STOCK LOCAL: Import 20 pièces"], modeles: "shopify.zip", contact: "Agent +86 138 XXXX"},
  {id: 4, title: "Livraison repas", etapes: ["1. MENU: Riz sauce graine...", "2. CLIENTS: Groupes WhatsApp...", "3. LOGISTIQUE: Livraison 12h/19h", "4. FIDÉLITÉ: Abonnement semaine", "5. SCALE: Recrute 2e cuisinière"], modeles: "menu.xlsx", contact: "Awa +225 05 XX"},
  {id: 5, title: "Customisation t-shirts", etapes: ["1. MATÉRIEL: Presse 25k...", "2. DESIGNS: Pinterest...", "3. VENTE: TikTok direct...", "4. DÉLAI: 48h max", "5. B2B: Clubs étudiants"], modeles: "designs.zip", contact: "Kone +225 01 XX"},
  {id: 6, title: "Revente crédits/data", etapes: ["1. INSCRIPTION: API CinetPay...", "2. BOT: Bot WhatsApp...", "3. PAIEMENT: Lien auto...", "4. 24/7: Encaisse nuit", "5. PARRAINAGE: 100 FCFA/filleul"], modeles: "bot.js", contact: "support@cinetpay.com"},
  {id: 7, title: "Community Manager", etapes: ["1. PROSPECTION: 10 restos...", "2. CONTENU: 3 posts/semaine", "3. RÉSULTAT: Montre DM...", "4. TARIF: 30k/mois", "5. 5 CLIENTS: 150k/mois"], modeles: "calendrier.xlsx", contact: "unsplash.com"},
  {id: 8, title: "Décoration événementielle", etapes: ["1. PACK: 3 thèmes...", "2. PORTFOLIO: 2 décos gratos", "3. TARIF: 75k pack 20p", "4. PARTENARIAT: Pâtissier", "5. CALENDRIER: Acompte 50%"], modeles: "devis.xlsx", contact: "Fatou +225 07 XX"},
  {id: 9, title: "Réparation phone domicile", etapes: ["1. FORMATION: YouTube écran/batterie", "2. PIÈCES: Grossiste Adjamé", "3. SERVICE: Dépannage 1h à domicile", "4. GARANTIE: 1 mois", "5. CARNET: Rappel 18 mois"], modeles: "liste_pieces.pdf", contact: "Fournisseur +225 05 XX"},
  {id: 10, title: "Vente jus detox", etapes: ["1. RECETTES: Gingembre-citron...", "2. BOUTEILLES: 50cl + étiquette", "3. LIVRAISON: 7h-9h cure matin", "4. CURE: 7 jours -15%", "5. TÉMOIGNAGE: Client/semaine"], modeles: "etiquette.png", contact: "Marché Gouro +225 01 XX"},
  {id: 11, title: "CV + Lettre motivation IA", etapes: ["1. TEMPLATES: 3 modèles Canva", "2. SERVICE: 24h envoi", "3. PUB: Groupes Facebook emploi", "4. TARIF: 2000 CV / 3500 pack", "5. SUIVI: 2 modifs gratuites"], modeles: "3_templates.docx", contact: "Drive CV"},
  {id: 12, title: "Vente mèches/perruques", etapes: ["1. STOCK: 3 modèles qui tournent", "2. POSE: Gratuite si achat", "3. TIKTOK: Transformation avant/après", "4. PAIEMENT: 50% avance", "5. VIP: Groupe prévente"], modeles: "photos_pro.zip", contact: "Grossiste +225 07 XX"}
];

// MIDDLEWARE: Vérifier si abonnement actif
function checkSubscription(req, res, next) {
  const phone = req.body.phone || req.query.phone;
  if (!phone) return res.status(400).json({error: "Numéro WhatsApp requis"});

  const sub = subscribers[phone];
  const now = Date.now();

  if (!sub ||!sub.active || sub.expires < now) {
    return res.status(403).json({error: "Abonnement expiré. Paye 2500 FCFA pour débloquer"});
  }
  req.phone = phone;
  next();
}

// ROUTES GRATUITES
app.get('/api/ideas/free', (req, res) => {
  res.json({ideas: freeIdeas});
});

// ROUTES PRO - Protégées
app.get('/api/ideas/pro', checkSubscription, (req, res) => {
  res.json({ideas: proIdeas});
});

app.get('/api/ideas/pro/:id', checkSubscription, (req, res) => {
  const idea = proIdeas.find(i => i.id == req.params.id);
  if (!idea) return res.status(404).json({error: "Idée introuvable"});
  res.json(idea);
});

// PAIEMENT
app.post('/api/pay/create', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({error: "Numéro requis"});

    const checkout = new CheckoutStore(paydunyaSetup);
    checkout.addItem('VORAX PRO 30 jours', 1, PRICE, PRICE);
    checkout.setTotalAmount(PRICE);
    checkout.setDescription('Accès 10 business complets + modèles + contacts');
    checkout.setCallbackUrl(BASE_URL + '/api/pay/notify');
    checkout.setReturnUrl(BASE_URL + `/?pro=true&phone=${phone}`);
    checkout.addCustomData(phone);

    const response = await checkout.create();
    if(response.success) res.json({success: true, url: response.response_text});
    else res.status(500).json({success: false, error: response.response_text});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// WEBHOOK IPN - Active abonnement 30 jours
app.post('/api/pay/notify', (req, res) => {
  try {
    const data = JSON.parse(req.body);
    console.log('IPN reçu:', data.data.status);

    if(data.data.status === 'completed') {
      const phone = data.data.custom_data;
      const ref = data.data.invoice.token;

      subscribers[phone] = {
        active: true,
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // +30 jours
        paydunya_ref: ref,
        amount: data.data.amount
      };
      console.log(`Abonnement activé pour ${phone} jusqu'au ${new Date(subscribers[phone].expires)}`);
    }
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(200);
  }
});

// VÉRIFIER STATUT ABONNEMENT
app.post('/api/subscription/status', (req, res) => {
  const { phone } = req.body;
  const sub = subscribers[phone];

  if (!sub) return res.json({active: false, message: "Aucun abonnement"});

  const now = Date.now();
  if (sub.expires > now) {
    const joursRestants = Math.ceil((sub.expires - now) / (1000*60*60*24));
    res.json({active: true, expires: sub.expires, jours_restants: joursRestants});
  } else {
    sub.active = false;
    res.json({active: false, message: "Abonnement expiré"});
  }
});

// ANNULER ABONNEMENT
app.post('/api/subscription/cancel', (req, res) => {
  const { phone } = req.body;
  const sub = subscribers[phone];

  if (!sub) return res.status(404).json({error: "Aucun abonnement trouvé"});

  sub.active = false;
  sub.expires = Date.now(); // Expire immédiatement
  res.json({success: true, message: "Abonnement annulé. Accès coupé immédiatement"});
});

// PAGE TEST
app.get('/', (req, res) => {
  res.send(`
    <h1>VORAX PRO</h1>
    <div id="app"></div>
    <script>
      const phone = prompt('Ton numéro WhatsApp:');

      // Vérifier statut
      fetch('/api/subscription/status', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({phone})})
     .then(r=>r.json()).then(status=>{
        if(status.active) showPro(phone, status.jours_restants);
        else showFree(phone);
      });

      function showFree(phone) {
        fetch('/api/ideas/free').then(r=>r.json()).then(d=>{
          document.getElementById('app').innerHTML =
            '<h2>2 Idées Gratuites</h2>' +
            d.ideas.map(i=>'<div><h3>'+i.title+'</h3><p>'+i.etapes[0]+'</p></div>').join('') +
            '<button onclick="payer()">Débloquer 10 idées PRO - 2500 FCFA</button>';
        });
      }

      function showPro(phone, jours) {
        document.getElementById('app').innerHTML =
          '<h2>Accès PRO - '+jours+' jours restants</h2>' +
          '<button onclick="annuler()">Annuler abonnement</button>' +
          '<div id="ideas"></div>';
        fetch('/api/ideas/pro?phone='+phone).then(r=>r.json()).then(d=>{
          document.getElementById('ideas').innerHTML = d.ideas.map(i=>
            '<div><h3>'+i.title+'</h3><button onclick="voir(\''+phone+'\','+i.id+')">Voir 5 étapes</button></div>'
          ).join('');
        });
      }

      async function payer() {
        const r = await fetch('/api/pay/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
        const data = await r.json();
        if(data.success) location.href = data.url;
      }

      async function annuler() {
        await fetch('/api/subscription/cancel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});
        alert('Abonnement annulé');
        location.reload();
      }

      function voir(phone,id) {
        fetch('/api/ideas/pro/'+id+'?phone='+phone).then(r=>r.json()).then(d=>{
          alert(d.etapes.join('\\n\\n') + '\\n\\nModèles: '+d.modeles+'\\nContact: '+d.contact);
        });
      }
    </script>
  `);
});

app.listen(PORT, () => console.log('VORAX PRO live', PORT));