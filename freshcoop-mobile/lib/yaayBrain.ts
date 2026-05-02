// Cerveau de Yaay : compréhension des intentions avec matching par MOT ENTIER
// (word boundaries) pour éviter que "bonjour" matche "prix du jour" par exemple.

import type { Store } from './api';

type Lang = 'fr' | 'wo' | 'pul' | 'sr';

export type YaayContext = {
  lang: Lang;
  user: {
    id: string;
    name: string;
    role: string;
    region?: string;
    organization?: string;
  } | null;
  store: Store;
};

type AnswerFn = (ctx: YaayContext) => string;

type Intent = {
  id: string;
  // Mots-clés par langue. Chaque mot-clé est un mot ou une expression.
  // Le matching se fait sur une frontière de mot (pas substring lâche).
  keywords: Partial<Record<Lang, string[]>>;
  answer: AnswerFn;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s*#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Matching par mot entier : on regarde si tous les mots du mot-clé apparaissent
// dans le texte, chacun comme un mot séparé. Ex: "prix du jour" matche
// "quel est le prix du jour" mais pas "bonjour".
function containsPhrase(text: string, phrase: string): boolean {
  const t = normalize(text);
  const p = normalize(phrase);
  if (!p) return false;
  // Chaque mot du phrase doit apparaître dans t comme mot entier.
  const words = p.split(' ').filter(Boolean);
  const tWords = t.split(' ').filter(Boolean);
  for (const w of words) {
    if (w.length <= 2) {
      // mots courts (ex: "cc") : match exact
      if (!tWords.includes(w)) return false;
    } else if (w.endsWith('*') || w.startsWith('*')) {
      // wildcard
      const base = w.replace(/\*/g, '');
      if (!tWords.some((tw) => tw.includes(base))) return false;
    } else {
      // mot entier (avec tolérance pluriel : "commande" matche "commandes")
      if (!tWords.some((tw) => tw === w || tw === `${w}s` || tw === w.slice(0, -1))) {
        return false;
      }
    }
  }
  return true;
}

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} M FCFA`;
  if (v >= 1000) return `${Math.round(v / 1000)}k FCFA`;
  return `${Math.round(v).toLocaleString('fr-FR')} FCFA`;
}

// === SALUTATIONS (prioritaires) =========================================

const GREETING_KEYWORDS: Record<Lang, string[]> = {
  fr: ['bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'coucou', 'cc', 'yo'],
  wo: ['salam', 'salamaleekum', 'asalam', 'nangadef', 'nanga def'],
  pul: ['mbaa kaa', 'assalam', 'no ngoni'],
  sr: ['nafio', 'nafiyo'],
};

function isGreeting(text: string): boolean {
  const t = normalize(text);
  const words = t.split(' ').filter(Boolean);
  if (words.length > 4) return false;
  const all = [
    ...GREETING_KEYWORDS.fr,
    ...GREETING_KEYWORDS.wo,
    ...GREETING_KEYWORDS.pul,
    ...GREETING_KEYWORDS.sr,
  ];
  return all.some((g) => words.includes(normalize(g)));
}

function greetingAnswer(ctx: YaayContext): string {
  const name = ctx.user?.name?.split(' ')[0] || '';
  const map: Record<Lang, string> = {
    fr: `Bonjour ${name} 👋\n\nJe suis FresCoop AI. Je peux vous aider sur :\n\n• Prix du marché\n• Publier un produit\n• Bancabilité et crédit\n• Anti-gaspi\n• Suivi d'un lot\n• Paiement PayDunya\n• Attestations\n• USSD *384*FRES#\n\nQue voulez-vous savoir ?`,
    wo: `Salamaleekum ${name} 👋\n\nMaa ngi tudd FresCoop AI. Wallu ma ci :\n\n• Njëg marché\n• Bind njaay\n• Crédit\n• Anti-gaspi\n• Suivi\n• Pay\n\nLan la bëgg a xam ?`,
    pul: `Mbaa kaa ${name} 👋\n\nKo miin woni FresCoop AI. Mbaawi mi wallu ma e :\n\n• Coggu\n• Winndu njeeygol\n• Tokkoral\n• Anti-gaspi\n• Ndaroo lot\n\nKo honno ?`,
    sr: `Nafio ${name} 👋\n\nMi tedd FresCoop AI. Le mbaane wallu ma ?`,
  };
  return map[ctx.lang];
}

// === INTENTS ============================================================

const INTENTS: Intent[] = [
  {
    id: 'thanks',
    keywords: {
      fr: ['merci', 'thanks', 'thx'],
      wo: ['jerejef', 'jërëjëf'],
      pul: ['a jaaraama', 'njaafi'],
      sr: ['yaad'],
    },
    answer: ({ lang }) => {
      const map: Record<Lang, string> = {
        fr: 'Avec plaisir 🌱 N\'hésitez pas si vous avez d\'autres questions.',
        wo: 'Ñoo ko bokk 🌱',
        pul: 'Njaafi 🌱',
        sr: 'Yaɗ 🌱',
      };
      return map[lang];
    },
  },

  {
    id: 'who-am-i',
    keywords: {
      fr: [
        'qui suis je',
        'qui suis-je',
        'mon profil',
        'mes infos',
        'mon compte',
        'mon rôle',
        'mon role',
      ],
      wo: ['sama profil', 'sama compte'],
      pul: ['konngol am'],
      sr: ['ma kan'],
    },
    answer: ({ user }) => {
      if (!user) return 'Vous n\'êtes pas connecté.';
      return `Vous êtes connecté en tant que ${user.name} (rôle ${user.role}).${user.organization ? ` Organisation : ${user.organization}.` : ''}${user.region ? ` Région : ${user.region}.` : ''}`;
    },
  },

  {
    id: 'how-sell',
    keywords: {
      fr: [
        'vendre',
        'publier produit',
        'ajouter produit',
        'mettre en vente',
        'poster',
        'comment vendre',
      ],
      wo: ['jaay', 'bind njaay'],
      pul: ['njeeygol', 'winndu njeeygol'],
      sr: ['felax'],
    },
    answer: ({ user, store }) => {
      if (user?.role === 'agriculteur') {
        const mine = (store.products || []).filter((p: any) => p.ownerId === user.id).length;
        return `Pour publier un produit :\n\n1. Onglet Produits\n2. Bouton + en bas à droite\n3. Photos, catégorie, prix, quantité, zone\n4. Publier — visible immédiatement sur le Marché\n\nVous avez ${mine} produit(s) publié(s). L'IA prix vous dira si votre tarif est aligné marché.`;
      }
      return `La publication est réservée aux agriculteurs. Parcours :\n\n1. Producteur publie le produit avec photo\n2. Acheteur commande depuis le Marché\n3. Paiement PayDunya (Wave, Orange Money, carte)\n\nInscrivez-vous en tant qu'Agriculteur pour vendre.`;
    },
  },

  {
    id: 'prices',
    keywords: {
      fr: [
        'prix du jour',
        'prix marche',
        'prix marché',
        'cours',
        'cours du jour',
        'tarif',
        'tarifs',
        'combien coûte',
        'combien coute',
        'moyenne prix',
        'prix moyen',
      ],
      wo: ['njëg bis', 'njeg bis'],
      pul: ['coggu hannde'],
      sr: ['kirim penaar'],
    },
    answer: ({ store }) => {
      const products = (store.products || []).filter((p: any) => Number(p.price) > 0);
      if (products.length === 0) return 'Aucun produit actif sur le marché pour le moment.';
      const byCat = new Map<string, number[]>();
      products.forEach((p: any) => {
        const cat = p.category || 'Autre';
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat)!.push(Number(p.price));
      });
      const lines = Array.from(byCat.entries())
        .slice(0, 5)
        .map(([cat, list]) => {
          const avg = Math.round(list.reduce((a, b) => a + b, 0) / list.length);
          return `• ${cat} : ${avg.toLocaleString('fr-FR')} F (moyenne sur ${list.length})`;
        })
        .join('\n');
      return `Prix moyens par catégorie sur ${products.length} produits actifs :\n\n${lines}\n\nConsultez l'onglet Marché pour voir chaque produit avec photo, région et vendeur.`;
    },
  },

  {
    id: 'credit',
    keywords: {
      fr: [
        'credit',
        'crédit',
        'emprunt',
        'banque',
        'prêt',
        'pret',
        'bancabilite',
        'bancabilité',
        'score',
        'bnde',
        'microcred',
      ],
      wo: ['crédit', 'banq'],
      pul: ['tokkoral', 'banka'],
      sr: ['haat'],
    },
    answer: ({ user, store }) => {
      if (user?.role === 'agriculteur') {
        const myTx = (store.transactions || []).filter(
          (t: any) => t.userId === user.id || t.ownerId === user.id,
        );
        const vol = myTx.reduce((a: number, t: any) => a + Number(t.amount || 0), 0);
        return `Votre score bancabilité est calculé sur 4 axes (0-100) :\n\n📈 Volumes de vente (30 pts)\n📋 Constance des preuves (25 pts)\n🎯 Diversification (20 pts)\n🛡️ Attestations (25 pts)\n\nVous avez ${myTx.length} transaction(s) pour ${fmtMoney(vol)}.\n\nConsultez "Mon espace → Bancabilité" pour voir votre score et les recommandations.`;
      }
      return `FresCoop calcule un score bancabilité (0-100) pour chaque agriculteur à partir de ses ventes, paiements, attestations et diversification. Au-delà de 70 : dossier éligible au crédit BNDE, Microcred ou SFD. Export PDF depuis la page Bancabilité.`;
    },
  },

  {
    id: 'anti-waste',
    keywords: {
      fr: [
        'anti gaspi',
        'anti-gaspi',
        'antigaspi',
        'gaspillage',
        'perte',
        'pertes',
        'dlc',
        'péremption',
        'peremption',
        'flash',
        'vente éclair',
        'vente eclair',
      ],
      wo: ['yàq', 'yaq', 'bonnde'],
      pul: ['bonnde', 'renoo'],
      sr: ['ŋoox', 'noox'],
    },
    answer: ({ store }) => {
      const atRisk = (store.products || []).filter((p: any) => {
        const age = (Date.now() - new Date(p.createdAt || Date.now()).getTime()) / 86400000;
        return age > 4 && Number(p.quantity || 0) > 0;
      }).length;
      return `FresCoop détecte les lots à DLC courte (≤6 jours) et propose 3 niveaux d'alerte :\n\n🔴 Critique (≤24h) : −40% automatique\n🟡 Élevé (2-3j) : −25%\n🟠 Surveillance (4-6j) : −15%\n\nActuellement ${atRisk} produit(s) à risque.\n\nL'agriculteur applique la remise en 1 clic (menu Anti-gaspi), les acheteurs B2B reçoivent une notification instantanée.`;
    },
  },

  {
    id: 'traceability',
    keywords: {
      fr: [
        'lot',
        'lots',
        'tracabilite',
        'traçabilité',
        'tracer',
        'qr code',
        'qr',
        'temperature',
        'température',
        'hub froid',
        'froid',
        'suivi',
      ],
      wo: ['topp', 'froid'],
      pul: ['ndaroo'],
      sr: ['suivi'],
    },
    answer: ({ store }) => {
      const lots = store.lots?.length || 0;
      const hubs = store.hubs?.length || 0;
      return `Chaque lot FresCoop a un QR code unique qui expose :\n\n📍 Origine (parcelle, village)\n📸 Photos qualité à la récolte\n❄️ Température du hub froid\n📊 Historique des statuts (récolté → livré → payé)\n🔗 Commande et paiement associés\n\n${lots} lot(s) tracé(s) sur ${hubs} hub(s) solaires au Sénégal. Scannez un QR depuis l'onglet Lots (bouton bleu).`;
    },
  },

  {
    id: 'ussd',
    keywords: {
      fr: [
        'ussd',
        'pas de smartphone',
        'sans internet',
        'sans smartphone',
        'telephone basique',
        'téléphone basique',
        '384',
        'hors ligne',
        'hors-ligne',
        'offline',
        '2g',
      ],
      wo: ['telephone tuuti'],
      pul: ['simartifol'],
      sr: ['ana telephone'],
    },
    answer: () => {
      return `Pas besoin de smartphone :\n\n📞 Composez *384*FRES# depuis n'importe quel téléphone (2G inclus)\n\nMenu disponible en wolof, pulaar, français :\n1. Prix du jour\n2. Déclarer une vente\n3. Mon solde FresCoop\n4. Alerte anti-gaspi\n5. Contacter un agent\n\nSimulateur dans "Mon espace → USSD". Frais opérateur standards.`;
    },
  },

  {
    id: 'payment',
    keywords: {
      fr: [
        'paiement',
        'payer',
        'wave',
        'orange money',
        'paydunya',
        'facture',
        'reçu',
        'recu',
        'remboursement',
        'moyen de paiement',
        'mobile money',
      ],
      wo: ['pay'],
      pul: ['njoɓdi'],
      sr: ['pay'],
    },
    answer: () => {
      return `FresCoop utilise PayDunya pour des paiements sécurisés :\n\n💳 Wave, Orange Money, Free Money\n💵 Cartes Visa/Mastercard\n🏦 Virement bancaire\n💼 Paiement à la livraison (physique)\n\nL'argent va directement du client au producteur (pas par FresCoop). Commission transparente de 2%. Reçu automatique dans "Mon espace → Paiement".`;
    },
  },

  {
    id: 'attestations',
    keywords: {
      fr: [
        'attestation',
        'attestations',
        'certificat',
        'dossier bancaire',
        'document officiel',
        'export pdf',
      ],
      wo: ['dossier', 'kayit'],
      pul: ['deftere'],
      sr: ['dossier'],
    },
    answer: ({ store, user }) => {
      const all = store.attestations || [];
      const mine = user
        ? all.filter((a: any) => a.userId === user.id || a.ownerId === user.id).length
        : 0;
      return `Les attestations FresCoop sont des documents officiels signés qui prouvent votre activité économique :\n\n📄 Inscription et ancienneté\n💰 Volume de transactions\n✅ Validation terrain\n🔒 QR code de vérification\n\n${all.length} attestation(s) dans le système${mine > 0 ? `, dont ${mine} à votre nom` : ''}. Menu "Attestations" pour voir le format complet (exportable PDF).`;
    },
  },

  {
    id: 'messages',
    keywords: {
      fr: [
        'message',
        'messages',
        'chat',
        'contacter',
        'parler au vendeur',
        'parler',
        'discussion',
        'conversation',
        'discuter',
      ],
      wo: ['xalaat', 'woote'],
      pul: ['yamiroore'],
      sr: ['message'],
    },
    answer: ({ user, store }) => {
      const msgs = user
        ? (store.messages || []).filter(
            (m: any) => m.fromId === user.id || m.toId === user.id,
          ).length
        : 0;
      return `Pour contacter un utilisateur :\n\n1. Sur la fiche produit → "Contacter le vendeur"\n2. Ou action rapide "Messages" depuis l'Accueil\n3. Tapez, envoyez, notification instantanée\n\n${msgs} message(s) dans vos conversations. Onglet Messages accessible depuis le Profil.`;
    },
  },

  {
    id: 'orders',
    keywords: {
      fr: [
        'commande',
        'commandes',
        'panier',
        'acheter',
        'achat',
        'livraison',
        'statut',
        'livrer',
        'passer commande',
      ],
      wo: ['jënd', 'commander'],
      pul: ['soodugol'],
      sr: ['jim moox'],
    },
    answer: ({ user, store }) => {
      if (!user) return 'Connectez-vous pour voir vos commandes.';
      const my = (store.orders || []).filter(
        (o: any) =>
          o.userId === user.id ||
          o.buyerId === user.id ||
          o.sellerId === user.id,
      );
      return `Vous avez ${my.length} commande(s). Cycle :\n\n1. Client ajoute au panier sur le Marché\n2. Validation → commande envoyée au producteur + agent\n3. Statuts : Paiement confirmé → Préparation → Prête → En livraison → Livrée\n4. Paiement sécurisé PayDunya à chaque étape\n\nOnglet Panier (client) ou Commandes (vendeur).`;
    },
  },

  {
    id: 'impact',
    keywords: {
      fr: [
        'impact',
        'poesam',
        'odd',
        'femmes',
        'productrices',
        'inclusion',
        'environnement',
        'co2',
        'carbone',
        'developpement durable',
        'développement durable',
      ],
    },
    answer: ({ store }) => {
      const women = (store.users || []).filter(
        (u: any) => u.role === 'agriculteur' && u.status === 'Actif',
      ).length;
      const volume = (store.lots || []).reduce(
        (a: number, l: any) => a + Number(l.weight || 0),
        0,
      );
      return `FresCoop active directement 4 ODD :\n\n🎯 ODD 1 · Pas de pauvreté — revenus protégés\n👩 ODD 5 · Égalité femmes-hommes — autonomisation\n💼 ODD 8 · Travail décent — accès au crédit\n🌱 ODD 12 · Consommation responsable — anti-gaspi\n\nChiffres actuels :\n• ${women} productrices actives\n• ${volume.toLocaleString('fr-FR')} kg tracés\n\nOnglet Impact pour voir les graphiques "avant / après FresCoop".`;
    },
  },

  {
    id: 'what-is',
    keywords: {
      fr: [
        'frescoop',
        'c est quoi',
        'cest quoi',
        'qu est ce',
        'presentation',
        'présentation',
        'qui êtes vous',
        'qui etes vous',
        'mission',
        'projet',
        'app',
      ],
    },
    answer: () => {
      return `FresCoop est la plateforme sénégalaise qui connecte productrices, commerçantes et acheteurs B2B autour de 3 briques :\n\n🌞 Micro-hubs solaires — stockage froid partagé, -35% de pertes\n📊 Intelligence marché — bon prix, bon acheteur, bon délai\n🏛️ Preuve économique portable — accès au crédit\n\nMission : protéger le revenu des productrices, réduire le gaspillage, ouvrir l'inclusion financière. Candidat POESAM 2026.`;
    },
  },

  {
    id: 'help',
    keywords: {
      fr: [
        'aide',
        'support',
        'probleme',
        'problème',
        'contact',
        'telephone frescoop',
        'téléphone frescoop',
        'email',
        'centre aide',
        'centre d aide',
      ],
    },
    answer: () => {
      return `Besoin d'aide ?\n\n📧 support@frescoop.sn\n📞 +221 33 800 00 00\n💬 WhatsApp +221 77 000 00 00\n🤖 FresCoop AI (moi) — 24/7\n\nLe Centre d'aide complet est dans Profil → Aide. FAQ, tutoriels, équipe terrain en wolof, pulaar, sérère, français.`;
    },
  },

  {
    id: 'hubs',
    keywords: {
      fr: [
        'hub',
        'hubs',
        'stockage',
        'entrepot',
        'entrepôt',
        'capacité',
        'capacite',
        'batterie',
        'solaire',
      ],
    },
    answer: ({ store }) => {
      const hubs = store.hubs || [];
      if (hubs.length === 0) {
        return `Les micro-hubs FresCoop sont des points de stockage froid partagés, alimentés par énergie solaire. Ils triplent la durée de vie des produits frais. Capacité moyenne : 2-3 tonnes. Objectif : 50 hubs d'ici 2027.`;
      }
      const total = hubs.reduce((a: number, h: any) => a + Number(h.capacityKg || 0), 0);
      return `${hubs.length} micro-hub(s) solaires actifs, capacité totale ${total.toLocaleString(
        'fr-FR',
      )} kg. Chaque hub expose :\n\n❄️ Température en temps réel\n🔋 % batterie solaire\n📦 Stock actuel / capacité\n♻️ kg de pertes évitées\n\nDétail dans l'onglet Opérations.`;
    },
  },

  {
    id: 'profile-edit',
    keywords: {
      fr: [
        'modifier profil',
        'changer mot de passe',
        'photo de profil',
        'changer email',
        'modifier mon profil',
      ],
    },
    answer: () =>
      `Pour modifier votre profil :\n\n1. Ouvrez l'onglet Profil\n2. Touchez "Modifier mon profil" : nom, téléphone, région, organisation, bio\n3. Pour la photo : touchez votre avatar en haut du profil → Prendre une photo / Galerie\n\nL'email ne peut être changé que par un admin (sécurité).`,
  },

  {
    id: 'demo',
    keywords: {
      fr: ['demo', 'démo', 'données démo', 'donnees demo', 'jury', 'présentation jury'],
    },
    answer: () =>
      `Mode démo POESAM :\n\n1. Ouvrez Profil → Serveur & données\n2. Touchez "Charger les données démo"\n3. Instantanément : 50 productrices, 200 produits, 150 commandes, 80 lots, 8 hubs\n\nParfait pour présenter au jury. Pour un pitch plein écran, utilisez "Mode présentation" dans le Profil — 7 slides avec stats live.\n\nLe mode démo peut être retiré à tout moment depuis le même écran.`,
  },
];

// Détection d'intention par scoring : on additionne les longueurs des phrases
// matchées. Celle avec le meilleur score gagne.
function bestIntent(text: string, ctx: YaayContext): Intent | null {
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    const phrases = intent.keywords[ctx.lang] || intent.keywords.fr || [];
    let score = 0;
    for (const phrase of phrases) {
      if (containsPhrase(text, phrase)) {
        score += phrase.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }
  return best?.intent || null;
}

// Fallback intelligent : suggère des questions utiles.
function fallback(ctx: YaayContext): string {
  const map: Record<Lang, string> = {
    fr: `Je n'ai pas bien compris 🤔\n\nVoici ce que je sais faire :\n\n• Prix du marché actuel\n• Comment vendre un produit\n• Bancabilité et crédit\n• Anti-gaspi et remises flash\n• Suivre un lot avec QR\n• Paiement PayDunya\n• Attestations officielles\n• USSD *384*FRES#\n\nOu tapez : prix, vendre, crédit, livraison, hub, impact, aide, démo…`,
    wo: `Xamuma lu nga laaj 🤔\n\nJëfandikoo baat yii : njëg, jaay, crédit, anti-gaspi, suivi, pay.`,
    pul: `Mi faamaali 🤔\n\nNaamno : coggu, njeeygol, tokkoral, anti-gaspi.`,
    sr: `Mi fa manel 🤔`,
  };
  return map[ctx.lang];
}

export function answer(input: string, ctx: YaayContext): string {
  const cleaned = input.trim();
  if (!cleaned) return fallback(ctx);

  // 1. Salutation prioritaire
  if (isGreeting(cleaned)) {
    return greetingAnswer(ctx);
  }

  // 2. Intent matching par mot entier
  const intent = bestIntent(cleaned, ctx);
  if (intent) return intent.answer(ctx);

  // 3. Fallback
  return fallback(ctx);
}

// Suggestions contextuelles selon rôle
export function suggestions(ctx: YaayContext): string[] {
  const role = ctx.user?.role;
  if (ctx.lang !== 'fr') {
    return ['Coggu ɗemngal ?', 'No mbaawnoo njeeygol ?', 'Lan mooy anti-gaspi ?'];
  }
  if (role === 'agriculteur') {
    return [
      'Comment vendre mes produits ?',
      'Comment obtenir un crédit ?',
      "Comment fonctionne l'anti-gaspi ?",
      'Quel est mon score bancabilité ?',
    ];
  }
  if (role === 'client' || role === 'acheteurB2B') {
    return [
      'Quel est le prix du jour ?',
      'Comment contacter un vendeur ?',
      'Comment payer une commande ?',
      "Qu'est-ce qu'une attestation ?",
    ];
  }
  if (role === 'transporteur') {
    return ['Comment voir mes tournées ?', 'Où sont les hubs froids ?', 'Anti-gaspi en urgence ?'];
  }
  if (role === 'partenaire') {
    return ['Comment fonctionne la bancabilité ?', 'Format des attestations ?', 'Impact POESAM ?'];
  }
  if (role === 'admin') {
    return ['Vue impact global', 'Combien de productrices ?', 'Performance des hubs ?'];
  }
  return [
    "C'est quoi FresCoop ?",
    'Comment vendre mes produits ?',
    'Comment suivre un lot ?',
    "Qu'est-ce que l'anti-gaspi ?",
  ];
}
