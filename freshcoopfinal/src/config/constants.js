// ─── API & Storage Keys ─────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_URL || '';

export const STORAGE_KEY = 'frescoop.production.roles.v2';
export const SESSION_KEY = 'frescoop.session.user';
export const CART_KEY = 'frescoop.cart';
export const HIDDEN_ORDERS_KEY = 'frescoop.hidden.orders';
export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const PRODUCT_PAGE_SIZE_OPTIONS = [6, 9, 12];
export const ORDER_PAGE_SIZE_OPTIONS = [5, 10, 20];

// ─── Seeded Admin ───────────────────────────────────────────────────────────
export const SEEDED_ADMIN_EMAIL = 'amethsl2218@gmail.com';
export const SEEDED_ADMIN_PASSWORD_HASH = '62a1a5600217bfc84fa5ac26faf898b366581f3b1512624444654b795b108a92';

export const SEEDED_ADMIN_USER = {
  id: 'usr-admin-uemoa',
  createdAt: '2026-04-28T00:00:00.000Z',
  name: 'Admin FresCoop',
  email: SEEDED_ADMIN_EMAIL,
  phone: '',
  role: 'admin',
  status: 'Actif',
  organization: 'FresCoop',
  region: '',
  bio: '',
  passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
};

export const SEEDED_ADMIN_USERS = [
  SEEDED_ADMIN_USER,
  {
    id: 'usr-admin-richef360',
    createdAt: '2026-04-29T00:00:00.000Z',
    name: 'Admin Richef360',
    email: 'richef360@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-dsenghor96',
    createdAt: '2026-04-29T00:00:00.000Z',
    name: 'Admin Dsenghor96',
    email: 'dsenghor96@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-nyacine183',
    createdAt: '2026-04-29T00:00:00.000Z',
    name: 'Admin Nyacine183',
    email: 'nyacine183@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-seydinalimamoulayeyade',
    createdAt: '2026-04-29T00:00:00.000Z',
    name: 'Admin Seydinalimamoulayeyade',
    email: 'seydinalimamoulayeyade@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-diagnealia03',
    createdAt: '2026-04-29T00:00:00.000Z',
    name: 'Admin Diagnealia03',
    email: 'diagnealia03@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-manediop945',
    createdAt: '2026-04-29T00:00:00.000Z',
    name: 'Admin Manediop945',
    email: 'manediop945@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-papa',
    createdAt: '2026-05-02T00:00:00.000Z',
    name: 'Papa Lioune',
    email: 'papalioune03@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
  {
    id: 'usr-admin-niangra',
    createdAt: '2026-05-02T00:00:00.000Z',
    name: 'Niangra Matoulaye',
    email: 'niangramatoulaye165@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: SEEDED_ADMIN_PASSWORD_HASH,
  },
];

// ─── Roles ──────────────────────────────────────────────────────────────────
export const roles = [
  { id: 'admin', label: 'Admin', locked: true },
  { id: 'agriculteur', label: 'Agriculteur' },
  { id: 'agentTerrain', label: 'Agent Terrain' },

  { id: 'client', label: 'Client' },
  { id: 'acheteurB2B', label: 'Acheteur B2B' },
  { id: 'partenaire', label: 'Partenaire finance' },
];

// ─── Public Images ──────────────────────────────────────────────────────────
export const publicImages = {
  hero: '/sector-images/platform-home.jpg',
  auth: '/sector-images/auth-cooperative.jpg',
  market: '/sector-images/market-produce.jpg',
  products: '/sector-images/seller-products.jpg',
  dossiers: '/sector-images/documents-dossier.jpg',
  attestations: '/sector-images/certificate-attestation.jpg',
  proofs: '/sector-images/finance-proof.jpg',
  orders: '/sector-images/orders-commerce.jpg',
  operations: '/sector-images/warehouse-operations.jpg',
  admin: '/sector-images/admin-users.jpg',
  impact: '/sector-images/analytics-impact.jpg',
  data: '/sector-images/data-governance.jpg',
  agriculture: '/sector-images/sector-agriculture.jpg',
  commerce: '/sector-images/sector-commerce.jpg',
  logistics: '/sector-images/sector-logistics.jpg',
  account: '/sector-images/account-profile.jpg',
  uemoaMap: '/uemoa-map.svg',
  identity: '/frescoop-identity.svg',
  fallbackProduct: '/sector-images/fallback-product.jpg',
  fallbackHub: '/sector-images/fallback-hub.jpg',
};

// ─── Page Meta ──────────────────────────────────────────────────────────────
export const basePageMeta = {
  '/': {
    image: publicImages.hero,
    kicker: 'Plateforme production',
    title: 'FresCoop connecte vendeurs, clients, preuves et opérations avec des données saisies.',
    body: 'Login, rôles, comptes, produits, commandes, dossiers, attestations et preuves économiques sont séparés par espace.',
  },
  '/login': {
    image: publicImages.auth,
    kicker: 'Accès sécurisé',
    title: 'Connectez-vous à votre espace FresCoop.',
    body: 'Admin, agriculteur, acheteur B2B et client ont chacun des pages et actions distinctes.',
  },
  '/marche': {
    image: publicImages.market,
    kicker: 'Espace client',
    title: 'Commander les articles disponibles et contacter les vendeurs.',
    body: 'Les clients voient seulement le marché, leurs commandes, leurs messages et leur compte.',
  },
  '/produits': {
    image: publicImages.products,
    kicker: 'Produits vendeurs',
    title: 'Agriculteurs et commerçants publient leurs produits réels.',
    body: 'Chaque article appartient à un compte vendeur et peut être commande ou contacté par un client.',
  },
  '/dossiers': {
    image: publicImages.dossiers,
    kicker: 'Dossiers et preuves',
    title: 'Soumettre les dossiers des personnes concernées avec pieces justificatives.',
    body: 'Les attestations sont possibles si le dossier contient assez de preuves ou apres validation admin.',
  },
  '/attestations': {
    image: publicImages.attestations,
    kicker: 'Attestations serieuses',
    title: 'Générer des attestations avec code, score de preuve et dossier source.',
    body: 'Un utilisateur sans ancienne attestation peut obtenir un certificat si ses preuves sont suffisantes.',
  },
  '/preuves': {
    image: publicImages.proofs,
    kicker: 'Preuve économique',
    title: 'Transformer les ventes et paiements réels en preuve économique portable.',
    body: 'Les preuves se basent sur transactions, paiements, acheteurs et justificatifs rattaches au compte.',
  },
  '/commandes': {
    image: publicImages.orders,
    kicker: 'Commandes',
    title: 'Suivre commandes, contacts et reponses vendeurs.',
    body: 'Clients, acheteurs et agriculteurs voient uniquement les commandes qui les concernent.',
  },
  '/paiement': {
    image: publicImages.proofs,
    kicker: 'Paiement partenaire',
    title: 'Payer la commande via partenaire agree et obtenir un recu transparent.',
    body: 'FresCoop ne detient pas de wallet. Le paiement est orchestre par Orange Money, banque, SFD ou fintech agreee.',
  },
  '/operations': {
    image: publicImages.operations,
    kicker: 'Operations terrain',
    title: 'Administrer hubs, logistique, capacité et froid.',
    body: 'Admin suit les sites opérationnels avec stock, temperature et responsable.',
  },
  '/lots': {
    image: publicImages.operations,
    kicker: 'Lots froids intelligents',
    title: 'Suivre le jumeau numerique du lot, du depot au paiement partenaire.',
    body: 'QR, pesee, photos qualité, capteurs, durée de vie commerciale, debouche recommande et preuve économique explicable.',
  },
  '/utilisateurs': {
    image: publicImages.admin,
    kicker: 'Administration',
    title: 'Gerer les comptes, roles et statuts des utilisateurs.',
    body: 'L admin conserve une vue complete sur les acteurs, dossiers et preuves.',
  },
  '/impact': {
    image: publicImages.impact,
    kicker: 'Impact filières UEMOA',
    title: 'Pertes évitées, revenu additionnel, genre, CO2: des chiffres mesurables.',
    body: 'Les KPI du hackathon UEMOA sont calculés à partir des produits, transactions, commandes, dossiers et capteurs saisis.',
  },
  '/bancabilite': {
    image: publicImages.impact,
    kicker: 'Inclusion financiere',
    title: 'Score de credit et dossier bancaire exportable.',
    body: "Transformer l'activité réelle en dossier vérifiable pour banques, SFD et microfinance — sans wallet propriétaire.",
  },
  '/ussd': {
    image: publicImages.operations,
    kicker: 'USSD · inclusion digitale',
    title: 'Accéder a FresCoop depuis un simple téléphone a touches.',
    body: '*384*FRES# pour les 70% de producteurs sans smartphone. Cours du jour, stock, ventes et paiements en wolof/pular.',
  },
  '/donnees': {
    image: publicImages.data,
    kicker: 'Base applicative',
    title: 'Exporter, importer et synchroniser les données de production.',
    body: 'Les données sont centralisables via API localé et exportables pour migration vers une base de données.',
  },
  '/compte': {
    image: publicImages.account,
    kicker: 'Mon compte',
    title: 'Gérer son profil, ses coordonnées et son activité.',
    body: 'Chaque acteur complete son compte avant de vendre, commander ou soumettre des documents.',
  },
};

export const roleHomeMeta = {
  admin: {
    image: publicImages.impact,
    kicker: 'Accueil admin',
    title: 'Piloter les revenus, la confiance et les opportunités FresCoop.',
    body: 'Un centre de décision pour convertir les commandes, activer les vendeurs, suivre la valeur du marché et produire un rapport filières UEMOA défendable.',
  },
  agriculteur: {
    image: publicImages.agriculture,
    kicker: "Accueil agriculteur",
    title: 'Vendre plus, prouver ses revenus et devenir finançable.',
    body: 'Un espace vendeur qui transforme stock, commandes, messages clients et preuves en opportunités commerciales concrètes.',
  },
  agentTerrain: {
    image: publicImages.operations,
    kicker: 'Accueil agent terrain',
    title: "Confirmer les commandes même quand l'agriculteur n'est pas connecté.",
    body: "Un espace de coordination pour appeler l'agriculteur, vérifier le stock et organiser la livraison.",
  },
  client: {
    image: publicImages.market,
    kicker: 'Accueil client',
    title: 'Acheter localement, suivre ses commandes et parler aux vendeurs.',
    body: 'Un espace simple pour trouver les produits disponibles, confirmer un panier, suivre les commandes et garder les conversations avec les vendeurs.',
  },
  acheteurB2B: {
    image: publicImages.market,
    kicker: 'Accueil acheteur B2B',
    title: 'Réserver des lots fiables et relancer les achats rentables.',
    body: 'Un catalogue de lots disponibles avec qualité, volume, localisation, fenêtre de consommation et re-achat en un clic.',
  },
  partenaire: {
    image: publicImages.proofs,
    kicker: 'Accueil partenaire',
    title: 'Consulter uniquement les preuves consenties et explicables.',
    body: 'Un espace finance ou assurance pour voir activité agrégée, indice économique explicable et recommandations consenties.',
  },
};

// ─── Dossier / Product / Order / Payment Statuses ───────────────────────────
export const dossierTypes = [
  'Attestation producteur',
  'Attestation commercant',
  'Preuve économique',
  'Verification coopérative',
  'Demande logistique',
  'Autre demande',
];

export const dossierStatuses = ['Soumis', 'En verification', 'Valide', 'Rejete'];
export const productStatuses = ['Publie', 'Brouillon', 'Suspendu'];
export const orderStatuses = ['Paiement en attente', 'Nouvelle', 'Confirmee', 'En preparation', 'Livree', 'Annulee'];
export const paymentStatuses = ['Paye', 'Partiel', 'En attente', 'Litige'];

// ─── Market Price References ────────────────────────────────────────────────
export const MARKET_PRICE_MAX_MARGIN = 100;

export const marketPriceReferences = [
  { key: 'oignon', label: 'Oignon', price: 350, unit: 'kg', source: 'Référence marché Dakar-Thiès' },
  { key: 'riz', label: 'Riz local', price: 330, unit: 'kg', source: 'Référence marché Saint-Louis' },
  { key: 'carotte', label: 'Carotte', price: 220, unit: 'kg', source: 'Référence marché Dakar' },
  { key: 'tomate', label: 'Tomate', price: 260, unit: 'kg', source: 'Référence marché Thiès' },
  { key: 'mangue', label: 'Mangue', price: 500, unit: 'kg', source: 'Référence marché Casamance' },
];

export const evidenceTypes = ['Piece identité', 'Registre coopérative', 'Photo activité', 'Facture', 'Recu paiement', 'Contrat', 'Autre preuve'];
export const chartColors = ['#1f835d', '#258399', '#e54d35', '#d99912', '#74526f'];

// ─── Image Stories ──────────────────────────────────────────────────────────
export const imageStories = [
  { image: publicImages.agriculture, title: 'Agriculture', body: 'Récoltes, coopératives et preuves terrain.' },
  { image: publicImages.commerce, title: 'Commerce', body: 'Catalogue, commandes et relation client.' },
  { image: publicImages.logistics, title: 'Logistique', body: 'Hubs, transport, stockage et froid.' },
  { image: publicImages.dossiers, title: 'Dossiers', body: 'Pieces justificatives et validation documentaire.' },
  { image: publicImages.proofs, title: 'Preuves économiques', body: 'Transactions et attestations financières.' },
  { image: publicImages.impact, title: 'Pilotage', body: 'Indicateurs réels et données exportables.' },
];

// ─── Public Site Paths ──────────────────────────────────────────────────────
export const publicSitePaths = [
  '/public',
  '/contact',
  '/sondage',
  '/questionnaire',
];

// ─── Proof Type Config (Agriculteur) ────────────────────────────────────────
export const PROOF_TYPE_CONFIG = [
  { id: 'attestation_chef', label: 'Attestation du chef de village', points: 20, level: 1, requiresUpload: true, description: "Photo du document signé par le chef de village ou de communauté" },
  { id: 'carte_cooperative', label: 'Carte de membre coopérative', points: 25, level: 1, requiresUpload: true, description: "Photo de votre carte de membre d'une coopérative agricole" },
  { id: 'parrainage_agriculteurs', label: 'Parrainage par 2 agriculteurs', points: 15, level: 1, requiresUpload: false, description: "Deux agriculteurs déjà actifs sur FresCoop vous parrainent" },
  { id: 'mobile_money_agri', label: 'Mobile money (achats agricoles)', points: 15, level: 1, requiresUpload: true, description: "Capture écran de transactions mobile money liées à l'agriculture" },
  { id: 'historique_livraisons', label: 'Historique livraisons (3+)', points: 20, level: 1, requiresUpload: false, description: "Vérification automatique après 3 livraisons confirmées sur FresCoop" },
  { id: 'cni', label: "Carte nationale d'identité (CNI)", points: 25, level: 2, requiresUpload: true, description: "Photo recto-verso de votre CNI ou carte d'identité CEDEAO en cours de validité" },
  { id: 'recu_intrants', label: 'Reçu achat intrants', points: 15, level: 2, requiresUpload: true, description: "Reçu d'achat d'engrais, semences ou produits phytosanitaires" },
  { id: 'contrat_vente', label: 'Contrat ou reçu de vente', points: 15, level: 2, requiresUpload: true, description: "Contrat avec une coopérative ou reçu de vente de récolte" },
  { id: 'carte_exploitant', label: "Carte d'exploitant agricole", points: 30, level: 2, requiresUpload: true, description: "Carte officielle délivrée par le Ministère de l'Agriculture" },
  { id: 'visite_agent', label: 'Visite agent terrain FresCoop', points: 40, level: 2, requiresUpload: false, requiresAgent: true, description: "Choisissez l'agent qui vous a visité. Il recevra une demande de confirmation." },
];

// ─── Helper ─────────────────────────────────────────────────────────────────
export function getProofConfigForRole() {
  return PROOF_TYPE_CONFIG;
}
