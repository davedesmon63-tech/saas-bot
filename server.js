// 🔵 PRO MODE (15 idées business)
  if (user.pro) {

    const proIdeas = [
      `💡 BUSINESS PRO 1 :
TikTok boutique automatisée + produits viraux

📈 Stratégie :
- vidéos courtes
- produits tendance
- influenceurs

💰 10k - 50k FCFA/jour`,

      `💡 BUSINESS PRO 2 :
Gestion WhatsApp Business pour commerces

📈 Stratégie :
- répondre clients
- automatisation messages
- abonnement mensuel

💰 20k FCFA/jour`,

      `💡 BUSINESS PRO 3 :
Service montage vidéo TikTok

💰 15k - 50k FCFA/jour`,

      `💡 BUSINESS PRO 4 :
Dropshipping produits tendance

💰 10k - 60k FCFA/jour`,

      `💡 BUSINESS PRO 5 :
Création CV professionnels (Canva)

💰 5k - 20k FCFA/jour`,

      `💡 BUSINESS PRO 6 :
Mini agence publicité TikTok

💰 30k - 100k FCFA/mois`,

      `💡 BUSINESS PRO 7 :
Affiliation produits viraux

💰 revenu passif`,

      `💡 BUSINESS PRO 8 :
Formation en ligne WhatsApp + PDF

💰 10k FCFA/jour`,

      `💡 BUSINESS PRO 9 :
Gestion pages Instagram entreprises

💰 20k - 70k FCFA/mois`,

      `💡 BUSINESS PRO 10 :
Bots WhatsApp pour entreprises

💰 20k FCFA/client`,

      `💡 BUSINESS PRO 11 :
Revente services digitaux (logos, flyers)

💰 5k - 30k FCFA/jour`,

      `💡 BUSINESS PRO 12 :
Marketing d’influence micro

💰 variable`,

      `💡 BUSINESS PRO 13 :
Pages Facebook monétisées

💰 revenu passif`,

      `💡 BUSINESS PRO 14 :
Service e-commerce WhatsApp catalogue

💰 10k - 80k FCFA/jour`,

      `💡 BUSINESS PRO 15 :
Revente produits locaux avec marge

💰 5k - 40k FCFA/jour`
    ];

    const idea = proIdeas[Math.floor(Math.random() * proIdeas.length)];

    return res.json({
      reply: "🔥 PRO ACTIF\n\n" + idea
    });
  }