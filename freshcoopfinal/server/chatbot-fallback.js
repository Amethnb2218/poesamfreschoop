function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function has(text, patterns) {
  return patterns.some((p) => text.includes(p));
}

export function generateLocalAnswer(message, lang, context) {
  const text = norm(message);
  const stats = context?.stats || {};
  const userName = context?.userName || '';

  if (lang === 'wo') return generateWolofAnswer(text, stats, userName);
  return generateFrenchAnswer(text, stats, userName);
}

function generateFrenchAnswer(text, stats, userName) {
  if (has(text, ['bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'coucou'])) {
    const name = userName ? ` ${userName.split(' ')[0]}` : '';
    return `Bonjour${name} ! Je suis FresCoop AI, votre assistant pour la plateforme agri-fintech. Je peux vous aider sur les prix du marche, la vente de produits, le credit bancaire, le suivi des lots, les paiements ou l'anti-gaspi. Posez-moi votre question !`;
  }

  if (has(text, ['qui es tu', 'qui es-tu', 'ton nom', 'tu es qui', 'c est quoi frescoop', 'presentation'])) {
    return `Je suis FresCoop AI, l'assistant intelligent de la plateforme FresCoop. FresCoop est une solution agri-fintech pour les filieres agricoles UEMOA qui combine micro-hubs solaires (stockage froid), intelligence marche et preuve economique portable pour proteger les revenus des producteurs et ouvrir l'acces au credit.`;
  }

  if (has(text, ['merci', 'thanks', 'ok merci'])) {
    return `Avec plaisir ! N'hesitez pas si vous avez d'autres questions sur FresCoop.`;
  }

  if (has(text, ['prix', 'cout', 'combien', 'tarif', 'cours', 'njeg', 'cher'])) {
    return `Les prix du jour sur FresCoop varient selon la saison et la zone. Quelques reperes : tomates 500-900 FCFA/kg, oignons 400-500 FCFA/kg, mangues Kent 700-1100 FCFA/kg, mil environ 22 000 FCFA/sac de 50kg. Consultez l'onglet Marche pour les prix en temps reel de ${stats.products || 'nos'} produits disponibles.`;
  }

  if (has(text, ['vendre', 'publier', 'poster', 'mettre en vente', 'comment vendre'])) {
    return `Pour vendre sur FresCoop : 1) Creez un compte Agriculteur, 2) Allez dans l'onglet Produits et cliquez + pour ajouter vos photos, prix et quantites, 3) Les acheteurs B2B et clients verront votre produit sur le Marche, 4) Les commandes arrivent avec paiement securise GIM-Pay (Wave, Orange Money, Free Money). Chaque vente renforce votre score de bancabilite.`;
  }

  if (has(text, ['credit', 'banq', 'bancabilite', 'pret', 'emprunt', 'bnde', 'microcred', 'financement'])) {
    return `FresCoop calcule un score de bancabilite de 0 a 100 base sur vos ventes (30 pts), la regularite des preuves GIM-Pay (25 pts), la diversification (20 pts) et les attestations validees (25 pts). Un score superieur ou egal a 70 rend votre dossier eligible chez BNDE, Microcred ou un SFD partenaire. Le dossier est exportable en PDF depuis l'onglet Bancabilite.`;
  }

  if (has(text, ['anti gaspi', 'antigaspi', 'gaspillage', 'perte', 'peremption', 'dlc', 'pourrir'])) {
    return `FresCoop propose 3 niveaux d'alerte anti-gaspi automatique. Critique (moins de 24h) : remise -40%. Eleve (2-3 jours) : remise -25%. Surveillance (4-6 jours) : remise -15%. L'agriculteur applique la remise en un clic et les acheteurs B2B sont notifies par SMS et push. Cela reduit les pertes post-recolte de 35% en moyenne.`;
  }

  if (has(text, ['lot', 'suivi', 'tracabilite', 'qr', 'froid', 'temperature'])) {
    return `Chaque lot FresCoop possede un QR code unique qui expose son origine (parcelle, village), les photos qualite, la temperature en hub froid en temps reel et l'historique complet (recolte, stockage, livraison, paiement). ${stats.lots ? stats.lots + ' lots sont actuellement traces' : 'Consultez l\'onglet Lots'} pour scanner un QR ou voir le detail.`;
  }

  if (has(text, ['pay', 'paiement', 'wave', 'orange money', 'paydunya', 'regler', 'facture'])) {
    return `Les paiements FresCoop passent par GIM-Pay de facon securisee : Wave, Orange Money, Free Money, cartes Visa/Mastercard et virement bancaire. L'argent va directement du client au producteur avec une commission transparente de 2%. Un recu automatique est genere dans votre espace Paiement.`;
  }

  if (has(text, ['ussd', 'telephone', '2g', '384', 'sans internet', 'sans smartphone'])) {
    return `Le service USSD *384*FRES# permet d'acceder a FresCoop depuis un telephone 2G sans Internet. Menu disponible en wolof, pulaar et francais : consulter les prix, declarer une vente, verifier votre solde, recevoir les alertes anti-gaspi et contacter un agent terrain. 100% couverture rurale.`;
  }

  if (has(text, ['attestation', 'certificat', 'document', 'preuve', 'dossier'])) {
    return `Les attestations FresCoop sont des documents officiels contenant votre identite, votre volume de transactions${stats.transactions ? ' (' + stats.transactions + ' enregistrees)' : ''}, une validation par un agent terrain et un QR code de verification. Elles sont exportables en PDF pour les banques et partenaires depuis l'onglet Attestations.`;
  }

  if (has(text, ['commande', 'acheter', 'achat', 'panier', 'livraison'])) {
    return `Le cycle d'une commande FresCoop : le client ajoute au panier depuis le Marche, valide et paye via GIM-Pay. Les statuts progressent de Nouvelle a Confirmee, En preparation puis Livree. Chaque etape notifie l'acheteur, le vendeur et l'agent terrain. ${stats.orders ? stats.orders + ' commandes traitees a ce jour.' : ''}`;
  }

  if (has(text, ['hub', 'stockage', 'entrepot', 'solaire', 'capacite'])) {
    return `Les micro-hubs solaires FresCoop sont des unites de stockage froid partagees alimentees par panneaux solaires. Capacite moyenne de 2-3 tonnes, temperature controlee en temps reel. Ils reduisent les pertes post-recolte de 35%. ${stats.hubs ? stats.hubs + ' hubs pilotes actifs.' : 'Plusieurs hubs pilotes sont prevus dans les bassins agricoles UEMOA.'}`;
  }

  if (has(text, ['impact', 'uemoa', 'odd', 'femme', 'inclusion', 'environnement'])) {
    return `FresCoop active plusieurs ODD : ODD 1 (revenus proteges), ODD 5 (productrices actives), ODD 8 (acces credit via bancabilite), ODD 12 (anti-gaspi et consommation responsable). La plateforme vise l'inclusion financiere des productrices et producteurs de la zone UEMOA, en transformant l'activite informelle en historique economique exploitable.`;
  }

  if (has(text, ['aide', 'support', 'probleme', 'contact', 'appeler'])) {
    return `L'equipe FresCoop est disponible 7j/7. Contactez-nous par email (support@frescoop.sn), telephone (+221 33 800 00 00) ou WhatsApp (+221 77 000 00 00). FresCoop AI est aussi disponible 24/7 en 4 langues. Le centre d'aide complet est accessible depuis Profil puis Centre d'aide.`;
  }

  if (has(text, ['tomate', 'oignon', 'mangue', 'mil', 'riz', 'arachide', 'bissap', 'niebe'])) {
    return `Les filieres les plus actives sur FresCoop sont le maraichage (tomates, oignons, carottes), les fruits (mangues Kent pour l'export, papayes), les cereales (mil, riz local de la Vallee) et la transformation (bissap seche, huile d'arachide). Chaque filiere a ses pics saisonniers. Consultez le Marche pour les disponibilites du moment.`;
  }

  return `Je suis FresCoop AI. Je peux vous aider sur de nombreux sujets : prix du marche, comment vendre vos produits, le credit et la bancabilite, l'anti-gaspi, la tracabilite des lots, les paiements GIM-Pay, les attestations, le USSD pour telephones simples, ou les micro-hubs solaires. Posez votre question plus precisement et je vous repondrai avec plaisir.`;
}

function generateWolofAnswer(text, stats, userName) {
  if (has(text, ['salamaleekum', 'salam', 'bonjour', 'nangadef', 'na nga def', 'salut'])) {
    const name = userName ? ` ${userName.split(' ')[0]}` : '';
    return `Salamaleekum${name} ! Maa ngi tudd FresCoop AI. Manaa la dimbalé ci : njëg yi (prix), jaay (vendre), jënd (acheter), crédit ak bancabilité, anti-gaspi, suivi lot yi, paiement GIM-Pay. Laaj ma lu la neex !`;
  }

  if (has(text, ['kan nga', 'kan la', 'qui es tu', 'ton nom'])) {
    return `Maa ngi tudd FresCoop AI, assistaan bu xam-xam bu plateforme FresCoop bi. FresCoop moo ngi wallu jaaykat yi ak jëndkat yi ci filières agricoles UEMOA. Manaa wax ci njëg, jaay, crédit, anti-gaspi ak paiement.`;
  }

  if (has(text, ['jerejef', 'jërëjëf', 'merci'])) {
    return `Jërëjëf ! Bul jàmm, laaj ma su la lu neex.`;
  }

  if (has(text, ['njeg', 'prix', 'nieg', 'combien', 'tarif', 'cout'])) {
    return `Njëg yi tey ci FresCoop : tomates 500-900 FCFA/kg, soble (oignon) 400-500 FCFA/kg, mango Kent 700-1100 FCFA/kg, duggub (mil) 22 000 FCFA/sac 50kg. Xoolal onglet Marché bi ngir gis njëg yi ci waxtu bi.`;
  }

  if (has(text, ['jaay', 'vendre', 'publier', 'jeeygol'])) {
    return `Ngir jaay ci FresCoop : 1) Bind sa compte Agriculteur, 2) Dem ci Produits, tobbal sa nataal yi ak njëg, 3) Jëndkat yi dinañu gis sa kirim ci Marché bi, 4) Paiement ci GIM-Pay (Wave, Orange Money). Jaay bu nekk moo ngi yokk sa score bancabilité.`;
  }

  if (has(text, ['credit', 'banq', 'bancabilite', 'pret', 'xaalis'])) {
    return `FresCoop day sàmm sa score bancabilité 0-100. Score bu ëpp ci 70 day tax nga mën jëlé crédit ci BNDE walla Microcred. Score bi dafa jëm ci lu ngay jaay (30 pts), preuves GIM-Pay (25 pts), diversification (20 pts) ak attestations (25 pts). Xoolal onglet Bancabilité bi.`;
  }

  if (has(text, ['anti gaspi', 'gaspi', 'perte', 'yàq', 'pourrir'])) {
    return `Anti-gaspi FresCoop : su kirim bi des na 24h, remise -40% automatique. 2-3 fan : -25%. 4-6 fan : -15%. Jaaykat bi day tëral remise bi ci ben clic, jëndkat B2B yi dinañu am alerte SMS. Loolu moo ngi wàññi pertes yi 35%.`;
  }

  if (has(text, ['pay', 'paiement', 'wave', 'orange', 'xaalis', 'fey'])) {
    return `Paiement ci FresCoop jëm ci GIM-Pay bu aar : Wave, Orange Money, Free Money, carte Visa/Mastercard. Xaalis bi jëm ci jaaykat bi directement, commission 2% rekk. Reçu automatique ci sa espace Paiement.`;
  }

  if (has(text, ['lot', 'suivi', 'qr', 'froid', 'temperature'])) {
    return `Lot bu nekk ci FresCoop am na QR code bu ñuul. Scan ko ngir gis : foo ko jële, nataal qualité, température hub froid bi ci waxtu bi, ak histoire bi yépp. ${stats.lots ? stats.lots + ' lots moo ngi suivi.' : ''}`;
  }

  if (has(text, ['hub', 'stockage', 'solaire'])) {
    return `Micro-hubs solaires FresCoop mooy entrepôt froid bu soleil moo ngi tàkk. Capacité 2-3 tonnes, température contrôlée ci waxtu bi. Day wàññi pertes 35%. ${stats.hubs ? stats.hubs + ' hubs pilotes moo ngi dox.' : ''}`;
  }

  if (has(text, ['commande', 'jend', 'acheter', 'panier'])) {
    return `Jënd ci FresCoop : tëral ci panier bi, fey ci GIM-Pay. Statut yi : Nouvelle, Confirmée, En préparation, Livrée. Jaaykat bi, jëndkat bi ak agent terrain bi dinañu am notification ci étape bu nekk.`;
  }

  if (has(text, ['aide', 'dimbal', 'problem', 'contact'])) {
    return `Ndimbali FresCoop : email support@frescoop.sn, tel +221 33 800 00 00, WhatsApp +221 77 000 00 00. FresCoop AI nii laa fi, 24/7 ci 4 làkk. Xoolal Centre d'aide bi ci Profil.`;
  }

  return `Maa ngi ci FresCoop AI. Manaa la dimbalé ci : njëg (prix), jaay (vendre), jënd (acheter), crédit, anti-gaspi, lots, paiement GIM-Pay, attestations, USSD *384*FRES# ak micro-hubs. Laaj ma ci li la bëgg précisément !`;
}
