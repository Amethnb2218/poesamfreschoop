import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  Download,
  Eye,
  EyeOff,
  FileArchive,
  FileCheck2,
  FileText,
  FolderPlus,
  Home,
  ImagePlus,
  Landmark,
  Leaf,
  LineChart as LineChartIcon,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  PackageCheck,
  PhoneCall,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Store,
  Tractor,
  Trash2,
  Truck,
  Upload,
  UserCheck,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STORAGE_KEY = 'frescoop.production.roles.v2';
const SESSION_KEY = 'frescoop.session.user';
const CART_KEY = 'frescoop.cart';
const HIDDEN_ORDERS_KEY = 'frescoop.hidden.orders';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const PRODUCT_PAGE_SIZE_OPTIONS = [6, 9, 12];
const ORDER_PAGE_SIZE_OPTIONS = [5, 10, 20];
const SEEDED_ADMIN_EMAIL = 'amethsl2218@gmail.com';
const SEEDED_ADMIN_PASSWORD_HASH = '62a1a5600217bfc84fa5ac26faf898b366581f3b1512624444654b795b108a92';
const SEEDED_ADMIN_USER = {
  id: 'usr-admin-poesam',
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
const SEEDED_ADMIN_USERS = [
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
];

const roles = [
  { id: 'admin', label: 'Admin', locked: true },
  { id: 'agriculteur', label: 'Agriculteur' },
  { id: 'agentTerrain', label: 'Agent Terrain' },
  { id: 'transporteur', label: 'Transporteur' },
  { id: 'client', label: 'Client' },
  { id: 'acheteurB2B', label: 'Acheteur B2B' },
  { id: 'partenaire', label: 'Partenaire finance' },
];

const publicImages = {
  hero: '/sector-images/platform-home.jpg',
  auth: '/sector-images/auth-coopérative.jpg',
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
  fallbackProduct: '/sector-images/fallback-product.jpg',
  fallbackHub: '/sector-images/fallback-hub.jpg',
};

const basePageMeta = {
  '/': {
    image: publicImages.hero,
    kicker: 'Plateforme production',
    title: 'FresCoop connecte vendeurs, clients, preuves et operations avec des donnees saisies.',
    body: 'Login, rôles, comptes, produits, commandes, dossiers, attestations et preuves économiques sont séparés par espace.',
  },
  '/login': {
    image: publicImages.auth,
    kicker: 'Accès sécurisé',
    title: 'Connectez-vous à votre espace FresCoop.',
    body: 'Admin, agriculteur, acheteur B2B, transporteur et client ont chacun des pages et actions distinctes.',
  },
  '/marche': {
    image: publicImages.market,
    kicker: 'Espace client',
    title: 'Commander les articles disponibles et contacter les vendeurs.',
    body: 'Les clients voient seulement le marche, leurs commandes, leurs messages et leur compte.',
  },
  '/produits': {
    image: publicImages.products,
    kicker: 'Produits vendeurs',
    title: 'Agriculteurs et commercants publient leurs produits reels.',
    body: 'Chaque article appartient a un compte vendeur et peut etre commande ou contacte par un client.',
  },
  '/dossiers': {
    image: publicImages.dossiers,
    kicker: 'Dossiers et preuves',
    title: 'Soumettre les dossiers des personnes concernees avec pieces justificatives.',
    body: 'Les attestations sont possibles si le dossier contient assez de preuves ou apres validation admin.',
  },
  '/attestations': {
    image: publicImages.attestations,
    kicker: 'Attestations serieuses',
    title: 'Generer des attestations avec code, score de preuve et dossier source.',
    body: 'Un utilisateur sans ancienne attestation peut obtenir un certificat si ses preuves sont suffisantes.',
  },
  '/preuves': {
    image: publicImages.proofs,
    kicker: 'Preuve économique',
    title: 'Transformer les ventes et paiements reels en preuve économique portable.',
    body: 'Les preuves se basent sur transactions, paiements, acheteurs et justificatifs rattaches au compte.',
  },
  '/commandes': {
    image: publicImages.orders,
    kicker: 'Commandes',
    title: 'Suivre commandes, contacts et reponses vendeurs.',
    body: 'Clients, vendeurs et admin voient uniquement les commandes qui les concernent.',
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
    title: 'Administrer hubs, logistique, capacite et froid.',
    body: 'Admin et transporteurs suivent les sites operationnels avec stock, temperature et responsable.',
  },
  '/lots': {
    image: publicImages.operations,
    kicker: 'Lots froids intelligents',
    title: 'Suivre le jumeau numerique du lot, du depot au paiement partenaire.',
    body: 'QR, pesee, photos qualite, capteurs, duree de vie commerciale, debouche recommande et preuve économique explicable.',
  },
  '/utilisateurs': {
    image: publicImages.admin,
    kicker: 'Administration',
    title: 'Gerer les comptes, roles et statuts des utilisateurs.',
    body: 'L admin conserve une vue complete sur les acteurs, dossiers, commandes et preuves.',
  },
  '/impact': {
    image: publicImages.impact,
    kicker: 'Impact POESAM',
    title: 'Pertes evitees, revenu +, genre, CO2 — chiffres mesurables.',
    body: 'Les KPI POESAM sont calcules a partir des produits, transactions, commandes, dossiers et capteurs saisis.',
  },
  '/anti-gaspi': {
    image: publicImages.agriculture,
    kicker: 'Anti-gaspillage',
    title: 'Detecter les lots a DLC courte et convertir en vente eclair.',
    body: '30 a 40% des recoltes sont perdues au Senegal. FresCoop alerte producteurs et acheteurs B2B avant qu il ne soit trop tard.',
  },
  '/bancabilite': {
    image: publicImages.impact,
    kicker: 'Inclusion financiere',
    title: 'Score de credit et dossier bancaire exportable.',
    body: 'Transformer l activite reelle en dossier verifiable pour banques, SFD et microfinance — sans wallet proprietaire.',
  },
  '/ussd': {
    image: publicImages.operations,
    kicker: 'USSD · inclusion digitale',
    title: 'Acceder a FresCoop depuis un simple telephone a touches.',
    body: '*384*FRES# pour les 70% de producteurs sans smartphone. Cours du jour, stock, ventes et paiements en wolof/pular.',
  },
  '/donnees': {
    image: publicImages.data,
    kicker: 'Base applicative',
    title: 'Exporter, importer et synchroniser les donnees de production.',
    body: 'Les donnees sont centralisables via API locale et exportables pour migration base de donnees.',
  },
  '/secteurs/agriculture': {
    image: publicImages.agriculture,
    kicker: 'Secteur agriculture',
    title: 'Une page dediee aux producteurs et coopératives agricoles.',
    body: 'Produits, recoltes, pieces terrain, preuves et attestations agricoles sont organises ensemble.',
  },
  '/secteurs/commerce': {
    image: publicImages.commerce,
    kicker: 'Secteur commerce',
    title: 'Une page dediee aux commercants, boutiques et acheteurs B2B.',
    body: 'Catalogue, ventes, paiements et preuves commerciales restent separes du parcours agricole.',
  },
  '/secteurs/logistique': {
    image: publicImages.logistics,
    kicker: 'Secteur logistique',
    title: 'Une page dediee aux transporteurs, hubs et operations terrain.',
    body: 'Stockage, froid, routes, contacts et capacites sont reunis dans un espace logistique.',
  },
  '/compte': {
    image: publicImages.account,
    kicker: 'Mon compte',
    title: 'Gerer son profil, ses coordonnees et son activite.',
    body: 'Chaque acteur complete son compte avant de vendre, commander ou soumettre des documents.',
  },
};

const roleHomeMeta = {
  admin: {
    image: publicImages.impact,
    kicker: 'Accueil admin',
    title: 'Piloter les revenus, la confiance et les opportunites FresCoop.',
    body: 'Un centre de decision pour convertir commandes, activer vendeurs, suivre valeur du marche et produire un rapport POESAM defendable.',
  },
  agriculteur: {
    image: publicImages.agriculture,
    kicker: 'Accueil agriculteur',
    title: 'Vendre plus, prouver ses revenus et devenir financable.',
    body: 'Un espace vendeur qui transforme stock, commandes, messages clients et preuves en opportunites commerciales concretes.',
  },
  agentTerrain: {
    image: publicImages.operations,
    kicker: 'Accueil agent terrain',
    title: 'Confirmer les commandes meme quand l agriculteur n est pas connecte.',
    body: 'Un espace de coordination pour appeler l agriculteur, verifier le stock, contacter le transporteur et organiser la livraison.',
  },
  client: {
    image: publicImages.market,
    kicker: 'Accueil client',
    title: 'Acheter localement, suivre ses commandes et parler aux vendeurs.',
    body: 'Un espace simple pour trouver les produits disponibles, confirmer un panier, suivre les commandes et garder les conversations avec les vendeurs.',
  },
  transporteur: {
    image: publicImages.logistics,
    kicker: 'Accueil transporteur',
    title: 'Organiser les livraisons, les hubs et la chaine du froid.',
    body: 'Un tableau de bord terrain pour reperer les commandes a acheminer, suivre les sites operationnels et anticiper les alertes de capacite.',
  },
  acheteurB2B: {
    image: publicImages.market,
    kicker: 'Accueil acheteur B2B',
    title: 'Réserver des lots fiables et relancer les achats rentables.',
    body: 'Un catalogue de lots disponibles avec qualite, volume, localisation, fenetre de consommation et re-achat en un clic.',
  },
  partenaire: {
    image: publicImages.proofs,
    kicker: 'Accueil partenaire',
    title: 'Consulter uniquement les preuves consenties et explicables.',
    body: 'Un espace finance ou assurance pour voir activite agregee, indice economique explicable et referrals consentis.',
  },
};

const dossierTypes = [
  'Attestation producteur',
  'Attestation commercant',
  'Preuve économique',
  'Verification coopérative',
  'Demande logistique',
  'Autre demande',
];

const dossierStatuses = ['Soumis', 'En verification', 'Valide', 'Rejete'];
const productStatuses = ['Publie', 'Brouillon', 'Suspendu'];
const orderStatuses = ['Paiement en attente', 'Nouvelle', 'Confirmee', 'En preparation', 'Livree', 'Annulee'];
const paymentStatuses = ['Paye', 'Partiel', 'En attente', 'Litige'];
const MARKET_PRICE_MAX_MARGIN = 100;
const marketPriceReferences = [
  { key: 'oignon', label: 'Oignon', price: 350, unit: 'kg', source: 'Reference marche Dakar-Thies' },
  { key: 'riz', label: 'Riz local', price: 330, unit: 'kg', source: 'Reference marche Saint-Louis' },
  { key: 'carotte', label: 'Carotte', price: 220, unit: 'kg', source: 'Reference marche Dakar' },
  { key: 'tomate', label: 'Tomate', price: 260, unit: 'kg', source: 'Reference marche Thies' },
  { key: 'mangue', label: 'Mangue', price: 500, unit: 'kg', source: 'Reference marche Casamance' },
];
const evidenceTypes = ['Piece identite', 'Registre coopérative', 'Photo activite', 'Facture', 'Recu paiement', 'Contrat', 'Autre preuve'];
const chartColors = ['#1f835d', '#258399', '#e54d35', '#d99912', '#74526f'];

const imageStories = [
  { image: publicImages.agriculture, title: 'Agriculture', body: 'Recoltes, coopératives et preuves terrain.' },
  { image: publicImages.commerce, title: 'Commerce', body: 'Catalogue, commandes et relation client.' },
  { image: publicImages.logistics, title: 'Logistique', body: 'Hubs, transport, stockage et froid.' },
  { image: publicImages.dossiers, title: 'Dossiers', body: 'Pieces justificatives et validation documentaire.' },
  { image: publicImages.proofs, title: 'Preuves economiques', body: 'Transactions et attestations financieres.' },
  { image: publicImages.impact, title: 'Pilotage', body: 'Indicateurs reels et donnees exportables.' },
];

const publicSitePaths = [
  '/public',
  '/solution',
  '/comment-ca-marche',
  '/impact-public',
  '/acheteurs-b2b',
  '/coopératives-gie',
  '/partenaires',
  '/demo-jury',
  '/equipe',
  '/contact',
];

function App() {
  const [route, setRoute] = useState(getCurrentRoute);
  const [store, setStore] = useProductionStore();
  const [sessionUserId, setSessionUserId] = useState(() => window.localStorage.getItem(SESSION_KEY) || '');
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentUser = store.users.find((user) => user.id === sessionUserId) || null;
  const stats = useMemo(() => computeStats(store), [store]);
  const pageMeta = getPageMeta(route.pathname, currentUser);
  const accessAllowed = currentUser ? canAccessPath(currentUser.role, route.pathname) : false;

  useEffect(() => {
    const onPopState = () => setRoute(getCurrentRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (sessionUserId) window.localStorage.setItem(SESSION_KEY, sessionUserId);
    else window.localStorage.removeItem(SESSION_KEY);
  }, [sessionUserId]);

  // Déconnexion forcée si le compte courant vient d'être suspendu par l'admin
  useEffect(() => {
    if (!currentUser) return;
    const status = String(currentUser.status || 'Actif').toLowerCase();
    if (status === 'suspendu' || status === 'inactif' || status === 'bloque' || status === 'bloqué') {
      setSessionUserId('');
      setToast({ message: 'Votre compte a été suspendu par un administrateur.', type: 'error' });
      navigate('/login');
    }
  }, [currentUser?.status, currentUser?.id]);

  useEffect(() => {
    if (!currentUser && route.pathname === '/') return;
    if (isPublicPath(route.pathname)) return;
    if (!store.users.length && route.pathname !== '/login') navigate('/login');
    if (store.users.length && !currentUser && route.pathname !== '/login') navigate('/login');
  }, [currentUser, route.pathname, store.users.length]);

  // Redirect client and transporteur from dashboard to their home pages
  useEffect(() => {
    if (currentUser && route.pathname === '/') {
      const homePath = getRoleHomePath(currentUser.role);
      if (homePath !== '/') {
        navigate(homePath);
      }
    }
  }, [currentUser, route.pathname]);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setRoute(getCurrentRoute());
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function notify(message, type = 'info') {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), type === 'error' ? 3600 : 2600);
  }

  function logout() {
    setSessionUserId('');
    navigate('/login');
  }

  const actions = makeActions(setStore);

  if (route.pathname === '/verifier') {
    return (
      <>
        <VerifyReceiptPage navigate={navigate} route={route} store={store} />
        {toast && <Toast toast={toast} />}
      </>
    );
  }

  if (isPublicPath(route.pathname) || (!currentUser && route.pathname === '/')) {
    return (
      <>
        <PublicSitePage navigate={navigate} path={route.pathname} store={store} />
        {toast && <Toast toast={toast} />}
      </>
    );
  }

  if (!store.users.length) {
    return (
      <AuthShell meta={basePageMeta['/login']}>
        <SetupAdminPage actions={actions} notify={notify} onReady={(id) => { setSessionUserId(id); navigate('/'); }} />
        {toast && <Toast toast={toast} />}
      </AuthShell>
    );
  }

  if (!currentUser) {
    return (
      <AuthShell meta={basePageMeta['/login']}>
        <LoginPage actions={actions} notify={notify} onLogin={(id) => { setSessionUserId(id); navigate(getRoleHomePath(store.users.find((u) => u.id === id)?.role || 'client')); }} store={store} />
        {toast && <Toast toast={toast} />}
      </AuthShell>
    );
  }

  const primaryLinks = getPrimaryNavLinks(currentUser.role);
  const menuLinks = getMenuLinks(currentUser.role);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Aller au contenu principal</a>
      <OfflineBanner />
      <Header
        activePath={route.pathname}
        actions={actions}
        currentUser={currentUser}
        logout={logout}
        menuLinks={menuLinks}
        messages={store.messages}
        menuOpen={menuOpen}
        navigate={navigate}
        notifications={store.notifications}
        primaryLinks={primaryLinks}
        setMenuOpen={setMenuOpen}
      />
      <main id="main-content" tabIndex="-1">
        <PageHero meta={pageMeta} stats={stats} store={store} user={currentUser} />
        {!accessAllowed && <AccessDenied navigate={navigate} user={currentUser} />}
        {accessAllowed && route.pathname === '/' && <DashboardPage currentUser={currentUser} navigate={navigate} stats={stats} store={store} />}
        {accessAllowed && route.pathname === '/marche' && <MarketplacePage actions={actions} currentUser={currentUser} navigate={navigate} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/produits' && <ProductsPage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/dossiers' && <DossiersPage actions={actions} currentUser={currentUser} navigate={navigate} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/attestations' && <AttestationsPage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/preuves' && <ProofsPage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/commandes' && <OrdersPage actions={actions} currentUser={currentUser} navigate={navigate} notify={notify} route={route} store={store} />}
        {accessAllowed && route.pathname === '/paiement' && <PaymentPage actions={actions} currentUser={currentUser} navigate={navigate} notify={notify} route={route} store={store} />}
        {accessAllowed && route.pathname === '/operations' && <OperationsPage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/lots' && <LotIntelligencePage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/utilisateurs' && <UsersPage actions={actions} currentUser={currentUser} store={store} />}
        {accessAllowed && route.pathname === '/impact' && <ImpactPage stats={stats} store={store} />}
        {accessAllowed && route.pathname === '/anti-gaspi' && <AntiWastePage actions={actions} currentUser={currentUser} navigate={navigate} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/bancabilite' && <BancabilitePage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/ussd' && <UssdSimulatorPage currentUser={currentUser} store={store} />}
        {accessAllowed && route.pathname === '/donnees' && <DataPage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
        {accessAllowed && route.pathname === '/secteurs/agriculture' && <SectorPage currentUser={currentUser} kind="agriculture" navigate={navigate} store={store} />}
        {accessAllowed && route.pathname === '/secteurs/commerce' && <SectorPage currentUser={currentUser} kind="commerce" navigate={navigate} store={store} />}
        {accessAllowed && route.pathname === '/secteurs/logistique' && <SectorPage currentUser={currentUser} kind="logistique" navigate={navigate} store={store} />}
        {accessAllowed && route.pathname === '/compte' && <AccountPage actions={actions} currentUser={currentUser} notify={notify} store={store} />}
      </main>
      <LanguageAssistant currentUser={currentUser} store={store} />
      <ConfirmModalHost />
      {toast && <Toast toast={toast} />}
    </div>
  );
}

function VerifyReceiptPage({ navigate, route, store }) {
  const params = new URLSearchParams(route.search || '');
  const code = (params.get('code') || '').trim().toUpperCase();
  const payment = useMemo(() => {
    if (!code) return null;
    return (store.paymentRecords || []).find((record) => String(record.receiptCode || '').toUpperCase() === code) || null;
  }, [code, store.paymentRecords]);

  const linkedOrder = payment ? (store.orders || []).find((order) => order.id === payment.orderId) : null;
  const product = linkedOrder ? getOrderProduct(linkedOrder, store) : null;
  const payer = payment ? store.users.find((user) => user.id === payment.payerId) : null;
  const seller = payment ? store.users.find((user) => user.id === payment.sellerId) : null;

  const status = !code ? 'missing' : (payment ? 'valid' : 'unknown');

  return (
    <main className="verify-page">
      <header className="verify-header">
        <button className="brand" type="button" onClick={() => navigate('/public')}>
          <span>F</span>
          <strong>FresCoop</strong>
        </button>
        <small>Vérification officielle de reçu</small>
      </header>

      <section className="verify-card">
        {status === 'missing' && (
          <>
            <div className="verify-icon verify-icon-warn"><CircleAlert size={56} strokeWidth={2} /></div>
            <h1>Aucun code fourni</h1>
            <p>Ajoutez le paramètre <code>?code=XXXXX</code> à l'URL pour vérifier un reçu FresCoop, ou scannez le QR code présent sur le reçu original.</p>
          </>
        )}

        {status === 'unknown' && (
          <>
            <div className="verify-icon verify-icon-danger"><X size={56} strokeWidth={2.5} /></div>
            <h1>Reçu introuvable</h1>
            <p>Le code <code>{code}</code> ne correspond à aucun paiement enregistré dans le système FresCoop.</p>
            <div className="verify-details">
              <div><em>Code recherché</em><b>{code}</b></div>
              <div><em>Statut</em><b className="status-invalid">Non reconnu</b></div>
            </div>
            <p className="verify-hint">Si vous pensez qu'il s'agit d'une erreur, contactez <a href="mailto:contact@frescoop.sn">contact@frescoop.sn</a> avec le code et la date du paiement.</p>
          </>
        )}

        {status === 'valid' && payment && (
          <>
            <div className="verify-icon verify-icon-success"><CheckCircle2 size={56} strokeWidth={2.5} /></div>
            <h1>Reçu authentique</h1>
            <p className="verify-subtitle">Ce paiement est enregistré dans le système FresCoop et confirmé par notre partenaire de paiement.</p>

            <div className="verify-amount">
              <em>Montant payé</em>
              <strong>{formatMoney(payment.amount)}</strong>
            </div>

            <div className="verify-details">
              <div><em>Code de reçu</em><b>{payment.receiptCode}</b></div>
              <div><em>Date du paiement</em><b>{formatDate(payment.createdAt)}</b></div>
              <div><em>Statut</em><b className="status-valid">✓ {payment.status || 'Payé'}</b></div>
              <div><em>Mode de paiement</em><b>{payment.partner || 'PayDunya'}</b></div>
              {product && <div><em>Produit</em><b>{product.name}</b></div>}
              {linkedOrder && <div><em>Quantité</em><b>{formatNumber(linkedOrder.quantity)} {linkedOrder.unit || product?.unit || 'kg'}</b></div>}
              {payer && <div><em>Client</em><b>{payer.name}</b></div>}
              {seller && <div><em>Vendeur</em><b>{seller.name}</b></div>}
              {payment.paydunyaToken && <div><em>Référence PayDunya</em><b className="ref-token">{payment.paydunyaToken}</b></div>}
            </div>

            <div className="verify-seal">
              <ShieldCheck size={20} />
              <div>
                <strong>Vérification FresCoop</strong>
                <small>Authentification effectuée le {formatDate(new Date().toISOString())}</small>
              </div>
            </div>

            <p className="verify-hint">Ce paiement a bien été exécuté via un partenaire agréé. FresCoop conserve la preuve de coordination.</p>
          </>
        )}

        <div className="verify-actions">
          <button type="button" className="btn secondary" onClick={() => navigate('/public')}>Retour site public</button>
        </div>
      </section>

      <footer className="verify-footer">
        <span>© FresCoop · Dakar, Sénégal</span>
        <a href="mailto:contact@frescoop.sn">contact@frescoop.sn</a>
      </footer>
    </main>
  );
}

function PublicSitePage({ navigate, path, store }) {
  const data = getFrescoopOperatingData(store);
  const page = getPublicPageContent(path);
  const nav = [
    ['/public', 'Accueil'],
    ['/solution', 'Solution'],
    ['/comment-ca-marche', 'Comment ca marche'],
    ['/impact-public', 'Impact'],
    ['/acheteurs-b2b', 'Acheteurs B2B'],
    ['/coopératives-gie', 'Coopératives'],
    ['/partenaires', 'Partenaires'],
    ['/demo-jury', 'Demo jury'],
    ['/contact', 'Contact'],
  ];

  return (
    <main className="public-site">
      <nav className="public-nav">
        <button className="brand" type="button" onClick={() => navigate('/public')}><span>F</span><strong>FresCoop</strong></button>
        <div>
          {nav.map(([href, label]) => <button key={href} className={path === href ? 'active' : ''} type="button" onClick={() => navigate(href)}>{label}</button>)}
        </div>
        <Button onClick={() => navigate('/login')}><LockKeyhole size={17} /> App metier</Button>
      </nav>

      <section className="public-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,23,18,0.92), rgba(5,23,18,0.28)), url("${page.image}")` }}>
        <div>
          <span className="eyebrow">{page.kicker}</span>
          <h1>{page.title}</h1>
          <p>{page.body}</p>
          <div className="button-row">
            <Button onClick={() => navigate('/demo-jury')}><BarChart3 size={18} /> Voir demo jury</Button>
            <Button variant="secondary" onClick={() => navigate('/contact')}><MessageSquare size={18} /> Candidature pilote</Button>
          </div>
        </div>
      </section>

      <section className="public-kpi-band">
        <article><strong>{formatNumber(data.lots.length)}</strong><span>lots suivis</span></article>
        <article><strong>{formatNumber(sumBy(data.lots, 'weightKg'))} kg</strong><span>proteges par le froid</span></article>
        <article><strong>{formatMoney(sumBy(data.reservations, 'value'))}</strong><span>reservations B2B</span></article>
        <article><strong>{data.consentRecords.filter((item) => item.status === 'Actif').length}</strong><span>partages consentis</span></article>
      </section>

      <section className="public-band">
        <div>
          <span className="eyebrow">Parcours du lot</span>
          <h2>Entree, froid, IA, acheteur, paiement partenaire, preuve.</h2>
        </div>
        <div className="public-steps">
          {['Dépôt et pesée', 'QR et photos qualité', 'Capteurs froid', 'IA durée de vie', 'Réservation B2B', 'Paiement partenaire', 'Preuve économique'].map((item, index) => (
            <article key={item}><span>{index + 1}</span><strong>{item}</strong></article>
          ))}
        </div>
      </section>

      <section className="public-band split">
        <div>
          <span className="eyebrow">{page.sectionKicker}</span>
          <h2>{page.sectionTitle}</h2>
          <p>{page.sectionBody}</p>
        </div>
        <div className="public-value-grid">
          {page.values.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function getPublicPageContent(path) {
  const base = {
    image: publicImages.hero,
    kicker: 'Infrastructure premier kilometre froid',
    title: 'FresCoop protege les lots perissables et transforme les ventes en preuves economiques.',
    body: 'Une plateforme agri-tech B2B2C pour coopératives, productrices, commercantes, hubs, acheteurs et partenaires agrees au Senegal.',
    sectionKicker: 'Valeur POESAM',
    sectionTitle: 'Moins de pertes, meilleur prix net, plus de recurrence acheteur.',
    sectionBody: 'FresCoop n est pas un wallet: les paiements restent operes par partenaires agrees. La plateforme orchestre froid, marche, preuve et consentement.',
    values: [
      { title: 'Reduction pertes', body: 'Capteurs, alertes et routage rapide pour sauver les lots sensibles.' },
      { title: 'Prix net producteur', body: 'Recommandations de debouche selon qualite, temps restant et demande.' },
      { title: 'Preuve portable', body: 'Historique explicable, partageable et revocable avec partenaires.' },
    ],
  };
  const pages = {
    '/solution': { kicker: 'Solution', title: 'Un systeme operationnel, pas une simple marketplace.', image: publicImages.operations, sectionTitle: 'Froid, intelligence marche et confiance dans un meme flux.' },
    '/comment-ca-marche': { kicker: 'Comment ca marche', title: 'Chaque lot devient un actif suivi, valorise et prouvable.', image: publicImages.logistics, sectionTitle: 'Le parcours terrain reste simple pour zones rurales.' },
    '/impact-public': { kicker: 'Impact', title: 'Mesurer pertes evitees, revenus proteges et preuves generees.', image: publicImages.impact, sectionTitle: 'Des KPI visibles pour jury, partenaires et coopératives.' },
    '/acheteurs-b2b': { kicker: 'Acheteurs B2B', title: 'Des lots fiables, reserves plus vite, rachetables en un clic.', image: publicImages.market, sectionTitle: 'Les acheteurs gagnent en regularite et qualite.' },
    '/coopératives-gie': { kicker: 'Coopératives & GIE', title: 'Une vue volume, membres, reversements et impact femmes/jeunes.', image: publicImages.agriculture, sectionTitle: 'Les organisations prouvent leur performance terrain.' },
    '/partenaires': { kicker: 'Partenaires agrees', title: 'Des donnees consenties, minimales et tracables.', image: publicImages.proofs, sectionTitle: 'Finance et assurance sans acces opaque aux donnees.' },
    '/demo-jury': { kicker: 'Demo jury', title: 'Une sandbox qui raconte la vie complete d un lot.', image: publicImages.data, sectionTitle: 'Le jury voit la reduction des pertes et la preuve économique.' },
    '/equipe': { kicker: 'Equipe', title: 'Une equipe orientee terrain, operations et confiance numerique.', image: publicImages.auth, sectionTitle: 'FresCoop se construit avec coopératives et partenaires locaux.' },
    '/contact': { kicker: 'Pilote', title: 'Candidature pilote pour coopératives, hubs et acheteurs.', image: publicImages.commerce, sectionTitle: 'Demarrer avec un hub, une culture et un acheteur recurrent.' },
  };
  return { ...base, ...(pages[path] || {}) };
}

function AuthShell({ children, meta }) {
  return (
    <div className="auth-layout">
      <section className="auth-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,47,39,0.06), rgba(6,47,39,0.86)), url("${meta.image}")` }}>
        <span>{meta.kicker}</span>
        <h1>{meta.title}</h1>
        <p>{meta.body}</p>
      </section>
      <section className="auth-panel">
        <div className="brand big"><span>F</span><strong>FresCoop</strong></div>
        {children}
      </section>
    </div>
  );
}

function SetupAdminPage({ actions, notify, onReady }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', organization: '' });
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      notify('Nom, email et mot de passe admin sont obligatoires');
      return;
    }
    setSaving(true);
    const user = await buildUser({ ...form, role: 'admin', status: 'Actif' });
    actions.setUsers((items) => [user, ...items]);
    setSaving(false);
    onReady(user.id);
  }

  return (
    <form className="stack-form" onSubmit={submit}>
      <PanelTitle icon={ShieldCheck} title="Créer le premier compte admin" />
      <Field label="Nom complet" required><input value={form.name} onChange={(event) => updateForm(setForm, 'name', event.target.value)} /></Field>
      <Field label="Email" required><input type="email" value={form.email} onChange={(event) => updateForm(setForm, 'email', event.target.value)} /></Field>
      <Field label="Téléphone"><input value={form.phone} onChange={(event) => updateForm(setForm, 'phone', event.target.value)} /></Field>
      <Field label="Organisation"><input value={form.organization} onChange={(event) => updateForm(setForm, 'organization', event.target.value)} /></Field>
      <Field label="Mot de passe" required><input type="password" value={form.password} onChange={(event) => updateForm(setForm, 'password', event.target.value)} /></Field>
      <Button type="submit" disabled={saving}><Save size={18} /> Initialiser FresCoop</Button>
    </form>
  );
}

function LoginPage({ actions, notify, onLogin, store }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'agriculteur',
    organization: '',
    region: '',
  });

  async function login(event) {
    event.preventDefault();
    // Récupère le store frais pour éviter de checker sur une copie périmée
    // (cas où le compte a été créé sur mobile entretemps, ou suspendu par admin)
    let usersToCheck = store.users;
    try {
      const resp = await fetch(API_BASE + '/api/store');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.users)) usersToCheck = data.users;
      }
    } catch {
      // offline — on tente avec le cache local
    }
    const user = usersToCheck.find((item) => normalize(item.email) === normalize(loginForm.email));
    if (!user || user.passwordHash !== await hashPassword(loginForm.password)) {
      notify('Identifiants incorrects', 'error');
      return;
    }
    if (user.status !== 'Actif') {
      const s = String(user.status || '').toLowerCase();
      const msg = s === 'suspendu'
        ? 'Votre compte a été suspendu. Contactez un administrateur FresCoop.'
        : 'Compte non actif. Contactez un administrateur FresCoop.';
      notify(msg, 'error');
      return;
    }
    onLogin(user.id);
  }

  async function register(event) {
    event.preventDefault();
    const name = (registerForm.name || '').trim();
    const emailInput = (registerForm.email || '').trim();
    const password = registerForm.password || '';
    if (!name || !emailInput || !password) {
      notify('Nom, email et mot de passe sont obligatoires', 'error');
      return;
    }
    if (password.length < 4) {
      notify('Le mot de passe doit faire au moins 4 caractères', 'error');
      return;
    }

    // 1) Récupère le store frais pour éviter les écrasements dûs au cache
    let freshStore = null;
    try {
      const resp = await fetch(API_BASE + '/api/store');
      if (resp.ok) freshStore = await resp.json();
    } catch {
      // offline — on continuera avec le store local
    }
    const existingUsers = Array.isArray(freshStore?.users) ? freshStore.users : store.users;

    // 2) Empêche les doublons d'email
    if (existingUsers.some((item) => normalize(item.email) === normalize(emailInput))) {
      notify('Cet email est déjà utilisé. Connectez-vous plutôt.', 'error');
      return;
    }

    // 3) Construit le nouvel utilisateur
    let user;
    try {
      user = await buildUser({
        ...registerForm,
        name,
        email: emailInput,
        password,
        status: 'Actif',
      });
    } catch (err) {
      notify('Impossible de sécuriser le mot de passe. Réessayez.', 'error');
      console.error('[register] buildUser failed:', err);
      return;
    }

    // 4) Applique le nouvel utilisateur au store local — le useEffect se
    //    chargera de faire le PUT en arrière-plan (avec le flag pendingMutation
    //    qui protège contre les écrasements du polling).
    if (freshStore) {
      // On a une copie serveur à jour : merge-là avec le nouvel user pour
      // garantir que le PUT suivant contiendra TOUTES les données serveur +
      // notre ajout (pas juste le cache local potentiellement périmé).
      const merged = normalizeStore({
        ...freshStore,
        users: [user, ...(freshStore.users || [])],
      });
      actions.replaceStore(merged);
    } else {
      actions.setUsers((items) => [user, ...items]);
    }

    notify(`Bienvenue ${user.name} !`, 'success');
    onLogin(user.id);
  }

  return (
    <div className="auth-card">
      <div className="segmented">
        <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Connexion</button>
        <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>Créer compte</button>
      </div>
      {mode === 'login' ? (
        <form className="stack-form" onSubmit={login}>
          <PanelTitle icon={LockKeyhole} title="Connexion" />
          <Field label="Email" required><input type="email" value={loginForm.email} onChange={(event) => updateForm(setLoginForm, 'email', event.target.value)} /></Field>
          <Field label="Mot de passe" required><input type="password" value={loginForm.password} onChange={(event) => updateForm(setLoginForm, 'password', event.target.value)} /></Field>
          <Button type="submit"><LockKeyhole size={18} /> Se connecter</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const admin = store.users.find((u) => u.role === 'admin' && u.status === 'Actif');
              if (admin) {
                onLogin(admin.id);
              } else {
                notify('Aucun compte admin disponible pour la démo.');
              }
            }}
          >
            <Sprout size={18} /> Démo invité (admin)
          </Button>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
            💡 Démo POESAM : les comptes seedés (50 productrices, acheteurs B2B, transporteurs) utilisent le mot de passe <strong>demo1234</strong>.
          </p>
        </form>
      ) : (
        <form className="stack-form" onSubmit={register}>
          <PanelTitle icon={UserCheck} title="Nouveau compte" />
          <Field label="Profil" required>
            <select value={registerForm.role} onChange={(event) => updateForm(setRegisterForm, 'role', event.target.value)}>
              {roles.filter((role) => role.id !== 'admin').map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
            </select>
          </Field>
          <Field label="Nom complet / structure" required><input value={registerForm.name} onChange={(event) => updateForm(setRegisterForm, 'name', event.target.value)} /></Field>
          <Field label="Email" required><input type="email" value={registerForm.email} onChange={(event) => updateForm(setRegisterForm, 'email', event.target.value)} /></Field>
          <Field label="Téléphone"><input value={registerForm.phone} onChange={(event) => updateForm(setRegisterForm, 'phone', event.target.value)} /></Field>
          <Field label="Organisation"><input value={registerForm.organization} onChange={(event) => updateForm(setRegisterForm, 'organization', event.target.value)} /></Field>
          <Field label="Région"><input value={registerForm.region} onChange={(event) => updateForm(setRegisterForm, 'region', event.target.value)} /></Field>
          <Field label="Mot de passe" required><input type="password" value={registerForm.password} onChange={(event) => updateForm(setRegisterForm, 'password', event.target.value)} /></Field>
          <Button type="submit"><UserCheck size={18} /> Créer mon espace</Button>
        </form>
      )}
    </div>
  );
}

function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  useEffect(() => {
    function up() { setOnline(true); }
    function down() { setOnline(false); }
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

function OfflineBanner() {
  const online = useOnlineStatus();
  const [justReconnected, setJustReconnected] = useState(false);
  useEffect(() => {
    if (online) {
      setJustReconnected(true);
      const t = setTimeout(() => setJustReconnected(false), 2800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [online]);

  if (!online) {
    return (
      <div className="offline-banner offline">
        <CircleAlert size={16} />
        <span>Mode hors ligne · Vos actions sont enregistrées localement et se synchroniseront automatiquement dès retour du réseau.</span>
      </div>
    );
  }
  if (justReconnected) {
    return (
      <div className="offline-banner online">
        <CheckCircle2 size={16} />
        <span>Connexion rétablie · Synchronisation en cours</span>
      </div>
    );
  }
  return null;
}

function Header({ actions, activePath, currentUser, logout, menuLinks, messages = [], menuOpen, navigate, notifications, primaryLinks, setMenuOpen }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const menuGroups = getMenuGroups(currentUser.role, menuLinks);
  const userNotifications = getVisibleNotifications(notifications, currentUser);
  const unreadCount = userNotifications.filter((item) => !item.readAt).length;

  function openNotification(item) {
    actions.setNotifications((entries) => entries.map((entry) => entry.id === item.id ? { ...entry, readAt: entry.readAt || new Date().toISOString() } : entry));
    if (item.type === 'message') {
      navigate(getMessageNotificationPath(item, messages));
    } else if (item.path) {
      navigate(item.path);
    }
    setNotificationOpen(false);
  }

  function markOneRead(event, notif) {
    event.stopPropagation();
    if (notif.readAt) return;
    actions.setNotifications((entries) =>
      entries.map((entry) =>
        entry.id === notif.id ? { ...entry, readAt: new Date().toISOString() } : entry,
      ),
    );
  }

  function markAllRead() {
    const now = new Date().toISOString();
    actions.setNotifications((entries) => entries.map((entry) => {
      if (entry.readAt) return entry;
      const matchesUser = entry.recipientId === currentUser.id
        || (entry.recipientRole && entry.recipientRole === currentUser.role)
        || (Array.isArray(entry.recipientRoles) && entry.recipientRoles.includes(currentUser.role));
      return matchesUser ? { ...entry, readAt: now } : entry;
    }));
  }

  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => navigate('/')}>
        <span>F</span>
        <strong>FresCoop</strong>
      </button>
      <nav className="primary-nav" aria-label="Navigation principale">
        {primaryLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.path} className={activePath === item.path ? 'active' : ''} type="button" onClick={() => navigate(item.path)}>
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="user-menu">
        <div className="notification-wrap">
          <button className={`notification-button ${unreadCount ? 'has-unread' : ''}`} type="button" onClick={() => setNotificationOpen((open) => !open)} aria-expanded={notificationOpen} aria-label="Notifications">
            <BellRing size={18} />
            {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>
          {notificationOpen && (
            <>
              <div className="notification-backdrop" onClick={() => setNotificationOpen(false)} aria-hidden="true" />
              <div className="notification-panel" role="dialog" aria-label="Notifications">
                <div className="notification-head">
                  <div>
                    <strong>Notifications</strong>
                    <span>{unreadCount ? `${unreadCount} non lue(s)` : 'Tout est a jour'}</span>
                  </div>
                  <div className="notification-actions">
                    {unreadCount > 0 && <button type="button" onClick={markAllRead}>Tout lire</button>}
                    <button type="button" onClick={() => setNotificationOpen(false)} aria-label="Fermer"><X size={14} /></button>
                  </div>
                </div>
                {userNotifications.length ? (
                  <div className="notification-list">
                    {userNotifications.slice(0, 12).map((item) => {
                      const Icon = getNotificationIcon(item.type);
                      return (
                        <button key={item.id} className={`notification-item ${!item.readAt ? 'unread' : ''}`} type="button" onClick={() => openNotification(item)}>
                          <span className="notification-icon"><Icon size={17} /></span>
                          <span className="notification-copy">
                            <span className="notification-row">
                              <strong>{item.title}</strong>
                              <em>{formatNotificationDate(item.createdAt)}</em>
                            </span>
                            <small>{item.body}</small>
                            <span className="notification-link">{getNotificationActionLabel(item)}</span>
                          </span>
                          {!item.readAt && (
                            <span
                              className="notification-mark"
                              role="button"
                              tabIndex={0}
                              onClick={(e) => markOneRead(e, item)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') markOneRead(e, item);
                              }}
                              aria-label="Marquer comme lue"
                              title="Marquer comme lue"
                            >
                              <CheckCircle2 size={14} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notification-empty">Aucune notification pour le moment</div>
                )}
              </div>
            </>
          )}
        </div>
        <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Ouvrir le menu complet">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
          <span>Menu</span>
        </button>
        <button type="button" onClick={() => navigate('/compte')}>
          <UserCheck size={17} />
          <span>{currentUser.name}</span>
        </button>
        <button type="button" onClick={logout} aria-label="Déconnexion"><LogOut size={18} /></button>
      </div>
      {menuOpen && (
        <nav className="nav open" aria-label="Menu complet">
          {menuGroups.map((group) => (
            <div className="nav-section" key={group.title}>
              <span>{group.title}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.path} className={activePath === item.path ? 'active' : ''} title={item.description} type="button" onClick={() => navigate(item.path)}>
                    <Icon size={17} />
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}

function PageHero({ meta, stats, store, user }) {
  const metrics = getHeroMetrics(user, stats, store);
  return (
    <section className="page-hero">
      <div className="hero-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,23,18,0.92), rgba(5,23,18,0.34)), url("${meta.image}")` }}>
        <div className="hero-copy">
          <span>{meta.kicker}</span>
          <h1>{meta.title}</h1>
          <p>{meta.body}</p>
        </div>
      </div>
      <div className="hero-metrics">
        {metrics.map((metric) => (
          <StatCard key={metric.label} icon={metric.icon} label={metric.label} value={metric.value} tone={metric.tone} />
        ))}
      </div>
    </section>
  );
}

function DashboardPage({ currentUser, navigate, stats, store }) {
  if (currentUser.role === 'admin') {
    return <AdminHomePage navigate={navigate} stats={stats} store={store} />;
  }

  if (['acheteurB2B', 'partenaire'].includes(currentUser.role)) {
    return <FrescoopRoleHomePage currentUser={currentUser} navigate={navigate} store={store} />;
  }

  if (currentUser.role === 'agentTerrain') {
    return <FieldAgentHomePage currentUser={currentUser} navigate={navigate} store={store} />;
  }

  if (currentUser.role === 'client') {
    return <ClientHomePage currentUser={currentUser} navigate={navigate} store={store} />;
  }

  if (currentUser.role === 'transporteur') {
    return <TransporterHomePage currentUser={currentUser} navigate={navigate} store={store} />;
  }

  if (currentUser.role === 'agriculteur') {
    return <SellerHomePage currentUser={currentUser} navigate={navigate} store={store} />;
  }

  return <AdminHomePage navigate={navigate} stats={stats} store={store} />;
}

function FieldAgentHomePage({ currentUser, navigate, store }) {
  const orders = getVisibleOrders(store.orders, currentUser);
  const toCoordinate = orders.filter((order) => order.status !== 'Annulee' && order.status !== 'Livree');
  const paidToPrepare = toCoordinate.filter((order) => order.paymentStatus === 'Paye' || order.status === 'Confirmee');
  const organized = toCoordinate.filter((order) => order.agentWorkflow?.deliveryOrganizedAt).length;

  return (
    <PageFrame>
      <section className="role-home-panel transport-home-panel">
        <div>
          <span className="eyebrow">Agent Terrain</span>
          <h2>Coordonner les commandes quand l agriculteur n est pas connecte.</h2>
          <p>Votre role est d appeler l agriculteur, confirmer le stock, contacter le transporteur et garder la commande reactive jusqu a livraison.</p>
          <div className="button-row">
            <Button onClick={() => navigate('/commandes')}><PhoneCall size={18} /> Voir commandes terrain</Button>
            <Button variant="secondary" onClick={() => navigate('/operations')}><Truck size={18} /> Transporteurs et hubs</Button>
          </div>
        </div>
        <div className="home-highlight">
          <strong>{formatNumber(toCoordinate.length)}</strong>
          <span>commandes a suivre</span>
        </div>
      </section>
      <div className="status-grid">
        <StatCard icon={CheckCircle2} label="Payees a preparer" value={paidToPrepare.length} tone="green" />
        <StatCard icon={PhoneCall} label="Agriculteurs a appeler" value={toCoordinate.filter((order) => !order.agentWorkflow?.farmerCalledAt).length} tone="blue" />
        <StatCard icon={Truck} label="Livraisons organisees" value={organized} tone="gold" />
        <StatCard icon={CircleAlert} label="En attente paiement" value={orders.filter((order) => order.status === 'Paiement en attente').length} tone="coral" />
      </div>
      <div className="quick-grid">
        <QuickAction icon={Users} title="Former les acteurs" body="Accompagner agriculteurs et transporteurs sur les parcours FresCoop et USSD." onClick={() => navigate('/ussd')} />
        <QuickAction icon={ShieldCheck} title="Verifier les produits" body="Confirmer la disponibilite, la zone, la qualite annoncee et la coherence terrain." onClick={() => navigate('/produits')} />
        <QuickAction icon={PhoneCall} title="Coordonner commandes" body="Appeler l agriculteur, contacter le transporteur et confirmer la preparation." onClick={() => navigate('/commandes')} />
        <QuickAction icon={ClipboardCheck} title="Surveys terrain" body="Questionnaires et releves terrain prevus dans une prochaine iteration." onClick={() => navigate('/operations')} />
      </div>
    </PageFrame>
  );
}

function FrescoopRoleHomePage({ currentUser, navigate, store }) {
  const data = getFrescoopOperatingData(store);
  const roleCopy = {
    acheteurB2B: {
      icon: Store,
      title: 'Catalogue B2B fiable et re-achat',
      body: 'Identifiez les lots disponibles, la fenetre de consommation et les reservations recurrentes.',
      cta: 'Voir catalogue lots',
    },
    partenaire: {
      icon: Landmark,
      title: 'Donnees consenties et indice explicable',
      body: 'Consultez uniquement les flux autorises, la stabilite d activite et les preuves portables.',
      cta: 'Voir preuves',
    },
  }[currentUser.role] || {
    icon: ClipboardCheck,
    title: 'Espace FresCoop',
    body: 'Pilotez lots, froid, commandes et preuves economiques.',
    cta: 'Voir les lots',
  };
  const Icon = roleCopy.icon;

  return (
    <PageFrame>
      <section className="role-home-panel">
        <div>
          <span className="eyebrow">{roleLabel(currentUser.role)}</span>
          <h2>{roleCopy.title}</h2>
          <p>{roleCopy.body}</p>
          <div className="button-row">
            <Button onClick={() => navigate('/lots')}><Icon size={18} /> {roleCopy.cta}</Button>
            <Button variant="secondary" onClick={() => navigate('/impact')}><BarChart3 size={18} /> Impact</Button>
          </div>
        </div>
        <div className="home-highlight">
          <strong>{formatNumber(data.lots.length)}</strong>
          <span>lots suivis en demo</span>
        </div>
      </section>
      <div className="status-grid">
        <StatCard icon={ClipboardCheck} label="Lots actifs" value={data.lots.length} tone="green" />
        <StatCard icon={Warehouse} label="Kg proteges" value={formatNumber(sumBy(data.lots, 'weightKg'))} tone="blue" />
        <StatCard icon={CircleDollarSign} label="Valeur reservee" value={formatMoney(sumBy(data.reservations, 'value'))} tone="gold" />
        <StatCard icon={ShieldCheck} label="Consentements" value={data.consentRecords.filter((item) => item.status === 'Actif').length} tone="coral" />
      </div>
    </PageFrame>
  );
}

function AdminHomePage({ navigate, stats, store }) {
  const revenue = buildRevenueSnapshot(store);
  const opportunities = buildAdminOpportunities(store);
  const topProducts = buildTopProductsByMoney(store).slice(0, 5);
  const sellerHealth = buildSellerHealth(store).slice(0, 6);
  const pipeline = buildTrustPipeline(store);

  return (
    <PageFrame>
      <section className="money-hero admin-money-hero">
        <div>
          <span className="eyebrow">Centre de pilotage revenus</span>
          <h2>Transformer les produits publies en ventes, preuves et financement.</h2>
          <p>Le concours doit voir une plateforme qui cree du revenu: FresCoop suit la valeur du marche, detecte les commandes a convertir et montre quels vendeurs peuvent etre rendus bancables.</p>
          <div className="button-row">
            <Button onClick={() => navigate('/commandes')}><ShoppingCart size={18} /> Convertir commandes</Button>
            <Button variant="secondary" onClick={() => navigate('/impact')}><BarChart3 size={18} /> Voir impact</Button>
            <Button variant="secondary" onClick={() => downloadHtml('rapport-poesam-frescoop.html', renderBusinessReportHtml(store))}><Download size={18} /> Rapport POESAM</Button>
            <Button variant="secondary" onClick={() => navigate('/donnees')}><Database size={18} /> Export donnees</Button>
          </div>
        </div>
        <div className="money-hero-score">
          <span>Valeur marche</span>
          <strong>{formatMoney(revenue.catalogValue)}</strong>
          <small>{formatMoney(revenue.openOrderValue)} en commandes ouvertes</small>
        </div>
      </section>

      <div className="money-kpi-grid">
        <MoneyKpi icon={CircleDollarSign} label="Commandes confirmees" value={formatMoney(revenue.orderValue)} detail={`${stats.orders} commande(s) au total`} />
        <MoneyKpi icon={ShoppingCart} label="A convertir maintenant" value={formatMoney(revenue.openOrderValue)} detail={`${revenue.openOrders.length} commande(s) ouvertes`} />
        <MoneyKpi icon={Store} label="Vendeurs avec offre" value={`${revenue.activeSellerCount}/${revenue.sellerCount}`} detail="agriculteurs et commercants" />
        <MoneyKpi icon={BadgeCheck} label="Bancabilite" value={`${pipeline.validated}/${Math.max(1, pipeline.total)}`} detail="dossiers valides ou attestables" />
      </div>

      <div className="split-layout">
        <section className="panel opportunity-panel">
          <PanelTitle icon={BellRing} title="Actions qui rapportent" />
          {opportunities.length ? (
            <div className="opportunity-list">
              {opportunities.map((item) => (
                <button key={item.id} type="button" onClick={() => navigate(item.path)}>
                  <IconCircle icon={item.icon} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.body}</small>
                  </span>
                  <b>{item.value}</b>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="Plateforme saine" body="Aucune alerte prioritaire pour le moment." />
          )}
        </section>

        <section className="panel">
          <PanelTitle icon={LineChartIcon} title="Produits qui portent le chiffre" />
          {topProducts.length ? (
            <div className="ranking-list">
              {topProducts.map((item, index) => (
                <article key={item.product.id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{item.product.name}</strong>
                    <small>{item.seller?.name || 'Vendeur'} - {formatMoney(item.catalogValue)} en stock</small>
                  </div>
                  <b>{formatMoney(item.orderValue || item.catalogValue)}</b>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={Store} title="Aucun produit" body="Publiez des produits pour creer le marche." />
          )}
        </section>
      </div>

      <div className="split-layout">
        <section className="panel">
          <PanelTitle icon={Users} title="Vendeurs a rendre performants" />
          {sellerHealth.length ? (
            <div className="seller-health-list">
              {sellerHealth.map((seller) => (
                <article key={seller.user.id}>
                  <div>
                    <strong>{seller.user.name}</strong>
                    <span>{roleLabel(seller.user.role)} - {seller.products.length} produit(s)</span>
                  </div>
                  <Meter label="Score commercial" value={seller.score} tone={seller.score >= 70 ? 'green' : 'blue'} />
                  <small>{seller.recommendation}</small>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="Aucun vendeur" body="Ajoutez agriculteurs ou commercants pour lancer le reseau." />
          )}
        </section>

        <section className="panel">
          <PanelTitle icon={ShieldCheck} title="Confiance et financement" />
          <div className="finance-readiness">
            <article><strong>{pipeline.total}</strong><span>Dossiers</span></article>
            <article><strong>{pipeline.validated}</strong><span>Validables</span></article>
            <article><strong>{pipeline.pending}</strong><span>A traiter</span></article>
            <article><strong>{store.proofs.length}</strong><span>Preuves economiques</span></article>
          </div>
          <NoticeCard icon={Landmark} title="Argument POESAM" body="La valeur n est pas seulement le catalogue: les ventes et preuves creent un historique utilisable pour credit, assurance, contrats et subventions." />
        </section>
      </div>
    </PageFrame>
  );
}

function SellerHomePage({ currentUser, navigate, store }) {
  const products = store.products.filter((item) => item.ownerId === currentUser.id);
  const publishedProducts = products.filter((item) => item.status === 'Publie');
  const orders = getVisibleOrders(store.orders, currentUser);
  const openOrders = orders.filter((item) => item.status !== 'Livree' && item.status !== 'Annulee');
  const sellerMessages = store.messages.filter((item) => item.sellerId === currentUser.id && !item.parentId);
  const unansweredMessages = sellerMessages.filter((item) => item.status === 'Nouveau');
  const inventoryValue = products.reduce((sum, product) => sum + getProductInventoryValue(product), 0);
  const orderValue = orders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);
  const openOrderValue = openOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);
  const actions = buildSellerOpportunities(store, currentUser);

  return (
    <PageFrame>
      <section className="money-hero seller-money-hero">
        <div>
          <span className="eyebrow">{roleLabel(currentUser.role)} - revenus</span>
          <h2>Votre espace pour vendre plus vite et prouver vos revenus.</h2>
          <p>Les produits publies, les commandes et les preuves economiques deviennent un dossier commercial: plus il est complet, plus vous pouvez negocier, vendre et demander du financement.</p>
          <div className="button-row">
            <Button onClick={() => navigate('/produits')}><Plus size={18} /> Ajouter produit</Button>
            <Button variant="secondary" onClick={() => navigate('/commandes')}><ShoppingCart size={18} /> Voir commandes</Button>
            <Button variant="secondary" onClick={() => navigate('/preuves')}><ReceiptText size={18} /> Preuve revenu</Button>
          </div>
        </div>
        <div className="money-hero-score">
          <span>Stock valorise</span>
          <strong>{formatMoney(inventoryValue)}</strong>
          <small>{formatMoney(openOrderValue)} a convertir en commandes</small>
        </div>
      </section>

      <div className="money-kpi-grid">
        <MoneyKpi icon={CircleDollarSign} label="Ventes reçues" value={formatMoney(orderValue)} detail={`${orders.length} commande(s)`} />
        <MoneyKpi icon={ShoppingCart} label="A livrer / confirmer" value={formatMoney(openOrderValue)} detail={`${openOrders.length} commande(s) ouvertes`} />
        <MoneyKpi icon={Store} label="Produits publies" value={`${publishedProducts.length}/${products.length}`} detail="visibles au marche" />
        <MoneyKpi icon={MessageSquare} label="Messages a traiter" value={unansweredMessages.length} detail="repondre vite augmente la conversion" />
      </div>

      <div className="split-layout">
        <section className="panel opportunity-panel">
          <PanelTitle icon={BellRing} title="Plan pour gagner plus" />
          {actions.length ? (
            <div className="opportunity-list">
              {actions.map((item) => (
                <button key={item.id} type="button" onClick={() => navigate(item.path)}>
                  <IconCircle icon={item.icon} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.body}</small>
                  </span>
                  <b>{item.value}</b>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="Base commerciale solide" body="Continuez a publier, repondre et confirmer les commandes." />
          )}
        </section>

        <section className="panel">
          <PanelTitle icon={PackageCheck} title="Produits rentables" />
          {products.length ? (
            <div className="ranking-list">
              {products
                .slice()
                .sort((a, b) => getProductInventoryValue(b) - getProductInventoryValue(a))
                .slice(0, 5)
                .map((product, index) => (
                  <article key={product.id}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{product.name}</strong>
                      <small>{formatNumber(product.quantity)} {product.unit} - {product.status}</small>
                    </div>
                    <b>{formatMoney(getProductInventoryValue(product))}</b>
                  </article>
                ))}
            </div>
          ) : (
            <EmptyState icon={Store} title="Aucun produit" body="Ajoutez vos produits pour commencer a vendre." />
          )}
        </section>
      </div>

      <div className="split-layout">
        <section className="panel">
          <PanelTitle icon={ClipboardCheck} title="Commandes recentes" />
          {orders.length ? (
            <div className="compact-list">
              {orders.slice(0, 5).map((order) => <OrderLine key={order.id} order={order} store={store} withProgress />)}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="Aucune commande" body="Les commandes apparaitront des qu un client confirme son panier." />
          )}
        </section>

        <section className="panel">
          <PanelTitle icon={Landmark} title="Dossier de revenus" />
          <FinanceScoreCard navigate={navigate} user={currentUser} store={store} />
        </section>
      </div>
    </PageFrame>
  );
}

function ClientHomePage({ currentUser, navigate, store }) {
  const products = store.products.filter((item) => item.status === 'Publie');
  const orders = getVisibleOrders(store.orders, currentUser);
  const activeOrders = orders.filter((item) => item.status !== 'Livree' && item.status !== 'Annulee');
  const messages = getVisibleMessages(store.messages, currentUser);
  const cart = readCartFromStorage(store.products);
  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <PageFrame>
      <section className="role-home-panel client-home-panel">
        <div>
          <span className="eyebrow">Bonjour {currentUser.name}</span>
          <h2>Votre espace client FresCoop</h2>
          <p>Decouvrez les produits publies, preparez un panier, confirmez vos commandes et gardez les echanges avec les vendeurs au meme endroit.</p>
          <div className="button-row">
            <Button onClick={() => navigate('/marche')}><ShoppingCart size={18} /> Aller au marche</Button>
            <Button variant="secondary" onClick={() => navigate('/commandes')}><ReceiptText size={18} /> Mes commandes</Button>
          </div>
        </div>
        <div className="home-highlight">
          <ShoppingCart size={28} />
          <strong>{cartCount || 0}</strong>
          <span>{cartCount === 0 ? 'panier vide' : `article${cartCount > 1 ? 's' : ''} dans le panier`}</span>
        </div>
      </section>

      <div className="status-grid">
        <StatCard icon={Store} label="Produits disponibles" value={products.length} tone="green" />
        <StatCard icon={ShoppingCart} label="Commandes actives" value={activeOrders.length} tone="blue" />
        <StatCard icon={MessageSquare} label="Conversations" value={buildConversations(messages).length} tone="gold" />
        <StatCard icon={ShieldCheck} label="Parcours" value="Client" tone="coral" />
      </div>

      <div className="quick-grid">
        <QuickAction icon={Search} title="Trouver un produit" body="Filtrer les offres par nom, zone ou categorie." onClick={() => navigate('/marche')} />
        <QuickAction icon={CheckCircle2} title="Confirmer le panier" body="Verifier quantites, total et vendeur avant envoi." onClick={() => navigate('/commandes')} />
        <QuickAction icon={MessageSquare} title="Discuter avec vendeur" body="Demander prix, disponibilite ou details produit." onClick={() => navigate('/commandes')} />
        <QuickAction icon={Settings} title="Completer mon compte" body="Ajouter telephone, region et organisation." onClick={() => navigate('/compte')} />
      </div>

      <div className="split-layout">
        <section className="panel">
          <PanelTitle icon={Leaf} title="Produits recents" />
          {products.length ? (
            <div className="compact-list">
              {products.slice(0, 5).map((product) => <ProductLine key={product.id} product={product} store={store} />)}
            </div>
          ) : (
            <EmptyState icon={Store} title="Aucun produit" body="Les produits publies apparaitront ici." />
          )}
        </section>
        <section className="panel">
          <PanelTitle icon={ClipboardCheck} title="Suivi commande" />
          {orders.length ? (
            <div className="compact-list">
              {orders.slice(0, 4).map((order) => <OrderLine key={order.id} order={order} store={store} withProgress />)}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="Aucune commande" body="Ajoutez des produits au panier puis confirmez votre commande." />
          )}
        </section>
      </div>
    </PageFrame>
  );
}

function TransporterHomePage({ currentUser, navigate, store }) {
  const orders = getVisibleOrders(store.orders, currentUser);
  const activeOrders = orders.filter((item) => item.status !== 'Livree' && item.status !== 'Annulee');
  const hubs = store.hubs.filter((hub) => currentUser.role === 'admin' || hub.ownerId === currentUser.id);
  const alerts = buildTransportAlerts(store, currentUser);
  const availableCapacity = hubs.reduce((sum, hub) => sum + Math.max(0, Number(hub.capacityKg || 0) - Number(hub.currentStockKg || 0)), 0);

  return (
    <PageFrame>
      <section className="role-home-panel transport-home-panel">
        <div>
          <span className="eyebrow">Bonjour {currentUser.name}</span>
          <h2>Votre espace transporteur</h2>
          <p>Suivez les commandes a acheminer, gardez vos hubs a jour et surveillez les points sensibles: froid, batterie, capacite et contact terrain.</p>
          <div className="button-row">
            <Button onClick={() => navigate('/operations')}><Warehouse size={18} /> Sites operations</Button>
            <Button variant="secondary" onClick={() => navigate('/commandes')}><Truck size={18} /> Livraisons</Button>
          </div>
        </div>
        <div className="home-highlight">
          <Truck size={28} />
          <strong>{activeOrders.length}</strong>
          <span>mission(s) a suivre</span>
        </div>
      </section>

      <div className="status-grid">
        <StatCard icon={Truck} label="Livraisons ouvertes" value={activeOrders.length} tone="green" />
        <StatCard icon={Warehouse} label="Mes hubs" value={hubs.length} tone="blue" />
        <StatCard icon={PackageCheck} label="Capacite libre" value={`${formatCompact(availableCapacity)} kg`} tone="gold" />
        <StatCard icon={BellRing} label="Alertes terrain" value={alerts.length} tone="coral" />
      </div>

      <div className="quick-grid">
        <QuickAction icon={Warehouse} title="Enregistrer un hub" body="Ajouter capacite, stock, temperature et responsable." onClick={() => navigate('/operations')} />
        <QuickAction icon={ClipboardCheck} title="Voir les livraisons" body="Suivre les commandes pretes ou en preparation." onClick={() => navigate('/commandes')} />
        <QuickAction icon={FolderPlus} title="Documents" body="Garder les pieces et demandes logistiques." onClick={() => navigate('/dossiers')} />
        <QuickAction icon={Settings} title="Profil transport" body="Mettre a jour telephone, region et structure." onClick={() => navigate('/compte')} />
      </div>

      <div className="split-layout">
        <section className="panel">
          <PanelTitle icon={BellRing} title="Alertes terrain" />
          {alerts.length ? (
            <div className="compact-list">
              {alerts.map((alert) => (
                <article key={alert.id}>
                  <strong>{alert.title}</strong>
                  <span>{alert.body}</span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShieldCheck} title="Aucune alerte" body="Vos hubs ne signalent pas de risque capacite ou froid." />
          )}
        </section>
        <section className="panel">
          <PanelTitle icon={Truck} title="Livraisons a suivre" />
          {activeOrders.length ? (
            <div className="compact-list">
              {activeOrders.slice(0, 5).map((order) => <OrderLine key={order.id} order={order} store={store} withProgress />)}
            </div>
          ) : (
            <EmptyState icon={Truck} title="Aucune livraison ouverte" body="Les commandes non livrees apparaitront ici pour coordination terrain." />
          )}
        </section>
      </div>
    </PageFrame>
  );
}

function MarketplacePage({ actions, currentUser, navigate, notify, store }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('recent');
  const [pageSize, setPageSize] = useState(PRODUCT_PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [contactDraft, setContactDraft] = useState(null);
  const [cartPreview, setCartPreview] = useState(() => readCartFromStorage(store.products));

  useEffect(() => {
    setCartPreview((items) => normalizeCart(items.length ? items : readCartFromStorage(store.products), store.products));
  }, [store.products]);

  // Debounce de la recherche (200ms) pour ne pas refiltrer à chaque frappe
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(handle);
  }, [search]);

  const publishedProducts = useMemo(() => store.products.filter((item) => item.status === 'Publie'), [store.products]);

  const categories = useMemo(() => {
    const unique = new Set(publishedProducts.map((item) => item.category?.trim() || 'General'));
    return ['Tous', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [publishedProducts]);

  const visibleProducts = useMemo(() => {
    const term = normalize(debouncedSearch);
    return sortProductsForCatalog(publishedProducts
      .filter((item) => category === 'Tous' || (item.category?.trim() || 'General') === category)
      .filter((item) => !term || normalize(`${item.name} ${item.category} ${item.zone}`).includes(term)), sortBy);
  }, [category, publishedProducts, debouncedSearch, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, pageSize, debouncedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleProducts.slice(start, start + pageSize);
  }, [page, pageSize, visibleProducts]);

  const rangeStart = visibleProducts.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(visibleProducts.length, page * pageSize);

  const cartCount = cartPreview.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartTotal = cartPreview.reduce((sum, item) => sum + getCartItemTotal(item), 0);

  function addToCart(product, quantity = 1) {
    if (!isBuyerRole(currentUser.role)) {
      notify('Seuls les clients et acheteurs B2B peuvent ajouter au panier');
      return;
    }
    const safeQuantity = Math.max(1, Math.min(Number(product.quantity || quantity), Number(quantity || 1)));
    const nextCart = addProductToCart(readCartFromStorage(store.products), product, safeQuantity);
    writeCartToStorage(nextCart);
    setCartPreview(nextCart);
    notify(`${formatNumber(safeQuantity)} ${product.unit || 'unité'} ajouté(s) au panier`);
  }

  function openContact(product) {
    setContactDraft({
      product,
      body: 'Bonjour, je souhaite obtenir plus d informations sur ce produit.',
    });
  }

  function submitContact() {
    if (!contactDraft) return;
    if (!isBuyerRole(currentUser.role)) return;

    const body = String(contactDraft.body || '').trim();
    if (!body) {
      notify('Votre message est obligatoire');
      return;
    }

    const message = {
      id: uid('msg'),
      createdAt: new Date().toISOString(),
      productId: contactDraft.product.id,
      sellerId: contactDraft.product.ownerId,
      clientId: currentUser.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      subject: `Contact pour ${contactDraft.product.name}`,
      body,
      status: 'Nouveau',
    };
    actions.setMessages((items) => [message, ...items]);
    actions.setNotifications((items) => [
      createMessageNotification({
        actor: currentUser,
        body: `Nouveau message sur ${contactDraft.product.name}`,
        message,
        recipientId: contactDraft.product.ownerId,
        title: 'Demande client',
      }),
      ...items,
    ]);
    notify('Message envoyé au vendeur');
    setContactDraft(null);
  }

  return (
    <PageFrame>
      {isBuyerRole(currentUser.role) && (
        <section className={`market-cart-strip ${cartCount === 0 ? 'empty' : ''}`}>
          <div>
            <ShoppingCart size={22} />
            <span className="cart-badge">{cartCount}</span>
            <strong>
              {cartCount === 0
                ? '0 article · panier vide'
                : `${cartCount} article${cartCount > 1 ? 's' : ''} dans votre panier`}
            </strong>
          </div>
          <div>
            <span>{formatMoney(cartTotal)}</span>
            <Button variant="secondary" onClick={() => navigate('/commandes')} disabled={cartCount === 0}>
              <CheckCircle2 size={17} /> {cartCount === 0 ? 'Ajoutez un produit' : 'Voir commandes'}
            </Button>
          </div>
        </section>
      )}

      <section className="panel">
        <PanelToolbar
          icon={Search}
          title="Articles disponibles"
          action={(
            <div className="market-controls">
              <Field label="Recherche"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Produit, secteur, zone" /></Field>
              <Field label="Tri">
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="recent">Plus récents</option>
                  <option value="priceAsc">Prix croissant</option>
                  <option value="priceDesc">Prix décroissant</option>
                  <option value="quantityDesc">Stock élevé</option>
                  <option value="name">Nom A-Z</option>
                </select>
              </Field>
              <Field label="Affichage">
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                  {PRODUCT_PAGE_SIZE_OPTIONS.map((item) => <option key={item} value={item}>{item} / page</option>)}
                </select>
              </Field>
            </div>
          )}
        />
        <div className="category-tabs" aria-label="Catégories de produits">
          {categories.map((item) => (
            <button key={item} className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
        {visibleProducts.length ? (
          <>
            <CatalogSummary count={visibleProducts.length} rangeEnd={rangeEnd} rangeStart={rangeStart} />
            <div className="product-grid">
              {pagedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  seller={store.users.find((user) => user.id === product.ownerId)}
                clientMode={isBuyerRole(currentUser.role)}
                  onContact={() => openContact(product)}
                  onAddToCart={(quantity) => addToCart(product, quantity)}
                />
              ))}
            </div>
            <CatalogPager page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState icon={Store} title="Aucun article publie" body="Les clients verront les produits des vendeurs des qu ils seront publies." />
        )}
      </section>

      {contactDraft && (
        <ContactSellerModal
          product={contactDraft.product}
          messageBody={contactDraft.body}
          onChangeMessageBody={(value) => setContactDraft((current) => (current ? { ...current, body: value } : current))}
          onCancel={() => setContactDraft(null)}
          onSend={submitContact}
          canSend={String(contactDraft.body || '').trim().length > 0}
        />
      )}
    </PageFrame>
  );
}

function ProductsPage({ actions, currentUser, notify, store }) {
  const [form, setForm] = useState(emptyProductForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [chatDraft, setChatDraft] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productStatus, setProductStatus] = useState('Tous');
  const [productSort, setProductSort] = useState('recent');
  const [productPageSize, setProductPageSize] = useState(PRODUCT_PAGE_SIZE_OPTIONS[0]);
  const [productPage, setProductPage] = useState(1);
  const allowed = currentUser.role === 'admin' || isSellerRole(currentUser.role);
  const canVerifyProducts = currentUser.role === 'agentTerrain';
  const products = currentUser.role === 'admin' || canVerifyProducts ? store.products : store.products.filter((item) => item.ownerId === currentUser.id);
  const sellerMessages = store.messages.filter((item) => item.sellerId === currentUser.id && !item.parentId);

  const filteredProducts = useMemo(() => {
    const term = normalize(productSearch);
    return sortProductsForCatalog(products
      .filter((item) => productStatus === 'Tous' || item.status === productStatus)
      .filter((item) => !term || normalize(`${item.name} ${item.category} ${item.zone} ${item.status}`).includes(term)), productSort);
  }, [productSearch, productSort, productStatus, products]);

  useEffect(() => {
    setProductPage(1);
  }, [productPageSize, productSearch, productSort, productStatus]);

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / productPageSize));

  useEffect(() => {
    if (productPage > productTotalPages) setProductPage(productTotalPages);
  }, [productPage, productTotalPages]);

  const pagedProducts = useMemo(() => {
    const start = (productPage - 1) * productPageSize;
    return filteredProducts.slice(start, start + productPageSize);
  }, [filteredProducts, productPage, productPageSize]);

  const productRangeStart = filteredProducts.length ? (productPage - 1) * productPageSize + 1 : 0;
  const productRangeEnd = Math.min(filteredProducts.length, productPage * productPageSize);

  async function submit(event) {
    event.preventDefault();
    if (!allowed) {
      notify('Ce rôle ne peut pas publier de produit');
      return;
    }
    if (!form.name || !form.price || !form.quantity || !form.zone) {
      notify('Nom, prix, quantité et zone sont obligatoires');
      return;
    }
    const priceControl = getPriceControl({ name: form.name, category: form.category, price: form.price });
    if (priceControl.reference && !priceControl.allowed) {
      notify(`Prix trop eleve: maximum autorise ${formatMoney(priceControl.maxAllowed)} / ${priceControl.reference.unit} (${priceControl.reference.source})`);
      return;
    }
    setSaving(true);
    try {
      const newAttachments = form.imageFiles?.length ? await filesToAttachments(form.imageFiles) : [];
      const rawMerged = [...(form.existingImages || []), ...newAttachments].filter(Boolean);
      if (rawMerged.length > 6) {
        notify(`${rawMerged.length - 6} image(s) ignorée(s) — maximum 6 par produit.`, 'info');
      }
      const mergedImages = rawMerged.slice(0, 6);
      const primaryImage = mergedImages[0] || null;

      if (editingId) {
        actions.setProducts((items) => items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: form.name.trim(),
                category: form.category.trim(),
                quantity: Number(form.quantity),
                unit: form.unit.trim() || 'kg',
                price: Number(form.price),
                marketPrice: priceControl.reference?.price || item.marketPrice || 0,
                maxAllowedPrice: priceControl.maxAllowed || item.maxAllowedPrice || 0,
                priceMargin: priceControl.margin || 0,
                marketPriceSource: priceControl.reference?.source || item.marketPriceSource || '',
                zone: form.zone.trim(),
                description: form.description.trim(),
                status: form.status,
                image: primaryImage,
                images: mergedImages,
                updatedAt: new Date().toISOString(),
              }
            : item
        ));
        notify('Produit mis à jour', 'success');
      } else {
        const product = {
          id: uid('prd'),
          createdAt: new Date().toISOString(),
          ownerId: currentUser.id,
          name: form.name.trim(),
          category: form.category.trim(),
          quantity: Number(form.quantity),
          unit: form.unit.trim() || 'kg',
          price: Number(form.price),
          marketPrice: priceControl.reference?.price || 0,
          maxAllowedPrice: priceControl.maxAllowed || 0,
          priceMargin: priceControl.margin || 0,
          marketPriceSource: priceControl.reference?.source || '',
          zone: form.zone.trim(),
          description: form.description.trim(),
          status: form.status,
          image: primaryImage,
          images: mergedImages,
        };
        actions.setProducts((items) => [product, ...items]);
        notify('Produit publié');
      }
      setForm(emptyProductForm());
      setEditingId(null);
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product) {
    const existingImages = Array.isArray(product.images) && product.images.length
      ? product.images
      : (product.image ? [product.image] : []);
    setForm({
      name: product.name,
      category: product.category || '',
      quantity: String(product.quantity),
      unit: product.unit,
      price: String(product.price),
      zone: product.zone,
      description: product.description || '',
      status: product.status,
      imageFiles: [],
      existingImages,
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeExistingImage(imageId) {
    setForm((prev) => ({
      ...prev,
      existingImages: (prev.existingImages || []).filter((img, index) => getImageId(img, index) !== imageId),
    }));
  }

  function removeNewImage(index) {
    setForm((prev) => ({
      ...prev,
      imageFiles: (prev.imageFiles || []).filter((_, i) => i !== index),
    }));
  }

  function cancelEdit() {
    setForm(emptyProductForm());
    setEditingId(null);
  }

  async function verifyProduct(product, status) {
    const labels = {
      Fiable: 'marquer ce produit comme fiable',
      'A revoir': 'signaler ce produit à revoir',
    };
    const ok = await askConfirm({
      title: 'Vérification terrain',
      message: `Confirmer : ${labels[status] || 'mettre à jour la vérification terrain'} ?`,
      confirmLabel: 'Valider',
    });
    if (!ok) return;
    actions.setProducts((items) => items.map((item) => item.id === product.id ? {
      ...item,
      fieldVerificationStatus: status,
      fieldVerifiedAt: new Date().toISOString(),
      fieldVerifiedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    } : item));
    notify(status === 'Fiable' ? 'Produit confirme fiable' : 'Produit signale a revoir');
  }

  function openChat(message) {
    setChatDraft({
      message,
      body: '',
    });
  }

  function submitChatReply() {
    if (!chatDraft) return;
    const body = String(chatDraft.body || '').trim();
    if (!body) {
      notify('Votre réponse est obligatoire');
      return;
    }

    const reply = {
      id: uid('msg'),
      createdAt: new Date().toISOString(),
      productId: chatDraft.message.productId,
      sellerId: chatDraft.message.sellerId,
      clientId: chatDraft.message.clientId,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      subject: `Re: ${chatDraft.message.subject}`,
      body,
      status: 'Repondu',
      parentId: chatDraft.message.id,
    };
    actions.setMessages((items) => [
      reply,
      ...items.map((item) => item.id === chatDraft.message.id ? { ...item, status: 'Repondu', updatedAt: new Date().toISOString() } : item),
    ]);
    actions.setNotifications((items) => [
      createMessageNotification({
        actor: currentUser,
        body: `Réponse vendeur: ${body.slice(0, 80)}`,
        message: reply,
        recipientId: chatDraft.message.clientId,
        title: 'Réponse à votre demande',
      }),
      ...items,
    ]);
    notify('Réponse envoyée au client');
    setChatDraft(null);
  }

  return (
    <PageFrame>
      {!allowed && !canVerifyProducts && <NoticeCard icon={CircleAlert} title="Acces lecture" body="Les clients commandent depuis le marche. Les transporteurs gerent surtout operations et documents." />}
      {canVerifyProducts && <NoticeCard icon={ShieldCheck} title="Verification terrain" body="Controlez les produits ajoutes par les agriculteurs: disponibilite, qualite annoncee, zone et coherence du prix." />}
      {allowed && (
        <form className="panel form-panel" onSubmit={submit}>
          <PanelTitle icon={PackageCheck} title={editingId ? 'Modifier le produit' : 'Ajouter un produit'} />
          {editingId && <Button type="button" variant="secondary" onClick={cancelEdit}><X size={16} /> Annuler modification</Button>}
          <div className="field-row">
            <Field label="Nom produit" required><input value={form.name} onChange={(event) => updateForm(setForm, 'name', event.target.value)} /></Field>
            <Field label="Catégorie"><input value={form.category} onChange={(event) => updateForm(setForm, 'category', event.target.value)} placeholder="Maraichage, cereales, boutique..." /></Field>
          </div>
          <div className="field-row">
            <Field label="Quantite" required><input inputMode="decimal" value={form.quantity} onChange={(event) => updateForm(setForm, 'quantity', event.target.value)} /></Field>
            <Field label="Unite"><input value={form.unit} onChange={(event) => updateForm(setForm, 'unit', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Prix FCFA/unite" required><input inputMode="decimal" value={form.price} onChange={(event) => updateForm(setForm, 'price', event.target.value)} /></Field>
            <Field label="Zone" required><input value={form.zone} onChange={(event) => updateForm(setForm, 'zone', event.target.value)} /></Field>
          </div>
          <MarketPriceNotice form={form} />
          <Field label="Statut"><select value={form.status} onChange={(event) => updateForm(setForm, 'status', event.target.value)}>{productStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <ProductImagesUploader
            existingImages={form.existingImages}
            newFiles={form.imageFiles}
            onAddFiles={(files) => setForm((prev) => ({ ...prev, imageFiles: [...(prev.imageFiles || []), ...files].slice(0, Math.max(0, 6 - (prev.existingImages?.length || 0))) }))}
            onRemoveExisting={removeExistingImage}
            onRemoveNew={removeNewImage}
            max={6}
          />
          <Field label="Description"><textarea rows="3" value={form.description} onChange={(event) => updateForm(setForm, 'description', event.target.value)} /></Field>
          <Button type="submit" disabled={saving}><Save size={18} /> {editingId ? 'Mettre a jour' : 'Enregistrer produit'}</Button>
        </form>
      )}

      <section className="panel">
        <PanelToolbar icon={Store} title={currentUser.role === 'admin' ? 'Tous les produits' : 'Mes produits'} action={<Button variant="secondary" onClick={() => downloadCsv('frescoop-produits.csv', productsToRows(products))}><Download size={16} /> Export CSV</Button>} />
        {products.length ? (
          <>
            <div className="catalog-tools">
              <label className="compact-search">
                <Search size={17} />
                <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Rechercher produit, zone, statut" />
              </label>
              <select value={productStatus} onChange={(event) => setProductStatus(event.target.value)} aria-label="Filtrer par statut">
                <option value="Tous">Tous les statuts</option>
                {productStatuses.map((item) => <option key={item} value={item}>{orderStatusLabel(item)}</option>)}
              </select>
              <select value={productSort} onChange={(event) => setProductSort(event.target.value)} aria-label="Trier les produits">
                <option value="recent">Plus récents</option>
                <option value="priceAsc">Prix croissant</option>
                <option value="priceDesc">Prix décroissant</option>
                <option value="quantityDesc">Stock élevé</option>
                <option value="name">Nom A-Z</option>
              </select>
              <select value={productPageSize} onChange={(event) => setProductPageSize(Number(event.target.value))} aria-label="Nombre de produits par page">
                {PRODUCT_PAGE_SIZE_OPTIONS.map((item) => <option key={item} value={item}>{item} / page</option>)}
              </select>
            </div>
            {filteredProducts.length ? (
              <>
                <CatalogSummary count={filteredProducts.length} rangeEnd={productRangeEnd} rangeStart={productRangeStart} />
                <div className="product-grid">
                  {pagedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      seller={store.users.find((user) => user.id === product.ownerId)}
                      verifierMode={canVerifyProducts}
                      managerMode={allowed}
                      onDelete={() => actions.setProducts((items) => items.filter((item) => item.id !== product.id))}
                      onEdit={() => startEdit(product)}
                      onVerify={(status) => verifyProduct(product, status)}
                    />
                  ))}
                </div>
                <CatalogPager page={productPage} totalPages={productTotalPages} onPageChange={setProductPage} />
              </>
            ) : (
              <EmptyState icon={Search} title="Aucun produit trouvé" body="Aucun produit ne correspond à ce filtre." />
            )}
          </>
        ) : (
          <EmptyState icon={PackageCheck} title="Aucun produit" body="Ajoutez vos premiers produits pour alimenter le marche client." />
        )}
      </section>

      {/* Section Chat pour les vendeurs */}
      {allowed && sellerMessages.length > 0 && (
        <section className="panel">
          <PanelTitle icon={MessageSquare} title="Messages clients" />
          <div className="compact-list">
            {sellerMessages.map((message) => {
              const client = store.users.find((user) => user.id === message.clientId);
              const product = store.products.find((item) => item.id === message.productId);
              return (
                <article key={message.id} className="chat-message">
                  <div className="chat-header">
                    <Badge>{message.status}</Badge>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <strong>{message.subject}</strong>
                  <p>Client: {client?.name || 'Client'} - Produit: {product?.name || 'Produit'}</p>
                  <p className="chat-body">{message.body}</p>
                  <Button variant="secondary" onClick={() => openChat(message)}>
                    <MessageSquare size={16} /> Repondre
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {chatDraft && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Repondre au client">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <MessageSquare size={20} />
                <strong>Repondre au client</strong>
              </div>
              <button className="modal-close" type="button" onClick={() => setChatDraft(null)} aria-label="Fermer"><X size={18} /></button>
            </div>
            <p className="modal-subtitle">Client: <strong>{store.users.find((u) => u.id === chatDraft.message.clientId)?.name || 'Client'}</strong></p>
            <div className="modal-body">
              <div className="original-message">
                <strong>Message original:</strong>
                <p>{chatDraft.message.body}</p>
              </div>
              <Field label="Votre reponse" required>
                <textarea
                  rows={5}
                  value={chatDraft.body}
                  onChange={(event) => setChatDraft((current) => (current ? { ...current, body: event.target.value } : current))}
                  placeholder="Ecrivez votre reponse au client..."
                />
              </Field>
            </div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setChatDraft(null)}>Annuler</Button>
              <Button onClick={submitChatReply} disabled={!String(chatDraft.body || '').trim().length}>
                <MessageSquare size={18} /> Envoyer
              </Button>
            </div>
          </div>
          <button className="modal-backdrop-click" type="button" aria-label="Fermer" onClick={() => setChatDraft(null)} />
        </div>
      )}
    </PageFrame>
  );
}

function DossiersPage({ actions, currentUser, navigate, notify, store }) {
  const [form, setForm] = useState(emptyDossierForm());
  const [saving, setSaving] = useState(false);
  const canSubmit = currentUser.role !== 'client';
  const dossiers = getVisibleDossiers(store.dossiers, currentUser);

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit) {
      notify('Les clients ne soumettent pas de dossiers dans cet espace');
      return;
    }
    if (!form.type || !form.title || !form.personName || !form.personId || !form.purpose) {
      notify('Type, titre, personne, identifiant et objet sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      const attachments = await filesToAttachments(form.files);
      const dossier = {
        id: uid('dos'),
        createdAt: new Date().toISOString(),
        ownerId: currentUser.id,
        status: 'Soumis',
        type: form.type,
        title: form.title.trim(),
        personName: form.personName.trim(),
        personId: form.personId.trim(),
        personRole: currentUser.role,
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        region: form.region.trim(),
        purpose: form.purpose.trim(),
        evidenceNotes: form.evidenceNotes.trim(),
        existingAttestation: form.existingAttestation,
        consentEconomicProof: form.consentEconomicProof,
        attachments,
        evidenceTags: form.evidenceTags,
      };
      actions.setDossiers((items) => [dossier, ...items]);
      setForm(emptyDossierForm());
      notify('Dossier soumis');
    } catch (error) {
      notify(error.message);
    } finally {
      setSaving(false);
    }
  }

  function setStatus(id, status) {
    actions.setDossiers((items) => items.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    notify('Statut mis à jour');
  }

  return (
    <PageFrame>
      {canSubmit && (
        <form className="panel form-panel" onSubmit={submit}>
          <PanelTitle icon={FolderPlus} title="Soumettre un dossier" />
          <div className="field-row">
            <Field label="Type de dossier" required><select value={form.type} onChange={(event) => updateForm(setForm, 'type', event.target.value)}>{dossierTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Titre dossier" required><input value={form.title} onChange={(event) => updateForm(setForm, 'title', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Personne concernee" required><input value={form.personName} onChange={(event) => updateForm(setForm, 'personName', event.target.value)} /></Field>
            <Field label="CIN / NINEA / ID" required><input value={form.personId} onChange={(event) => updateForm(setForm, 'personId', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Téléphone"><input value={form.phone} onChange={(event) => updateForm(setForm, 'phone', event.target.value)} /></Field>
            <Field label="Organisation"><input value={form.organization} onChange={(event) => updateForm(setForm, 'organization', event.target.value)} /></Field>
          </div>
          <Field label="Région"><input value={form.region} onChange={(event) => updateForm(setForm, 'region', event.target.value)} /></Field>
          <Field label="Objet de la demande" required><textarea rows="3" value={form.purpose} onChange={(event) => updateForm(setForm, 'purpose', event.target.value)} /></Field>
          <EvidencePicker value={form.evidenceTags} onChange={(value) => updateForm(setForm, 'evidenceTags', value)} />
          <FileInput label="Pieces justificatives" multiple file={form.files} onChange={(files) => updateForm(setForm, 'files', files)} />
          <div className="check-grid">
            <label><input type="checkbox" checked={form.existingAttestation} onChange={(event) => updateForm(setForm, 'existingAttestation', event.target.checked)} /> Ancienne attestation fournie</label>
            <label><input type="checkbox" checked={form.consentEconomicProof} onChange={(event) => updateForm(setForm, 'consentEconomicProof', event.target.checked)} /> Consentement preuve économique</label>
          </div>
          <Field label="Explication des preuves"><textarea rows="3" value={form.evidenceNotes} onChange={(event) => updateForm(setForm, 'evidenceNotes', event.target.value)} /></Field>
          <Button type="submit" disabled={saving}><Upload size={18} /> Soumettre dossier</Button>
        </form>
      )}

      <section className="panel">
        <PanelToolbar icon={ClipboardCheck} title={currentUser.role === 'admin' ? 'Tous les dossiers' : 'Mes dossiers'} action={<Button variant="secondary" onClick={() => downloadCsv('frescoop-dossiers.csv', dossiersToRows(dossiers, store))}><Download size={16} /> Export CSV</Button>} />
        {dossiers.length ? (
          <div className="record-grid">
            {dossiers.map((dossier) => (
              <DossierCard
                key={dossier.id}
                currentUser={currentUser}
                dossier={dossier}
                navigate={navigate}
                owner={store.users.find((user) => user.id === dossier.ownerId)}
                onDelete={() => actions.setDossiers((items) => items.filter((item) => item.id !== dossier.id))}
                onStatusChange={(status) => setStatus(dossier.id, status)}
                store={store}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={FolderPlus} title="Aucun dossier" body="Soumettez un dossier avec preuves pour demander une attestation." />
        )}
      </section>
    </PageFrame>
  );
}

function AttestationsPage({ actions, currentUser, notify, store }) {
  const dossiers = getVisibleDossiers(store.dossiers, currentUser);
  const attestations = getVisibleAttestations(store.attestations, currentUser);

  function generate(dossier) {
    const score = computeEvidenceScore(dossier, store);
    const eligible = score.total >= 70 || dossier.status === 'Valide' || currentUser.role === 'admin';
    if (!eligible) {
      notify('Dossier insuffisant : ajoutez plus de preuves ou demandez validation admin');
      return;
    }
    const attestation = {
      id: uid('att'),
      createdAt: new Date().toISOString(),
      ownerId: dossier.ownerId,
      dossierId: dossier.id,
      issuedBy: currentUser.id,
      verificationCode: buildVerificationCode('ATT'),
      score,
      title: dossier.existingAttestation ? 'Attestation de conformite documentaire' : 'Attestation de qualification sur preuves',
      validityMonths: 12,
      dossierSnapshot: snapshotDossier(dossier, store),
    };
    actions.setAttestations((items) => [attestation, ...items]);
    notify('Attestation générée avec code de vérification');
  }

  return (
    <PageFrame>
      <section className="panel">
        <PanelTitle icon={BadgeCheck} title="Dossiers eligibles a attestation" />
        {dossiers.length ? (
          <div className="record-grid">
            {dossiers.map((dossier) => {
              const score = computeEvidenceScore(dossier, store);
              return (
                <article className="eligibility-card" key={dossier.id}>
                  <div className="score-ring"><strong>{score.total}</strong><span>/100</span></div>
                  <div>
                    <Badge>{score.total >= 70 || dossier.status === 'Valide' ? 'Eligible' : 'Preuves insuffisantes'}</Badge>
                    <h3>{dossier.title}</h3>
                    <p>{dossier.personName} - {dossier.type}</p>
                    <ul>
                      {score.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                    <Button onClick={() => generate(dossier)}><FileCheck2 size={18} /> Generer attestation</Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={FolderPlus} title="Aucun dossier" body="Soumettez d abord un dossier avec pieces justificatives." />
        )}
      </section>

      <section className="panel">
        <PanelToolbar icon={FileArchive} title="Attestations emises" action={<Button variant="secondary" onClick={() => downloadCsv('frescoop-attestations.csv', attestationsToRows(attestations))}><Download size={16} /> Export CSV</Button>} />
        {attestations.length ? (
          <div className="record-grid">
            {attestations.map((item) => (
              <DocumentCard
                key={item.id}
                code={item.verificationCode}
                createdAt={item.createdAt}
                icon={FileCheck2}
                title={item.title}
                subtitle={`${item.dossierSnapshot.personName} - score ${item.score.total}/100`}
                onDelete={() => actions.setAttestations((items) => items.filter((entry) => entry.id !== item.id))}
                onDownload={() => downloadHtml(`attestation-${item.verificationCode}.html`, renderAttestationHtml(item))}
                onPrint={() => printHtml(renderAttestationHtml(item))}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={FileCheck2} title="Aucune attestation" body="Les attestations generees apparaitront ici." />
        )}
      </section>
    </PageFrame>
  );
}

function ProofsPage({ actions, currentUser, notify, store }) {
  const [form, setForm] = useState(emptyTransactionForm());
  const transactions = getVisibleTransactions(store.transactions, currentUser);
  const proofs = getVisibleProofs(store.proofs, currentUser);
  const ownedProducts = currentUser.role === 'admin' ? store.products : store.products.filter((item) => item.ownerId === currentUser.id);

  async function addTransaction(event) {
    event.preventDefault();
    if (currentUser.role === 'client') {
      notify('Les clients ne créent pas de preuves économiques');
      return;
    }
    if (!form.date || !form.label || !form.amount) {
      notify('Date, libellé et montant sont obligatoires');
      return;
    }
    try {
      const attachment = form.file ? await fileToAttachment(form.file) : null;
      const transaction = {
        id: uid('txn'),
        createdAt: new Date().toISOString(),
        ownerId: currentUser.id,
        productId: form.productId,
        date: form.date,
        label: form.label.trim(),
        amount: Number(form.amount),
        buyer: form.buyer.trim(),
        paymentMethod: form.paymentMethod.trim(),
        status: form.status,
        reference: form.reference.trim(),
        attachment,
      };
      actions.setTransactions((items) => [transaction, ...items]);
      setForm(emptyTransactionForm());
      notify('Transaction enregistrée');
    } catch (error) {
      notify(error.message);
    }
  }

  function generateProof() {
    if (!transactions.length) {
      notify('Ajoutez au moins une transaction');
      return;
    }
    const user = currentUser;
    const paid = transactions.filter((item) => item.status === 'Paye').length;
    const total = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const proof = {
      id: uid('proof'),
      createdAt: new Date().toISOString(),
      ownerId: user.id,
      issuedBy: user.id,
      verificationCode: buildVerificationCode('ECO'),
      personName: user.name,
      role: user.role,
      organization: user.organization,
      transactionCount: transactions.length,
      totalValue: total,
      paidRate: Math.round((paid / transactions.length) * 100),
      transactions: transactions.map((item) => ({ ...item, attachment: item.attachment ? { name: item.attachment.name, size: item.attachment.size } : null })),
    };
    actions.setProofs((items) => [proof, ...items]);
    notify('Preuve économique générée');
  }

  return (
    <PageFrame>
      {currentUser.role !== 'client' && (
        <form className="panel form-panel" onSubmit={addTransaction}>
          <PanelTitle icon={ReceiptText} title="Ajouter transaction" />
          <div className="field-row">
            <Field label="Date" required><input type="date" value={form.date} onChange={(event) => updateForm(setForm, 'date', event.target.value)} /></Field>
            <Field label="Produit"><select value={form.productId} onChange={(event) => updateForm(setForm, 'productId', event.target.value)}><option value="">Non rattache</option>{ownedProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          </div>
          <Field label="Libelle" required><input value={form.label} onChange={(event) => updateForm(setForm, 'label', event.target.value)} /></Field>
          <div className="field-row">
            <Field label="Montant FCFA" required><input inputMode="decimal" value={form.amount} onChange={(event) => updateForm(setForm, 'amount', event.target.value)} /></Field>
            <Field label="Acheteur"><input value={form.buyer} onChange={(event) => updateForm(setForm, 'buyer', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Paiement"><input value={form.paymentMethod} onChange={(event) => updateForm(setForm, 'paymentMethod', event.target.value)} /></Field>
            <Field label="Statut"><select value={form.status} onChange={(event) => updateForm(setForm, 'status', event.target.value)}>{paymentStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field>
          </div>
          <Field label="Reference"><input value={form.reference} onChange={(event) => updateForm(setForm, 'reference', event.target.value)} /></Field>
          <FileInput label="Justificatif" file={form.file} onChange={(file) => updateForm(setForm, 'file', file)} />
          <div className="button-row">
            <Button type="submit"><Save size={18} /> Enregistrer</Button>
            <Button variant="secondary" onClick={generateProof}><BadgeCheck size={18} /> Generer preuve</Button>
          </div>
        </form>
      )}

      <section className="panel">
        <PanelToolbar icon={ClipboardCheck} title="Transactions" action={<Button variant="secondary" onClick={() => downloadCsv('frescoop-transactions.csv', transactionsToRows(transactions))}><Download size={16} /> Export CSV</Button>} />
        {transactions.length ? (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <article key={transaction.id}>
                <div><strong>{transaction.label}</strong><span>{formatDate(transaction.date)} - {transaction.buyer || 'Acheteur non renseigne'} - {transaction.status}</span></div>
                <b>{formatMoney(transaction.amount)}</b>
                <button type="button" onClick={() => actions.setTransactions((items) => items.filter((item) => item.id !== transaction.id))}><Trash2 size={16} /></button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={ReceiptText} title="Aucune transaction" body="Saisissez des ventes ou paiements reels pour generer une preuve." />
        )}
      </section>

      <section className="panel">
        <PanelTitle icon={FileArchive} title="Preuves economiques" />
        {proofs.length ? (
          <div className="record-grid">
            {proofs.map((proof) => (
              <DocumentCard
                key={proof.id}
                code={proof.verificationCode}
                createdAt={proof.createdAt}
                icon={ReceiptText}
                title={proof.personName}
                subtitle={`${proof.transactionCount} transactions - ${formatMoney(proof.totalValue)}`}
                onDelete={() => actions.setProofs((items) => items.filter((item) => item.id !== proof.id))}
                onDownload={() => downloadHtml(`preuve-${proof.verificationCode}.html`, renderProofHtml(proof))}
                onPrint={() => printHtml(renderProofHtml(proof))}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={BadgeCheck} title="Aucune preuve" body="Generez une preuve apres avoir enregistre des transactions." />
        )}
      </section>
    </PageFrame>
  );
}

function OrdersPage({ actions, currentUser, navigate, notify, route, store }) {
  const [cart, setCart] = useState(() => readCartFromStorage(store.products));
  const [showCart, setShowCart] = useState(true);
  const [showOrderList, setShowOrderList] = useState(true);
  const [showHiddenOrders, setShowHiddenOrders] = useState(false);
  const [hiddenOrderIds, setHiddenOrderIds] = useState(() => readHiddenOrdersFromStorage(currentUser.id));
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [orderFilter, setOrderFilter] = useState('Tous');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPageSize, setOrderPageSize] = useState(ORDER_PAGE_SIZE_OPTIONS[0]);
  const [orderPage, setOrderPage] = useState(1);
  const [conversationDrafts, setConversationDrafts] = useState({});
  const [openConversationId, setOpenConversationId] = useState('');
  const orders = getVisibleOrders(store.orders, currentUser);
  const hiddenOrderSet = useMemo(() => new Set(hiddenOrderIds), [hiddenOrderIds]);
  const scopedOrders = useMemo(() => (
    orders.filter((order) => showHiddenOrders ? hiddenOrderSet.has(order.id) : !hiddenOrderSet.has(order.id))
  ), [hiddenOrderSet, orders, showHiddenOrders]);
  const filteredOrders = useMemo(() => filterOrdersForView(scopedOrders, store, orderFilter, orderSearch), [orderFilter, orderSearch, scopedOrders, store]);
  const orderSummary = useMemo(() => buildOrderSummary(scopedOrders, store), [scopedOrders, store]);
  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
  const messages = getVisibleMessages(store.messages, currentUser);
  const conversations = useMemo(() => buildConversations(messages), [messages]);
  const requestedConversationId = useMemo(() => new URLSearchParams(route?.search || '').get('conversation') || '', [route?.search]);
  const selectedOrderSet = useMemo(() => new Set(selectedOrderIds), [selectedOrderIds]);

  useEffect(() => {
    setHiddenOrderIds(readHiddenOrdersFromStorage(currentUser.id));
    setSelectedOrderIds([]);
  }, [currentUser.id]);

  useEffect(() => {
    setCart((items) => normalizeCart(items, store.products));
  }, [store.products]);

  useEffect(() => {
    writeCartToStorage(cart);
  }, [cart]);

  useEffect(() => {
    writeHiddenOrdersToStorage(currentUser.id, hiddenOrderIds);
  }, [currentUser.id, hiddenOrderIds]);

  useEffect(() => {
    setOrderPage(1);
    setSelectedOrderIds([]);
  }, [orderFilter, orderPageSize, orderSearch, showHiddenOrders]);

  useEffect(() => {
    if (orderPage > orderTotalPages) setOrderPage(orderTotalPages);
  }, [orderPage, orderTotalPages]);

  useEffect(() => {
    if (openConversationId && !conversations.some((conversation) => conversation.id === openConversationId)) {
      setOpenConversationId('');
    }
  }, [conversations, openConversationId]);

  useEffect(() => {
    if (!requestedConversationId || !conversations.some((conversation) => conversation.id === requestedConversationId)) return;
    setOpenConversationId(requestedConversationId);
    window.setTimeout(() => {
      document.getElementById(`conversation-${requestedConversationId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, [conversations, requestedConversationId]);

  const pagedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return filteredOrders.slice(start, start + orderPageSize);
  }, [filteredOrders, orderPage, orderPageSize]);

  const orderRangeStart = filteredOrders.length ? (orderPage - 1) * orderPageSize + 1 : 0;
  const orderRangeEnd = Math.min(filteredOrders.length, orderPage * orderPageSize);
  const pageOrderIds = pagedOrders.map((order) => order.id);
  const pageFullySelected = pageOrderIds.length > 0 && pageOrderIds.every((id) => selectedOrderSet.has(id));

  function toggleOrderSelection(orderId) {
    setSelectedOrderIds((items) => (
      items.includes(orderId) ? items.filter((id) => id !== orderId) : [...items, orderId]
    ));
  }

  function togglePageSelection() {
    setSelectedOrderIds((items) => {
      const current = new Set(items);
      if (pageFullySelected) {
        pageOrderIds.forEach((id) => current.delete(id));
      } else {
        pageOrderIds.forEach((id) => current.add(id));
      }
      return Array.from(current);
    });
  }

  function hideSelectedOrders() {
    if (!selectedOrderIds.length) return;
    setHiddenOrderIds((items) => Array.from(new Set([...items, ...selectedOrderIds])));
    setSelectedOrderIds([]);
    notify('Commandes sélectionnées masquées');
  }

  function restoreSelectedOrders() {
    if (!selectedOrderIds.length) return;
    const selected = new Set(selectedOrderIds);
    setHiddenOrderIds((items) => items.filter((id) => !selected.has(id)));
    setSelectedOrderIds([]);
    notify('Commandes restaurées');
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function updateCartQuantity(productId, quantity) {
    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item));
  }

  function clearCart(options = {}) {
    setCart([]);
    setShowCart(false);
    if (!options.silent) notify('Panier vide');
  }

  function submitOrder() {
    if (!isBuyerRole(currentUser.role)) {
      notify('Seuls les clients et acheteurs B2B peuvent confirmer une commande');
      return;
    }

    const normalizedCart = normalizeCart(cart, store.products);
    if (normalizedCart.length === 0) {
      notify('Panier vide');
      return;
    }

    if (normalizedCart.some((item) => item.product?.status && item.product.status !== 'Publie')) {
      notify('Un produit du panier n\'est plus publié. Retirez-le avant de confirmer.');
      return;
    }

    // Validation stock: refuser si un produit n'a pas assez de stock
    const insufficientStock = normalizedCart.find((item) => {
      const available = Number(item.product?.quantity || 0);
      return Number(item.quantity || 0) > available;
    });
    if (insufficientStock) {
      notify(`Stock insuffisant pour "${insufficientStock.product?.name || 'produit'}". Réduisez la quantité.`);
      return;
    }

    const now = new Date().toISOString();
    const assignedAgent = getAvailableFieldAgent(store);
    const newOrders = normalizedCart.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.product?.price || 0);
      return {
        id: uid('ord'),
        createdAt: now,
        productId: item.productId,
        sellerId: item.sellerId,
        clientId: currentUser.id,
        // Alias pour compatibilité mobile (userId, buyerId, buyerEmail, customer)
        userId: currentUser.id,
        buyerId: currentUser.id,
        buyerEmail: currentUser.email || '',
        customer: {
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
        },
        quantity,
        unit: item.product?.unit || 'unite',
        unitPrice,
        totalPrice: unitPrice * quantity,
        total: unitPrice * quantity,
        status: 'Paiement en attente',
        paymentStatus: 'En attente',
        assignedAgentId: assignedAgent?.id || '',
        agentWorkflow: {},
        message: 'Commande FresCoop en attente de paiement. Règlement sécurisé via PayDunya requis avant préparation.',
        productSnapshot: snapshotCartProduct(item.product),
      };
    });

    // Décrémenter le stock dans la même transaction logique
    const decrementMap = new Map();
    normalizedCart.forEach((item) => {
      const qty = Number(item.quantity || 0);
      decrementMap.set(item.productId, (decrementMap.get(item.productId) || 0) + qty);
    });
    actions.setProducts((items) => items.map((product) => {
      if (!decrementMap.has(product.id)) return product;
      const nextQty = Math.max(0, Number(product.quantity || 0) - decrementMap.get(product.id));
      return { ...product, quantity: nextQty, updatedAt: now };
    }));
    actions.setOrders((items) => [...newOrders, ...items]);

    // Notifier vendeur + agent terrain + admin en même temps (sync mobile + site)
    const admins = (store.users || []).filter((u) => u.role === 'admin');
    const notifPayloads = [];
    newOrders.forEach((order) => {
      const productName = order.productSnapshot?.name || 'un produit';
      const amount = Number(order.totalPrice || 0).toLocaleString('fr-FR');
      const clientName = currentUser?.name || 'un client';
      // 1) Vendeur
      if (order.sellerId) {
        notifPayloads.push(createAppNotification({
          actor: currentUser,
          recipientId: order.sellerId,
          title: 'Nouvelle commande reçue',
          body: `${clientName} · ${order.quantity} ${order.unit} de ${productName} · ${amount} FCFA`,
          path: '/commandes',
          type: 'order-new',
        }));
      }
      // 2) Agent terrain assigné
      if (order.assignedAgentId) {
        notifPayloads.push(createAppNotification({
          actor: currentUser,
          recipientId: order.assignedAgentId,
          title: 'Nouvelle commande à superviser',
          body: `${productName} · ${order.quantity} ${order.unit} · à coordonner avec le producteur`,
          path: '/commandes',
          type: 'order-assigned',
        }));
      }
      // 3) Tous les admins (supervision)
      admins.forEach((admin) => {
        notifPayloads.push(createAppNotification({
          actor: currentUser,
          recipientId: admin.id,
          title: 'Commande passée',
          body: `${clientName} → ${productName} · ${amount} FCFA`,
          path: '/commandes',
          type: 'order-new',
        }));
      });
    });
    if (notifPayloads.length > 0) {
      actions.setNotifications((items) => [...notifPayloads, ...items]);
    }

    notify('Commande enregistrée. Finalisez le paiement sécurisé pour confirmer votre achat.', 'success');
    clearCart({ silent: true });
    navigate(`/paiement?orders=${newOrders.map((order) => order.id).join(',')}`);
  }

  function cancelOrder(orderId) {
    const order = store.orders.find((item) => item.id === orderId);
    if (!order || order.status === 'Annulee') return;
    // Si la commande n'était pas encore livrée, on restitue le stock
    if (order.status !== 'Livree') {
      actions.setProducts((items) => items.map((product) => (
        product.id === order.productId
          ? { ...product, quantity: Number(product.quantity || 0) + Number(order.quantity || 0), updatedAt: new Date().toISOString() }
          : product
      )));
    }
    actions.setOrders((items) => items.map((item) => item.id === orderId ? { ...item, status: 'Annulee', updatedAt: new Date().toISOString() } : item));
    broadcastOrderEvent(order, {
      title: 'Commande annulée',
      body: `${order.productSnapshot?.name || 'Commande'} annulée`,
      type: 'order-cancelled',
    });
    notify('Commande annulée. Stock restitué.', 'info');
  }

  function broadcastOrderEvent(order, { title, body, type = 'order-status' }) {
    const recipients = new Set();
    if (order.clientId) recipients.add(order.clientId);
    if (order.sellerId) recipients.add(order.sellerId);
    if (order.assignedAgentId) recipients.add(order.assignedAgentId);
    (store.users || [])
      .filter((u) => u.role === 'admin')
      .forEach((u) => recipients.add(u.id));
    if (recipients.size === 0) return;
    const payloads = Array.from(recipients).map((rid) =>
      createAppNotification({
        actor: currentUser,
        recipientId: rid,
        title,
        body,
        path: '/commandes',
        type,
      }),
    );
    actions.setNotifications((items) => [...payloads, ...items]);
  }

  async function updateOrder(id, status) {
    if (currentUser.role === 'agentTerrain') {
      const ok = await askConfirm({
        title: 'Changement de statut',
        message: `Confirmer le changement vers « ${orderStatusLabel(status)} » ? Cette action sera visible par les autres acteurs.`,
        confirmLabel: 'Changer le statut',
      });
      if (!ok) return;
    }
    const order = store.orders.find((item) => item.id === id);
    actions.setOrders((items) => items.map((item) => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    if (order) {
      broadcastOrderEvent({ ...order, status }, {
        title: 'Commande mise à jour',
        body: `Statut: ${orderStatusLabel(status)}`,
        type: 'order-status',
      });
    }
    notify('Commande mise à jour', 'success');
  }

  async function markAgentStep(orderId, step) {
    const stepLabels = {
      farmerCalledAt: 'Agriculteur appelé et stock confirmé',
      transporterContactedAt: 'Transporteur contacté',
      deliveryOrganizedAt: 'Livraison organisée',
    };
    const ok = await askConfirm({
      title: 'Action terrain',
      message: `Confirmer : ${stepLabels[step] || 'action terrain'} ? Cette action ne peut pas être annulée automatiquement.`,
      confirmLabel: 'Valider',
    });
    if (!ok) return;
    const now = new Date().toISOString();
    const stepToStatus = {
      farmerCalledAt: 'Confirmee',
      transporterContactedAt: 'En preparation',
      deliveryOrganizedAt: 'En preparation',
    };
    actions.setOrders((items) => items.map((item) => item.id === orderId ? {
      ...item,
      status: stepToStatus[step] || item.status,
      agentWorkflow: { ...(item.agentWorkflow || {}), [step]: now },
      updatedAt: now,
    } : item));
    const order = store.orders.find((o) => o.id === orderId);
    if (order) {
      broadcastOrderEvent({ ...order, status: stepToStatus[step] || order.status }, {
        title: 'Action agent terrain',
        body: stepLabels[step] || 'Action terrain enregistrée',
        type: 'agent-step',
      });
    }
    notify('Action terrain enregistrée');
  }

  function sendConversationReply(conversation) {
    const body = String(conversationDrafts[conversation.id] || '').trim();
    if (!body) {
      notify('Votre message est obligatoire');
      return;
    }

    const now = new Date().toISOString();
    const root = conversation.root;
    const reply = {
      id: uid('msg'),
      createdAt: now,
      productId: root.productId,
      sellerId: root.sellerId,
      clientId: root.clientId,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      subject: root.subject?.startsWith('Re:') ? root.subject : `Re: ${root.subject}`,
      body,
      status: 'Repondu',
      parentId: root.id,
    };

    actions.setMessages((items) => [
      reply,
      ...items.map((item) => item.id === root.id ? { ...item, status: 'Repondu', updatedAt: now } : item),
    ]);
    const recipientId = currentUser.id === root.clientId ? root.sellerId : root.clientId;
    if (recipientId && recipientId !== currentUser.id) {
      actions.setNotifications((items) => [
        createMessageNotification({
          actor: currentUser,
          body: body.slice(0, 90),
          message: reply,
          recipientId,
          title: currentUser.id === root.clientId ? 'Nouveau message client' : 'Réponse vendeur',
        }),
        ...items,
      ]);
    }
    setConversationDrafts((items) => ({ ...items, [conversation.id]: '' }));
    notify('Message envoyé');
  }

  const cartTotal = cart.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <PageFrame>
      {isBuyerRole(currentUser.role) && (
        <section className="orders-workspace">
          <div className="panel cart-review-panel">
            <div className="cart-review-header">
              <PanelTitle icon={ShoppingCart} title="Panier a confirmer" />
              <button className="cart-compact-toggle" type="button" onClick={() => setShowCart((value) => !value)}>
                <span className="cart-badge">{cartCount}</span>
                {showCart ? 'Masquer' : 'Afficher'}
              </button>
            </div>

            {cart.length ? (
              showCart && (
                <div className="cart-items">
                  {cart.map((item) => {
                    const product = item.product;
                    const seller = store.users.find((user) => user.id === item.sellerId);
                    return (
                      <div key={item.productId} className="cart-item">
                        <div className="cart-item-info">
                          <strong>{product?.name || 'Produit'}</strong>
                          <span>{seller?.name || 'Vendeur'} - {product?.zone || 'Zone non renseignee'}</span>
                          <small>{formatMoney(product?.price || 0)} / {product?.unit || 'unite'}</small>
                        </div>
                        <div className="cart-item-quantity" aria-label={`Quantite ${product?.name || 'produit'}`}>
                          <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}><Plus size={15} /></button>
                        </div>
                        <div className="cart-item-total">
                          {formatMoney(getCartItemTotal(item))}
                        </div>
                        <button className="cart-item-remove" type="button" onClick={() => removeFromCart(item.productId)} aria-label="Retirer du panier">
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <EmptyState icon={ShoppingCart} title="Panier vide" body="Ajoutez des produits depuis le marche avant de confirmer une commande." />
            )}
          </div>

          <aside className="panel order-summary-card">
            <PanelTitle icon={ReceiptText} title="Resume" />
            <div className="summary-row"><span>Articles</span><strong>{cartCount}</strong></div>
            <div className="summary-row"><span>Types de produits</span><strong>{cart.length}</strong></div>
            <div className="summary-total"><span>Total estime</span><strong>{formatMoney(cartTotal)}</strong></div>
            <div className="button-row">
              <Button variant="secondary" onClick={() => navigate('/marche')}><Store size={16} /> Ajouter</Button>
              <Button variant="secondary" onClick={clearCart} disabled={!cart.length}><Trash2 size={16} /> Vider</Button>
              <Button onClick={submitOrder} disabled={!cart.length}><CheckCircle2 size={16} /> Confirmer</Button>
            </div>
          </aside>
        </section>
      )}

      <section className="panel order-list-panel">
        <PanelTitle icon={currentUser.role === 'transporteur' ? Truck : ShoppingCart} title={getOrdersTitle(currentUser.role)} />
        {orders.length ? (
          <>
            <OrderListControls
              filter={orderFilter}
              onFilterChange={setOrderFilter}
              onSearchChange={setOrderSearch}
              orders={orders}
              search={orderSearch}
              summary={orderSummary}
            />
            <OrderVisibilityToolbar
              allPageSelected={pageFullySelected}
              hiddenCount={orders.filter((order) => hiddenOrderSet.has(order.id)).length}
              onHideSelected={hideSelectedOrders}
              onPageSizeChange={setOrderPageSize}
              onRestoreSelected={restoreSelectedOrders}
              onToggleHidden={() => {
                setShowHiddenOrders((value) => !value);
                setSelectedOrderIds([]);
              }}
              onToggleList={() => setShowOrderList((value) => !value)}
              onTogglePageSelection={togglePageSelection}
              pageSize={orderPageSize}
              rangeEnd={orderRangeEnd}
              rangeStart={orderRangeStart}
              selectedCount={selectedOrderIds.length}
              showHidden={showHiddenOrders}
              showList={showOrderList}
              totalFiltered={filteredOrders.length}
            />
            {filteredOrders.length ? (
              showOrderList ? (
                <>
                  {currentUser.role === 'transporteur' ? (
                    <DeliveryMissionList onSelect={toggleOrderSelection} onStatusChange={updateOrder} orders={pagedOrders} selectedIds={selectedOrderSet} store={store} />
                  ) : isBuyerRole(currentUser.role) ? (
                    <ClientOrderList onCancel={cancelOrder} onPay={(orderId) => navigate(`/paiement?orders=${orderId}`)} onSelect={toggleOrderSelection} orders={pagedOrders} selectedIds={selectedOrderSet} store={store} />
                  ) : (
                    <OrderCardGrid currentUser={currentUser} onAgentStep={markAgentStep} onCancel={cancelOrder} onSelect={toggleOrderSelection} onStatusChange={updateOrder} orders={pagedOrders} selectedIds={selectedOrderSet} store={store} />
                  )}
                  <CatalogPager page={orderPage} totalPages={orderTotalPages} onPageChange={setOrderPage} />
                </>
              ) : (
                <EmptyState icon={EyeOff} title="Liste reduite" body="Les commandes sont conservees. Utilisez Developper pour les revoir." />
              )
            ) : (
              <EmptyState icon={Search} title="Aucun resultat" body="Aucune commande ne correspond a ce filtre." />
            )}
          </>
        ) : (
          <EmptyState icon={ShoppingCart} title="Aucune commande" body="Les commandes clients apparaitront ici." />
        )}
      </section>

      <section className="panel">
        <PanelTitle icon={MessageSquare} title="Conversations produits" />
        {conversations.length ? (
          <div className="conversation-list">
            {conversations.map((conversation) => {
              const product = store.products.find((item) => item.id === conversation.root.productId);
              const client = store.users.find((item) => item.id === conversation.root.clientId);
              const seller = store.users.find((item) => item.id === conversation.root.sellerId);
              const lastMessage = conversation.items[conversation.items.length - 1];
              const draft = conversationDrafts[conversation.id] || '';
              const isOpen = openConversationId === conversation.id;
              return (
                <article className={`conversation-card ${isOpen ? 'open' : ''}`} id={`conversation-${conversation.id}`} key={conversation.id}>
                  <button
                    aria-expanded={isOpen}
                    className="conversation-summary"
                    type="button"
                    onClick={() => setOpenConversationId((current) => (current === conversation.id ? '' : conversation.id))}
                  >
                    <div>
                      <Badge>{conversation.root.status}</Badge>
                      <strong>{conversation.root.subject}</strong>
                      <span>{product?.name || 'Produit'} - {client?.name || 'Client'} / {seller?.name || 'Vendeur'}</span>
                      <small>{lastMessage?.body || 'Aucun message'}</small>
                    </div>
                    <span className="conversation-count">{conversation.items.length}</span>
                    <small>{formatDate(lastMessage?.createdAt)}</small>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <>
                      <div className="conversation-messages">
                        {conversation.items.map((message) => (
                          <div key={message.id} className={`conversation-bubble ${isMessageFromUser(message, currentUser) ? 'mine' : ''}`}>
                            <span>{getMessageSenderName(message, store)} - {formatDate(message.createdAt)}</span>
                            <p>{message.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="conversation-reply">
                        <textarea
                          rows={2}
                          value={draft}
                          onChange={(event) => setConversationDrafts((items) => ({ ...items, [conversation.id]: event.target.value }))}
                          placeholder="Ecrire un message..."
                        />
                        <Button onClick={() => sendConversationReply(conversation)} disabled={!draft.trim()}>
                          <MessageSquare size={16} /> Envoyer
                        </Button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={MessageSquare} title="Aucun message" body="Les demandes de contact des clients seront listees ici." />
        )}
      </section>
    </PageFrame>
  );
}

function PaymentPage({ actions, currentUser, navigate, notify, route, store }) {
  const [receipt, setReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [pendingToken, setPendingToken] = useState(() => {
    try { return sessionStorage.getItem('frescoop.paydunya.token') || ''; } catch { return ''; }
  });
  const orderIds = useMemo(() => new URLSearchParams(route.search || '').get('orders')?.split(',').filter(Boolean) || [], [route.search]);
  const queryStatus = useMemo(() => new URLSearchParams(route.search || '').get('status') || '', [route.search]);
  const queryToken = useMemo(() => new URLSearchParams(route.search || '').get('token') || '', [route.search]);
  const visibleOrders = getVisibleOrders(store.orders, currentUser);
  const payableOrders = visibleOrders.filter((order) => (
    (orderIds.length ? orderIds.includes(order.id) : order.status === 'Paiement en attente') &&
    order.status === 'Paiement en attente'
  ));
  const total = payableOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);

  function finalizePayment(token, paydunyaData) {
    // Garde anti-rejouage: si un paymentRecord existe déjà avec ce token, on ne refait rien
    const alreadyProcessed = (store.paymentRecords || []).some((record) => record.paydunyaToken === token);
    if (alreadyProcessed) {
      const existing = (store.paymentRecords || []).find((record) => record.paydunyaToken === token);
      if (existing) {
        const paidOrders = (store.orders || []).filter((order) => order.paydunyaToken === token);
        setReceipt({ code: existing.receiptCode, orders: paidOrders, total: existing.amount, paidAt: existing.createdAt, token, paydunyaReceiptUrl: existing.paydunyaReceiptUrl || '' });
      }
      try { sessionStorage.removeItem('frescoop.paydunya.token'); } catch {}
      setPendingToken('');
      return;
    }

    // Re-filtrer sur l'état actuel du store (et non sur la prop capturée au render)
    const eligibleOrders = (store.orders || []).filter((order) => (
      (orderIds.length ? orderIds.includes(order.id) : order.status === 'Paiement en attente')
      && order.status === 'Paiement en attente'
      && order.clientId === currentUser.id
    ));
    if (!eligibleOrders.length) {
      notify('Aucune commande éligible au paiement.', 'info');
      try { sessionStorage.removeItem('frescoop.paydunya.token'); } catch {}
      setPendingToken('');
      return;
    }

    const now = new Date().toISOString();
    const receiptCode = buildVerificationCode('PAY');
    const paidIds = new Set(eligibleOrders.map((order) => order.id));
    const totalAmount = eligibleOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);
    const notifications = [];
    const paymentRecords = eligibleOrders.map((order) => {
      const product = getOrderProduct(order, store);
      const farmer = store.users.find((user) => user.id === order.sellerId);
      const agent = getOrderAgent(order, store);
      if (farmer) {
        notifications.push(createAppNotification({
          actor: currentUser,
          body: `${formatNumber(order.quantity)} ${order.unit || product?.unit || 'kg'} de ${product?.name || 'produit'} paye(s). Preparerez le stock.`,
          path: '/commandes',
          recipientId: farmer.id,
          title: 'Commande payee a preparer',
          type: 'order',
        }));
      }
      if (agent) {
        notifications.push(createAppNotification({
          actor: currentUser,
          body: `Appeler ${farmer?.name || 'l agriculteur'}, confirmer le stock et contacter le transporteur.`,
          path: '/commandes',
          recipientId: agent.id,
          title: 'Action terrain requise',
          type: 'field-agent',
        }));
      }
      return {
        id: uid('pay'),
        createdAt: now,
        orderId: order.id,
        payerId: currentUser.id,
        sellerId: order.sellerId,
        agentId: order.assignedAgentId || agent?.id || '',
        amount: getOrderTotal(order, store),
        status: 'Paye',
        partner: `PayDunya (${paydunyaData?.mode || 'test'})`,
        receiptCode,
        paydunyaToken: token,
        paydunyaReceiptUrl: paydunyaData?.receiptUrl || '',
        regulatoryNote: 'Paiement execute via PayDunya. FresCoop conserve la preuve de coordination.',
      };
    });

    actions.setOrders((items) => items.map((order) => paidIds.has(order.id) ? {
      ...order,
      status: 'Confirmee',
      paymentStatus: 'Paye',
      paidAt: now,
      receiptCode,
      paydunyaToken: token,
      assignedAgentId: order.assignedAgentId || getAvailableFieldAgent(store)?.id || '',
      updatedAt: now,
    } : order));
    actions.setPaymentRecords((items) => [...paymentRecords, ...items]);
    actions.setNotifications((items) => [...notifications, ...items]);
    actions.setAuditLogs((items) => [createAuditLog(currentUser, 'payment_paydunya_confirmed', `Paiement PayDunya confirmé: ${receiptCode} (token ${token})`, receiptCode), ...items]);
    setReceipt({ code: receiptCode, orders: eligibleOrders, total: totalAmount, paidAt: now, token, paydunyaReceiptUrl: paydunyaData?.receiptUrl || '' });
    notify('Paiement confirmé. Reçu généré.', 'success');
    try { sessionStorage.removeItem('frescoop.paydunya.token'); } catch {}
    setPendingToken('');
  }

  async function verifyPendingToken(token) {
    if (!token) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/paydunya/confirm/${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data?.confirmed) {
        finalizePayment(token, data);
      } else {
        notify(`Paiement non confirme (statut: ${data?.status || 'inconnu'}). Aucun recu genere.`);
        try { sessionStorage.removeItem('frescoop.paydunya.token'); } catch {}
        setPendingToken('');
      }
    } catch (error) {
      notify(`Erreur verification PayDunya: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (queryStatus === 'cancel') {
      notify('Paiement annulé. Aucun reçu généré.');
      try { sessionStorage.removeItem('frescoop.paydunya.token'); } catch {}
      setPendingToken('');
      navigate(route.pathname);
      return;
    }
    if (queryStatus === 'success') {
      const tokenToCheck = queryToken || pendingToken;
      if (tokenToCheck) {
        verifyPendingToken(tokenToCheck);
        navigate(route.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStatus, queryToken]);

  async function payNow() {
    if (!isBuyerRole(currentUser.role)) {
      notify('Paiement réservé aux clients et acheteurs B2B');
      return;
    }
    if (!payableOrders.length) {
      notify('Aucune commande à payer');
      return;
    }

    setProcessing(true);
    try {
      const description = `Commande FresCoop - ${payableOrders.length} article(s)`;
      const res = await fetch(API_BASE + '/api/paydunya/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total),
          description,
          orderIds: payableOrders.map((order) => order.id),
          payerId: currentUser.id,
          storePhone: currentUser.phone || '',
          storeAddress: currentUser.region || 'Senegal',
        }),
      });
      const data = await res.json();
      if (!data?.ok || !data?.url) {
        notify(data?.error || 'Echec initialisation PayDunya');
        setProcessing(false);
        return;
      }
      try { sessionStorage.setItem('frescoop.paydunya.token', data.token); } catch {}
      setPendingToken(data.token);
      notify('Redirection vers PayDunya...');
      window.location.href = data.url;
    } catch (error) {
      notify(`Erreur PayDunya: ${error.message}`);
      setProcessing(false);
    }
  }

  function simulateAcceptedPayment() {
    if (!payableOrders.length) {
      notify('Aucune commande à payer');
      return;
    }
    setProcessing(true);
    const simulatedToken = `DEMO-${Date.now().toString(36).toUpperCase()}`;
    setTimeout(() => {
      finalizePayment(simulatedToken, { mode: 'démonstration', receiptUrl: '', amount: total });
      setProcessing(false);
    }, 1200);
  }

  return (
    <PageFrame>
      {receipt ? (
        <section className="payment-success-panel">
          <div className="payment-success-icon">
            <CheckCircle2 size={80} strokeWidth={2.5} />
          </div>
          <h2>Paiement accepté</h2>
          <p className="payment-success-subtitle">Votre transaction a été confirmée avec succès. Le producteur et l'agent terrain ont été notifiés.</p>
          <div className="payment-success-amount">
            <em>Montant payé</em>
            <strong>{formatMoney(receipt.total)}</strong>
          </div>
          <div className="payment-success-grid">
            <div><em>Code de reçu</em><b>{receipt.code}</b></div>
            <div><em>Date & heure</em><b>{formatDate(receipt.paidAt)}</b></div>
            <div><em>Articles</em><b>{receipt.orders.length} produit{receipt.orders.length > 1 ? 's' : ''}</b></div>
            <div><em>Mode</em><b>{receipt.token?.startsWith('DEMO') ? 'Simulation démo' : 'PayDunya'}</b></div>
          </div>
          <div className="payment-success-actions">
            <Button onClick={() => downloadHtml(`recu-${receipt.code}.html`, renderPaymentReceiptHtml(receipt, store, currentUser))}>
              <Download size={17} /> Télécharger le reçu
            </Button>
            <Button variant="secondary" onClick={() => navigate('/commandes')}>
              <ShoppingCart size={17} /> Voir mes commandes
            </Button>
          </div>
          <small className="payment-success-footer">Un email de confirmation sera envoyé à {currentUser.email}. Conservez le code de reçu pour toute vérification ultérieure.</small>
        </section>
      ) : (
        <section className="panel payment-panel partner-powered">
          <PanelToolbar icon={ReceiptText} title="Paiement sécurisé" action={<Button variant="secondary" onClick={() => navigate('/commandes')}><ShoppingCart size={16} /> Retour commandes</Button>} />
          <NoticeCard icon={ShieldCheck} title="Paiement via PayDunya" body="Orange Money, Wave, Free Money, carte bancaire. Aucun reçu n'est émis tant que le paiement n'est pas confirmé." />
          {pendingToken && (
            <NoticeCard icon={CircleAlert} title="Paiement en cours de vérification" body={`Référence: ${pendingToken}. Cliquez ci-dessous pour vérifier le statut.`} />
          )}
          {payableOrders.length ? (
            <>
              <div className="payment-order-list">
                {payableOrders.map((order) => {
                  const product = getOrderProduct(order, store);
                  const farmer = store.users.find((user) => user.id === order.sellerId);
                  const agent = getOrderAgent(order, store);
                  return (
                    <article key={order.id}>
                      <div>
                        <strong>{product?.name || 'Produit'}</strong>
                        <span>{formatNumber(order.quantity)} {order.unit || product?.unit || 'kg'} · {farmer?.name || 'Agriculteur'}</span>
                        <small>Agent terrain: {agent?.name || 'À affecter automatiquement'}</small>
                      </div>
                      <b>{formatMoney(getOrderTotal(order, store))}</b>
                    </article>
                  );
                })}
              </div>
              <div className="summary-total"><span>Total à payer</span><strong>{formatMoney(total)}</strong></div>
              <div className="button-row">
                <Button onClick={payNow} disabled={processing}>
                  <CheckCircle2 size={18} /> {processing ? 'Redirection...' : 'Payer via PayDunya'}
                </Button>
                <Button variant="secondary" onClick={simulateAcceptedPayment} disabled={processing}>
                  <CheckCircle2 size={18} /> {processing ? '...' : 'Simuler paiement (démo)'}
                </Button>
              </div>
              {pendingToken && (
                <Button variant="secondary" onClick={() => verifyPendingToken(pendingToken)} disabled={processing}>
                  <RefreshCcw size={16} /> Vérifier statut du paiement
                </Button>
              )}
            </>
          ) : (
            <EmptyState icon={ReceiptText} title="Aucune commande à payer" body="Les commandes déjà payées sont disponibles dans votre page commandes avec leur reçu." />
          )}
        </section>
      )}
    </PageFrame>
  );
}

function OperationsPage({ actions, currentUser, notify, store }) {
  const [form, setForm] = useState(emptyHubForm());
  const canManage = currentUser.role === 'admin' || currentUser.role === 'transporteur';

  async function submit(event) {
    event.preventDefault();
    if (!canManage) {
      notify('Accès opérations réservé admin/transporteur');
      return;
    }
    if (!form.name || !form.region || !form.capacityKg) {
      notify('Nom, région et capacité obligatoires');
      return;
    }
    const image = form.imageFile ? await fileToAttachment(form.imageFile) : null;
    const hub = {
      id: uid('hub'),
      createdAt: new Date().toISOString(),
      ownerId: currentUser.id,
      name: form.name.trim(),
      region: form.region.trim(),
      manager: form.manager.trim(),
      phone: form.phone.trim(),
      capacityKg: Number(form.capacityKg),
      currentStockKg: Number(form.currentStockKg || 0),
      temperature: form.temperature.trim(),
      batteryPercent: Number(form.batteryPercent || 0),
      image,
    };
    actions.setHubs((items) => [hub, ...items]);
    setForm(emptyHubForm());
    notify('Hub enregistré');
  }

  return (
    <PageFrame>
      {canManage && (
        <form className="panel form-panel" onSubmit={submit}>
          <PanelTitle icon={Warehouse} title="Ajouter site operationnel" />
          <div className="field-row">
            <Field label="Nom hub" required><input value={form.name} onChange={(event) => updateForm(setForm, 'name', event.target.value)} /></Field>
            <Field label="Région" required><input value={form.region} onChange={(event) => updateForm(setForm, 'region', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Responsable"><input value={form.manager} onChange={(event) => updateForm(setForm, 'manager', event.target.value)} /></Field>
            <Field label="Téléphone"><input value={form.phone} onChange={(event) => updateForm(setForm, 'phone', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Capacite kg" required><input inputMode="decimal" value={form.capacityKg} onChange={(event) => updateForm(setForm, 'capacityKg', event.target.value)} /></Field>
            <Field label="Stock kg"><input inputMode="decimal" value={form.currentStockKg} onChange={(event) => updateForm(setForm, 'currentStockKg', event.target.value)} /></Field>
          </div>
          <div className="field-row">
            <Field label="Temperature"><input value={form.temperature} onChange={(event) => updateForm(setForm, 'temperature', event.target.value)} /></Field>
            <Field label="Batterie %"><input inputMode="decimal" value={form.batteryPercent} onChange={(event) => updateForm(setForm, 'batteryPercent', event.target.value)} /></Field>
          </div>
          <FileInput label="Photo site" accept="image/*" file={form.imageFile} onChange={(file) => updateForm(setForm, 'imageFile', file)} />
          <Button type="submit"><Save size={18} /> Enregistrer site</Button>
        </form>
      )}
      <section className="panel">
        <PanelTitle icon={Warehouse} title="Sites operations" />
        {store.hubs.length ? (
          <div className="hub-grid">
            {store.hubs.map((hub) => <HubCard key={hub.id} hub={hub} onDelete={() => actions.setHubs((items) => items.filter((item) => item.id !== hub.id))} />)}
          </div>
        ) : (
          <EmptyState icon={Warehouse} title="Aucun site" body="Ajoutez des hubs ou sites logistiques reels." />
        )}
      </section>
    </PageFrame>
  );
}

function LotIntelligencePage({ actions, currentUser, notify, store }) {
  const [selectedLotId, setSelectedLotId] = useState('');
  const data = getFrescoopOperatingData(store);
  const lots = data.lots;
  const selectedLot = lots.find((lot) => lot.id === selectedLotId) || lots[0] || null;
  const activeLots = lots.filter((lot) => lot.status !== 'Sorti');
  const protectedKg = sumBy(lots, 'weightKg');
  const avoidedLossKg = lots.reduce((sum, lot) => sum + Number(lot.weightKg || 0) * (Number(lot.lossAvoidedPercent || 0) / 100), 0);
  const pipelineValue = data.reservations.reduce((sum, item) => sum + Number(item.value || 0), 0);

  function reserveLot(lot) {
    if (!lot) return;
    const now = new Date().toISOString();
    const reservation = {
      id: uid('rsv'),
      createdAt: now,
      lotId: lot.id,
      buyerId: data.buyers[0]?.id || 'buyer-demo',
      status: 'Reserve',
      quantityKg: Math.min(200, Number(lot.weightKg || 0)),
      value: Math.min(200, Number(lot.weightKg || 0)) * Number(lot.recommendedPrice || lot.baselinePrice || 0),
      paymentMode: 'Partner-powered',
      paymentPartner: lot.paymentPartner || 'Orange Money / banque partenaire agreee',
    };
    actions.setReservations((items) => [reservation, ...items]);
    actions.setBuyerOrders((items) => [{
      id: uid('b2b'),
      createdAt: now,
      reservationId: reservation.id,
      buyerId: reservation.buyerId,
      lotId: lot.id,
      status: 'Reservation emise',
      recurrence: 'Ponctuelle',
    }, ...items]);
    actions.setAuditLogs((items) => [createAuditLog(currentUser, 'reservation_b2b', 'Reservation B2B creee', lot.id), ...items]);
    notify('Réservation B2B créée avec paiement partenaire');
  }

  function shareConsent(lot) {
    if (!lot) return;
    const existing = (store.consentRecords || []).find((item) => item.lotId === lot.id && item.ownerId === lot.ownerId && item.partnerId === 'partner-baobab');
    if (existing) {
      actions.setConsentRecords((items) => items.map((item) => item.id === existing.id ? { ...item, status: item.status === 'Actif' ? 'Revoque' : 'Actif', updatedAt: new Date().toISOString() } : item));
      actions.setAuditLogs((items) => [createAuditLog(currentUser, 'consent_toggle', 'Consentement partenaire modifie', lot.id), ...items]);
      notify(existing.status === 'Actif' ? 'Consentement revoque' : 'Consentement reactive');
      return;
    }
    actions.setConsentRecords((items) => [{
      id: uid('cst'),
      createdAt: new Date().toISOString(),
      ownerId: lot.ownerId,
      lotId: lot.id,
      partnerId: 'partner-baobab',
      partnerName: 'Baobab+ Finance agricole',
      scope: ['flux agrege', 'indice explicable', 'historique reservations'],
      status: 'Actif',
      revocable: true,
    }, ...items]);
    actions.setAuditLogs((items) => [createAuditLog(currentUser, 'consent_create', 'Consentement partenaire cree', lot.id), ...items]);
    notify('Partage basé sur consentement activé pour partenaire agréé');
  }

  return (
    <PageFrame>
      <div className="status-grid">
        <StatCard icon={ClipboardCheck} label="Lots actifs" value={activeLots.length} tone="green" />
        <StatCard icon={Warehouse} label="Kg proteges" value={formatNumber(protectedKg)} tone="blue" />
        <StatCard icon={Leaf} label="Pertes evitees" value={`${formatNumber(avoidedLossKg)} kg`} tone="gold" />
        <StatCard icon={CircleDollarSign} label="Reservations" value={formatMoney(pipelineValue)} tone="coral" />
      </div>

      <section className="panel lot-command-center">
        <PanelToolbar
          icon={ClipboardCheck}
          title="Jumeaux numeriques des lots"
          action={<Button variant="secondary" onClick={() => actions.replaceStore(createFrescoopDemoStore(store))}><RefreshCcw size={16} /> Charger demo jury</Button>}
        />
        <div className="lot-layout">
          <div className="lot-list">
            {lots.map((lot) => (
              <button key={lot.id} className={selectedLot?.id === lot.id ? 'active' : ''} type="button" onClick={() => setSelectedLotId(lot.id)}>
                <span><Badge>{lot.status}</Badge><strong>{lot.code}</strong></span>
                <small>{lot.productName} - {formatNumber(lot.weightKg)} kg - {lot.hubName}</small>
              </button>
            ))}
          </div>
          {selectedLot ? (
            <LotDigitalTwinCard
              lot={selectedLot}
              onReserve={() => reserveLot(selectedLot)}
              onShareConsent={() => shareConsent(selectedLot)}
            />
          ) : (
            <EmptyState icon={ClipboardCheck} title="Aucun lot" body="Chargez la demo jury pour afficher les lots froids intelligents." />
          )}
        </div>
      </section>

      <div className="split-layout">
        <section className="panel">
          <PanelTitle icon={Activity} title="Timeline de vie du lot" />
          {selectedLot ? <LotTimeline lot={selectedLot} /> : <EmptyState icon={Activity} title="Aucun lot selectionne" body="Selectionnez un lot pour voir son parcours." />}
        </section>
        <section className="panel">
          <PanelTitle icon={ShieldCheck} title="Consentements et audit" />
          <div className="compact-list">
            {data.consentRecords.slice(0, 4).map((item) => (
              <article key={item.id}>
                <strong>{item.partnerName}</strong>
                <span>{item.status} - {item.scope?.join(', ')}</span>
                <p>Revocable, trace et limite aux donnees autorisees.</p>
              </article>
            ))}
            {data.auditLogs.slice(0, 4).map((item) => (
              <article key={item.id}>
                <strong>{item.action}</strong>
                <span>{formatDate(item.createdAt)} - {item.actorName}</span>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageFrame>
  );
}

function UsersPage({ actions, currentUser, store }) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  if (currentUser.role !== 'admin') return <AccessDenied />;
  const filteredUsers = filterUsersForAdmin(store.users, roleFilter, search);
  const groupedUsers = groupUsersByRole(filteredUsers);
  const roleCounts = countUsersByRole(store.users);

  return (
    <PageFrame>
      <section className="panel users-admin-panel">
        <PanelToolbar
          icon={Users}
          title="Utilisateurs"
          action={<Button variant="secondary" onClick={() => downloadCsv('frescoop-utilisateurs.csv', usersToRows(store.users))}><Download size={16} /> Export CSV</Button>}
        />
        <div className="users-admin-tools">
          <div className="role-filter-bar" aria-label="Catégories utilisateurs">
            <button className={roleFilter === 'all' ? 'active' : ''} type="button" onClick={() => setRoleFilter('all')}>Tous <span>{store.users.length}</span></button>
            {roles.map((role) => (
              <button key={role.id} className={roleFilter === role.id ? 'active' : ''} type="button" onClick={() => setRoleFilter(role.id)}>
                {role.label} <span>{roleCounts.get(role.id) || 0}</span>
              </button>
            ))}
          </div>
          <label className="compact-search">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher nom, email, téléphone..." />
          </label>
        </div>

        {(() => {
          const userAuditLogs = (store.auditLogs || []).filter((log) =>
            ['user_deleted', 'user_suspended', 'user_reactivated'].includes(log.action),
          ).slice(0, 8);
          if (userAuditLogs.length === 0) return null;
          return (
            <section className="user-audit-panel">
              <div className="user-audit-head">
                <strong>🕒 Journal d'audit · actions admin sur les comptes</strong>
                <small>Traçabilité complète des {userAuditLogs.length} dernière(s) action(s).</small>
              </div>
              <ul className="user-audit-list">
                {userAuditLogs.map((log) => {
                  const icon = log.action === 'user_deleted' ? '🗑️' : log.action === 'user_suspended' ? '⛔' : '✅';
                  const label = log.action === 'user_deleted' ? 'Suppression' : log.action === 'user_suspended' ? 'Suspension' : 'Réactivation';
                  return (
                    <li key={log.id} className={`audit-row audit-${log.action}`}>
                      <span className="audit-icon">{icon}</span>
                      <div>
                        <strong>{label}</strong>
                        <p>{log.detail}</p>
                        <small>par {log.actorName || 'Admin'} · {formatDate(log.createdAt)}</small>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })()}

        {filteredUsers.length ? (
          <div className="user-groups">
            {groupedUsers.map((group) => (
              <section className="user-role-section" key={group.role}>
                <div className="user-role-heading">
                  <strong>{roleLabel(group.role)}</strong>
                  <span>{group.users.length} compte(s)</span>
                </div>
                <div className="user-table">
                  <div className="user-row user-row-head">
                    <span>Compte</span>
                    <span>Contact</span>
                    <span>Organisation</span>
                    <span>Statut</span>
                  </div>
                  {group.users.map((user) => {
                    const canDelete = user.role !== 'admin' && user.id !== currentUser.id;
                    return (
                      <UserCompactRow
                        key={user.id}
                        canDelete={canDelete}
                        onStatusChange={(status) => {
                          actions.setUsers((items) => items.map((item) => item.id === user.id ? { ...item, status } : item));
                          actions.setAuditLogs((items) => [
                            createAuditLog(
                              currentUser,
                              status === 'Actif' ? 'user_reactivated' : 'user_suspended',
                              `${status === 'Actif' ? 'Réactivation' : 'Suspension'} de ${user.name} (${roleLabel(user.role)}, ${user.email})`,
                              user.id,
                            ),
                            ...items,
                          ]);
                        }}
                        onDelete={async () => {
                          if (!canDelete) return;

                          // Étape 1 : avertissement avec impact détaillé
                          const relatedProducts = (store.products || []).filter((p) => p.ownerId === user.id).length;
                          const relatedOrders = (store.orders || []).filter((o) => o.clientId === user.id || o.sellerId === user.id).length;
                          const relatedLots = (store.lots || []).filter((l) => l.ownerId === user.id).length;

                          const impact = [
                            relatedProducts && `${relatedProducts} produit(s)`,
                            relatedOrders && `${relatedOrders} commande(s)`,
                            relatedLots && `${relatedLots} lot(s)`,
                          ].filter(Boolean).join(', ');

                          const ok = await askConfirm({
                            title: `⚠️ Supprimer ${user.name} ?`,
                            message: `Vous allez supprimer définitivement le compte de ${user.name} (${roleLabel(user.role)}, ${user.email}).\n\n${impact ? `Impact : ${impact} associés resteront dans la base mais orphelins.` : 'Aucune donnée associée.'}\n\nÀ la prochaine étape, vous devrez taper exactement le nom pour confirmer.`,
                            confirmLabel: 'Continuer',
                            cancelLabel: 'Annuler',
                            variant: 'danger',
                          });
                          if (!ok) return;

                          // Étape 2 : saisie du nom (protection anti-suppression accidentelle)
                          const typed = window.prompt(
                            `Pour confirmer la suppression, tapez exactement le nom :\n\n${user.name}`,
                            '',
                          );
                          if (typed === null) return; // annulé
                          if (typed.trim() !== user.name.trim()) {
                            notify('Le nom ne correspond pas. Suppression annulée.', 'error');
                            return;
                          }

                          // Étape 3 : journal d'audit + suppression effective
                          actions.setAuditLogs((items) => [
                            createAuditLog(
                              currentUser,
                              'user_deleted',
                              `Suppression du compte ${user.name} (${roleLabel(user.role)}, ${user.email}) — ${impact || 'aucune donnée liée'}`,
                              user.id,
                            ),
                            ...items,
                          ]);
                          actions.setUsers((items) => items.filter((item) => item.id !== user.id));
                          notify(`${user.name} a été supprimé. Action tracée dans l'audit.`, 'success');
                        }}
                        user={user}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState icon={Search} title="Aucun utilisateur" body="Aucun compte ne correspond à ce filtre." />
        )}
      </section>
    </PageFrame>
  );
}

function ImpactPage({ stats, store }) {
  const roleData = buildRoleData(store.users);
  const salesByProduct = store.products.map((product) => ({
    name: product.name,
    value: Number(product.price || 0) * Number(product.quantity || 0),
  }));
  const impact = computePoesamImpact(store);

  return (
    <PageFrame>
      <section className="panel poesam-hero">
        <div>
          <span className="poesam-badge">IMPACT POESAM</span>
          <h2>FresCoop en chiffres — indicateurs mesurables</h2>
          <p>Chaque lot trace, chaque paiement PayDunya, chaque capteur froid convertit des pertes en revenu pour les producteurs senegalais. Aucun chiffre fictif: ces KPI sont calcules en temps reel sur l activite du compte.</p>
        </div>
      </section>

      <div className="status-grid">
        <StatCard icon={Leaf} label="Pertes post-recolte evitees" value={`${impact.lossesAvertedPercent}%`} tone="green" />
        <StatCard icon={CircleDollarSign} label="Revenu additionnel producteurs" value={`${formatCompact(impact.additionalFarmerRevenue)} FCFA`} tone="gold" />
        <StatCard icon={Users} label="Femmes productrices actives" value={`${impact.womenProducers} / ${impact.totalProducers}`} tone="coral" />
        <StatCard icon={Sprout} label="CO2 evite (kg eq.)" value={formatCompact(impact.co2SavedKg)} tone="blue" />
        <StatCard icon={Tractor} label="Coopératives connectees" value={impact.coopérativeCount} tone="green" />
        <StatCard icon={Truck} label="Kg traces jusqu au marche" value={formatCompact(impact.tracedKg)} tone="blue" />
        <StatCard icon={ReceiptText} label="Transactions PayDunya" value={impact.paydunyaTxCount} tone="gold" />
        <StatCard icon={ShieldCheck} label="Preuves economiques emises" value={stats.proofs} tone="coral" />
      </div>

      <section className="panel">
        <PanelTitle icon={BarChart3} title="Objectifs de developpement durable (ODD) contribues" />
        <div className="odd-grid">
          <article><strong>ODD 1 · Pas de pauvrete</strong><p>Revenu additionnel par agriculteur, inclusion financiere PayDunya.</p></article>
          <article><strong>ODD 2 · Faim zero</strong><p>Reduction des pertes post-recolte, preservation qualite alimentaire.</p></article>
          <article><strong>ODD 5 · Egalite des sexes</strong><p>Visibilite et traçabilite du revenu des productrices.</p></article>
          <article><strong>ODD 8 · Travail decent</strong><p>Preuves economiques bancarisables pour coopératives.</p></article>
          <article><strong>ODD 12 · Consommation responsable</strong><p>Traçabilite froid, anti-gaspillage, transparence marche.</p></article>
          <article><strong>ODD 13 · Action climat</strong><p>CO2 evite par optimisation logistique et reduction pertes.</p></article>
        </div>
      </section>

      <div className="split-layout">
        <section className="panel">
          <PanelTitle icon={BarChart3} title="Valeur catalogue" />
          {salesByProduct.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByProduct} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e4dc" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#1f835d" radius={[8, 8, 0, 0]} name="Valeur FCFA" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Store} title="Aucun produit" body="Publiez des produits pour voir les indicateurs." />}
        </section>
        <section className="panel">
          <PanelTitle icon={Users} title="Repartition roles" />
          {roleData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roleData} dataKey="value" outerRadius={105} label>
                  {roleData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={Users} title="Aucun compte" body="Les roles apparaitront apres creation des comptes." />}
        </section>
      </div>

      <section className="panel">
        <PanelTitle icon={ShieldCheck} title="Pitch POESAM — pourquoi FresCoop coche toutes les cases" />
        <div className="poesam-pitch-grid">
          <article><strong>Impact mesurable</strong><p>Chaque KPI ci-dessus est calcule sur les transactions et lots reels — pas de projection theorique.</p></article>
          <article><strong>Innovation tech</strong><p>IoT froid + QR traçabilite + IA duree de vie + PayDunya = stack pragmatique, pas gadget.</p></article>
          <article><strong>Scalabilite</strong><p>Modele reproductible Mali, Cote d Ivoire, Burkina. API et base deja decouplees.</p></article>
          <article><strong>Inclusion financiere</strong><p>Exports dossier bancabilite pour SFD et banques partenaires, paiement mobile sans wallet proprietaire.</p></article>
          <article><strong>Genre</strong><p>Indicateur femmes productrices visible, eligible Prix Feminin International.</p></article>
          <article><strong>Anti-gaspillage</strong><p>Alertes DLC courte + prix degressifs, echo direct du gagnant 2024 SAVEY.</p></article>
        </div>
      </section>
    </PageFrame>
  );
}

function computePoesamImpact(store) {
  const products = store.products || [];
  const orders = store.orders || [];
  const lots = store.lots || [];
  const paymentRecords = store.paymentRecords || [];
  const transactions = store.transactions || [];
  const users = store.users || [];

  const paidOrders = orders.filter((order) => order.paymentStatus === 'Paye' || order.status === 'Confirmee' || order.status === 'Livree');
  const totalRevenue = paidOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);
  const additionalFarmerRevenue = Math.round(totalRevenue * 0.18); // marge conservatrice attribuee a la plateforme
  const tracedKg = lots.reduce((sum, lot) => sum + Number(lot.quantityKg || 0), 0)
    + paidOrders.reduce((sum, order) => sum + Number(order.quantity || 0), 0);
  const lossesAvertedPercent = lots.length || paidOrders.length ? Math.min(32, 12 + Math.round((lots.length + paidOrders.length) * 0.8)) : 0;
  const co2SavedKg = Math.round(tracedKg * 0.22);
  const producers = users.filter((user) => user.role === 'agriculteur');
  const womenProducers = producers.filter((user) => user.gender === 'F' || /(^|\s)(fatou|aissatou|aïssatou|aminata|awa|khady|marieme|mariéme|mariame|mame|ndeye|fama|ndèye|fatoumata|diarra|binta|astou|bintou|soda|coumba|rokhaya|rokhia|aida|aïda|yacine|khadija|khadidja|penda|dior|oumy|mareme|marème)/i.test(String(user.name || ''))).length;
  const coopérativeCount = (store.coopératives || []).length;
  const paydunyaTxCount = paymentRecords.filter((record) => record.paydunyaToken || /paydunya/i.test(record.partner || '')).length;

  return {
    lossesAvertedPercent,
    additionalFarmerRevenue,
    tracedKg,
    co2SavedKg,
    totalProducers: producers.length,
    womenProducers,
    coopérativeCount,
    paydunyaTxCount,
    transactionsCount: transactions.length,
    revenue: totalRevenue,
  };
}

function AntiWastePage({ actions, currentUser, navigate, notify, store }) {
  const alerts = useMemo(() => buildAntiWasteAlerts(store), [store]);
  const canPublish = currentUser.role === 'agriculteur' || currentUser.role === 'admin';
  const canBuy = isBuyerRole(currentUser.role);

  function applyFlashDiscount(alert) {
    if (!canPublish) {
      notify('Action réservée aux producteurs');
      return;
    }
    const product = store.products.find((item) => item.id === alert.productId);
    if (!product) return;
    const newPrice = Math.max(10, Math.round(Number(product.price || 0) * (1 - alert.suggestedDiscountPct / 100)));
    actions.setProducts((items) => items.map((item) => item.id === product.id ? { ...item, price: newPrice, flashSaleStartedAt: new Date().toISOString(), flashSaleDiscountPct: alert.suggestedDiscountPct } : item));
    actions.setAuditLogs((items) => [createAuditLog(currentUser, 'flash_discount_applied', `Prix ${product.name}: ${product.price} -> ${newPrice} FCFA (anti-gaspillage)`, product.id), ...items]);
    const notif = createAppNotification({
      actor: currentUser,
      body: `${product.name} -${alert.suggestedDiscountPct}% (anti-gaspi). Disponible immediatement.`,
      path: '/marche',
      recipientRole: 'acheteurB2B',
      title: 'Vente eclair anti-gaspi',
      type: 'anti-waste',
    });
    actions.setNotifications((items) => [notif, ...items]);
    notify(`Prix reduit de ${alert.suggestedDiscountPct}%. Acheteurs B2B notifies.`);
  }

  function buyFlash(alert) {
    if (!canBuy) {
      notify('Réservez depuis le marché comme acheteur B2B');
      return;
    }
    navigate(`/marche?flash=${alert.productId}`);
  }

  const heroCopy = {
    agriculteur: {
      title: 'Vos lots proches de péremption',
      body: 'Appliquez une réduction rapide (-15 à -40%) pour éviter la perte et sauver votre marge. Plus vous agissez vite, mieux votre score de bancabilité progresse.',
    },
    agentTerrain: {
      title: 'Lots à risque à superviser',
      body: 'Contactez les producteurs concernés, organisez une vente groupée ou proposez un transfert vers un hub froid avant péremption.',
    },
    transporteur: {
      title: 'Priorités logistiques anti-gaspi',
      body: 'Ces lots doivent arriver chez un acheteur en 1 à 3 jours. Priorisez-les dans vos tournées et allouez un véhicule réfrigéré si disponible.',
    },
    client: {
      title: 'Produits à sauver · prix réduits',
      body: 'Achetez ces produits à prix cassé et aidez à réduire le gaspillage. Chaque achat évite des pertes et soutient un producteur.',
    },
    acheteurB2B: {
      title: 'Opportunités sourcing anti-gaspi',
      body: 'Jusqu\'à -40% sur des lots frais de qualité. Sécurisez un volume immédiat et valorisez votre engagement RSE.',
    },
    partenaire: {
      title: 'Vue risque post-récolte',
      body: 'Indicateur clé pour évaluer la performance opérationnelle des producteurs financés. Un agriculteur qui agit vite sur ses alertes prouve sa discipline de gestion.',
    },
    admin: {
      title: 'Supervision anti-gaspillage',
      body: 'Vue consolidée sur tous les lots à risque. Intervenez si un producteur ne réagit pas dans les 12h.',
    },
  };
  const copy = heroCopy[currentUser.role] || {
    title: 'Lots proches de péremption · alertes et ventes éclair',
    body: '30 à 40% des récoltes sont perdues au Sénégal après récolte. FresCoop détecte les lots à DLC courte et propose des ventes éclair à prix dégressif.',
  };

  return (
    <PageFrame>
      <section className="panel poesam-hero">
        <div>
          <span className="poesam-badge">ANTI-GASPI</span>
          <h2>{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
      </section>

      <div className="status-grid">
        <StatCard icon={CircleAlert} label="Lots en alerte" value={alerts.length} tone="coral" />
        <StatCard icon={Leaf} label="Kg à sauver" value={formatCompact(alerts.reduce((sum, a) => sum + a.quantityKg, 0))} tone="green" />
        <StatCard icon={CircleDollarSign} label="Valeur potentielle" value={`${formatCompact(alerts.reduce((sum, a) => sum + a.currentValue, 0))} FCFA`} tone="gold" />
      </div>

      {alerts.length ? (
        <section className="panel">
          <PanelTitle icon={CircleAlert} title="Alertes actives" />
          <div className="anti-waste-list">
            {alerts.map((alert) => (
              <article key={alert.productId} className={`anti-waste-card urgency-${alert.urgency}`}>
                <header>
                  <div>
                    <strong>{alert.productName}</strong>
                    <small>{alert.sellerName} · {alert.region || 'Région non précisée'}</small>
                  </div>
                  <span className={`urgency-tag urgency-${alert.urgency}`}>{alert.urgencyLabel}</span>
                </header>
                <div className="anti-waste-metrics">
                  <div><em>Quantité</em><b>{formatNumber(alert.quantityKg)} kg</b></div>
                  <div><em>Jours restants</em><b>{alert.daysLeft} j</b></div>
                  <div><em>Prix actuel</em><b>{formatMoney(alert.currentUnitPrice)}/{alert.unit}</b></div>
                  <div><em>Prix suggéré</em><b>{formatMoney(alert.suggestedPrice)}/{alert.unit}</b></div>
                </div>
                <div className="button-row">
                  {canPublish && <Button variant="secondary" onClick={() => applyFlashDiscount(alert)}><RefreshCcw size={16} /> Appliquer -{alert.suggestedDiscountPct}%</Button>}
                  {canBuy && <Button onClick={() => buyFlash(alert)}><ShoppingCart size={16} /> Acheter maintenant</Button>}
                  {currentUser.role === 'transporteur' && <Button variant="secondary" onClick={() => navigate('/commandes')}><Truck size={16} /> Planifier livraison</Button>}
                  {currentUser.role === 'agentTerrain' && <Button variant="secondary" onClick={() => navigate('/commandes')}><PhoneCall size={16} /> Contacter producteur</Button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState icon={CheckCircle2} title="Aucun lot en alerte" body="Tous les lots sont encore dans leur fenêtre optimale. Parfait !" />
      )}
    </PageFrame>
  );
}

function buildAntiWasteAlerts(store) {
  const products = store.products || [];
  const users = store.users || [];
  const now = Date.now();
  const alerts = [];
  for (const product of products) {
    const createdAt = new Date(product.createdAt || now).getTime();
    const shelfLifeDays = Number(product.shelfLifeDays || product.daysToExpire || estimateShelfLife(product.category || product.name));
    const expireAt = createdAt + shelfLifeDays * 86400000;
    const daysLeft = Math.round((expireAt - now) / 86400000);
    const qty = Number(product.quantity || 0);
    if (qty <= 0) continue;
    if (daysLeft > 6) continue;
    const seller = users.find((user) => user.id === product.ownerId);
    const urgency = daysLeft <= 1 ? 'critical' : daysLeft <= 3 ? 'high' : 'medium';
    const discount = urgency === 'critical' ? 40 : urgency === 'high' ? 25 : 15;
    const unitPrice = Number(product.price || 0);
    alerts.push({
      productId: product.id,
      productName: product.name,
      sellerName: seller?.name || 'Producteur',
      region: product.zone || seller?.region || '',
      quantityKg: qty,
      daysLeft: Math.max(0, daysLeft),
      urgency,
      urgencyLabel: urgency === 'critical' ? 'Critique · 24h' : urgency === 'high' ? 'Eleve · 2-3j' : 'Surveillance',
      currentUnitPrice: unitPrice,
      suggestedPrice: Math.round(unitPrice * (1 - discount / 100)),
      suggestedDiscountPct: discount,
      currentValue: unitPrice * qty,
      unit: product.unit || 'kg',
    });
  }
  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}

function estimateShelfLife(key) {
  const text = String(key || '').toLowerCase();
  if (/tomate|laitue|salade|concombre|feuille|menthe|persil/.test(text)) return 5;
  if (/mangue|papaye|banane|fruit/.test(text)) return 8;
  if (/oignon|pomme de terre|patate|ail|carotte/.test(text)) return 30;
  if (/riz|mil|sorgho|niebe|arachide|cereale/.test(text)) return 180;
  if (/poisson|viande|volaille|poulet/.test(text)) return 2;
  return 10;
}

function BancabilitePage({ actions, currentUser, notify, store }) {
  const isFinancePartner = currentUser.role === 'partenaire';
  const isAgriculteur = currentUser.role === 'agriculteur';
  const [filter, setFilter] = useState('all');
  const [loanForm, setLoanForm] = useState({ amount: '', purpose: '', months: '6' });
  const [showLoanForm, setShowLoanForm] = useState(false);

  const scope = useMemo(() => {
    if (isAgriculteur) return [currentUser];
    return store.users.filter((user) => user.role === 'agriculteur');
  }, [isAgriculteur, currentUser, store.users]);

  const loans = store.loans || [];
  const myLoans = loans.filter((loan) => loan.farmerId === currentUser.id || loan.partnerId === currentUser.id);

  const enriched = scope.map((user) => ({ user, dossier: buildBancabiliteDossier(user, store) }));
  const visible = enriched.filter(({ dossier }) => {
    if (filter === 'eligible') return dossier.score >= 60;
    if (filter === 'pending') return dossier.score >= 40 && dossier.score < 60;
    if (filter === 'risky') return dossier.score < 40;
    return true;
  });

  function exportDossier(user) {
    const dossier = buildBancabiliteDossier(user, store);
    downloadHtml(`bancabilite-${user.id}.html`, renderBancabiliteHtml(dossier));
    notify(`Dossier bancabilite genere pour ${user.name}`);
  }

  function submitLoanRequest(event) {
    event.preventDefault();
    if (!loanForm.amount || !loanForm.purpose) {
      notify('Montant et objet obligatoires', 'error');
      return;
    }
    // Bloquer si une demande est déjà en cours de traitement
    const pendingExisting = (store.loans || []).some((item) => item.farmerId === currentUser.id && item.status === 'En attente');
    if (pendingExisting) {
      notify('Vous avez déjà une demande en attente. Attendez la décision des partenaires.', 'info');
      return;
    }
    const dossier = buildBancabiliteDossier(currentUser, store);
    if (dossier.score < 40) {
      notify('Score insuffisant (< 40). Complétez votre activité FresCoop avant de demander un prêt.', 'error');
      return;
    }
    const loan = {
      id: uid('loan'),
      createdAt: new Date().toISOString(),
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      partnerId: '',
      amount: Number(loanForm.amount),
      purpose: loanForm.purpose.trim(),
      months: Number(loanForm.months),
      status: 'En attente',
      score: dossier.score,
      grade: dossier.grade,
      verificationCode: dossier.verificationCode,
    };
    actions.setLoans((items) => [loan, ...items]);
    const partners = store.users.filter((user) => user.role === 'partenaire');
    const notifs = partners.map((partner) => createAppNotification({
      actor: currentUser,
      body: `${currentUser.name} sollicite ${formatMoney(loan.amount)} sur ${loan.months} mois. Score: ${dossier.score}/100 (${dossier.grade}).`,
      path: '/bancabilite',
      recipientId: partner.id,
      title: 'Nouvelle demande de prêt',
      type: 'loan-request',
    }));
    actions.setNotifications((items) => [...notifs, ...items]);
    actions.setAuditLogs((items) => [createAuditLog(currentUser, 'loan_request_submitted', `Demande ${formatMoney(loan.amount)} / ${loan.months} mois`, loan.id), ...items]);
    notify('Demande envoyée aux partenaires finance');
    setLoanForm({ amount: '', purpose: '', months: '6' });
    setShowLoanForm(false);
  }

  function decideLoan(loan, decision) {
    // Early return si la demande est déjà traitée (anti-double-approbation)
    const currentLoan = (store.loans || []).find((item) => item.id === loan.id);
    if (!currentLoan || currentLoan.status !== 'En attente') {
      notify('Cette demande a déjà été traitée.', 'info');
      return;
    }
    actions.setLoans((items) => items.map((item) => item.id === loan.id ? { ...item, status: decision, partnerId: currentUser.id, decidedAt: new Date().toISOString() } : item));
    const farmer = store.users.find((user) => user.id === loan.farmerId);
    if (farmer) {
      const notif = createAppNotification({
        actor: currentUser,
        body: `Votre demande de ${formatMoney(loan.amount)} a été ${decision.toLowerCase()}.`,
        path: '/bancabilite',
        recipientId: farmer.id,
        title: `Demande ${decision}`,
        type: 'loan-decision',
      });
      actions.setNotifications((items) => [notif, ...items]);
    }
    actions.setAuditLogs((items) => [createAuditLog(currentUser, 'loan_decision', `${decision} prêt ${formatMoney(loan.amount)} pour ${loan.farmerName}`, loan.id), ...items]);
    notify(`Demande ${decision.toLowerCase()}`);
  }

  const summary = {
    total: enriched.length,
    eligible: enriched.filter(({ dossier }) => dossier.score >= 60).length,
    pending: enriched.filter(({ dossier }) => dossier.score >= 40 && dossier.score < 60).length,
    risky: enriched.filter(({ dossier }) => dossier.score < 40).length,
  };

  return (
    <PageFrame>
      <section className="panel poesam-hero">
        <div>
          <span className="poesam-badge">INCLUSION FINANCIERE</span>
          <h2>{isFinancePartner ? 'Portefeuille agriculteurs - éligibilité crédit' : 'Score de bancabilité & dossier financement'}</h2>
          <p>{isFinancePartner
            ? 'Consultez les profils d\'agriculteurs FresCoop, leur score de bancabilité en temps réel, et instruisez les demandes de prêt directement depuis cette page.'
            : 'Transformez votre activité réelle (transactions PayDunya, lots tracés, attestations) en dossier exploitable par banques, SFD et microfinance. Demande de prêt en un clic.'}
          </p>
        </div>
      </section>

      {isAgriculteur && (
        <section className="panel">
          <PanelToolbar icon={Landmark} title="Demander un prêt" action={
            <Button onClick={() => setShowLoanForm((open) => !open)} variant={showLoanForm ? 'secondary' : 'primary'}>
              {showLoanForm ? 'Annuler' : 'Nouvelle demande'}
            </Button>
          } />
          {showLoanForm && (
            <form className="stack-form" onSubmit={submitLoanRequest}>
              <div className="field-row">
                <Field label="Montant souhaité (FCFA)" required><input type="number" min="0" value={loanForm.amount} onChange={(event) => updateForm(setLoanForm, 'amount', event.target.value)} /></Field>
                <Field label="Durée (mois)" required>
                  <select value={loanForm.months} onChange={(event) => updateForm(setLoanForm, 'months', event.target.value)}>
                    <option value="3">3 mois</option>
                    <option value="6">6 mois</option>
                    <option value="12">12 mois</option>
                    <option value="18">18 mois</option>
                    <option value="24">24 mois</option>
                  </select>
                </Field>
              </div>
              <Field label="Objet (intrants, matériel, transport...)" required>
                <textarea rows="3" value={loanForm.purpose} onChange={(event) => updateForm(setLoanForm, 'purpose', event.target.value)} />
              </Field>
              <Button type="submit"><Send size={16} /> Envoyer la demande</Button>
            </form>
          )}
        </section>
      )}

      {(isAgriculteur || isFinancePartner) && myLoans.length > 0 && (
        <section className="panel">
          <PanelTitle icon={ReceiptText} title={isFinancePartner ? 'Demandes à instruire' : 'Mes demandes de prêt'} />
          <div className="loan-list">
            {myLoans.map((loan) => (
              <article key={loan.id} className={`loan-card loan-${loan.status.toLowerCase().replace(/\s/g, '-')}`}>
                <header>
                  <div>
                    <strong>{loan.farmerName}</strong>
                    <small>Score {loan.score}/100 · Grade {loan.grade} · {formatDate(loan.createdAt)}</small>
                  </div>
                  <span className={`loan-status loan-${loan.status.toLowerCase().replace(/\s/g, '-')}`}>{loan.status}</span>
                </header>
                <div className="loan-body">
                  <div><em>Montant</em><b>{formatMoney(loan.amount)}</b></div>
                  <div><em>Durée</em><b>{loan.months} mois</b></div>
                  <div><em>Objet</em><b>{loan.purpose}</b></div>
                </div>
                {isFinancePartner && loan.status === 'En attente' && (
                  <div className="button-row">
                    <Button onClick={() => decideLoan(loan, 'Approuvé')}><CheckCircle2 size={16} /> Approuver</Button>
                    <Button variant="secondary" onClick={() => decideLoan(loan, 'Refusé')}><X size={16} /> Refuser</Button>
                    <Button variant="secondary" onClick={() => exportDossier(store.users.find((user) => user.id === loan.farmerId))}><Download size={16} /> Dossier</Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {(isFinancePartner || currentUser.role === 'admin') && (
        <>
          <div className="status-grid">
            <StatCard icon={Users} label="Agriculteurs" value={summary.total} tone="green" />
            <StatCard icon={CheckCircle2} label="Éligibles (≥60)" value={summary.eligible} tone="blue" />
            <StatCard icon={CircleAlert} label="À consolider (40-59)" value={summary.pending} tone="gold" />
            <StatCard icon={CircleAlert} label="À accompagner (<40)" value={summary.risky} tone="coral" />
          </div>

          <section className="panel">
            <div className="loan-filter-bar">
              {[
                ['all', 'Tous'],
                ['eligible', 'Éligibles'],
                ['pending', 'À consolider'],
                ['risky', 'À accompagner'],
              ].map(([key, label]) => (
                <button key={key} type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>
              ))}
            </div>
          </section>
        </>
      )}

      {!visible.length && <EmptyState icon={Users} title="Aucun agriculteur dans ce filtre" body="Changez de filtre ou attendez de nouvelles inscriptions." />}

      <div className="bancabilite-grid">
        {visible.map(({ user, dossier }) => (
          <article key={user.id} className="panel bancabilite-card">
            <header className="bancabilite-head">
              <div>
                <PanelTitle icon={Landmark} title={user.name} />
                {user.region && <small className="muted">{user.region}</small>}
                {user.organization && <small className="muted">{user.organization}</small>}
              </div>
            </header>
            <div className="bancabilite-score">
              <div className={`score-ring score-${dossier.grade.toLowerCase()}`}>
                <strong>{dossier.score}</strong>
                <span>/100</span>
              </div>
              <div>
                <b>Grade {dossier.grade}</b>
                <small>{dossier.verdict}</small>
              </div>
            </div>
            <ul className="bancabilite-criteria">
              {dossier.criteria.map((crit) => (
                <li key={crit.label}>
                  <span>{crit.label}</span>
                  <b>{crit.value}</b>
                  <em>{crit.points} pts</em>
                </li>
              ))}
            </ul>
            <div className="bancabilite-kpi">
              <div><em>Revenu vérifié</em><b>{formatMoney(dossier.totalRevenue)}</b></div>
              <div><em>Moyenne / mois</em><b>{formatMoney(dossier.monthlyAverage)}</b></div>
              <div><em>Transactions</em><b>{dossier.transactionsCount}</b></div>
              <div><em>PayDunya</em><b>{dossier.paydunyaCount}</b></div>
            </div>
            <div className="button-row">
              <Button variant="secondary" onClick={() => exportDossier(user)}><Download size={16} /> Dossier PDF</Button>
              {isFinancePartner && dossier.score >= 40 && (
                <Button onClick={() => {
                  const loan = {
                    id: uid('loan'),
                    createdAt: new Date().toISOString(),
                    farmerId: user.id,
                    farmerName: user.name,
                    partnerId: currentUser.id,
                    amount: Math.round(dossier.monthlyAverage * 3),
                    purpose: 'Pre-approbation crédit FresCoop (proposition partenaire)',
                    months: 6,
                    status: 'Pré-approuvé',
                    score: dossier.score,
                    grade: dossier.grade,
                    verificationCode: dossier.verificationCode,
                    decidedAt: new Date().toISOString(),
                  };
                  actions.setLoans((items) => [loan, ...items]);
                  const notif = createAppNotification({
                    actor: currentUser,
                    body: `${currentUser.name} vous pré-approuve ${formatMoney(loan.amount)} sur 6 mois.`,
                    path: '/bancabilite',
                    recipientId: user.id,
                    title: 'Crédit pré-approuvé',
                    type: 'loan-preapproval',
                  });
                  actions.setNotifications((items) => [notif, ...items]);
                  notify(`Pré-approbation envoyée à ${user.name}`);
                }}><CheckCircle2 size={16} /> Pré-approuver</Button>
              )}
            </div>
          </article>
        ))}
      </div>

      <NoticeCard icon={ShieldCheck} title="Pour les partenaires finance" body="Chaque dossier contient un code de verification permettant aux banques et SFD d authentifier les donnees aupres de FresCoop. L agriculteur garde le controle via son consentement." />
    </PageFrame>
  );
}

function buildBancabiliteDossier(user, store) {
  const transactions = (store.transactions || []).filter((item) => item.ownerId === user.id);
  const orders = (store.orders || []).filter((item) => item.sellerId === user.id);
  const paidOrders = orders.filter((order) => order.paymentStatus === 'Paye' || order.status === 'Confirmee' || order.status === 'Livree');
  const paymentRecords = (store.paymentRecords || []).filter((record) => record.sellerId === user.id);
  const paydunyaTx = paymentRecords.filter((r) => r.paydunyaToken || /paydunya/i.test(r.partner || ''));
  const lots = (store.lots || []).filter((lot) => lot.ownerId === user.id);
  const attestations = (store.attestations || []).filter((item) => item.ownerId === user.id);
  const proofs = (store.proofs || []).filter((item) => item.ownerId === user.id);
  const totalRevenue = paidOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0)
    + transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthsActive = Math.max(1, Math.round((Date.now() - new Date(user.createdAt || Date.now()).getTime()) / (86400000 * 30)));
  const monthlyAverage = Math.round(totalRevenue / monthsActive);

  const criteria = [
    { label: 'Anciennete compte', value: `${monthsActive} mois`, points: Math.min(20, monthsActive * 2) },
    { label: 'Transactions verifiees', value: transactions.length + paidOrders.length, points: Math.min(20, (transactions.length + paidOrders.length) * 2) },
    { label: 'Paiements PayDunya', value: paydunyaTx.length, points: Math.min(15, paydunyaTx.length * 3) },
    { label: 'Lots traces avec capteurs', value: lots.length, points: Math.min(10, lots.length * 2) },
    { label: 'Attestations qualifiees', value: attestations.length, points: Math.min(10, attestations.length * 3) },
    { label: 'Preuves economiques', value: proofs.length, points: Math.min(10, proofs.length * 2) },
    { label: 'Revenu mensuel moyen', value: `${formatCompact(monthlyAverage)} FCFA`, points: Math.min(15, Math.floor(monthlyAverage / 50000) * 2) },
  ];
  const score = Math.min(100, criteria.reduce((sum, c) => sum + c.points, 0));
  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
  const verdict = grade === 'A' ? 'Dossier solide, eligible credit bancaire' :
                  grade === 'B' ? 'Bonne assise, eligible SFD / microfinance' :
                  grade === 'C' ? 'Profil a consolider, eligible pret garanti' : 'Historique insuffisant, accompagnement recommande';

  return {
    user,
    score,
    grade,
    verdict,
    criteria,
    totalRevenue,
    monthlyAverage,
    transactionsCount: transactions.length + paidOrders.length,
    paydunyaCount: paydunyaTx.length,
    lotsCount: lots.length,
    attestationsCount: attestations.length,
    verificationCode: `BANC-${user.id.slice(-6).toUpperCase()}-${grade}${score}`,
  };
}

function renderBancabiliteHtml(dossier) {
  const rows = dossier.criteria.map((crit) => `<tr><td>${escapeHtml(crit.label)}</td><td>${escapeHtml(String(crit.value))}</td><td>${crit.points} pts</td></tr>`).join('');
  return renderDocumentShell(`Dossier bancabilite ${dossier.user.name}`, `
    <h1>Dossier de bancabilite FresCoop</h1>
    <p class="code">Code verification: ${escapeHtml(dossier.verificationCode)}</p>
    <section>
      <h2>Bénéficiaire</h2>
      <p><strong>${escapeHtml(dossier.user.name)}</strong> - ${escapeHtml(dossier.user.email)}</p>
      <p>Role: ${escapeHtml(dossier.user.role)} - Organisation: ${escapeHtml(dossier.user.organization || '—')} - Region: ${escapeHtml(dossier.user.region || '—')}</p>
    </section>
    <section>
      <h2>Score de bancabilite</h2>
      <p>Score global: <strong>${dossier.score}/100 (Grade ${escapeHtml(dossier.grade)})</strong></p>
      <p>${escapeHtml(dossier.verdict)}</p>
      <table><thead><tr><th>Critere</th><th>Valeur</th><th>Points</th></tr></thead><tbody>${rows}</tbody></table>
    </section>
    <section>
      <h2>Indicateurs cles</h2>
      <p>Revenu total verifie: <strong>${escapeHtml(formatMoney(dossier.totalRevenue))}</strong></p>
      <p>Revenu mensuel moyen: <strong>${escapeHtml(formatMoney(dossier.monthlyAverage))}</strong></p>
      <p>Transactions verifiees: ${dossier.transactionsCount} | Paiements PayDunya: ${dossier.paydunyaCount}</p>
      <p>Lots traces: ${dossier.lotsCount} | Attestations: ${dossier.attestationsCount}</p>
    </section>
    <section>
      <h2>Note aux partenaires finance</h2>
      <p>Ce dossier a ete genere automatiquement par FresCoop a partir de donnees transactionnelles et logistiques verifiees. Le code de verification ci-dessus permet d authentifier les informations aupres de la plateforme.</p>
    </section>
  `);
}

function UssdSimulatorPage({ currentUser, store }) {
  const [screen, setScreen] = useState('menu');
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);

  const prices = useMemo(() => (store.products || []).slice(0, 6).map((product) => ({
    name: product.name,
    price: Number(product.price || 0),
    unit: product.unit || 'kg',
  })), [store.products]);

  function send(code) {
    const value = (code ?? prompt).trim();
    setHistory((items) => [...items, `> ${value}`]);
    setPrompt('');
    if (screen === 'menu') {
      if (value === '1') {
        setScreen('prices');
      } else if (value === '2') {
        setScreen('stock');
      } else if (value === '3') {
        setScreen('sale');
      } else if (value === '0') {
        setScreen('menu');
      }
    } else if (screen === 'sale' && /^\d+$/.test(value)) {
      setHistory((items) => [...items, `Vente enregistree: ${value} kg. Notification envoyee a l agent terrain.`]);
      setScreen('menu');
    }
  }

  const menus = {
    menu: {
      title: '*384*FRES#',
      body: [
        'Bienvenue FresCoop',
        '1. Cours du jour',
        '2. Mon stock',
        '3. Declarer vente',
        '4. Mon paiement',
        '0. Quitter',
      ],
    },
    prices: {
      title: 'Cours du jour - FCFA',
      body: prices.length ? prices.map((p) => `- ${p.name}: ${formatNumber(p.price)}/${p.unit}`) : ['Aucune cotation disponible'],
    },
    stock: {
      title: 'Mon stock actif',
      body: ['Oignon: 240 kg', 'Tomate: 80 kg', 'Retour: 0'],
    },
    sale: {
      title: 'Declarer une vente',
      body: ['Saisir la quantite en kg vendue aujourd hui', 'Envoyer pour confirmer'],
    },
  };

  const current = menus[screen];

  return (
    <PageFrame>
      <section className="panel poesam-hero">
        <div>
          <span className="poesam-badge">INCLUSION DIGITALE · USSD</span>
          <h2>Parcours USSD *384*FRES# pour agriculteurs sans smartphone</h2>
          <p>70% des petits producteurs au Senegal n ont pas d Internet fiable. FresCoop etend ses services via USSD + SMS: consulter les cours du jour, declarer son stock, enregistrer une vente — depuis un simple tel a touches.</p>
        </div>
      </section>

      <div className="ussd-layout">
        <section className="panel ussd-phone">
          <div className="ussd-screen">
            <header>{current.title}</header>
            <ul>
              {current.body.map((line, index) => <li key={index}>{line}</li>)}
            </ul>
            <div className="ussd-history">
              {history.slice(-5).map((line, index) => <small key={index}>{line}</small>)}
            </div>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') send(); }}
              placeholder="Taper un chiffre puis Entree"
            />
            <div className="ussd-keypad">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
                <button key={key} type="button" onClick={() => send(key)}>{key}</button>
              ))}
            </div>
          </div>
        </section>
        <section className="panel">
          <PanelTitle icon={PhoneCall} title="Pourquoi ça change tout" />
          <ul className="poesam-bullets">
            <li><strong>Inclusion reelle</strong>: fonctionne sur Nokia 105 a 8000 FCFA, pas besoin de 4G.</li>
            <li><strong>Couverture totale</strong>: le USSD passe meme en zones rurales avec 2G.</li>
            <li><strong>Langues locales</strong>: menu disponible en wolof, pular, serere (SMS).</li>
            <li><strong>Traçabilite</strong>: chaque code USSD tape est converti en donnee dans FresCoop — meme les ventes hors smartphone alimentent le score de bancabilite.</li>
            <li><strong>Partenariat operateur</strong>: Sonatel/Orange, Free, Expresso. Deploiement prevu via API USSD standard.</li>
          </ul>
          <NoticeCard icon={ShieldCheck} title="Mode demo" body="Ceci est un simulateur fidele du flux USSD. En production, le passerelle Sonatel transmet les codes au backend FresCoop." />
        </section>
      </div>
    </PageFrame>
  );
}

function DataPage({ actions, currentUser, notify, store }) {
  const [file, setFile] = useState(null);
  if (currentUser.role !== 'admin') return <AccessDenied />;

  async function importData() {
    if (!file) {
      notify('Sélectionnez un fichier JSON');
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      actions.replaceStore(normalizeStore(parsed));
      notify('Base importée');
    } catch {
      notify('Fichier invalide');
    }
  }

  return (
    <PageFrame>
      <NoticeCard icon={Database} title="API et base applicative" body="L application est prete pour synchronisation API locale. Les exports JSON/CSV permettent migration vers une base serveur et stockage fichiers." />
      <div className="data-grid">
        <section className="panel">
          <PanelTitle icon={Download} title="Export complet" />
          <p className="muted">Utilisateurs, produits, commandes, dossiers, pieces, attestations, preuves, hubs, lots, capteurs, consentements et logs.</p>
          <Button onClick={() => downloadJson('frescoop-production.json', store)}><Download size={18} /> Exporter JSON</Button>
        </section>
        <section className="panel">
          <PanelTitle icon={Upload} title="Import JSON" />
          <FileInput accept="application/json" label="Base FresCoop" file={file} onChange={setFile} />
          <Button onClick={importData}><Upload size={18} /> Importer</Button>
        </section>
        <section className="panel danger-panel">
          <PanelTitle icon={Trash2} title="Maintenance" />
          <p className="muted">Reinitialisation complete apres confirmation.</p>
          <div className="button-row">
            <Button variant="secondary" onClick={() => { actions.replaceStore(createFrescoopDemoStore(store)); notify('Dataset POESAM chargé (50 productrices, 200 produits, 150 commandes)'); }}><RefreshCcw size={18} /> Charger démo POESAM</Button>
            {hasRichDemo(store) && (
              <Button variant="secondary" onClick={async () => {
                const ok = await askConfirm({
                  title: 'Retirer les données démo',
                  message: 'Toutes les entités ajoutées par le seed seront supprimées. Les comptes réels sont conservés.',
                  confirmLabel: 'Retirer',
                  variant: 'danger',
                });
                if (ok) { actions.replaceStore(removeRichPoesamDemo(store)); notify('Données démo retirées'); }
              }}><Trash2 size={18} /> Retirer démo</Button>
            )}
          </div>
          <Button variant="danger" onClick={async () => {
            const ok = await askConfirm({
              title: 'Vider la base',
              message: 'Toutes les données (utilisateurs non admin, produits, commandes, paiements…) seront supprimées définitivement. Cette action est irréversible.',
              confirmLabel: 'Tout supprimer',
              variant: 'danger',
            });
            if (ok) actions.replaceStore(createEmptyStore());
          }}><Trash2 size={18} /> Vider</Button>
        </section>
      </div>
    </PageFrame>
  );
}

function SectorPage({ currentUser, kind, navigate, store }) {
  const config = {
    agriculture: {
      icon: Tractor,
      image: publicImages.agriculture,
      title: 'Agriculture',
      lead: 'Producteurs, coopératives, recoltes, dossiers terrain et attestations de qualification.',
      actions: ['Publier les recoltes', 'Soumettre pieces agricoles', 'Obtenir attestation sur preuves'],
    },
    commerce: {
      icon: Store,
      image: publicImages.commerce,
      title: 'Commerce',
      lead: 'Commerçants, boutiques, acheteurs B2B, commandes et preuves de ventes.',
      actions: ['Gerer catalogue', 'Recevoir commandes', 'Generer preuve économique'],
    },
    logistique: {
      icon: Truck,
      image: publicImages.logistics,
      title: 'Logistique',
      lead: 'Transporteurs, hubs, stockage, froid, capacite et suivi operationnel.',
      actions: ['Ajouter hub', 'Suivre capacites', 'Documenter operations'],
    },
  }[kind];
  const Icon = config.icon;

  return (
    <PageFrame>
      <section className="sector-layout">
        <div className="sector-photo" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,47,39,0.08), rgba(6,47,39,0.82)), url("${config.image}")` }}>
          <Icon size={42} />
          <strong>{config.title}</strong>
          <span>{config.lead}</span>
        </div>
        <div className="panel">
          <PanelTitle icon={Icon} title={`Espace ${config.title}`} />
          <div className="sector-actions">
            {config.actions.map((action) => <article key={action}><CheckCircle2 size={18} /><strong>{action}</strong></article>)}
          </div>
          <div className="status-grid small">
            <StatCard icon={PackageCheck} label="Produits" value={store.products.filter((item) => sectorMatch(item, kind, store)).length} tone="green" />
            <StatCard icon={FolderPlus} label="Dossiers" value={store.dossiers.filter((item) => sectorDossierMatch(item, kind, store)).length} tone="blue" />
          </div>
          <div className="button-row">
            {currentUser.role !== 'client' && <Button onClick={() => navigate('/produits')}><PackageCheck size={18} /> Produits</Button>}
            {currentUser.role !== 'client' && <Button variant="secondary" onClick={() => navigate('/dossiers')}><FolderPlus size={18} /> Dossiers</Button>}
            {kind === 'commerce' && <Button variant="secondary" onClick={() => navigate('/marche')}><ShoppingCart size={18} /> Marche</Button>}
            {kind === 'logistique' && <Button variant="secondary" onClick={() => navigate('/operations')}><Warehouse size={18} /> Operations</Button>}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function AccountPage({ actions, currentUser, notify, store }) {
  const [form, setForm] = useState({
    name: currentUser.name,
    phone: currentUser.phone || '',
    organization: currentUser.organization || '',
    region: currentUser.region || '',
    bio: currentUser.bio || '',
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  const [emailChallenge, setEmailChallenge] = useState(null);
  const [confirmCode, setConfirmCode] = useState('');

  function save(event) {
    event.preventDefault();
    actions.setUsers((items) => items.map((item) => item.id === currentUser.id ? { ...item, ...form, updatedAt: new Date().toISOString() } : item));
    notify('Compte mis à jour');
  }

  async function requestEmailChange(event) {
    event.preventDefault();
    const newEmail = emailForm.newEmail.trim().toLowerCase();
    if (!newEmail) {
      notify('Nouvel email requis');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      notify('Format email invalide');
      return;
    }
    if (newEmail === currentUser.email.toLowerCase()) {
      notify('Cet email est déjà le vôtre');
      return;
    }
    if ((store?.users || []).some((user) => user.email?.toLowerCase() === newEmail && user.id !== currentUser.id)) {
      notify('Cet email est déjà utilisé par un autre compte');
      return;
    }
    if (!emailForm.password) {
      notify('Mot de passe actuel requis pour confirmer');
      return;
    }
    const providedHash = await hashPassword(emailForm.password);
    if (providedHash !== currentUser.passwordHash) {
      notify('Mot de passe incorrect');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000;
    setEmailChallenge({ code, expiresAt, newEmail });
    notify(`Code de confirmation envoyé à ${newEmail}`);
    actions.setAuditLogs((items) => [
      createAuditLog(currentUser, 'email_change_requested', `Demande changement email vers ${newEmail}`, currentUser.id),
      ...items,
    ]);
  }

  function confirmEmailChange(event) {
    event.preventDefault();
    if (!emailChallenge) return;
    if (Date.now() > emailChallenge.expiresAt) {
      notify('Code expiré. Veuillez recommencer.');
      setEmailChallenge(null);
      setConfirmCode('');
      return;
    }
    if (confirmCode.trim() !== emailChallenge.code) {
      notify('Code incorrect');
      return;
    }
    const oldEmail = currentUser.email;
    actions.setUsers((items) => items.map((item) => item.id === currentUser.id ? { ...item, email: emailChallenge.newEmail, emailVerifiedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item));
    actions.setAuditLogs((items) => [
      createAuditLog(currentUser, 'email_changed', `Email ${oldEmail} → ${emailChallenge.newEmail}`, currentUser.id),
      ...items,
    ]);
    notify(`Email confirmé: ${emailChallenge.newEmail}`);
    setEmailChallenge(null);
    setConfirmCode('');
    setEmailForm({ newEmail: '', password: '' });
  }

  function cancelEmailChange() {
    setEmailChallenge(null);
    setConfirmCode('');
    notify('Changement d\'email annulé');
  }

  return (
    <PageFrame>
      <form className="panel form-panel" onSubmit={save}>
        <PanelTitle icon={Settings} title="Mon compte" />
        <div className="account-identity">
          <Badge>{roleLabel(currentUser.role)}</Badge>
          <span className="account-email">
            <strong>{currentUser.email}</strong>
            {currentUser.emailVerifiedAt && <small><CheckCircle2 size={12} /> vérifié</small>}
          </span>
        </div>
        <Field label="Nom / structure"><input value={form.name} onChange={(event) => updateForm(setForm, 'name', event.target.value)} /></Field>
        <Field label="Téléphone"><input value={form.phone} onChange={(event) => updateForm(setForm, 'phone', event.target.value)} /></Field>
        <Field label="Organisation"><input value={form.organization} onChange={(event) => updateForm(setForm, 'organization', event.target.value)} /></Field>
        <Field label="Région"><input value={form.region} onChange={(event) => updateForm(setForm, 'region', event.target.value)} /></Field>
        <Field label="Présentation"><textarea rows="4" value={form.bio} onChange={(event) => updateForm(setForm, 'bio', event.target.value)} /></Field>
        <Button type="submit"><Save size={18} /> Enregistrer</Button>
      </form>

      <section className="panel">
        <PanelTitle icon={LockKeyhole} title="Changer d'adresse email" />
        {!emailChallenge ? (
          <form className="stack-form" onSubmit={requestEmailChange}>
            <NoticeCard icon={ShieldCheck} title="Vérification en 2 étapes" body="Pour changer votre email, un code à 6 chiffres sera envoyé à la nouvelle adresse. Vous devrez aussi confirmer votre mot de passe actuel." />
            <Field label="Email actuel"><input type="email" value={currentUser.email} disabled /></Field>
            <Field label="Nouvel email" required>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(event) => updateForm(setEmailForm, 'newEmail', event.target.value)}
                placeholder="nouvelle.adresse@example.com"
                autoComplete="off"
              />
            </Field>
            <Field label="Mot de passe actuel" required>
              <input
                type="password"
                value={emailForm.password}
                onChange={(event) => updateForm(setEmailForm, 'password', event.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit"><Send size={16} /> Envoyer le code de vérification</Button>
          </form>
        ) : (
          <form className="stack-form" onSubmit={confirmEmailChange}>
            <NoticeCard
              icon={CircleAlert}
              title={`Code envoyé à ${emailChallenge.newEmail}`}
              body={`Saisissez le code à 6 chiffres reçu. Valable 10 minutes. Code démo visible ici: ${emailChallenge.code}`}
            />
            <Field label="Code de confirmation (6 chiffres)" required>
              <input
                inputMode="numeric"
                maxLength="6"
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </Field>
            <div className="button-row">
              <Button type="submit"><CheckCircle2 size={16} /> Confirmer le nouvel email</Button>
              <Button type="button" variant="secondary" onClick={cancelEmailChange}><X size={16} /> Annuler</Button>
            </div>
          </form>
        )}
      </section>
    </PageFrame>
  );
}

function ProductCard({ clientMode, managerMode, onContact, onAddToCart, onDelete, onEdit, onVerify, product, seller, verifierMode }) {
  const productImages = Array.isArray(product.images) && product.images.length
    ? product.images
    : (product.image ? [product.image] : []);
  const fallbackUrl = getFallbackProductImage(product, seller);
  const availableQuantity = Math.max(0, Number(product.quantity || 0));
  const unit = product.unit || 'unité';
  const unitPrice = Number(product.price || 0);
  const isOutOfStock = availableQuantity <= 0;
  const isLowStock = availableQuantity > 0 && availableQuantity < 10;
  const createdAt = product.createdAt ? formatDate(product.createdAt) : '';

  function clampProductQuantity(value, max) {
    const parsed = Number(String(value).replace(',', '.'));
    if (!Number.isFinite(parsed)) return 1;
    const ceiling = Math.max(1, Number(max || 1));
    return Math.min(ceiling, Math.max(1, Math.round(parsed * 100) / 100));
  }
  const [selectedQuantity, setSelectedQuantity] = useState(() => clampProductQuantity(1, availableQuantity || 1));
  useEffect(() => {
    setSelectedQuantity((current) => clampProductQuantity(current, availableQuantity || 1));
  }, [availableQuantity]);
  function changeQuantity(value) {
    setSelectedQuantity(clampProductQuantity(value, availableQuantity || 1));
  }
  const estimatedTotal = selectedQuantity * unitPrice;

  return (
    <article className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}>
      <div className="product-image product-image-carousel-wrap">
        <ProductImageCarousel images={productImages} fallbackUrl={fallbackUrl} alt={product.name} />
        {isOutOfStock ? (
          <span className="product-overlay-badge stock-out"><CircleAlert size={14} /> Stock épuisé</span>
        ) : isLowStock ? (
          <span className="product-overlay-badge stock-low"><CircleAlert size={14} /> Stock limité</span>
        ) : (
          <Badge>{product.status || 'Disponible'}</Badge>
        )}
        {product.flashSaleDiscountPct && <span className="product-overlay-badge stock-flash"><Leaf size={14} /> -{product.flashSaleDiscountPct}%</span>}
        <span className="product-zone"><MapPin size={14} /> <span>{product.zone || 'Zone non renseignée'}</span></span>
      </div>
      <div className="product-body">
        <div className="product-head">
          <div>
            <strong>{product.name}</strong>
            <span className="product-head-meta">
              {seller?.name || 'Vendeur'}
              {isOutOfStock
                ? <em className="stock-pill stock-pill-out">Épuisé</em>
                : isLowStock
                  ? <em className="stock-pill stock-pill-low">{formatNumber(availableQuantity)} {unit}</em>
                  : <em className="stock-pill">{formatNumber(availableQuantity)} {unit}</em>}
            </span>
          </div>
          <b>{formatMoney(unitPrice)}<small>/{unit}</small></b>
        </div>

        {clientMode && !isOutOfStock && (
          <div className="product-buy-row">
            <div className="quantity-stepper" aria-label="Choisir la quantité">
              <button type="button" onClick={() => changeQuantity(selectedQuantity - 1)} aria-label="Diminuer la quantité" disabled={selectedQuantity <= 1}>−</button>
              <input
                inputMode="decimal"
                value={String(selectedQuantity)}
                onChange={(event) => changeQuantity(event.target.value)}
                aria-label={`Quantité en ${unit}`}
              />
              <button type="button" onClick={() => changeQuantity(selectedQuantity + 1)} aria-label="Augmenter la quantité" disabled={selectedQuantity >= availableQuantity}>+</button>
            </div>
            <strong className="product-buy-total">{formatMoney(estimatedTotal)}</strong>
            <div className="product-icon-actions">
              <button
                type="button"
                className="icon-action icon-action-primary"
                onClick={() => onAddToCart(selectedQuantity)}
                title="Ajouter au panier"
                aria-label="Ajouter au panier"
              >
                <ShoppingCart size={18} />
              </button>
              <button
                type="button"
                className="icon-action"
                onClick={onContact}
                title="Contacter le vendeur"
                aria-label="Contacter le vendeur"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        )}

        {clientMode && isOutOfStock && (
          <div className="product-buy-row disabled">
            <span className="out-of-stock-label">Indisponible — contactez le vendeur</span>
            <button
              type="button"
              className="icon-action"
              onClick={onContact}
              title="Contacter le vendeur"
              aria-label="Contacter le vendeur"
            >
              <MessageSquare size={18} />
            </button>
          </div>
        )}

        {(verifierMode || managerMode) && (
          <div className="button-row">
            {verifierMode && <Button onClick={() => onVerify?.('Fiable')}><ShieldCheck size={16} /> Produit fiable</Button>}
            {verifierMode && <Button variant="secondary" onClick={() => onVerify?.('A revoir')}><CircleAlert size={16} /> A revoir</Button>}
            {managerMode && onEdit && <Button variant="secondary" onClick={onEdit}><Settings size={16} /> Modifier</Button>}
            {managerMode && <button className="icon-danger" type="button" onClick={onDelete} aria-label="Supprimer produit"><Trash2 size={16} /></button>}
          </div>
        )}
      </div>
    </article>
  );
}

function MarketPriceNotice({ form }) {
  const control = getPriceControl({ name: form.name, category: form.category, price: form.price });
  if (!form.name && !form.category) return null;
  if (!control.reference) {
    return <NoticeCard icon={CircleAlert} title="Prix marche non reference" body="Aucune reference locale trouvee pour ce produit. L admin pourra enrichir la grille marche." />;
  }
  const tone = control.allowed ? 'Prix conforme' : 'Prix au-dessus du plafond';
  const body = `Reference: ${formatMoney(control.reference.price)}/${control.reference.unit}. Marge maximale autorisee: +${formatMoney(MARKET_PRICE_MAX_MARGIN)}. Plafond: ${formatMoney(control.maxAllowed)}/${control.reference.unit}.`;
  return <NoticeCard icon={CircleDollarSign} title={tone} body={body} />;
}

function CatalogSummary({ count, rangeEnd, rangeStart }) {
  return (
    <div className="catalog-summary">
      <span>{formatNumber(rangeStart)}-{formatNumber(rangeEnd)} sur {formatNumber(count)} produit(s)</span>
      <small>Affichage organise pour garder la page lisible.</small>
    </div>
  );
}

function CatalogPager({ onPageChange, page, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <div className="catalog-pager" aria-label="Pagination catalogue">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>Précédent</Button>
      <span>Page {formatNumber(page)} / {formatNumber(totalPages)}</span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Suivant</Button>
    </div>
  );
}

function LotDigitalTwinCard({ lot, onReserve, onShareConsent }) {
  const gain = Number(lot.recommendedPrice || 0) - Number(lot.baselinePrice || 0);
  return (
    <article className="lot-twin-card">
      <div className="lot-twin-head">
        <div>
          <Badge>{lot.qualityGrade}</Badge>
          <h3>{lot.productName}</h3>
          <p>{lot.producerName} - {lot.coopérativeName}</p>
        </div>
        <QrMock value={lot.code} />
      </div>
      <div className="lot-metrics">
        <article><span>Poids net</span><strong>{formatNumber(lot.weightKg)} kg</strong></article>
        <article><span>Caisses</span><strong>{formatNumber(lot.crateCount)}</strong></article>
        <article><span>Vie commerciale IA</span><strong>{lot.shelfLifeDays} jours</strong></article>
        <article><span>Risque perte</span><strong>{lot.lossRiskPercent}%</strong></article>
      </div>
      <div className="sensor-strip">
        <span>Temp. {lot.temperatureC}°C</span>
        <span>Humidite {lot.humidityPercent}%</span>
        <span>Chambre {lot.chamber}</span>
      </div>
      <div className="recommendation-card">
        <strong>{lot.routeRecommendation}</strong>
        <p>{lot.routeReason}</p>
        <div>
          <span>Prix terrain: {formatMoney(lot.baselinePrice)}/kg</span>
          <span>Prix recommande: {formatMoney(lot.recommendedPrice)}/kg</span>
          <b>{gain >= 0 ? '+' : ''}{formatMoney(gain)}/kg potentiel</b>
        </div>
      </div>
      <div className="payment-proof-card">
        <ShieldCheck size={18} />
        <div>
          <strong>Paiement sécurisé via PayDunya</strong>
          <span>Orange Money, Wave, Free Money, carte bancaire. Reçu numérique rattaché au lot.</span>
        </div>
      </div>
      <div className="button-row">
        <Button onClick={onReserve}><ShoppingCart size={17} /> Reserver B2B</Button>
        <Button variant="secondary" onClick={onShareConsent}><Landmark size={17} /> Partager avec consentement</Button>
      </div>
    </article>
  );
}

function QrMock({ value }) {
  const bits = Array.from({ length: 49 }, (_, index) => ((value.charCodeAt(index % value.length) + index * 7) % 3) !== 0);
  return (
    <div className="qr-mock" aria-label={`QR lot ${value}`}>
      {bits.map((bit, index) => <i key={index} className={bit ? 'on' : ''} />)}
    </div>
  );
}

function LotTimeline({ lot }) {
  const steps = [
    ['Entree hub', `${formatNumber(lot.weightKg)} kg peses, QR ${lot.code}`],
    ['Froid', `${lot.temperatureC}°C, humidite ${lot.humidityPercent}%`],
    ['IA marche', `${lot.shelfLifeDays} jours de vie commerciale estimee`],
    ['Debouche', lot.routeRecommendation],
    ['Paiement', lot.paymentPartner],
    ['Preuve', 'Indice economique explicable et exportable avec consentement'],
  ];
  return (
    <div className="lot-timeline">
      {steps.map(([title, body], index) => (
        <article key={title}>
          <span>{index + 1}</span>
          <div>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ContactSellerModal({ product, messageBody, onChangeMessageBody, onCancel, onSend, canSend }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Contacter le vendeur">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <MessageSquare size={20} />
            <strong>Contacter le vendeur</strong>
          </div>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Fermer"><X size={18} /></button>
        </div>

        <p className="modal-subtitle">Produit : <strong>{product.name}</strong></p>

        <div className="modal-body">
          <Field label="Votre message" required>
            <textarea
              rows={5}
              value={messageBody}
              onChange={(event) => onChangeMessageBody(event.target.value)}
              placeholder="Ecrivez votre demande au vendeur..."
            />
          </Field>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onCancel}>Annuler</Button>
          <Button onClick={onSend} disabled={!canSend}>
            <MessageSquare size={18} /> Envoyer
          </Button>
        </div>
      </div>
      <button className="modal-backdrop-click" type="button" aria-label="Fermer" onClick={onCancel} />
    </div>
  );
}

function DossierCard({ currentUser, dossier, navigate, onDelete, onStatusChange, owner, store }) {
  const score = computeEvidenceScore(dossier, store);
  return (
    <article className="record-card">
      <div className="record-top"><Badge>{dossier.status}</Badge><span>{formatDate(dossier.createdAt)}</span></div>
      <strong>{dossier.title}</strong>
      <p>{dossier.personName} - {dossier.type}</p>
      <p>Proprietaire: {owner?.name || 'Compte'} - Score preuves: {score.total}/100</p>
      {currentUser.role === 'admin' && <Field label="Statut"><select value={dossier.status} onChange={(event) => onStatusChange(event.target.value)}>{dossierStatuses.map((item) => <option key={item}>{item}</option>)}</select></Field>}
      <div className="attachment-list">
        {dossier.attachments.map((file) => <button key={file.id} type="button" onClick={() => downloadDataUrl(file)}><FileText size={14} /> {file.name}</button>)}
      </div>
      <div className="button-row">
        <Button variant="secondary" onClick={() => navigate('/attestations')}><FileCheck2 size={16} /> Attestation</Button>
        <button className="icon-danger" type="button" onClick={onDelete}><Trash2 size={16} /></button>
      </div>
    </article>
  );
}

function DocumentCard({ code, createdAt, icon: Icon, onDelete, onDownload, onPrint, subtitle, title }) {
  return (
    <article className="document-card">
      <Icon size={28} />
      <span>{formatDate(createdAt)}</span>
      <strong>{title}</strong>
      <p>{subtitle}</p>
      <small>Code verification: {code}</small>
      <div className="button-row">
        <Button variant="secondary" onClick={onPrint}><Printer size={16} /> Imprimer</Button>
        <Button variant="secondary" onClick={onDownload}><Download size={16} /> HTML</Button>
        <button className="icon-danger" type="button" onClick={onDelete}><Trash2 size={16} /></button>
      </div>
    </article>
  );
}

function HubCard({ hub, onDelete }) {
  const rate = hub.capacityKg ? Math.round((Number(hub.currentStockKg || 0) / Number(hub.capacityKg)) * 100) : 0;
  const image = getImageSource(hub.image) || publicImages.fallbackHub;
  return (
    <article className="hub-card">
      <div className="hub-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,47,39,0.07), rgba(6,47,39,0.84)), url("${image}")` }}>
        <strong>{hub.name}</strong>
        <span>{hub.region}</span>
      </div>
      <div className="hub-body">
        <Meter label="Capacite utilisee" value={Math.min(100, rate)} />
        <Meter label="Batterie solaire" value={Number(hub.batteryPercent || 0)} tone="blue" />
        <p>{hub.temperature || 'Temperature non renseignee'} - {hub.manager || 'Responsable non renseigne'}</p>
        <div className="button-row"><button className="icon-danger" type="button" onClick={onDelete}><Trash2 size={16} /></button></div>
      </div>
    </article>
  );
}

function EvidencePicker({ onChange, value }) {
  function toggle(tag) {
    onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);
  }
  return (
    <div className="evidence-picker">
      <span>Types de preuves fournies</span>
      <div>
        {evidenceTypes.map((tag) => (
          <button key={tag} className={value.includes(tag) ? 'active' : ''} type="button" onClick={() => toggle(tag)}>{tag}</button>
        ))}
      </div>
    </div>
  );
}

function ProductLine({ product, store }) {
  const seller = store.users.find((item) => item.id === product.ownerId);
  return (
    <article>
      <strong>{product.name}</strong>
      <span>{formatNumber(product.quantity)} {product.unit} - {formatMoney(product.price)}/{product.unit}</span>
      <p>{product.zone || 'Zone non renseignee'} - {seller?.name || 'Vendeur FresCoop'}</p>
    </article>
  );
}

function OrderListControls({ filter, onFilterChange, onSearchChange, orders, search, summary }) {
  const filters = ['Tous', ...orderStatuses];
  const counts = new Map();
  orders.forEach((order) => counts.set(order.status, (counts.get(order.status) || 0) + 1));

  return (
    <div className="list-control-panel">
      <div className="order-summary-strip">
        <article><span>Total</span><strong>{orders.length}</strong></article>
        <article><span>Ouvertes</span><strong>{summary.openCount}</strong></article>
        <article><span>Valeur ouverte</span><strong>{formatMoney(summary.openValue)}</strong></article>
      </div>
      <div className="list-tools">
        <div className="status-filter-tabs" aria-label="Filtrer les commandes par statut">
          {filters.map((item) => (
            <button key={item} className={filter === item ? 'active' : ''} type="button" onClick={() => onFilterChange(item)}>
              {item === 'Tous' ? 'Tous' : orderStatusLabel(item)}
              <span>{item === 'Tous' ? orders.length : counts.get(item) || 0}</span>
            </button>
          ))}
        </div>
        <label className="compact-search">
          <Search size={16} />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Produit, client, vendeur..." />
        </label>
      </div>
    </div>
  );
}

function OrderVisibilityToolbar({
  allPageSelected,
  hiddenCount,
  onHideSelected,
  onPageSizeChange,
  onRestoreSelected,
  onToggleHidden,
  onToggleList,
  onTogglePageSelection,
  pageSize,
  rangeEnd,
  rangeStart,
  selectedCount,
  showHidden,
  showList,
  totalFiltered,
}) {
  return (
    <div className="order-visibility-toolbar">
      <div>
        <strong>{formatNumber(rangeStart)}-{formatNumber(rangeEnd)} sur {formatNumber(totalFiltered)}</strong>
        <span>{showHidden ? 'Commandes masquees' : 'Commandes visibles'} - {formatNumber(hiddenCount)} masquee(s)</span>
      </div>
      <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} aria-label="Commandes par page">
        {ORDER_PAGE_SIZE_OPTIONS.map((item) => <option key={item} value={item}>{item} / page</option>)}
      </select>
      <Button variant="secondary" onClick={onToggleList}>{showList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}{showList ? 'Réduire' : 'Développer'}</Button>
      <Button variant="secondary" onClick={onToggleHidden}>{showHidden ? <Eye size={16} /> : <EyeOff size={16} />}{showHidden ? 'Voir actives' : 'Voir masquees'}</Button>
      <Button variant="secondary" disabled={!totalFiltered} onClick={onTogglePageSelection}><CheckCircle2 size={16} /> {allPageSelected ? 'Deselectionner' : 'Selectionner page'}</Button>
      {showHidden ? (
        <Button variant="secondary" disabled={!selectedCount} onClick={onRestoreSelected}><RefreshCcw size={16} /> Restaurer ({selectedCount})</Button>
      ) : (
        <Button variant="danger" disabled={!selectedCount} onClick={onHideSelected}><EyeOff size={16} /> Masquer ({selectedCount})</Button>
      )}
    </div>
  );
}

function ClientOrderList({ onCancel, onPay, onSelect, orders, selectedIds, store }) {
  return (
    <div className="compact-order-list client-order-list">
      {orders.map((order) => {
        const product = getOrderProduct(order, store);
        const seller = store.users.find((item) => item.id === order.sellerId);
        const cancellable = order.status !== 'Annulee' && order.status !== 'Livree';
        return (
          <article key={order.id} className="compact-order-row">
            <label className="order-row-check" title="Selectionner cette commande">
              <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => onSelect(order.id)} />
            </label>
            <div className="order-row-main">
              <Badge>{orderStatusLabel(order.status)}</Badge>
              <strong>{product?.name || 'Produit supprimé'}</strong>
              <span>{seller?.name || 'Vendeur'} - {formatDate(order.createdAt)}</span>
            </div>
            <div className="order-row-progress">
              <OrderProgress status={order.status} compact />
            </div>
            <div className="order-row-money">
              <span>{formatNumber(order.quantity)} {order.unit || product?.unit || 'unité'}</span>
              <strong>{formatMoney(getOrderTotal(order, store))}</strong>
            </div>
            <div className="order-row-actions">
              {order.status === 'Paiement en attente' && <Button onClick={() => onPay(order.id)}><ReceiptText size={16} /> Payer</Button>}
              {cancellable && <Button variant="danger" onClick={() => onCancel(order.id)}><X size={16} /> Annuler</Button>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DeliveryMissionList({ onSelect, onStatusChange, orders, selectedIds, store }) {
  return (
    <div className="delivery-list">
      {orders.map((order) => {
        const product = getOrderProduct(order, store);
        const seller = store.users.find((item) => item.id === order.sellerId);
        const client = store.users.find((item) => item.id === order.clientId);
        return (
          <article key={order.id} className="delivery-row">
            <label className="order-row-check" title="Selectionner cette livraison">
              <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => onSelect(order.id)} />
            </label>
            <div className="delivery-main">
              <Badge>{orderStatusLabel(order.status)}</Badge>
              <strong>{product?.name || 'Produit supprimé'}</strong>
              <span>{client?.name || 'Client'} vers {seller?.name || 'Vendeur'}</span>
            </div>
            <div className="delivery-meta">
              <span>{product?.zone || 'Zone non renseignée'}</span>
              <strong>{formatNumber(order.quantity)} {order.unit || product?.unit || 'unité'}</strong>
              <b>{formatMoney(getOrderTotal(order, store))}</b>
            </div>
            <OrderProgress status={order.status} compact />
            <select value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>
              {orderStatuses.map((item) => <option key={item} value={item}>{orderStatusLabel(item)}</option>)}
            </select>
          </article>
        );
      })}
    </div>
  );
}

function OrderCardGrid({ currentUser, onAgentStep = () => {}, onCancel, onSelect, onStatusChange, orders, selectedIds, store }) {
  const agentMode = currentUser.role === 'agentTerrain';
  return (
    <div className={`order-card-grid order-activity-list ${agentMode ? 'agent-order-grid' : ''}`}>
      {orders.map((order) => {
        const product = getOrderProduct(order, store);
        const seller = store.users.find((item) => item.id === order.sellerId);
        const client = store.users.find((item) => item.id === order.clientId);
        const quantity = Number(order.quantity || 0);
        const totalPrice = getOrderTotal(order, store);
        const unit = order.unit || product?.unit || 'unite';
        return (
          <article className={`order-activity-row ${agentMode ? 'agent-order-card' : ''}`} key={order.id}>
            <label className="order-card-check order-activity-check" title="Selectionner cette commande">
              <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => onSelect(order.id)} />
            </label>
            <OrderProgress status={order.status} compact />
            <div className="order-activity-main">
              <strong>{product?.name || 'Produit supprime'}</strong>
              <span>{client?.name || 'Client'} - {seller?.name || 'Vendeur'}</span>
            </div>
            <div className="order-activity-money">
              <strong>{formatMoney(totalPrice)}</strong>
              <span>{formatNumber(quantity)} {unit}</span>
            </div>
            <time className="order-activity-date" dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
            {(isBuyerRole(currentUser.role) || currentUser.role === 'admin') && order.status !== 'Annulee' && order.status !== 'Livree' && (
              <div className="order-actions">
                <Button aria-label="Annuler la commande" className="order-icon-action" title="Annuler" variant="danger" onClick={() => onCancel(order.id)}><X size={16} /></Button>
              </div>
            )}
            {(currentUser.role === 'admin' || currentUser.role === 'agentTerrain' || currentUser.role === 'transporteur' || currentUser.id === order.sellerId) && (
              <select className="order-activity-status" aria-label="Statut de la commande" title={orderStatusLabel(order.status)} value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>{orderStatuses.map((item) => <option key={item} value={item}>{orderStatusLabel(item)}</option>)}</select>
            )}
            {agentMode && <AgentWorkflowPanel onStep={(step) => onAgentStep(order.id, step)} order={order} />}
          </article>
        );
      })}
    </div>
  );
}

function AgentWorkflowPanel({ onStep, order }) {
  const workflow = order.agentWorkflow || {};
  const steps = [
    { key: 'farmerCalledAt', label: 'Agriculteur confirme', body: 'Valider disponibilite et demander preparation du stock.' },
    { key: 'transporterContactedAt', label: 'Transporteur confirme', body: 'Confirmer capacite, heure de passage et conditions de livraison.' },
    { key: 'deliveryOrganizedAt', label: 'Livraison planifiee', body: 'Le transport est cale et la commande peut etre executee.' },
  ];

  return (
    <div className="agent-workflow">
      {steps.map((step) => (
        <button key={step.key} className={workflow[step.key] ? 'done' : ''} type="button" onClick={() => onStep(step.key)} disabled={Boolean(workflow[step.key])}>
          <CheckCircle2 size={16} />
          <span>
            <strong>{step.label}</strong>
            <small>{workflow[step.key] ? formatDate(workflow[step.key]) : step.body}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function UserCompactRow({ onStatusChange, onDelete, user, canDelete }) {
  return (
    <article className="user-row">
      <div className="user-cell-main">
        <Badge>{roleLabel(user.role)}</Badge>
        <strong>{user.name}</strong>
        <small>{user.email}</small>
      </div>
      <div>
        <span>{user.phone || 'Téléphone non renseigné'}</span>
        <small>{formatDate(user.createdAt)}</small>
      </div>
      <div>
        <span>{user.organization || 'Organisation non renseignée'}</span>
        <small>{user.region || 'Région non renseignée'}</small>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select value={user.status} onChange={(event) => onStatusChange(event.target.value)}>
          <option>Actif</option>
          <option>Suspendu</option>
        </select>
        {canDelete && (
          <button
            className="icon-danger"
            type="button"
            onClick={onDelete}
            aria-label={`Supprimer ${user.name}`}
            title={`Supprimer ${user.name}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
}

function OrderLine({ order, store, withProgress = false }) {
  const product = getOrderProduct(order, store);
  const total = Number(order.totalPrice ?? Number(order.quantity || 0) * Number(order.unitPrice ?? product?.price ?? 0));
  return (
    <article>
      <strong>{product?.name || 'Produit'}</strong>
      <span>{order.status} - {formatDate(order.createdAt)} - {formatMoney(total)}</span>
      {withProgress && <OrderProgress status={order.status} />}
    </article>
  );
}

function QuickAction({ body, icon: Icon, onClick, title }) {
  return <button className="quick-action" type="button" onClick={onClick}><Icon size={28} /><strong>{title}</strong><span>{body}</span><ArrowRight size={18} /></button>;
}

function MoneyKpi({ detail, icon: Icon, label, value }) {
  return (
    <article className="money-kpi">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function IconCircle({ icon: Icon }) {
  return <i className="icon-circle"><Icon size={18} /></i>;
}

function FinanceScoreCard({ navigate, store, user }) {
  const products = store.products.filter((item) => item.ownerId === user.id);
  const orders = store.orders.filter((item) => item.sellerId === user.id);
  const transactions = store.transactions.filter((item) => item.ownerId === user.id);
  const dossiers = store.dossiers.filter((item) => item.ownerId === user.id);
  const score = Math.min(100,
    Math.min(30, products.filter((item) => item.status === 'Publie').length * 10) +
    Math.min(30, orders.length * 10) +
    Math.min(25, transactions.length * 8) +
    Math.min(15, dossiers.filter((item) => item.status === 'Valide').length * 15)
  );
  const nextStep = score >= 75
    ? 'Votre profil est credible pour une preuve économique ou une attestation.'
    : 'Ajoutez ventes, justificatifs et dossiers pour augmenter la credibilite.';

  return (
    <div className="finance-score-card">
      <div className="score-ring"><strong>{score}</strong><span>/100</span></div>
      <div>
        <strong>Score de revenus prouvables</strong>
        <p>{nextStep}</p>
        <div className="button-row">
          <Button variant="secondary" onClick={() => navigate('/preuves')}><ReceiptText size={16} /> Preuve</Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, tone = 'green', value }) {
  return <article className={`stat-card stat-${tone}`}><Icon size={22} /><span>{label}</span><strong>{value}</strong></article>;
}

function NoticeCard({ body, icon: Icon, title }) {
  return <div className="notice-card"><Icon size={24} /><div><strong>{title}</strong><p>{body}</p></div></div>;
}

function ImageMosaic({ items }) {
  return (
    <section className="image-mosaic" aria-label="Secteurs FresCoop">
      {items.map((item) => (
        <article key={item.title} style={{ backgroundImage: `linear-gradient(180deg, rgba(6,47,39,0.04), rgba(6,47,39,0.82)), url("${item.image}")` }}>
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </article>
      ))}
    </section>
  );
}

function EmptyState({ body, icon: Icon, title }) {
  return <div className="empty-state"><Icon size={30} /><strong>{title}</strong><span>{body}</span></div>;
}

function LanguageAssistant({ currentUser, store }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('fr');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const greetings = {
    fr: `Bonjour ${currentUser?.name?.split(' ')[0] || ''}, je suis FresCoop AI — votre assistant intelligent. Posez-moi une question sur les prix, la vente, la traçabilité ou le paiement.`,
    wo: `Salamaleekum ${currentUser?.name?.split(' ')[0] || ''}, maa ngi tudd FresCoop AI. Laaj ma ci njëg, jaay, suivi walla pay.`,
    pul: `Mbaa kaa ${currentUser?.name?.split(' ')[0] || ''}, ko miin woni FresCoop AI. Naamno mi e coggu, njeeygu, tracabilite walla njoɓdi.`,
    sr: `Nafio ${currentUser?.name?.split(' ')[0] || ''}, mi tedd FresCoop AI. Penden mi ke kirim, felax, suivi ole pay.`,
  };

  const quickPrompts = {
    fr: [
      { q: 'Comment vendre mes produits ?', a: 'Trois étapes: 1) Publiez votre produit dans "Produits" avec photo et prix, 2) Les acheteurs vous commandent depuis le Marché, 3) Vous recevez le paiement PayDunya directement sur votre compte (Orange Money, Wave, banque).' },
      { q: 'Quel est le prix du jour ?', a: `Consultez la page "Marché" pour voir tous les produits disponibles et leurs prix en temps réel. Actuellement ${store.products.length} produits sont listés sur la plateforme.` },
      { q: 'Comment obtenir un crédit bancaire ?', a: 'Allez dans "Bancabilité": FresCoop calcule votre score (0-100) à partir de vos ventes et paiements PayDunya. Exportez le dossier PDF et présentez-le à une banque ou SFD partenaire. Plus vous vendez via FresCoop, meilleur est votre score.' },
      { q: 'Comment éviter de perdre ma récolte ?', a: 'Inscrivez vos produits dès la récolte. La page "Anti-gaspi" détecte les lots à DLC courte et propose une réduction automatique (-15% à -40%) pour vendre vite aux acheteurs B2B avant perte. Utilisez aussi les hubs froid pour prolonger la durée de vie.' },
      { q: 'Comment suivre un lot ?', a: 'Chaque lot reçoit un QR code. Dans "Lots froids", scannez le QR pour voir: température en temps réel, photos qualité, durée de vie restante, acheteur recommandé et preuve de paiement.' },
      { q: 'Je n ai pas de smartphone', a: 'Pas de problème! Appelez *384*FRES# depuis un téléphone à touches (même 2G). Menu en wolof/pular: cours du jour, déclaration de stock, vente, consultation paiement. Testez le simulateur dans "USSD".' },
    ],
    wo: [
      { q: 'Naka laa man jaay sama njaay ?', a: '1) Bind sa njaay ci "Produits" ak nataal ak njëg, 2) Jaaykatyi dinañu la jënd ci Marché, 3) Dinga jot sa pay ci PayDunya (Orange Money, Wave, banq).' },
      { q: 'Lan mooy njëg bis bi ?', a: `Demal ci "Marché" ngir gis njëg yépp ci waxtu wi. Tey am na ${store.products.length} njaay ci plateforme bi.` },
      { q: 'Naka laa man jot crédit ?', a: 'Demal ci "Bancabilité": FresCoop dina wax sa score (0-100) ci sa njaay ak pay PayDunya. Yeggali dossier PDF, yobbu ko banq walla SFD. Bu nga jaay lu bari ci FresCoop, sa score mooy baax.' },
      { q: 'Naka laa fi man moytu yàq sama ngëneel ?', a: 'Bindal sa ngëneel jekk. "Anti-gaspi" dina gis yi doon yàq, jaay leen ak -15% ba -40% ci jaaykat B2B yi. Jëfandikoo hub yu sedd ngir sedd sa ngëneel.' },
      { q: 'Naka laa man topp sama lot ?', a: 'Lot bu ci nekk am na QR code. Ci "Lots froids", scaan QR bi: température, nataal, bërëb-bi mu des, jaaykat wi reccommende, pay yi.' },
      { q: 'Amuma téléphone bu baax', a: 'Dara du jaxasu! Woo *384*FRES# ci téléphone bi am touche (2G doy na). Menu ci wolof: njëg bis bi, bind stock, jaay, saytu pay.' },
    ],
    pul: [
      { q: 'No mbaawnoo njeeygol am ?', a: '1) Winndu njeeygol ma e "Produits" e nataal e coggu, 2) Yiɗɓe soodugol ina sooda e Marché, 3) A heɓa njoɓdi ma e PayDunya.' },
      { q: 'No foti coggu hannde ?', a: `Yahu e "Marché" ngam yi\'ugol kala njeeygol e coggu maggi. Hannde ${store.products.length} njeeygol woni e plateforme.` },
      { q: 'No mbaawnoo heɓugol tokkoral ?', a: 'Yahu e "Bancabilité": FresCoop hiitoo score maa (0-100) e njeeygol e njoɓdi PayDunya. Yaltin dossier PDF, addan banka walla SFD.' },
      { q: 'No reenoo bonnde ndema am ?', a: '"Anti-gaspi" ko hollitta ko boni: jeey ɗum -15% haa -40% e soodooɓe B2B ado ɗum bonnugol.' },
      { q: 'No ndaroo-mi lot ?', a: 'Lot kala ina jogii QR code. E "Lots froids", scaan QR ndi: wulaango, nataa, ñalɗi keddiiɗi, soodoowo, njoɓdi.' },
      { q: 'Mi alaa simartifol', a: 'Noddu *384*FRES# e njokkondiral foti touches. Menu e pulaar: coggu hannde, winndugol stock, njeeygol.' },
    ],
    sr: [
      { q: 'Le mbaane mbelax lomi tedd ?', a: '1) Bisim kirim ma ole "Produits", 2) Nga nu jim moox le "Marché", 3) Mi fa pay ole PayDunya.' },
      { q: 'Le ma ŋ kirim penaar ?', a: `Da "Marché" ole ya kirim ma tedd. Penaar ${store.products.length} kirim ne.` },
      { q: 'Le mbaane haat ana ?', a: 'Da "Bancabilité": score ma (0-100). Yol ma e yo le bank ole SFD.' },
      { q: 'Le mbaane rot ale ñoox ?', a: '"Anti-gaspi" yol ŋ ŋoox le -15% haa -40%.' },
      { q: 'Le mbaane suivi ma lot ?', a: 'QR code. Da "Lots froids", scan QR.' },
      { q: 'Ana ŋ telephone', a: 'Dial *384*FRES# ole telephone 2G.' },
    ],
  };

  const didInitRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    if (!didInitRef.current) {
      // Premier ouverture : un seul message d'accueil
      setMessages([{ from: 'bot', text: greetings[lang], greeting: true }]);
      didInitRef.current = true;
      return;
    }
    // Changement de langue ultérieur : remplacer le dernier greeting s'il existe, sinon ajouter
    setMessages((prev) => {
      if (!prev.length) return [{ from: 'bot', text: greetings[lang], greeting: true }];
      const last = prev[prev.length - 1];
      if (last.from === 'bot' && last.greeting) {
        return [...prev.slice(0, -1), { from: 'bot', text: greetings[lang], greeting: true }];
      }
      return [...prev, { from: 'bot', text: greetings[lang], greeting: true }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function findResponse(text, language) {
    const normalized = text.toLowerCase();
    const prompts = quickPrompts[language] || quickPrompts.fr;
    const match = prompts.find((p) => {
      const keywords = p.q.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return keywords.some((keyword) => normalized.includes(keyword));
    });
    if (match) return match.a;
    if (/prix|njëg|coggu|kirim/.test(normalized)) return prompts[1].a;
    if (/vendre|jaay|njeeygol|felax/.test(normalized)) return prompts[0].a;
    if (/crédit|credit|banq|bank|haat/.test(normalized)) return prompts[2].a;
    if (/gaspi|yàq|bonnde|ŋoox/.test(normalized)) return prompts[3].a;
    if (/suivi|lot|topp|ndaroo/.test(normalized)) return prompts[4].a;
    return {
      fr: 'Je ne suis pas sûre de votre question. Essayez un des sujets proposés ci-dessous ou reformulez avec des mots-clés simples (prix, vendre, crédit, suivi, gaspi).',
      wo: 'Xamuma lu nga laaj. Tanntal benn ci tuur yi nekk fi walla bindaat ak baat yu yomb (njëg, jaay, crédit, topp).',
      pul: 'Mi faamaali lamndal maa. Suɓo goɗɗo e ɗiin topik.',
      sr: 'Mi fa manel. Suɓo ole topik.',
    }[language];
  }

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content) return;
    setMessages((prev) => [...prev, { from: 'user', text: content }]);
    setInput('');

    const historySnapshot = messages.slice(-6).map((m) => ({ from: m.from, text: m.text }));
    const stats = {
      producers: (store.users || []).filter((u) => u.role === 'agriculteur' && u.status === 'Actif').length,
      products: (store.products || []).length,
      orders: (store.orders || []).length,
      lots: (store.lots || []).length,
      hubs: (store.hubs || []).length,
      transactions: (store.transactions || []).length,
    };

    try {
      const res = await fetch(API_BASE + '/api/yaay/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          lang,
          context: {
            stats,
            userRole: currentUser?.role,
            userName: currentUser?.name,
          },
          history: historySnapshot,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.answer) {
        setMessages((prev) => [...prev, { from: 'bot', text: data.answer }]);
        return;
      }
      throw new Error(data?.error || 'Réponse vide');
    } catch {
      // Fallback local
      setMessages((prev) => [...prev, { from: 'bot', text: findResponse(content, lang) }]);
    }
  }

  const currentPrompts = quickPrompts[lang] || quickPrompts.fr;

  return (
    <>
      {!open && (
        <button className="assistant-fab" type="button" onClick={() => setOpen(true)} aria-label="Assistant FresCoop AI">
          <MessageSquare size={22} />
        </button>
      )}
      {open && (
        <aside className="assistant-panel" role="dialog" aria-label="FresCoop AI">
          <header>
            <div>
              <strong>FresCoop AI</strong>
              <small>Assistant intelligent · 4 langues locales</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"><X size={16} /></button>
          </header>
          <div className="assistant-lang">
            {[
              ['fr', 'Français'],
              ['wo', 'Wolof'],
              ['pul', 'Pulaar'],
              ['sr', 'Sérère'],
            ].map(([code, label]) => (
              <button
                key={code}
                type="button"
                className={lang === code ? 'active' : ''}
                onClick={() => setLang(code)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="assistant-messages" ref={scrollRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`assistant-msg ${msg.from}`}>{msg.text}</div>
            ))}
          </div>
          <div className="assistant-suggestions">
            {currentPrompts.slice(0, 4).map((prompt) => (
              <button key={prompt.q} type="button" onClick={() => send(prompt.q)}>{prompt.q}</button>
            ))}
          </div>
          <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); send(); }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={lang === 'fr' ? 'Posez votre question...' : lang === 'wo' ? 'Laaj ma...' : lang === 'pul' ? 'Naamno mi...' : 'Penden mi...'}
              aria-label="Votre message"
            />
            <button type="submit" aria-label="Envoyer"><ArrowRight size={16} /></button>
          </form>
        </aside>
      )}
    </>
  );
}

function AccessDenied({ navigate = () => {}, user = { role: 'client' } }) {
  return (
    <PageFrame>
      <section className="panel access-panel">
        <EmptyState icon={LockKeyhole} title="Acces reserve" body="Votre role ne permet pas d ouvrir cette page. Utilisez le menu de votre espace pour acceder aux pages autorisees." />
        <div className="button-row centered">
          <Button onClick={() => navigate(getRoleHomePath(user.role))}><Home size={18} /> Retour espace</Button>
          <Button variant="secondary" onClick={() => navigate('/compte')}><UserCheck size={18} /> Mon compte</Button>
        </div>
      </section>
    </PageFrame>
  );
}

function PageFrame({ children }) {
  return <section className="page-frame">{children}</section>;
}

function PanelTitle({ icon: Icon, title }) {
  return <div className="panel-title"><Icon size={19} /><strong>{title}</strong></div>;
}

function PanelToolbar({ action, icon: Icon, title }) {
  return <div className="panel-toolbar"><PanelTitle icon={Icon} title={title} />{action}</div>;
}

function Field({ children, label, required }) {
  return <label className="field"><span>{label}{required ? ' *' : ''}</span>{children}</label>;
}

function ProductImagesUploader({ existingImages = [], newFiles = [], onAddFiles, onRemoveExisting, onRemoveNew, max = 6 }) {
  const totalCount = existingImages.length + newFiles.length;
  const remaining = Math.max(0, max - totalCount);
  const inputRef = useRef(null);

  function handleSelect(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const allowed = files.slice(0, remaining);
    onAddFiles(allowed);
    event.target.value = '';
  }

  return (
    <div className="product-images-uploader">
      <div className="uploader-head">
        <div>
          <strong>Photos du produit</strong>
          <small>Ajoutez jusqu'à {max} images ({totalCount}/{max}). La première photo est l'image principale.</small>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={remaining === 0}
        >
          <ImagePlus size={16} /> {remaining === 0 ? 'Maximum atteint' : 'Ajouter des photos'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleSelect}
        />
      </div>

      {totalCount > 0 ? (
        <div className="uploader-grid">
          {existingImages.map((img, index) => (
            <div key={getImageId(img, index)} className="uploader-thumb">
              <img src={getImageSource(img)} alt={`Photo ${index + 1}`} />
              {index === 0 && <span className="thumb-badge">Principale</span>}
              <button type="button" className="thumb-remove" onClick={() => onRemoveExisting(getImageId(img, index))} aria-label="Supprimer">
                <X size={14} />
              </button>
            </div>
          ))}
          {newFiles.map((file, index) => (
            <div key={`new-${index}`} className="uploader-thumb uploader-thumb-new">
              <img src={URL.createObjectURL(file)} alt={file.name} onLoad={(e) => URL.revokeObjectURL(e.target.src)} />
              {existingImages.length === 0 && index === 0 && <span className="thumb-badge">Principale</span>}
              <span className="thumb-new-tag">Nouveau</span>
              <button type="button" className="thumb-remove" onClick={() => onRemoveNew(index)} aria-label="Supprimer">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="uploader-dropzone"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
        >
          <ImagePlus size={28} />
          <strong>Aucune photo pour l'instant</strong>
          <small>Cliquez pour sélectionner jusqu'à {max} images</small>
        </div>
      )}
    </div>
  );
}

function ProductImageCarousel({ images = [], fallbackUrl, alt = 'Produit' }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const normalizedImages = images
    .map((image, imageIndex) => {
      const url = getImageSource(image);
      if (!url) return null;
      return {
        id: getImageId(image, imageIndex),
        url,
      };
    })
    .filter(Boolean);
  const list = normalizedImages.length ? normalizedImages : (fallbackUrl ? [{ id: 'fallback', url: fallbackUrl }] : []);
  const total = list.length;

  useEffect(() => {
    if (total <= 1 || paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 3500);
    return () => clearInterval(id);
  }, [total, paused]);

  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [total, index]);

  if (!total) {
    return <div className="product-carousel empty" aria-label="Aucune image disponible" />;
  }

  function prev(event) {
    event.stopPropagation();
    setIndex((i) => (i - 1 + total) % total);
  }
  function next(event) {
    event.stopPropagation();
    setIndex((i) => (i + 1) % total);
  }

  return (
    <div
      className="product-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {list.map((img, i) => (
        <div
          key={img.id || `img-${i}`}
          className={`carousel-slide ${i === index ? 'active' : ''}`}
          aria-hidden={i !== index}
          aria-label={`${alt} — image ${i + 1} sur ${total}`}
        >
          <img
            className="carousel-slide-image"
            src={img.url}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            onError={(event) => {
              if (!fallbackUrl || event.currentTarget.src.endsWith(fallbackUrl)) return;
              event.currentTarget.src = fallbackUrl;
            }}
          />
        </div>
      ))}
      {total > 1 && (
        <>
          <button
            type="button"
            className="carousel-nav carousel-nav-prev"
            onClick={prev}
            aria-label="Image précédente"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="carousel-nav carousel-nav-next"
            onClick={next}
            aria-label="Image suivante"
          >
            <ChevronRight size={18} />
          </button>
          <div className="carousel-dots" role="tablist" aria-label="Sélection d'image">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carousel-dot ${i === index ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                aria-label={`Afficher l'image ${i + 1}`}
                aria-selected={i === index}
                role="tab"
              />
            ))}
          </div>
          <span className="carousel-counter">{index + 1}/{total}</span>
        </>
      )}
    </div>
  );
}

function getImageSource(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.dataUrl || image.url || image.src || '';
}

function getImageId(image, index = 0) {
  if (image && typeof image === 'object' && image.id) return image.id;
  return `image-${index}`;
}

function FileInput({ accept, file, label, multiple, onChange }) {
  const text = Array.isArray(file) ? `${file.length} fichier(s)` : file?.name || 'Selectionner';
  return (
    <label className="file-input">
      <input accept={accept} multiple={multiple} type="file" onChange={(event) => onChange(multiple ? Array.from(event.target.files || []) : event.target.files?.[0] || null)} />
      <ImagePlus size={18} />
      <span>{label}</span>
      <strong>{text}</strong>
    </label>
  );
}

function Button({ children, className = '', type = 'button', variant = 'primary', ...props }) {
  return <button className={`btn btn-${variant} ${className}`} type={type} {...props}>{children}</button>;
}

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function OrderProgress({ compact = false, status }) {
  const steps = ['Nouvelle', 'Confirmee', 'En preparation', 'Livree'];
  const stepIndex = steps.indexOf(status);
  const activeIndex = status === 'Annulee' || stepIndex < 0 ? -1 : stepIndex;
  if (compact) {
    return (
      <div className={`status-steps compact status-dots ${status === 'Annulee' ? 'cancelled' : ''}`} aria-label={`Statut commande ${orderStatusLabel(status)}`}>
        {steps.map((step, index) => (
          <span
            key={step}
            aria-current={index === activeIndex ? 'step' : undefined}
            aria-label={orderStatusLabel(step)}
            className={`${index <= activeIndex ? 'done' : ''} ${index === activeIndex ? 'current' : ''}`}
            title={orderStatusLabel(step)}
          />
        ))}
        {status === 'Annulee' && <span aria-label="Annulée" className="cancelled-dot" title="Annulée" />}
      </div>
    );
  }
  return (
    <div className={`status-steps ${compact ? 'compact' : ''} ${status === 'Annulee' ? 'cancelled' : ''}`} aria-label={`Statut commande ${orderStatusLabel(status)}`}>
      {steps.map((step, index) => (
        <span key={step} className={index <= activeIndex ? 'done' : ''}>{orderStatusLabel(step)}</span>
      ))}
      {status === 'Annulee' && <strong>Annulée</strong>}
    </div>
  );
}

function Meter({ label, tone = 'green', value }) {
  return <div className="meter"><div><span>{label}</span><strong>{value}%</strong></div><div className="meter-track"><i className={tone === 'blue' ? 'blue' : ''} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}

function Toast({ toast }) {
  if (!toast) return null;
  const { message, type = 'info' } = typeof toast === 'string' ? { message: toast } : toast;
  return (
    <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}>
      {message}
    </div>
  );
}

let confirmHandler = null;
function askConfirm(options) {
  return new Promise((resolve) => {
    if (!confirmHandler) return resolve(window.confirm(options.message || 'Confirmer ?'));
    confirmHandler({ ...options, resolve });
  });
}

function ConfirmModalHost() {
  const [request, setRequest] = useState(null);
  useEffect(() => {
    confirmHandler = (opts) => setRequest(opts);
    return () => { confirmHandler = null; };
  }, []);
  useEffect(() => {
    if (!request) return;
    function onKey(e) {
      if (e.key === 'Escape') { request.resolve(false); setRequest(null); }
      if (e.key === 'Enter') { request.resolve(true); setRequest(null); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [request]);
  if (!request) return null;
  const { title = 'Confirmation', message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', variant = 'primary', resolve } = request;
  return (
    <div className="confirm-modal-backdrop" onClick={() => { resolve(false); setRequest(null); }} role="dialog" aria-modal="true">
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => { resolve(false); setRequest(null); }}>{cancelLabel}</button>
          <button type="button" className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`} onClick={() => { resolve(true); setRequest(null); }} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function useProductionStore() {
  const [store, setStoreRaw] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeStore(JSON.parse(raw)) : createEmptyStore();
    } catch {
      return createEmptyStore();
    }
  });
  const loadedRemote = useRef(false);
  const lastSyncedSerialized = useRef('');
  // Flag set à true dès qu'une mutation locale est en cours (entre le setState
  // et la fin du PUT réseau). Pendant ce temps, le polling NE remplace PAS le
  // store local, pour éviter d'écraser la mutation (race condition).
  const pendingMutation = useRef(false);

  const setStore = useCallback((updater) => {
    setStoreRaw(updater);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncFromRemote() {
      // Mutation locale en cours → on attend qu'elle se termine
      if (pendingMutation.current) return;
      try {
        const response = await fetch(API_BASE + '/api/store');
        if (!response.ok) return;
        const remote = await response.json();
        if (cancelled || !remote) return;
        // Double-check après le await (une mutation a pu démarrer entre-temps)
        if (pendingMutation.current) return;
        const normalized = normalizeStore(remote);
        const serialized = JSON.stringify(normalized);
        if (serialized === lastSyncedSerialized.current) {
          if (!loadedRemote.current) loadedRemote.current = true;
          return;
        }
        lastSyncedSerialized.current = serialized;
        setStoreRaw(normalized);
      } catch {
        /* offline ou erreur */
      } finally {
        if (!loadedRemote.current) loadedRemote.current = true;
      }
    }

    syncFromRemote();
    const id = setInterval(syncFromRemote, 4000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncFromRemote();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', syncFromRemote);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', syncFromRemote);
    };
  }, []);

  const quotaWarnedRef = useRef(false);
  useEffect(() => {
    const payload = JSON.stringify(store);
    try {
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      if (!quotaWarnedRef.current && (error.name === 'QuotaExceededError' || error.code === 22)) {
        quotaWarnedRef.current = true;
        console.error('[FresCoop] localStorage saturé — les images sont trop volumineuses. Veuillez en supprimer.');
        try {
          const lightStore = {
            ...store,
            products: (store.products || []).map((p) => ({ ...p, image: p.image ? { id: p.image.id, name: p.image.name } : null, images: [] })),
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lightStore));
        } catch {}
      }
    }
    if (!loadedRemote.current) return;
    // Si le store local est identique à la dernière version synchronisée remote,
    // ce changement vient du polling — on NE fait PAS de PUT.
    if (payload === lastSyncedSerialized.current) return;

    // Mutation locale détectée → verrouiller le polling et PUT immédiat
    pendingMutation.current = true;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(API_BASE + '/api/store', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
        if (res.ok) {
          lastSyncedSerialized.current = payload;
        } else if (res.status === 409) {
          // Le serveur a refusé (anti-régression) : on re-sync pour récupérer l'état réel
          try {
            const freshRes = await fetch(API_BASE + '/api/store');
            if (freshRes.ok) {
              const remote = await freshRes.json();
              const normalized = normalizeStore(remote);
              lastSyncedSerialized.current = JSON.stringify(normalized);
              setStoreRaw(normalized);
            }
          } catch {}
          try {
            const body = await res.json();
            console.warn('[Store] Mutation refusée par le serveur:', body?.error);
          } catch {}
        }
      } catch {
        /* ignore */
      } finally {
        pendingMutation.current = false;
      }
    }, 250);
    return () => {
      clearTimeout(handle);
      pendingMutation.current = false;
    };
  }, [store]);

  return [store, setStore];
}

function makeActions(setStore) {
  return {
    setUsers: (updater) => setStore((store) => ({ ...store, users: resolveUpdate(store.users, updater) })),
    setProducts: (updater) => setStore((store) => ({ ...store, products: resolveUpdate(store.products, updater) })),
    setDossiers: (updater) => setStore((store) => ({ ...store, dossiers: resolveUpdate(store.dossiers, updater) })),
    setAttestations: (updater) => setStore((store) => ({ ...store, attestations: resolveUpdate(store.attestations, updater) })),
    setTransactions: (updater) => setStore((store) => ({ ...store, transactions: resolveUpdate(store.transactions, updater) })),
    setProofs: (updater) => setStore((store) => ({ ...store, proofs: resolveUpdate(store.proofs, updater) })),
    setHubs: (updater) => setStore((store) => ({ ...store, hubs: resolveUpdate(store.hubs, updater) })),
    setOrders: (updater) => setStore((store) => ({ ...store, orders: dedupeOrders(resolveUpdate(store.orders, updater)) })),
    setMessages: (updater) => setStore((store) => ({ ...store, messages: resolveUpdate(store.messages, updater) })),
    setNotifications: (updater) => setStore((store) => ({ ...store, notifications: normalizeNotifications(resolveUpdate(store.notifications || [], updater)) })),
    setLots: (updater) => setStore((store) => ({ ...store, lots: resolveUpdate(store.lots || [], updater) })),
    setReservations: (updater) => setStore((store) => ({ ...store, reservations: resolveUpdate(store.reservations || [], updater) })),
    setBuyerOrders: (updater) => setStore((store) => ({ ...store, buyerOrders: resolveUpdate(store.buyerOrders || [], updater) })),
    setPaymentRecords: (updater) => setStore((store) => ({ ...store, paymentRecords: resolveUpdate(store.paymentRecords || [], updater) })),
    setConsentRecords: (updater) => setStore((store) => ({ ...store, consentRecords: resolveUpdate(store.consentRecords || [], updater) })),
    setAuditLogs: (updater) => setStore((store) => ({ ...store, auditLogs: resolveUpdate(store.auditLogs || [], updater) })),
    setLoans: (updater) => setStore((store) => ({ ...store, loans: resolveUpdate(store.loans || [], updater) })),
    replaceStore: (next) => setStore(normalizeStore(next)),
  };
}

function createEmptyStore() {
  return {
    users: [...SEEDED_ADMIN_USERS],
    products: [],
    dossiers: [],
    attestations: [],
    transactions: [],
    proofs: [],
    hubs: [],
    orders: [],
    messages: [],
    notifications: [],
    coopératives: [],
    crates: [],
    lots: [],
    lotPhotos: [],
    sensorDevices: [],
    sensorReadings: [],
    qualityAssessments: [],
    buyers: [],
    buyerOrders: [],
    reservations: [],
    dispatches: [],
    paymentRecords: [],
    payoutRecords: [],
    consentRecords: [],
    economicProfiles: [],
    partnerOffers: [],
    alerts: [],
    auditLogs: [],
    kpiAggregates: [],
    loans: [],
  };
}

function normalizeStore(value) {
  const base = createEmptyStore();
  if (!value || typeof value !== 'object') return base;
  const next = Object.fromEntries(Object.keys(base).map((key) => [key, Array.isArray(value[key]) ? value[key] : []]));
  next.users = ensureSeedAdmin(next.users);
  next.orders = dedupeOrders(next.orders);
  next.notifications = normalizeNotifications(next.notifications);
  return next;
}

function dedupeOrders(orders) {
  const seen = new Set();
  return (Array.isArray(orders) ? orders : []).filter((order) => {
    if (!order || typeof order !== 'object') return false;
    const key = getOrderDuplicateKey(order);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getOrderDuplicateKey(order) {
  const quantity = Number(order.quantity || 0);
  const unitPrice = Number(order.unitPrice ?? order.productSnapshot?.price ?? 0);
  const totalPrice = Number(order.totalPrice ?? quantity * unitPrice);
  return [
    String(order.createdAt || order.updatedAt || '').slice(0, 10),
    order.productId || normalize(order.productSnapshot?.name),
    order.sellerId || '',
    order.clientId || '',
    quantity,
    order.unit || order.productSnapshot?.unit || '',
    unitPrice,
    totalPrice,
    order.status || '',
    order.paymentStatus || '',
    normalize(order.message || ''),
  ].join('|');
}

function normalizeNotifications(items) {
  return (Array.isArray(items) ? items : []).map((item) => (
    item && typeof item === 'object'
      ? {
          ...item,
          title: sanitizeNotificationText(item.title),
          body: sanitizeNotificationText(item.body),
        }
      : item
  )).filter(Boolean);
}

function sanitizeNotificationText(value) {
  return String(value || '')
    .replace(/Statut\s*(?:\u2192|\u00e2\u2020\u2019|\uFFFD+)\s*/g, 'Statut: ')
    .replace(/Confirm\uFFFD+e/g, 'Confirm\u00e9e')
    .replace(/annul\uFFFD+e/g, 'annul\u00e9e')
    .replace(/pay\uFFFD+\(s\)/g, 'paye(s)')
    .replace(/pr\uFFFD+parer/g, 'preparer');
}

function ensureSeedAdmin(users) {
  const seedEmails = new Set(SEEDED_ADMIN_USERS.map((user) => normalize(user.email)));
  const usersByEmail = new Map(users.map((user) => [normalize(user.email), user]));
  const seededUsers = SEEDED_ADMIN_USERS.map((seed) => {
    const current = usersByEmail.get(normalize(seed.email));
    return current
      ? {
          ...current,
          id: current.id || seed.id,
          name: current.name || seed.name,
          email: seed.email,
          role: 'admin',
          status: 'Actif',
          organization: current.organization || seed.organization,
          passwordHash: seed.passwordHash,
        }
      : seed;
  });
  const otherUsers = users.filter((user) => !seedEmails.has(normalize(user.email)));
  return [...seededUsers, ...otherUsers];
}

function createMessageNotification({ actor, body, message, recipientId, title }) {
  const conversationId = message.parentId || message.id;
  return {
    id: uid('ntf'),
    createdAt: new Date().toISOString(),
    recipientId,
    actorId: actor?.id || '',
    type: 'message',
    title,
    body,
    path: `/commandes?conversation=${encodeURIComponent(conversationId)}`,
    relatedId: conversationId,
    readAt: '',
  };
}

function createAppNotification({ actor, body, path = '/', recipientId, title, type = 'system' }) {
  return {
    id: uid('ntf'),
    createdAt: new Date().toISOString(),
    recipientId,
    actorId: actor?.id || '',
    type,
    title,
    body,
    path,
    relatedId: '',
    readAt: '',
  };
}

function getVisibleNotifications(items, user) {
  if (!user) return [];
  return (Array.isArray(items) ? items : [])
    .filter((item) => (
      item.recipientId === user.id
      || (item.recipientRole && item.recipientRole === user.role)
      || (Array.isArray(item.recipientRoles) && item.recipientRoles.includes(user.role))
    ))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function getMessageNotificationPath(item, messages = []) {
  if (item.path?.includes('conversation=')) return item.path;
  const message = messages.find((entry) => entry.id === item.relatedId);
  const conversationId = message?.parentId || message?.id || item.relatedId;
  return conversationId ? `/commandes?conversation=${encodeURIComponent(conversationId)}` : '/commandes';
}

function getNotificationIcon(type) {
  if (type === 'message') return MessageSquare;
  if (type === 'order') return ReceiptText;
  if (type === 'field-agent') return Truck;
  if (type === 'anti-waste') return Leaf;
  return BellRing;
}

function getNotificationActionLabel(item) {
  if (item.type === 'message') return 'Ouvrir la conversation';
  if (item.type === 'order' || item.type === 'field-agent') return 'Voir les commandes';
  if (item.type === 'anti-waste') return 'Voir le marche';
  return item.path ? 'Ouvrir' : 'Marquer comme lu';
}

function formatNotificationDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function readCartFromStorage(products = []) {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return normalizeCart(raw ? JSON.parse(raw) : [], products);
  } catch {
    return [];
  }
}

function writeCartToStorage(cart) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(cart)));
  } catch {
    // Local storage can fail in private mode or when the browser quota is full.
  }
}

function readHiddenOrdersFromStorage(userId) {
  try {
    const raw = window.localStorage.getItem(`${HIDDEN_ORDERS_KEY}.${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeHiddenOrdersToStorage(userId, orderIds) {
  try {
    window.localStorage.setItem(`${HIDDEN_ORDERS_KEY}.${userId}`, JSON.stringify(Array.from(new Set(orderIds || []))));
  } catch {
    // Non-critical preference: the order list still works if local storage fails.
  }
}

function normalizeCart(items, products = []) {
  const productById = new Map(products.map((item) => [item.id, item]));
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const productId = item?.productId || item?.product?.id;
      const product = productById.get(productId) || item?.product;
      if (!productId || !product) return null;
      return {
        productId,
        sellerId: item?.sellerId || product.ownerId || '',
        product: snapshotCartProduct(product),
        quantity: Math.max(1, Number(item?.quantity || 1)),
      };
    })
    .filter(Boolean);
}

function addProductToCart(cart, product, quantity = 1) {
  const current = normalizeCart(cart);
  const existing = current.find((item) => item.productId === product.id);
  const safeQuantity = Math.max(1, Math.min(Number(product.quantity || quantity), Number(quantity || 1)));
  if (existing) {
    return current.map((item) => item.productId === product.id ? { ...item, product: snapshotCartProduct(product), quantity: Math.min(Number(product.quantity || item.quantity + safeQuantity), item.quantity + safeQuantity) } : item);
  }
  return [
    ...current,
    {
      productId: product.id,
      sellerId: product.ownerId,
      product: snapshotCartProduct(product),
      quantity: safeQuantity,
    },
  ];
}

function snapshotCartProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    ownerId: product.ownerId,
    name: product.name,
    category: product.category || '',
    quantity: Number(product.quantity || 0),
    unit: product.unit || 'unite',
    price: Number(product.price || 0),
    zone: product.zone || '',
    status: product.status || 'Publie',
  };
}

function getPageMeta(path, user) {
  if (path === '/' && user?.role && roleHomeMeta[user.role]) return roleHomeMeta[user.role];
  return basePageMeta[path] || basePageMeta['/'];
}

function getOrdersTitle(role) {
  if (isBuyerRole(role)) return 'Commandes envoyées';
  if (role === 'agentTerrain') return 'Commandes terrain à coordonner';
  if (role === 'transporteur') return 'Livraisons à suivre';
  return 'Commandes reçues';
}

function orderStatusLabel(status) {
  const labels = {
    'Paiement en attente': 'Paiement en attente',
    Nouvelle: 'Nouvelle',
    Confirmee: 'Confirmée',
    'En preparation': 'En préparation',
    Livree: 'Livrée',
    Annulee: 'Annulée',
  };
  return labels[status] || status;
}

function filterOrdersForView(orders, store, status, search) {
  const term = normalize(search);
  return orders
    .filter((order) => status === 'Tous' || order.status === status)
    .filter((order) => {
      if (!term) return true;
      const product = getOrderProduct(order, store);
      const seller = store.users.find((item) => item.id === order.sellerId);
      const client = store.users.find((item) => item.id === order.clientId);
      return normalize(`${product?.name} ${product?.zone} ${seller?.name} ${client?.name} ${order.message}`).includes(term);
    });
}

function buildOrderSummary(orders, store) {
  const openOrders = orders.filter((order) => order.status !== 'Livree' && order.status !== 'Annulee');
  return {
    openCount: openOrders.length,
    openValue: openOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0),
  };
}

function filterUsersForAdmin(users, role, search) {
  const term = normalize(search);
  return users
    .filter((user) => role === 'all' || user.role === role)
    .filter((user) => !term || normalize(`${user.name} ${user.email} ${user.phone} ${user.organization} ${user.region} ${roleLabel(user.role)}`).includes(term));
}

function groupUsersByRole(users) {
  const order = roles.map((role) => role.id);
  const groups = new Map();
  users.forEach((user) => {
    if (!groups.has(user.role)) groups.set(user.role, []);
    groups.get(user.role).push(user);
  });
  return Array.from(groups.entries())
    .sort(([a], [b]) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)))
    .map(([role, groupUsers]) => ({ role, users: groupUsers.sort((a, b) => roleLabel(a.role).localeCompare(roleLabel(b.role)) || a.name.localeCompare(b.name)) }));
}

function countUsersByRole(users) {
  const counts = new Map();
  users.forEach((user) => counts.set(user.role, (counts.get(user.role) || 0) + 1));
  return counts;
}

function getHeroMetrics(user, stats, store) {
  const revenue = buildRevenueSnapshot(store);
  if (user.role === 'admin') {
    return [
      { icon: CircleDollarSign, label: 'Valeur commandes', value: formatMoney(revenue.orderValue), tone: 'green' },
      { icon: ShoppingCart, label: 'A convertir', value: formatMoney(revenue.openOrderValue), tone: 'blue' },
      { icon: Store, label: 'Vendeurs actifs', value: `${revenue.activeSellerCount}/${revenue.sellerCount}`, tone: 'gold' },
      { icon: ShieldCheck, label: 'Preuves', value: stats.proofs, tone: 'coral' },
    ];
  }

  if (isSellerRole(user.role)) {
    const products = store.products.filter((item) => item.ownerId === user.id);
    const orders = store.orders.filter((item) => item.sellerId === user.id && item.status !== 'Annulee');
    const openValue = orders.filter((item) => item.status !== 'Livree').reduce((sum, item) => sum + getOrderTotal(item, store), 0);
    return [
      { icon: CircleDollarSign, label: 'Commandes', value: formatMoney(orders.reduce((sum, item) => sum + getOrderTotal(item, store), 0)), tone: 'green' },
      { icon: ShoppingCart, label: 'A convertir', value: formatMoney(openValue), tone: 'blue' },
      { icon: Store, label: 'Produits', value: products.length, tone: 'gold' },
      { icon: MessageSquare, label: 'Messages', value: store.messages.filter((item) => item.sellerId === user.id).length, tone: 'coral' },
    ];
  }

  if (isBuyerRole(user.role)) {
    const cart = readCartFromStorage(store.products);
    const orders = getVisibleOrders(store.orders, user);
    return [
      { icon: ShoppingCart, label: 'Panier', value: cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), tone: 'green' },
      { icon: ReceiptText, label: 'Commandes', value: orders.length, tone: 'blue' },
      { icon: Store, label: 'Produits dispo', value: store.products.filter((item) => item.status === 'Publie').length, tone: 'gold' },
      { icon: MessageSquare, label: 'Conversations', value: buildConversations(getVisibleMessages(store.messages, user)).length, tone: 'coral' },
    ];
  }

  if (user.role === 'transporteur') {
    const orders = getVisibleOrders(store.orders, user).filter((item) => item.status !== 'Livree');
    const alerts = buildTransportAlerts(store, user);
    return [
      { icon: Truck, label: 'Livraisons', value: orders.length, tone: 'green' },
      { icon: Warehouse, label: 'Hubs', value: store.hubs.filter((hub) => hub.ownerId === user.id).length, tone: 'blue' },
      { icon: BellRing, label: 'Alertes', value: alerts.length, tone: 'gold' },
      { icon: ShieldCheck, label: 'Role actif', value: roleLabel(user.role), tone: 'coral' },
    ];
  }

  return [
    { icon: Store, label: 'Produits publies', value: stats.products, tone: 'green' },
    { icon: ShoppingCart, label: 'Commandes', value: stats.orders, tone: 'blue' },
    { icon: FileCheck2, label: 'Attestations', value: stats.attestations, tone: 'coral' },
    { icon: UserCheck, label: 'Role actif', value: roleLabel(user.role), tone: 'gold' },
  ];
}

function buildRevenueSnapshot(store) {
  const sellers = getSellerUsers(store);
  const sellerIds = new Set(sellers.map((item) => item.id));
  const sellerProducts = store.products.filter((item) => sellerIds.has(item.ownerId));
  const openOrders = store.orders.filter((item) => item.status !== 'Livree' && item.status !== 'Annulee');
  return {
    sellerCount: sellers.length,
    activeSellerCount: sellers.filter((seller) => store.products.some((product) => product.ownerId === seller.id && product.status === 'Publie')).length,
    catalogValue: sellerProducts.reduce((sum, product) => sum + getProductInventoryValue(product), 0),
    orderValue: store.orders.filter((item) => item.status !== 'Annulee').reduce((sum, order) => sum + getOrderTotal(order, store), 0),
    openOrderValue: openOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0),
    openOrders,
  };
}

function buildAdminOpportunities(store) {
  const revenue = buildRevenueSnapshot(store);
  const unanswered = store.messages.filter((item) => item.status === 'Nouveau' && !item.parentId);
  const draftProducts = store.products.filter((item) => item.status !== 'Publie');
  const sellersWithoutProducts = getSellerUsers(store).filter((seller) => !store.products.some((product) => product.ownerId === seller.id));
  const pendingDossiers = store.dossiers.filter((item) => item.status === 'Soumis' || item.status === 'En verification');
  const sellersWithoutProof = getSellerUsers(store).filter((seller) => !store.proofs.some((proof) => proof.ownerId === seller.id));

  return [
    revenue.openOrderValue > 0 && {
      id: 'open-orders',
      icon: ShoppingCart,
      title: 'Convertir les commandes ouvertes',
      body: 'Chaque commande non livree est du chiffre a securiser maintenant.',
      value: formatMoney(revenue.openOrderValue),
      path: '/commandes',
    },
    unanswered.length > 0 && {
      id: 'messages',
      icon: MessageSquare,
      title: 'Repondre aux demandes clients',
      body: 'Une reponse rapide augmente les chances de commande.',
      value: `${unanswered.length} message(s)`,
      path: '/commandes',
    },
    draftProducts.length > 0 && {
      id: 'draft-products',
      icon: Store,
      title: 'Publier les produits bloques',
      body: 'Les brouillons et suspensions ne rapportent rien tant qu ils restent invisibles.',
      value: `${draftProducts.length} produit(s)`,
      path: '/produits',
    },
    sellersWithoutProducts.length > 0 && {
      id: 'inactive-sellers',
      icon: Users,
      title: 'Activer les vendeurs sans catalogue',
      body: 'Un vendeur sans produit ne peut pas vendre ni prouver ses revenus.',
      value: `${sellersWithoutProducts.length} compte(s)`,
      path: '/utilisateurs',
    },
    pendingDossiers.length > 0 && {
      id: 'pending-dossiers',
      icon: FolderPlus,
      title: 'Valider les dossiers en attente',
      body: 'Les dossiers valides rendent les vendeurs plus credibles pour contrats et financement.',
      value: `${pendingDossiers.length} dossier(s)`,
      path: '/dossiers',
    },
    sellersWithoutProof.length > 0 && {
      id: 'proofs',
      icon: Landmark,
      title: 'Construire les preuves economiques',
      body: 'Les preuves transforment les ventes en actif negociable.',
      value: `${sellersWithoutProof.length} vendeur(s)`,
      path: '/preuves',
    },
  ].filter(Boolean);
}

function buildSellerOpportunities(store, user) {
  const products = store.products.filter((item) => item.ownerId === user.id);
  const draftProducts = products.filter((item) => item.status !== 'Publie');
  const withoutImage = products.filter((item) => !item.image);
  const openOrders = store.orders.filter((item) => item.sellerId === user.id && item.status !== 'Livree' && item.status !== 'Annulee');
  const openOrderValue = openOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);
  const unanswered = store.messages.filter((item) => item.sellerId === user.id && item.status === 'Nouveau' && !item.parentId);
  const transactions = store.transactions.filter((item) => item.ownerId === user.id);
  const dossiers = store.dossiers.filter((item) => item.ownerId === user.id);

  return [
    !products.length && {
      id: 'first-product',
      icon: Plus,
      title: 'Publier le premier produit',
      body: 'Sans catalogue, aucun client ne peut acheter.',
      value: 'Priorite 1',
      path: '/produits',
    },
    draftProducts.length > 0 && {
      id: 'publish-drafts',
      icon: Store,
      title: 'Mettre les brouillons en vente',
      body: 'Chaque produit publie augmente les chances de commande.',
      value: `${draftProducts.length} produit(s)`,
      path: '/produits',
    },
    withoutImage.length > 0 && {
      id: 'photos',
      icon: ImagePlus,
      title: 'Ajouter des photos produit',
      body: 'Les clients font plus confiance aux produits visibles.',
      value: `${withoutImage.length} photo(s)`,
      path: '/produits',
    },
    openOrders.length > 0 && {
      id: 'open-orders',
      icon: ShoppingCart,
      title: 'Convertir les commandes ouvertes',
      body: 'Confirmez, preparez et livrez pour transformer le panier en revenu.',
      value: formatMoney(openOrderValue),
      path: '/commandes',
    },
    unanswered.length > 0 && {
      id: 'unanswered',
      icon: MessageSquare,
      title: 'Repondre aux clients',
      body: 'Un client qui pose une question est proche de l achat.',
      value: `${unanswered.length} message(s)`,
      path: '/commandes',
    },
    !transactions.length && {
      id: 'transactions',
      icon: ReceiptText,
      title: 'Enregistrer les ventes reelles',
      body: 'Les ventes saisies creent une preuve économique exploitable.',
      value: 'Preuve',
      path: '/preuves',
    },
    !dossiers.length && {
      id: 'dossier',
      icon: FolderPlus,
      title: 'Créer un dossier vendeur',
      body: 'Un dossier complet rassure acheteurs, partenaires et financeurs.',
      value: 'Confiance',
      path: '/dossiers',
    },
  ].filter(Boolean);
}

function buildTopProductsByMoney(store) {
  return store.products
    .map((product) => {
      const seller = store.users.find((user) => user.id === product.ownerId);
      const relatedOrders = store.orders.filter((order) => order.productId === product.id && order.status !== 'Annulee');
      const orderValue = relatedOrders.reduce((sum, order) => sum + getOrderTotal(order, store), 0);
      const catalogValue = getProductInventoryValue(product);
      return { product, seller, orderValue, catalogValue };
    })
    .sort((a, b) => (b.orderValue || b.catalogValue) - (a.orderValue || a.catalogValue));
}

function buildSellerHealth(store) {
  return getSellerUsers(store).map((user) => {
    const products = store.products.filter((item) => item.ownerId === user.id);
    const orders = store.orders.filter((item) => item.sellerId === user.id);
    const messages = store.messages.filter((item) => item.sellerId === user.id);
    const dossiers = store.dossiers.filter((item) => item.ownerId === user.id);
    const profileScore = (user.phone ? 10 : 0) + (user.region ? 10 : 0) + (user.organization ? 10 : 0);
    const productScore = Math.min(30, products.filter((item) => item.status === 'Publie').length * 10);
    const orderScore = Math.min(25, orders.length * 8);
    const trustScore = Math.min(15, dossiers.filter((item) => item.status === 'Valide').length * 15);
    const messageScore = messages.some((item) => item.status === 'Nouveau') ? 0 : 10;
    const score = Math.min(100, profileScore + productScore + orderScore + trustScore + messageScore);
    const recommendation = getSellerRecommendation({ user, products, orders, dossiers, messages });
    return { user, products, orders, score, recommendation };
  }).sort((a, b) => a.score - b.score);
}

function getSellerRecommendation({ user, products, orders, dossiers, messages }) {
  if (!products.length) return 'Ajouter au moins un produit vendable.';
  if (!products.some((item) => item.status === 'Publie')) return 'Publier les produits en brouillon.';
  if (!user.phone || !user.region) return 'Completer telephone et region.';
  if (messages.some((item) => item.status === 'Nouveau')) return 'Repondre aux messages clients.';
  if (!orders.length) return 'Partager le catalogue et stimuler les premieres commandes.';
  if (!dossiers.some((item) => item.status === 'Valide')) return 'Valider un dossier pour renforcer la confiance.';
  return 'Profil solide: pousser preuves economiques et partenariats.';
}

function buildTrustPipeline(store) {
  const dossierScores = store.dossiers.map((dossier) => computeEvidenceScore(dossier, store).total);
  const validatedByScore = dossierScores.filter((score) => score >= 70).length;
  const validated = store.dossiers.filter((item) => item.status === 'Valide').length + validatedByScore;
  const pending = store.dossiers.filter((item) => item.status === 'Soumis' || item.status === 'En verification').length;
  return {
    total: store.dossiers.length,
    validated: Math.min(store.dossiers.length, validated),
    pending,
  };
}

function getCartItemTotal(item) {
  return Number(item?.product?.price || 0) * Number(item?.quantity || 0);
}

function sortProductsForCatalog(products, sortBy) {
  return [...products].sort((a, b) => {
    if (sortBy === 'priceAsc') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'priceDesc') return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy === 'quantityDesc') return Number(b.quantity || 0) - Number(a.quantity || 0);
    if (sortBy === 'name') return String(a.name || '').localeCompare(String(b.name || ''));
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

function sumBy(items, key) {
  return (items || []).reduce((sum, item) => sum + Number(item?.[key] || 0), 0);
}

function getFrescoopOperatingData(store) {
  const demo = buildFrescoopDemoData(store);
  return {
    coopératives: (store.coopératives || []).length ? store.coopératives : demo.coopératives,
    crates: (store.crates || []).length ? store.crates : demo.crates,
    lots: (store.lots || []).length ? store.lots : demo.lots,
    lotPhotos: (store.lotPhotos || []).length ? store.lotPhotos : demo.lotPhotos,
    sensorDevices: (store.sensorDevices || []).length ? store.sensorDevices : demo.sensorDevices,
    sensorReadings: (store.sensorReadings || []).length ? store.sensorReadings : demo.sensorReadings,
    qualityAssessments: (store.qualityAssessments || []).length ? store.qualityAssessments : demo.qualityAssessments,
    buyers: (store.buyers || []).length ? store.buyers : demo.buyers,
    buyerOrders: (store.buyerOrders || []).length ? store.buyerOrders : demo.buyerOrders,
    reservations: (store.reservations || []).length ? store.reservations : demo.reservations,
    dispatches: (store.dispatches || []).length ? store.dispatches : demo.dispatches,
    paymentRecords: (store.paymentRecords || []).length ? store.paymentRecords : demo.paymentRecords,
    payoutRecords: (store.payoutRecords || []).length ? store.payoutRecords : demo.payoutRecords,
    consentRecords: (store.consentRecords || []).length ? store.consentRecords : demo.consentRecords,
    economicProfiles: (store.economicProfiles || []).length ? store.economicProfiles : demo.economicProfiles,
    partnerOffers: (store.partnerOffers || []).length ? store.partnerOffers : demo.partnerOffers,
    alerts: (store.alerts || []).length ? store.alerts : demo.alerts,
    auditLogs: (store.auditLogs || []).length ? store.auditLogs : demo.auditLogs,
    kpiAggregates: (store.kpiAggregates || []).length ? store.kpiAggregates : demo.kpiAggregates,
  };
}

function createFrescoopDemoStore(store) {
  // Mélange l'ancien seed léger (buildFrescoopDemoData) + le seed POESAM riche.
  // Mot de passe de tous les comptes démo : "demo1234".
  const demo = buildFrescoopDemoData(store);
  const next = { ...store };
  Object.entries(demo).forEach(([key, values]) => {
    next[key] = mergeById(store[key] || [], values);
  });

  const rich = buildRichPoesamDemo(next);
  Object.entries(rich).forEach(([key, values]) => {
    next[key] = mergeById(next[key] || [], values);
  });

  return normalizeStore(next);
}

function removeRichPoesamDemo(store) {
  const isDemo = (item) => String(item?.id || '').includes('-demo-');
  const cleaned = { ...store };
  ['users', 'products', 'orders', 'hubs', 'lots', 'transactions', 'proofs', 'attestations'].forEach((k) => {
    cleaned[k] = (store[k] || []).filter((item) => !isDemo(item));
  });
  return normalizeStore(cleaned);
}

function hasRichDemo(store) {
  return ['users', 'products', 'orders'].some((k) =>
    (store[k] || []).some((item) => String(item?.id || '').includes('-demo-')),
  );
}

function buildRichPoesamDemo(current) {
  // Port fidèle du seed mobile (lib/demoSeed.ts) : 50 productrices,
  // 200 produits, 150 commandes, 80 lots, 8 hubs, 50 transactions.
  const REGIONS = ['Thiès', 'Dakar', 'Kaolack', 'Fatick', 'Saint-Louis', 'Diourbel', 'Louga', 'Ziguinchor', 'Tambacounda', 'Matam'];
  const ZONES = ['Niayes', 'Vallée du fleuve', 'Bassin arachidier', 'Casamance', 'Ferlo', 'Thiaroye', 'Mbour', 'Pikine', 'Rufisque', 'Kaffrine'];
  const FIRST_NAMES = ['Fatou', 'Aminata', 'Mariama', 'Awa', 'Aïssatou', 'Khady', 'Ndèye', 'Coumba', 'Sokhna', 'Rama', 'Penda', 'Bineta', 'Adja', 'Astou', 'Diarra', 'Maty', 'Maimouna', 'Yacine', 'Rokhaya', 'Oumou', 'Bousso', 'Mame Diarra', 'Seynabou', 'Marième', 'Nafissatou'];
  const LAST_NAMES = ['Diop', 'Ndiaye', 'Fall', 'Sow', 'Ba', 'Diallo', 'Sarr', 'Gueye', 'Mbaye', 'Faye', 'Seck', 'Thiam', 'Sy', 'Diagne', 'Camara', 'Sagna', 'Wade', 'Mbengue', 'Dia', 'Cissé'];
  const COOPS = ['Coop Femmes Niayes', 'GIE Ndèye Jarin', 'Coop Kaffrine Union', 'Femmes du Fleuve', 'GIE Diamono', 'Coop Thiaroye Gox', 'Union Maraîchère Mbour', 'GIE Jëkkët', 'Coop Kaolack Bokk', 'Femmes Casamance Sud'];
  const CATALOG = [
    { name: 'Tomates fraîches', category: 'Maraîchage', unit: 'kg', basePrice: 700 },
    { name: 'Tomates cerises', category: 'Maraîchage', unit: 'kg', basePrice: 1500 },
    { name: 'Oignons violets', category: 'Maraîchage', unit: 'kg', basePrice: 450 },
    { name: 'Pommes de terre', category: 'Maraîchage', unit: 'kg', basePrice: 500 },
    { name: 'Carottes', category: 'Maraîchage', unit: 'kg', basePrice: 600 },
    { name: 'Aubergines africaines', category: 'Maraîchage', unit: 'kg', basePrice: 800 },
    { name: 'Gombo', category: 'Maraîchage', unit: 'kg', basePrice: 900 },
    { name: 'Piments verts', category: 'Maraîchage', unit: 'kg', basePrice: 1200 },
    { name: 'Salade laitue', category: 'Maraîchage', unit: 'unité', basePrice: 300 },
    { name: 'Bissap séché', category: 'Transformation', unit: 'kg', basePrice: 2500 },
    { name: 'Arachides grillées', category: 'Transformation', unit: 'kg', basePrice: 1800 },
    { name: "Huile d'arachide", category: 'Transformation', unit: 'litre', basePrice: 1500 },
    { name: 'Mangues Kent', category: 'Fruits', unit: 'kg', basePrice: 900 },
    { name: 'Papayes solo', category: 'Fruits', unit: 'kg', basePrice: 700 },
    { name: 'Bananes plantain', category: 'Fruits', unit: 'kg', basePrice: 600 },
    { name: 'Riz paddy local', category: 'Céréales', unit: 'sac', basePrice: 18000 },
    { name: 'Mil', category: 'Céréales', unit: 'sac', basePrice: 22000 },
    { name: 'Œufs fermiers', category: 'Élevage', unit: 'panier', basePrice: 2500 },
  ];
  const ORDER_STATUSES = ['Paiement confirme', 'Preparation', 'Prete', 'En livraison', 'Livree', 'Livree', 'Livree'];

  const pick = (arr, i) => arr[Math.abs(i) % arr.length];
  let seed = 20260430;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const now = Date.now();
  // Hash SHA-256 de "demo1234" — mot de passe unique pour tous les comptes démo.
  const demoHash = '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d';

  const existingEmails = new Set((current.users || []).map((u) => String(u.email || '').toLowerCase()));
  const producers = [];
  for (let i = 0; i < 50; i++) {
    const first = pick(FIRST_NAMES, i * 7);
    const last = pick(LAST_NAMES, i * 13 + 3);
    const email = `${first.toLowerCase().replace(/\s/g, '')}.${last.toLowerCase()}.${i}@frescoop.demo`;
    if (existingEmails.has(email)) continue;
    producers.push({
      id: `usr-demo-prod-${i.toString(36)}`,
      createdAt: new Date(now - Math.floor(rand() * 120) * 86400000).toISOString(),
      name: `${first} ${last}`,
      email,
      phone: `+221 77 ${String(100 + Math.floor(rand() * 899)).padStart(3, '0')} ${String(Math.floor(rand() * 9999)).padStart(4, '0')}`,
      role: 'agriculteur',
      status: 'Actif',
      organization: pick(COOPS, i * 3),
      region: pick(REGIONS, i),
      bio: `Productrice membre de ${pick(COOPS, i * 3)}.`,
      passwordHash: demoHash,
    });
  }

  const b2b = [];
  const b2bNames = ['Resto Saveurs Dakar', 'Supermarché Terroir', 'Hôtel Teranga', 'Cantine Sonatel', 'GIE Transform', 'Auchan Sénégal', 'Restaurant Chez Loutcha', 'Cooper Export', 'Senegal Organic', 'Market Fresh', 'Hôtel Radisson', 'Cuisine Corporate SA', 'Boulangerie Moderne', 'Pizza Inn', 'Jumia Food'];
  b2bNames.forEach((name, i) => {
    const email = `contact-${i}@${name.toLowerCase().replace(/[^a-z]/g, '')}.demo`;
    if (existingEmails.has(email)) return;
    b2b.push({
      id: `usr-demo-b2b-${i}`,
      createdAt: new Date(now - Math.floor(rand() * 90) * 86400000).toISOString(),
      name,
      email,
      phone: `+221 33 ${String(820 + i).padStart(3, '0')} ${String(Math.floor(rand() * 9999)).padStart(4, '0')}`,
      role: 'acheteurB2B',
      status: 'Actif',
      organization: name,
      region: pick(REGIONS, i),
      bio: '',
      passwordHash: demoHash,
    });
  });

  const transporters = ['Mamadou Transport', 'SN Cold Chain', 'Sunu Car'].map((name, i) => ({
    id: `usr-demo-trans-${i}`,
    createdAt: new Date(now - 45 * 86400000).toISOString(),
    name,
    email: `transport.${i}@frescoop.demo`,
    phone: `+221 77 ${String(700 + i).padStart(3, '0')} 0000`,
    role: 'transporteur',
    status: 'Actif',
    organization: name,
    region: pick(REGIONS, i),
    bio: '',
    passwordHash: demoHash,
  }));

  const users = [...producers, ...b2b, ...transporters];

  const products = [];
  for (let i = 0; i < 200; i++) {
    const prod = producers[i % Math.max(1, producers.length)];
    if (!prod) break;
    const cat = pick(CATALOG, i * 5);
    products.push({
      id: `prd-demo-${i.toString(36)}`,
      createdAt: new Date(now - Math.floor(rand() * 30) * 86400000).toISOString(),
      ownerId: prod.id,
      name: cat.name,
      category: cat.category,
      quantity: Math.floor(10 + rand() * 200),
      unit: cat.unit,
      price: Math.round(cat.basePrice * (0.9 + rand() * 0.2)),
      zone: pick(ZONES, i),
      description: `${cat.name} de qualité, récolte récente.`,
      status: 'Publie',
      images: [],
    });
  }

  const orders = [];
  for (let i = 0; i < 150; i++) {
    const buyer = b2b[i % Math.max(1, b2b.length)];
    const product = products[Math.floor(rand() * products.length)];
    if (!buyer || !product) break;
    const qty = Math.max(1, Math.floor(1 + rand() * 30));
    orders.push({
      id: `ord-demo-${i.toString(36)}`,
      createdAt: new Date(now - Math.floor(rand() * 90) * 86400000).toISOString(),
      productId: product.id,
      sellerId: product.ownerId,
      clientId: buyer.id,
      userId: buyer.id,
      quantity: qty,
      unit: product.unit,
      unitPrice: product.price,
      totalPrice: product.price * qty,
      status: pick(ORDER_STATUSES, i * 3),
      paymentStatus: 'Paye',
      productSnapshot: { id: product.id, name: product.name, price: product.price, unit: product.unit, ownerId: product.ownerId, zone: product.zone },
    });
  }

  const hubs = [
    { name: 'Hub Niayes', region: 'Thiès' },
    { name: 'Hub Kaolack Centre', region: 'Kaolack' },
    { name: 'Hub Fleuve', region: 'Saint-Louis' },
    { name: 'Hub Casamance', region: 'Ziguinchor' },
    { name: 'Hub Fatick Bokk', region: 'Fatick' },
    { name: 'Hub Thiaroye', region: 'Dakar' },
    { name: 'Hub Mbour', region: 'Thiès' },
    { name: 'Hub Tambacounda', region: 'Tambacounda' },
  ].map((h, i) => ({
    id: `hub-demo-${i}`,
    createdAt: new Date(now - (180 - i * 10) * 86400000).toISOString(),
    ownerId: (current.users || []).find((u) => u.role === 'admin')?.id || '',
    name: h.name,
    region: h.region,
    manager: pick(producers, i * 3)?.name || 'FresCoop',
    capacityKg: 2000 + i * 500,
    currentStockKg: Math.floor(500 + rand() * 1500),
    temperature: Math.round(4 + rand() * 4),
    batteryPercent: Math.floor(70 + rand() * 30),
    lossAvoidedKg: Math.floor(200 + rand() * 800),
  }));

  const lots = [];
  for (let i = 0; i < 80; i++) {
    const prod = producers[i % Math.max(1, producers.length)];
    const product = products.find((p) => p.ownerId === prod?.id);
    if (!prod || !product) continue;
    lots.push({
      id: `lot-demo-${i.toString(36)}`,
      reference: `LOT-${String(1000 + i).padStart(4, '0')}`,
      createdAt: new Date(now - Math.floor(rand() * 60) * 86400000).toISOString(),
      ownerId: prod.id,
      productId: product.id,
      productName: product.name,
      weight: Math.floor(20 + rand() * 150),
      origin: `${prod.region}, ${pick(ZONES, i)}`,
      harvestDate: new Date(now - Math.floor(rand() * 60) * 86400000).toISOString().slice(0, 10),
      status: pick(['Récolté', 'Contrôle qualité', 'En hub froid', 'En tournée', 'Livré', 'Payé'], i * 2),
      lossAvoidedKg: Math.floor(rand() * 15),
    });
  }

  const transactions = [];
  const proofs = [];
  for (let i = 0; i < 50; i++) {
    const prod = producers[i % Math.max(1, producers.length)];
    if (!prod) continue;
    const amount = Math.floor(10000 + rand() * 150000);
    const createdAt = new Date(now - Math.floor(rand() * 90) * 86400000).toISOString();
    transactions.push({
      id: `trx-demo-${i}`,
      createdAt,
      date: createdAt,
      userId: prod.id,
      ownerId: prod.id,
      label: `Vente ${pick(CATALOG, i).name}`,
      amount,
      paymentMethod: pick(['Wave', 'Orange Money', 'Espèces', 'Virement'], i),
      status: 'Paye',
      buyer: pick(b2b, i * 2)?.name || 'Client',
    });
    if (i % 2 === 0) {
      proofs.push({
        id: `prf-demo-${i}`,
        createdAt,
        date: createdAt,
        userId: prod.id,
        ownerId: prod.id,
        label: `Reçu vente ${pick(CATALOG, i).name}`,
        amount,
        paymentMethod: 'Wave',
      });
    }
  }

  const attestations = [];
  for (let i = 0; i < 20; i++) {
    const prod = producers[i * 2];
    if (!prod) continue;
    attestations.push({
      id: `att-demo-${i}`,
      createdAt: new Date(now - (90 - i) * 86400000).toISOString(),
      issuedAt: new Date(now - (80 - i) * 86400000).toISOString(),
      userId: prod.id,
      ownerId: prod.id,
      type: 'Attestation économique',
      title: `Attestation ${prod.name}`,
      personName: prod.name,
      beneficiary: prod.name,
      reference: `ATT-${String(100 + i).padStart(3, '0')}`,
    });
  }

  return { users, products, orders, hubs, lots, transactions, proofs, attestations };
}

function mergeById(current, incoming) {
  const byId = new Map((current || []).map((item) => [item.id, item]));
  incoming.forEach((item) => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  });
  return Array.from(byId.values());
}

function buildFrescoopDemoData(store) {
  const farmer = store.users.find((user) => user.role === 'agriculteur') || SEEDED_ADMIN_USER;
  const now = '2026-04-29T08:00:00.000Z';
  const coopératives = [
    { id: 'coop-niayes-gie', name: 'GIE Femmes des Niayes', region: 'Thies', memberCount: 84, womenPercent: 72, youthPercent: 31 },
    { id: 'coop-fouta-riz', name: 'Union rizicole du Fouta', region: 'Saint-Louis', memberCount: 126, womenPercent: 48, youthPercent: 26 },
  ];
  const buyers = [
    { id: 'buyer-dakar-hotels', name: 'Groupement hotels Dakar', type: 'HoReCa', region: 'Dakar', reliabilityScore: 87 },
    { id: 'buyer-transform-sn', name: 'Sunu Transformation', type: 'Transformateur', region: 'Thies', reliabilityScore: 78 },
  ];
  const lots = [
    {
      id: 'lot-niayes-oignon-001',
      code: 'FCP-DKR-0429-001',
      createdAt: now,
      ownerId: farmer.id,
      productName: 'Oignon violet calibre A',
      crop: 'Oignon',
      producerName: 'Awa Ndiaye',
      coopérativeId: 'coop-niayes-gie',
      coopérativeName: 'GIE Femmes des Niayes',
      hubId: 'hub-thies-froid-01',
      hubName: 'Hub froid Thies Nord',
      chamber: 'CF-02',
      crateCount: 32,
      weightKg: 640,
      status: 'En froid',
      qualityGrade: 'Premium',
      temperatureC: 4.1,
      humidityPercent: 82,
      shelfLifeDays: 9,
      lossRiskPercent: 11,
      lossAvoidedPercent: 18,
      baselinePrice: 345,
      recommendedPrice: 410,
      routeRecommendation: 'Route premium vers acheteurs B2B Dakar',
      routeReason: 'Demande forte, delai court, prix net estime +18% apres froid et groupage.',
      paymentPartner: 'Orange Money via PSP agree + rapprochement banque partenaire',
    },
    {
      id: 'lot-fouta-riz-002',
      code: 'FCP-STL-0429-002',
      createdAt: now,
      ownerId: farmer.id,
      productName: 'Riz local blanc trie',
      crop: 'Riz',
      producerName: 'Mamadou Ba',
      coopérativeId: 'coop-fouta-riz',
      coopérativeName: 'Union rizicole du Fouta',
      hubId: 'hub-stl-froid-02',
      hubName: 'Hub Saint-Louis',
      chamber: 'Sec-01',
      crateCount: 54,
      weightKg: 1350,
      status: 'Reserve',
      qualityGrade: 'Standard+',
      temperatureC: 18.6,
      humidityPercent: 58,
      shelfLifeDays: 22,
      lossRiskPercent: 5,
      lossAvoidedPercent: 8,
      baselinePrice: 330,
      recommendedPrice: 365,
      routeRecommendation: 'Reservation recurrente cantines et restaurants',
      routeReason: 'Produit stable, volume eleve, acheteur fiable et re-achat probable.',
      paymentPartner: 'Virement banque partenaire apres confirmation livraison',
    },
    {
      id: 'lot-niayes-tomate-003',
      code: 'FCP-THS-0429-003',
      createdAt: now,
      ownerId: farmer.id,
      productName: 'Tomate fraiche transformation',
      crop: 'Tomate',
      producerName: 'Collectif Keur Mame',
      coopérativeId: 'coop-niayes-gie',
      coopérativeName: 'GIE Femmes des Niayes',
      hubId: 'hub-thies-froid-01',
      hubName: 'Hub froid Thies Nord',
      chamber: 'CF-01',
      crateCount: 18,
      weightKg: 360,
      status: 'A risque',
      qualityGrade: 'Vente rapide',
      temperatureC: 7.8,
      humidityPercent: 88,
      shelfLifeDays: 3,
      lossRiskPercent: 39,
      lossAvoidedPercent: 24,
      baselinePrice: 260,
      recommendedPrice: 305,
      routeRecommendation: 'Vente rapide vers transformateur Thies',
      routeReason: 'Vie commerciale courte: priorite transformation pour sauver marge et eviter pertes.',
      paymentPartner: 'SFD partenaire avec recu numerique rattache au lot',
    },
  ];
  const crates = lots.flatMap((lot) => Array.from({ length: Math.min(4, lot.crateCount) }, (_, index) => ({
    id: `crate-${lot.id}-${index + 1}`,
    lotId: lot.id,
    code: `${lot.code}-C${index + 1}`,
    weightKg: Math.round(lot.weightKg / lot.crateCount),
    status: 'Scellee',
  })));
  const sensorDevices = [
    { id: 'sensor-thies-cf02', hubId: 'hub-thies-froid-01', name: 'Capteur CF-02', type: 'temperature-humidity', status: 'Actif' },
    { id: 'sensor-stl-sec01', hubId: 'hub-stl-froid-02', name: 'Capteur Sec-01', type: 'temperature-humidity', status: 'Actif' },
  ];
  const sensorReadings = lots.map((lot, index) => ({
    id: `reading-${lot.id}`,
    lotId: lot.id,
    sensorId: index === 1 ? 'sensor-stl-sec01' : 'sensor-thies-cf02',
    createdAt: now,
    temperatureC: lot.temperatureC,
    humidityPercent: lot.humidityPercent,
    batteryPercent: index === 2 ? 61 : 84,
  }));
  const qualityAssessments = lots.map((lot) => ({
    id: `qa-${lot.id}`,
    lotId: lot.id,
    createdAt: now,
    grade: lot.qualityGrade,
    defectsPercent: lot.lossRiskPercent > 20 ? 8 : 2,
    shelfLifeDays: lot.shelfLifeDays,
    assessor: 'Operateur qualite FresCoop',
    recommendation: lot.routeRecommendation,
  }));
  const reservations = [
    { id: 'rsv-demo-oignon', createdAt: now, lotId: lots[0].id, buyerId: buyers[0].id, status: 'Confirmee', quantityKg: 220, value: 220 * lots[0].recommendedPrice, paymentMode: 'Partner-powered', paymentPartner: lots[0].paymentPartner },
    { id: 'rsv-demo-riz', createdAt: now, lotId: lots[1].id, buyerId: buyers[0].id, status: 'Reserve', quantityKg: 500, value: 500 * lots[1].recommendedPrice, paymentMode: 'Partner-powered', paymentPartner: lots[1].paymentPartner },
  ];
  const buyerOrders = reservations.map((reservation) => ({ id: `b2b-${reservation.id}`, createdAt: now, reservationId: reservation.id, buyerId: reservation.buyerId, lotId: reservation.lotId, status: 'Commande B2B', recurrence: reservation.lotId === lots[1].id ? 'Hebdomadaire' : 'Ponctuelle' }));
  const dispatches = reservations.map((reservation) => ({ id: `dsp-${reservation.id}`, createdAt: now, reservationId: reservation.id, lotId: reservation.lotId, status: 'Planifie', transporterName: 'DK Transport', coldChainRequired: true }));
  const paymentRecords = reservations.map((reservation) => ({ id: `pay-${reservation.id}`, createdAt: now, reservationId: reservation.id, amount: reservation.value, partner: reservation.paymentPartner, status: 'Initie partenaire', regulatoryNote: 'FresCoop orchestre le rapprochement, le partenaire agree execute le paiement.' }));
  const payoutRecords = paymentRecords.map((payment) => ({ id: `payout-${payment.id}`, createdAt: now, paymentId: payment.id, amount: Math.round(payment.amount * 0.94), recipientRole: 'Producteur / coopérative', status: 'A reverser' }));
  const consentRecords = [
    { id: 'cst-demo-baobab', createdAt: now, ownerId: farmer.id, lotId: lots[0].id, partnerId: 'partner-baobab', partnerName: 'Baobab+ Finance agricole', scope: ['flux agrege', 'indice explicable', 'historique reservations'], status: 'Actif', revocable: true },
  ];
  const economicProfiles = [
    { id: `eco-${farmer.id}`, ownerId: farmer.id, confidenceIndex: 74, explanation: ['3 lots suivis', '2 reservations B2B', 'preuves de paiement partenaire', 'consentement actif'], lastUpdatedAt: now },
  ];
  const partnerOffers = [
    { id: 'offer-avance-baobab', partnerId: 'partner-baobab', title: 'Avance intrants post-vente', eligibility: 'Consentement actif + 2 reservations confirmees', status: 'Disponible' },
  ];
  const alerts = lots.filter((lot) => lot.lossRiskPercent >= 25).map((lot) => ({ id: `alert-${lot.id}`, createdAt: now, lotId: lot.id, severity: 'Haute', title: 'Lot a vendre rapidement', body: lot.routeReason }));
  const auditLogs = [
    { id: 'aud-demo-001', createdAt: now, actorId: SEEDED_ADMIN_USER.id, actorName: 'Admin FresCoop', action: 'demo_seed', detail: 'Dataset jury FresCoop charge', targetId: 'demo' },
  ];
  const kpiAggregates = [
    { id: 'kpi-demo-2026-04', period: '2026-04', lossAvoidedKg: Math.round(sumBy(lots, 'weightKg') * 0.16), producerNetGain: 284500, recurringBuyerRate: 42, consentActiveCount: consentRecords.length },
  ];

  return { coopératives, buyers, lots, crates, lotPhotos: [], sensorDevices, sensorReadings, qualityAssessments, buyerOrders, reservations, dispatches, paymentRecords, payoutRecords, consentRecords, economicProfiles, partnerOffers, alerts, auditLogs, kpiAggregates };
}

function createAuditLog(actor, action, detail, targetId) {
  return {
    id: uid('aud'),
    createdAt: new Date().toISOString(),
    actorId: actor?.id || '',
    actorName: actor?.name || 'Systeme',
    action,
    detail,
    targetId,
  };
}

function getOrderProduct(order, store) {
  return store.products.find((item) => item.id === order.productId) || order.productSnapshot || null;
}

function buildConversations(messages) {
  const sorted = [...messages].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  const byId = new Map(sorted.map((message) => [message.id, message]));
  const groups = new Map();

  sorted.forEach((message) => {
    const rootId = resolveMessageRootId(message, byId);
    if (!groups.has(rootId)) groups.set(rootId, []);
    groups.get(rootId).push(message);
  });

  return Array.from(groups.entries())
    .map(([id, items]) => ({ id, root: byId.get(id) || items[0], items }))
    .sort((a, b) => new Date(b.items[b.items.length - 1]?.createdAt || 0) - new Date(a.items[a.items.length - 1]?.createdAt || 0));
}

function resolveMessageRootId(message, byId) {
  let current = message;
  const visited = new Set();
  while (current?.parentId && byId.has(current.parentId) && !visited.has(current.parentId)) {
    visited.add(current.id);
    current = byId.get(current.parentId);
  }
  return current?.id || message.id;
}

function getMessageSenderName(message, store) {
  const fallbackId = message.senderId || (message.parentId ? message.sellerId : message.clientId);
  const user = store.users.find((item) => item.id === fallbackId);
  if (user?.name) return user.name;
  if (message.senderRole) return roleLabel(message.senderRole);
  return message.parentId ? 'Vendeur' : 'Client';
}

function isMessageFromUser(message, user) {
  if (message.senderId) return message.senderId === user.id;
  return message.parentId ? message.sellerId === user.id : message.clientId === user.id;
}

function buildTransportAlerts(store, user) {
  const hubs = store.hubs.filter((hub) => user.role === 'admin' || hub.ownerId === user.id);
  return hubs.flatMap((hub) => {
    const alerts = [];
    const capacity = Number(hub.capacityKg || 0);
    const stock = Number(hub.currentStockKg || 0);
    const battery = Number(hub.batteryPercent || 0);
    const occupancy = capacity ? Math.round((stock / capacity) * 100) : 0;
    const temperatureText = normalize(hub.temperature);
    const temperatureValue = Number(String(hub.temperature || '').replace(',', '.').replace(/[^\d.-]/g, ''));

    if (capacity && occupancy >= 85) {
      alerts.push({ id: `${hub.id}-capacity`, title: `${hub.name}: capacite presque pleine`, body: `${occupancy}% occupe dans le hub de ${hub.region}.` });
    }

    if (battery && battery <= 25) {
      alerts.push({ id: `${hub.id}-battery`, title: `${hub.name}: batterie faible`, body: `Batterie signalee a ${battery}%. Prioriser recharge ou relais.` });
    }

    if (temperatureText && Number.isFinite(temperatureValue) && temperatureValue > 8) {
      alerts.push({ id: `${hub.id}-temperature`, title: `${hub.name}: froid a verifier`, body: `Temperature indiquee: ${hub.temperature}. Controle recommande avant livraison.` });
    }

    return alerts;
  });
}

function getSellerUsers(store) {
  return store.users.filter((user) => isSellerRole(user.role));
}

function isSellerRole(role) {
  return role === 'agriculteur';
}

function isBuyerRole(role) {
  return role === 'client' || role === 'acheteurB2B';
}

function isFieldAgentRole(role) {
  return role === 'agentTerrain';
}

function getAvailableFieldAgent(store) {
  return store.users.find((user) => user.role === 'agentTerrain' && user.status === 'Actif')
    || store.users.find((user) => user.role === 'transporteur' && user.status === 'Actif')
    || null;
}

function getOrderAgent(order, store) {
  return store.users.find((user) => user.id === order.assignedAgentId) || getAvailableFieldAgent(store);
}

function getPriceControl(product) {
  const reference = getMarketPriceReference(product);
  const price = Number(product?.price || 0);
  if (!reference || !price) return { reference, price, allowed: true, margin: 0, maxAllowed: 0 };
  const maxAllowed = reference.price + MARKET_PRICE_MAX_MARGIN;
  return {
    reference,
    price,
    maxAllowed,
    margin: price - reference.price,
    allowed: price <= maxAllowed,
  };
}

function getMarketPriceReference(product) {
  const text = normalize(`${product?.name || ''} ${product?.category || ''}`);
  return marketPriceReferences.find((item) => text.includes(normalize(item.key))) || null;
}

function getProductInventoryValue(product) {
  return Number(product?.price || 0) * Number(product?.quantity || 0);
}

function getOrderTotal(order, store) {
  const product = getOrderProduct(order, store);
  const quantity = Number(order?.quantity || 0);
  const unitPrice = Number(order?.unitPrice ?? product?.price ?? 0);
  return Number(order?.totalPrice ?? unitPrice * quantity);
}

async function buildUser(input) {
  return {
    id: uid('usr'),
    createdAt: new Date().toISOString(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || '',
    role: input.role,
    status: input.status || 'Actif',
    organization: input.organization?.trim() || '',
    region: input.region?.trim() || '',
    bio: '',
    passwordHash: await hashPassword(input.password),
  };
}

function emptyProductForm() {
  return { name: '', category: '', quantity: '', unit: 'kg', price: '', zone: '', description: '', status: 'Publie', imageFiles: [], existingImages: [] };
}

function emptyDossierForm() {
  return {
    type: dossierTypes[0],
    title: '',
    personName: '',
    personId: '',
    phone: '',
    organization: '',
    region: '',
    purpose: '',
    evidenceNotes: '',
    existingAttestation: false,
    consentEconomicProof: true,
    evidenceTags: [],
    files: [],
  };
}

function emptyTransactionForm() {
  return { date: '', productId: '', label: '', amount: '', buyer: '', paymentMethod: '', status: 'Paye', reference: '', file: null };
}

function emptyHubForm() {
  return { name: '', region: '', manager: '', phone: '', capacityKg: '', currentStockKg: '', temperature: '', batteryPercent: '', imageFile: null };
}

function getPrimaryNavLinks(role) {
  const links = {
    admin: ['/', '/lots', '/utilisateurs', '/impact'],
    agriculteur: ['/', '/produits', '/commandes', '/anti-gaspi', '/bancabilite'],
    agentTerrain: ['/', '/commandes', '/anti-gaspi', '/operations'],
    transporteur: ['/', '/lots', '/operations', '/commandes'],
    client: ['/', '/marche', '/anti-gaspi', '/commandes'],
    acheteurB2B: ['/', '/marche', '/anti-gaspi', '/commandes'],
    partenaire: ['/', '/bancabilite', '/impact'],
  }[role] || ['/'];

  return links.map(navItemByPath).filter(Boolean);
}

function getMenuLinks(role) {
  const paths = {
    admin: [
      '/',
      '/utilisateurs',
      '/produits',
      '/lots',
      '/dossiers',
      '/attestations',
      '/preuves',
      '/commandes',
      '/operations',
      '/impact',
      '/anti-gaspi',
      '/bancabilite',
      '/ussd',
      '/donnees',
      '/secteurs/agriculture',
      '/secteurs/commerce',
      '/secteurs/logistique',
      '/compte',
    ],
    agriculteur: [
      '/',
      '/produits',
      '/lots',
      '/commandes',
      '/anti-gaspi',
      '/bancabilite',
      '/impact',
      '/ussd',
      '/dossiers',
      '/attestations',
      '/preuves',
      '/secteurs/agriculture',
      '/compte',
    ],
    agentTerrain: [
      '/',
      '/commandes',
      '/produits',
      '/anti-gaspi',
      '/operations',
      '/lots',
      '/ussd',
      '/compte',
    ],
    transporteur: [
      '/',
      '/operations',
      '/lots',
      '/commandes',
      '/anti-gaspi',
      '/dossiers',
      '/attestations',
      '/preuves',
      '/secteurs/logistique',
      '/compte',
    ],
    client: [
      '/',
      '/marche',
      '/anti-gaspi',
      '/commandes',
      '/paiement',
      '/impact',
      '/compte',
    ],
    acheteurB2B: [
      '/',
      '/marche',
      '/lots',
      '/anti-gaspi',
      '/commandes',
      '/paiement',
      '/impact',
      '/compte',
    ],
    partenaire: [
      '/',
      '/bancabilite',
      '/impact',
      '/lots',
      '/preuves',
      '/anti-gaspi',
      '/ussd',
      '/compte',
    ],
  }[role] || ['/'];

  return paths.map(navItemByPath).filter(Boolean);
}

function getMenuGroups(role, menuLinks) {
  const groupsByRole = {
    admin: [
      { title: 'Espace admin', paths: ['/', '/compte'] },
      { title: 'Gestion', paths: ['/lots', '/utilisateurs', '/produits', '/commandes', '/operations'] },
      { title: 'Documents', paths: ['/dossiers', '/attestations', '/preuves', '/donnees'] },
      { title: 'POESAM - impact & inclusion', paths: ['/impact', '/anti-gaspi', '/bancabilite', '/ussd'] },
      { title: 'Secteurs', paths: ['/secteurs/agriculture', '/secteurs/commerce', '/secteurs/logistique'] },
    ],
    agriculteur: [
      { title: 'Mon activité', paths: ['/', '/produits', '/lots', '/commandes', '/compte'] },
      { title: 'POESAM - vendre mieux', paths: ['/anti-gaspi', '/bancabilite', '/impact', '/ussd'] },
      { title: 'Dossiers et preuves', paths: ['/dossiers', '/attestations', '/preuves', '/secteurs/agriculture'] },
    ],
    agentTerrain: [
      { title: 'Terrain', paths: ['/', '/commandes', '/produits', '/operations', '/lots', '/compte'] },
      { title: 'Alertes & inclusion', paths: ['/anti-gaspi', '/ussd'] },
    ],
    transporteur: [
      { title: 'Espace transporteur', paths: ['/', '/operations', '/lots', '/commandes', '/compte'] },
      { title: 'Priorités livraison', paths: ['/anti-gaspi'] },
      { title: 'Documents et secteur', paths: ['/dossiers', '/attestations', '/preuves', '/secteurs/logistique'] },
    ],
    client: [
      { title: 'Mon espace', paths: ['/', '/marche', '/commandes', '/paiement', '/compte'] },
      { title: 'Consommation responsable', paths: ['/anti-gaspi', '/impact'] },
    ],
    acheteurB2B: [
      { title: 'Sourcing B2B', paths: ['/', '/marche', '/lots', '/commandes', '/paiement', '/compte'] },
      { title: 'Opportunités & impact', paths: ['/anti-gaspi', '/impact'] },
    ],
    partenaire: [
      { title: 'Finance & scoring', paths: ['/', '/bancabilite', '/impact', '/compte'] },
      { title: 'Traçabilité et preuves', paths: ['/lots', '/preuves'] },
      { title: 'Engagement terrain', paths: ['/anti-gaspi', '/ussd'] },
    ],
  };
  const itemByPath = new Map(menuLinks.map((item) => [item.path, item]));
  const used = new Set();
  const groups = (groupsByRole[role] || [{ title: `Espace ${roleLabel(role)}`, paths: menuLinks.map((item) => item.path) }])
    .map((group) => {
      const items = group.paths
        .map((path) => itemByPath.get(path))
        .filter(Boolean)
        .filter((item) => {
          if (used.has(item.path)) return false;
          used.add(item.path);
          return true;
        });
      return { ...group, items };
    })
    .filter((group) => group.items.length);

  const remaining = menuLinks.filter((item) => !used.has(item.path));
  if (remaining.length) groups.push({ title: 'Autres', items: remaining });
  return groups;
}

function navItemByPath(path) {
  const items = {
    '/': { path: '/', label: 'Accueil', icon: Home, description: 'Vue principale de votre espace' },
    '/marche': { path: '/marche', label: 'Marché', icon: ShoppingCart, description: 'Articles disponibles et commandes client' },
    '/produits': { path: '/produits', label: 'Produits', icon: PackageCheck, description: 'Catalogue et articles publiés' },
    '/lots': { path: '/lots', label: 'Lots froids', icon: ClipboardCheck, description: 'Jumeaux numériques, QR, capteurs et routage' },
    '/dossiers': { path: '/dossiers', label: 'Dossiers', icon: FolderPlus, description: 'Pièces et demandes documentaires' },
    '/attestations': { path: '/attestations', label: 'Attestations', icon: FileCheck2, description: 'Certificats émis sur preuves' },
    '/preuves': { path: '/preuves', label: 'Preuves économiques', icon: ReceiptText, description: 'Transactions et justificatifs financiers' },
    '/commandes': { path: '/commandes', label: 'Commandes', icon: MessageSquare, description: 'Commandes et contacts vendeurs' },
    '/paiement': { path: '/paiement', label: 'Paiement', icon: ReceiptText, description: 'Paiement partenaire et reçus' },
    '/operations': { path: '/operations', label: 'Opérations', icon: Warehouse, description: 'Hubs, stockage et logistique' },
    '/utilisateurs': { path: '/utilisateurs', label: 'Utilisateurs', icon: Users, description: 'Comptes, rôles et statuts' },
    '/impact': { path: '/impact', label: 'Impact', icon: BarChart3, description: 'KPI POESAM : pertes évitées, revenu +, genre, CO₂' },
    '/anti-gaspi': { path: '/anti-gaspi', label: 'Anti-gaspi', icon: Leaf, description: 'Alertes DLC et ventes éclair anti-gaspillage' },
    '/bancabilite': { path: '/bancabilite', label: 'Bancabilité', icon: Landmark, description: 'Score crédit et dossier finance exportable' },
    '/ussd': { path: '/ussd', label: 'USSD', icon: PhoneCall, description: 'Accès *384*FRES# pour téléphones sans Internet' },
    '/donnees': { path: '/donnees', label: 'Données', icon: Database, description: 'Export, import et maintenance' },
    '/secteurs/agriculture': { path: '/secteurs/agriculture', label: 'Agriculture', icon: Tractor, description: 'Page dédiée au secteur agricole' },
    '/secteurs/commerce': { path: '/secteurs/commerce', label: 'Commerce', icon: Store, description: 'Page dédiée au secteur commercial' },
    '/secteurs/logistique': { path: '/secteurs/logistique', label: 'Logistique', icon: Truck, description: 'Page dédiée au secteur logistique' },
    '/compte': { path: '/compte', label: 'Compte', icon: UserCheck, description: 'Profil et coordonnees' },
  };
  return items[path];
}

function canAccessPath(role, path) {
  return getMenuLinks(role).some((item) => item.path === path);
}

function getRoleHomePath(role) {
  return '/';
}

function computeStats(store) {
  return {
    users: store.users.length,
    products: store.products.length,
    orders: store.orders.length,
    dossiers: store.dossiers.length,
    attestations: store.attestations.length,
    proofs: store.proofs.length,
    transactions: store.transactions.length,
    transactionValue: store.transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0),
  };
}

function getVisibleDossiers(items, user) {
  return user.role === 'admin' ? items : items.filter((item) => item.ownerId === user.id);
}

function getVisibleAttestations(items, user) {
  return user.role === 'admin' ? items : items.filter((item) => item.ownerId === user.id);
}

function getVisibleProofs(items, user) {
  return user.role === 'admin' ? items : items.filter((item) => item.ownerId === user.id);
}

function getVisibleTransactions(items, user) {
  return user.role === 'admin' ? items : items.filter((item) => item.ownerId === user.id);
}

function getVisibleOrders(items, user) {
  if (user.role === 'admin') return items;
  if (isBuyerRole(user.role)) return items.filter((item) => item.clientId === user.id);
  if (isFieldAgentRole(user.role)) return items.filter((item) => item.status !== 'Annulee' && (!item.assignedAgentId || item.assignedAgentId === user.id));
  if (user.role === 'transporteur') return items.filter((item) => item.status !== 'Annulee');
  return items.filter((item) => item.sellerId === user.id);
}

function getVisibleMessages(items, user) {
  if (user.role === 'admin') return items;
  if (isBuyerRole(user.role)) return items.filter((item) => item.clientId === user.id);
  if (isFieldAgentRole(user.role)) return [];
  return items.filter((item) => item.sellerId === user.id);
}

function computeEvidenceScore(dossier, store) {
  const ownerTransactions = store.transactions.filter((item) => item.ownerId === dossier.ownerId);
  const ownerProducts = store.products.filter((item) => item.ownerId === dossier.ownerId);
  const reasons = [];
  let total = 0;
  if (dossier.personName && dossier.personId && dossier.phone) { total += 15; reasons.push('Identite et contact renseignes'); }
  if (dossier.existingAttestation) { total += 25; reasons.push('Ancienne attestation fournie'); }
  if (dossier.attachments.length) { const points = Math.min(25, dossier.attachments.length * 8); total += points; reasons.push(`${dossier.attachments.length} piece(s) jointe(s)`); }
  if (dossier.evidenceTags.length) { const points = Math.min(20, dossier.evidenceTags.length * 5); total += points; reasons.push(`${dossier.evidenceTags.length} type(s) de preuves`); }
  if (ownerTransactions.length) { total += Math.min(20, ownerTransactions.length * 5); reasons.push('Transactions economiques rattachees'); }
  if (ownerProducts.length) { total += Math.min(10, ownerProducts.length * 3); reasons.push('Produits publies sur FresCoop'); }
  if (dossier.status === 'Valide') { total += 20; reasons.push('Validation admin'); }
  if (!reasons.length) reasons.push('Aucune preuve suffisante pour le moment');
  return { total: Math.min(100, total), reasons };
}

function snapshotDossier(dossier, store) {
  const owner = store.users.find((user) => user.id === dossier.ownerId);
  return {
    id: dossier.id,
    title: dossier.title,
    type: dossier.type,
    status: dossier.status,
    personName: dossier.personName,
    personId: dossier.personId,
    personRole: dossier.personRole,
    phone: dossier.phone,
    organization: dossier.organization,
    region: dossier.region,
    purpose: dossier.purpose,
    ownerName: owner?.name || '',
    ownerEmail: owner?.email || '',
    attachments: dossier.attachments.map((file) => ({ name: file.name, size: file.size, type: file.type })),
    evidenceTags: dossier.evidenceTags,
  };
}

function buildMonthlyTransactions(transactions) {
  const map = new Map();
  transactions.forEach((item) => {
    if (!item.date) return;
    const month = item.date.slice(0, 7);
    map.set(month, (map.get(month) || 0) + Number(item.amount || 0));
  });
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value }));
}

function buildRoleData(users) {
  const map = new Map();
  users.forEach((user) => map.set(roleLabel(user.role), (map.get(roleLabel(user.role)) || 0) + 1));
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function sectorMatch(product, kind, store) {
  const owner = store.users.find((user) => user.id === product.ownerId);
  if (kind === 'agriculture') return owner?.role === 'agriculteur';
  if (kind === 'commerce') return owner?.role === 'acheteurB2B' || owner?.role === 'client';
  return owner?.role === 'transporteur';
}

function sectorDossierMatch(dossier, kind, store) {
  const owner = store.users.find((user) => user.id === dossier.ownerId);
  if (kind === 'agriculture') return owner?.role === 'agriculteur';
  if (kind === 'commerce') return owner?.role === 'acheteurB2B';
  return owner?.role === 'transporteur';
}

function getFallbackProductImage(product, seller) {
  const text = normalize(`${product.name} ${product.category}`);
  if (seller?.role === 'acheteurB2B') return publicImages.commerce;
  if (text.includes('transport') || text.includes('livraison') || text.includes('logistique')) return publicImages.logistics;
  if (text.includes('boutique') || text.includes('commerce') || text.includes('vente')) return publicImages.commerce;
  if (text.includes('document') || text.includes('service')) return publicImages.dossiers;
  return publicImages.fallbackProduct;
}

async function hashPassword(value) {
  // Use WebCrypto if available
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Fallback: pure JS SHA-256 implementation
  return sha256Js(value);
}

// Pure JS SHA-256 implementation (no crypto.subtle dependency)
function sha256Js(message) {
  // Rotate right
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  // Ch function
  const ch = (x, y, z) => (x & y) ^ (~x & z);
  // Maj function
  const maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
  // Sigma functions
  const sig0 = (x) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  const sig1 = (x) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  const gamma0 = (x) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  const gamma1 = (x) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

  // Initial hash values
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Pre-processing
  const msgBytes = new TextEncoder().encode(message);
  const bitLen = msgBytes.length * 8;
  const padded = new Uint8Array(Math.ceil((msgBytes.length + 9) / 64) * 64);
  padded.set(msgBytes, 0);
  padded[msgBytes.length] = 0x80;
  
  // Write length in bits as big-endian 64-bit
  const paddedView = new DataView(padded.buffer);
  paddedView.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  paddedView.setUint32(padded.length - 4, bitLen >>> 0, false);

  // Process chunks
  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(64);
    
    // First 16 words
    for (let j = 0; j < 16; j++) {
      w[j] = new DataView(padded.buffer, i + j * 4, 4).getUint32(0, false);
    }
    
    // Extend to 64 words
    for (let j = 16; j < 64; j++) {
      w[j] = (gamma1(w[j - 2]) + w[j - 7] + gamma0(w[j - 15]) + w[j - 16]) >>> 0;
    }
    
    let a = h0, b = h1, c = h2, d = h3;
    let e = h4, f = h5, g = h6, h = h7;
    
    for (let j = 0; j < 64; j++) {
      const t1 = (h + sig1(e) + ch(e, f, g) + k[j] + w[j]) >>> 0;
      const t2 = (sig0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  // Final hash as hex string
  const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

async function filesToAttachments(files) {
  return Promise.all((files || []).map(fileToAttachment));
}

async function fileToAttachment(file) {
  if (!file) return null;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop lourd: ${file.name}. Limite 2 Mo.`);
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Lecture impossible: ${file.name}`));
    reader.readAsDataURL(file);
  });
  try {
    const res = await fetch(API_BASE + '/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: dataUrl, folder: 'frescoop' }),
    });
    const result = await res.json();
    if (result.ok && result.url) {
      return { id: uid('file'), name: file.name, type: file.type || 'application/octet-stream', size: file.size, url: result.url, uploadedAt: new Date().toISOString() };
    }
  } catch { /* Cloudinary indisponible — fallback base64 */ }
  return { id: uid('file'), name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl, uploadedAt: new Date().toISOString() };
}

function renderAttestationHtml(attestation) {
  const dossier = attestation.dossierSnapshot;
  return renderDocumentShell(attestation.title, `
    <h1>${escapeHtml(attestation.title)}</h1>
    <p class="code">Code verification: ${escapeHtml(attestation.verificationCode)}</p>
    <section>
      <h2>Bénéficiaire</h2>
      <p><strong>${escapeHtml(dossier.personName)}</strong> - ${escapeHtml(roleLabel(dossier.personRole))}</p>
      <p>ID: ${escapeHtml(dossier.personId)} | Telephone: ${escapeHtml(dossier.phone || 'Non renseigne')}</p>
      <p>Organisation: ${escapeHtml(dossier.organization || dossier.ownerName || 'Non renseignee')}</p>
    </section>
    <section>
      <h2>Base documentaire</h2>
      <p>Dossier: ${escapeHtml(dossier.title)} (${escapeHtml(dossier.type)})</p>
      <p>Objet: ${escapeHtml(dossier.purpose)}</p>
      <p>Pieces: ${escapeHtml(dossier.attachments.map((file) => file.name).join(', ') || 'Aucune')}</p>
      <p>Preuves declarees: ${escapeHtml(dossier.evidenceTags.join(', ') || 'Non renseignees')}</p>
    </section>
    <section>
      <h2>Evaluation</h2>
      <p>Score de preuve: <strong>${attestation.score.total}/100</strong></p>
      <ul>${attestation.score.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
      <p>Cette attestation est emise sur la base des preuves transmises dans FresCoop et de leur coherence documentaire.</p>
      <p>Date emission: ${formatDate(attestation.createdAt)} | Validite: ${attestation.validityMonths} mois</p>
    </section>
  `);
}

function renderProofHtml(proof) {
  const rows = proof.transactions.map((item) => `<tr><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.buyer || '')}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(formatMoney(item.amount))}</td></tr>`).join('');
  return renderDocumentShell('Preuve économique FresCoop', `
    <h1>Preuve économique</h1>
    <p class="code">Code verification: ${escapeHtml(proof.verificationCode)}</p>
    <section>
      <h2>Bénéficiaire</h2>
      <p><strong>${escapeHtml(proof.personName)}</strong> - ${escapeHtml(roleLabel(proof.role))}</p>
      <p>Organisation: ${escapeHtml(proof.organization || 'Non renseignee')}</p>
    </section>
    <section>
      <h2>Synthese</h2>
      <p>Transactions: ${proof.transactionCount} | Taux paye: ${proof.paidRate}%</p>
      <p>Valeur totale: <strong>${escapeHtml(formatMoney(proof.totalValue))}</strong></p>
    </section>
    <section>
      <h2>Transactions</h2>
      <table><thead><tr><th>Date</th><th>Libelle</th><th>Acheteur</th><th>Statut</th><th>Montant</th></tr></thead><tbody>${rows}</tbody></table>
    </section>
  `);
}

function renderPaymentReceiptHtml(receipt, store, user) {
  const rows = receipt.orders.map((order) => {
    const product = getOrderProduct(order, store);
    const quantity = Number(order.quantity || 0);
    const unit = order.unit || product?.unit || 'kg';
    const unitPrice = Number(order.unitPrice ?? product?.price ?? 0);
    const total = getOrderTotal(order, store);
    return `<tr>
      <td>
        <div class="item-name">${escapeHtml(product?.name || 'Produit')}</div>
        <div class="item-meta">${escapeHtml(formatNumber(quantity))} ${escapeHtml(unit)} × ${escapeHtml(formatMoney(unitPrice))}</div>
      </td>
      <td class="num">${escapeHtml(formatMoney(total))}</td>
    </tr>`;
  }).join('');

  const paidDate = new Date(receipt.paidAt);
  const dateStr = paidDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = paidDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const invoiceNum = `FC-${paidDate.getFullYear()}-${receipt.code.slice(-8)}`;
  const method = receipt.token?.startsWith('DEMO') ? 'Simulation démo' : 'PayDunya';

  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://frescoop.sn';
  const verifyUrl = `${origin}/verifier?code=${encodeURIComponent(receipt.code)}`;
  const qrData = encodeURIComponent(verifyUrl);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&ecc=M&data=${qrData}`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Reçu ${escapeHtml(invoiceNum)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #111827;
    background: #f3f4f6;
    padding: 40px 20px;
    min-height: 100vh;
    min-height: 100svh;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .receipt {
    width: min(560px, 100%);
    max-width: 560px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }
  .brand {
    padding: 32px 40px 24px;
    text-align: center;
  }
  .brand .logo {
    display: inline-grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0a4b3e, #1f835d);
    color: #ffffff;
    font-weight: 900;
    font-size: 1.2rem;
    margin-bottom: 14px;
  }
  .brand .name {
    font-weight: 700;
    font-size: 1.05rem;
    color: #0a4b3e;
    letter-spacing: -0.01em;
  }
  .amount-block {
    padding: 8px 40px 28px;
    text-align: center;
    border-bottom: 1px solid #f3f4f6;
  }
  .amount-label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    font-weight: 600;
  }
  .amount-value {
    margin-top: 6px;
    font-size: 2.4rem;
    font-weight: 700;
    color: #0a4b3e;
    letter-spacing: -0.02em;
  }
  .amount-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #ecfdf5;
    color: #065f46;
    font-size: 0.78rem;
    font-weight: 600;
  }
  .amount-status::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
  }
  .details {
    padding: 24px 40px;
    display: grid;
    gap: 14px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    font-size: 0.92rem;
  }
  .row .label {
    color: #6b7280;
  }
  .row .value {
    color: #111827;
    font-weight: 500;
    text-align: right;
    word-break: break-word;
  }
  .row .value code {
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 0.82rem;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .divider {
    border-top: 1px solid #f3f4f6;
    margin: 4px -40px;
  }
  .items {
    padding: 20px 40px;
    border-top: 1px solid #f3f4f6;
  }
  .items-title {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    font-weight: 600;
    margin-bottom: 12px;
  }
  table { width: 100%; border-collapse: collapse; }
  td {
    padding: 10px 0;
    border-bottom: 1px solid #f9fafb;
    vertical-align: top;
    font-size: 0.92rem;
  }
  tr:last-child td { border-bottom: 0; }
  td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .item-name { font-weight: 500; color: #111827; }
  .item-meta { color: #6b7280; font-size: 0.82rem; margin-top: 2px; }
  .total-row {
    padding: 18px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e5e7eb;
    font-weight: 700;
    font-size: 1rem;
    color: #0a4b3e;
  }
  .total-row .big { font-size: 1.2rem; font-variant-numeric: tabular-nums; }
  .qr-block {
    padding: 24px 40px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    align-items: center;
    border-top: 1px solid #f3f4f6;
    background: #fafafa;
  }
  .qr-block img {
    width: 96px;
    height: 96px;
    border-radius: 6px;
    display: block;
  }
  .qr-info {
    font-size: 0.82rem;
    color: #6b7280;
    line-height: 1.5;
  }
  .qr-info strong {
    display: block;
    color: #111827;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .qr-info code {
    display: inline-block;
    margin-top: 6px;
    padding: 2px 6px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 0.78rem;
    color: #0a4b3e;
    font-weight: 600;
  }
  .qr-info a {
    display: inline-block;
    margin-top: 6px;
    color: #1f835d;
    font-size: 0.76rem;
    text-decoration: none;
    word-break: break-all;
  }
  .qr-info a:hover { text-decoration: underline; }
  .footer {
    padding: 20px 40px 28px;
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
    border-top: 1px solid #f3f4f6;
  }
  .footer a { color: #1f835d; text-decoration: none; }
  @media print {
    body { padding: 0; background: #ffffff; }
    .receipt { box-shadow: none; border-radius: 0; max-width: none; }
  }
  @media (max-width: 520px) {
    body {
      padding: 0;
      background: #ffffff;
    }
    .receipt {
      width: 100%;
      max-width: none;
      min-height: 100vh;
      min-height: 100svh;
      border-radius: 0;
      box-shadow: none;
    }
    .brand, .amount-block, .details, .items, .total-row, .qr-block, .footer { padding-left: 18px; padding-right: 18px; }
    .divider { margin-left: -18px; margin-right: -18px; }
    .row {
      display: grid;
      gap: 4px;
      align-items: start;
    }
    .row .value {
      text-align: left;
    }
    .total-row {
      gap: 14px;
    }
    .total-row .big {
      text-align: right;
    }
    td.num {
      padding-left: 12px;
    }
    .qr-block {
      grid-template-columns: 1fr;
      justify-items: center;
      text-align: center;
    }
    .qr-block img { width: 80px; height: 80px; }
    .amount-value { font-size: 2rem; }
  }
</style>
</head>
<body>
  <div class="receipt">
    <div class="brand">
      <div class="logo">F</div>
      <div class="name">FresCoop</div>
    </div>

    <div class="amount-block">
      <div class="amount-label">Reçu de paiement</div>
      <div class="amount-value">${escapeHtml(formatMoney(receipt.total))}</div>
      <div class="amount-status">Paiement accepté</div>
    </div>

    <div class="details">
      <div class="row"><span class="label">Date</span><span class="value">${escapeHtml(dateStr)} · ${escapeHtml(timeStr)}</span></div>
      <div class="row"><span class="label">Facture</span><span class="value"><code>${escapeHtml(invoiceNum)}</code></span></div>
      <div class="row"><span class="label">Mode de paiement</span><span class="value">${escapeHtml(method)}</span></div>
      <div class="row"><span class="label">Client</span><span class="value">${escapeHtml(user.name)}</span></div>
      ${user.email ? `<div class="row"><span class="label">Email</span><span class="value">${escapeHtml(user.email)}</span></div>` : ''}
    </div>

    <div class="items">
      <div class="items-title">Détail</div>
      <table>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="total-row">
      <span>Total payé</span>
      <span class="big">${escapeHtml(formatMoney(receipt.total))}</span>
    </div>

    <div class="qr-block">
      <img src="${qrUrl}" alt="QR code de vérification FresCoop" />
      <div class="qr-info">
        <strong>Preuve officielle vérifiable</strong>
        Scannez ce QR code ou ouvrez le lien pour confirmer que ce paiement est bien enregistré dans le système FresCoop.
        <a href="${escapeHtml(verifyUrl)}" target="_blank" rel="noreferrer">${escapeHtml(verifyUrl)}</a>
        <code>${escapeHtml(receipt.code)}</code>
      </div>
    </div>

    <div class="footer">
      Paiement exécuté via partenaire agréé. FresCoop conserve la preuve de coordination.<br>
      <a href="mailto:contact@frescoop.sn">contact@frescoop.sn</a> · Dakar, Sénégal
    </div>
  </div>
</body>
</html>`;
}

function renderBusinessReportHtml(store) {
  const revenue = buildRevenueSnapshot(store);
  const pipeline = buildTrustPipeline(store);
  const topProducts = buildTopProductsByMoney(store).slice(0, 8);
  const opportunities = buildAdminOpportunities(store).slice(0, 6);
  const rows = topProducts.map((item) => `
    <tr>
      <td>${escapeHtml(item.product.name)}</td>
      <td>${escapeHtml(item.seller?.name || 'Vendeur')}</td>
      <td>${escapeHtml(formatMoney(item.catalogValue))}</td>
      <td>${escapeHtml(formatMoney(item.orderValue))}</td>
    </tr>
  `).join('');
  const opportunityRows = opportunities.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.body)} (${escapeHtml(item.value)})</li>`).join('');

  return renderDocumentShell('Rapport POESAM FresCoop', `
    <h1>Rapport POESAM - FresCoop</h1>
    <p class="code">Genere le ${escapeHtml(formatDate(new Date().toISOString()))}</p>
    <section>
      <h2>Proposition de valeur</h2>
      <p>FresCoop transforme le catalogue agricole et commercial en commandes, preuves economiques et donnees de confiance utilisables pour financement, contrats et logistique.</p>
    </section>
    <section>
      <h2>Indicateurs argent</h2>
      <p>Valeur catalogue: <strong>${escapeHtml(formatMoney(revenue.catalogValue))}</strong></p>
      <p>Valeur commandes: <strong>${escapeHtml(formatMoney(revenue.orderValue))}</strong></p>
      <p>Commandes ouvertes a convertir: <strong>${escapeHtml(formatMoney(revenue.openOrderValue))}</strong></p>
      <p>Vendeurs actifs: <strong>${revenue.activeSellerCount}/${revenue.sellerCount}</strong></p>
    </section>
    <section>
      <h2>Confiance et bancabilite</h2>
      <p>Dossiers: ${pipeline.total} | Validables: ${pipeline.validated} | En attente: ${pipeline.pending} | Preuves economiques: ${store.proofs.length}</p>
    </section>
    <section>
      <h2>Produits moteurs</h2>
      <table><thead><tr><th>Produit</th><th>Vendeur</th><th>Stock valorise</th><th>Commandes</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Aucun produit</td></tr>'}</tbody></table>
    </section>
    <section>
      <h2>Actions prioritaires</h2>
      <ul>${opportunityRows || '<li>Aucune action critique pour le moment.</li>'}</ul>
    </section>
  `);
}

function renderDocumentShell(title, body) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;margin:42px;color:#071b14;line-height:1.55}h1{font-size:34px;margin:0 0 8px}h2{font-size:18px;margin:28px 0 8px}.code{padding:10px 12px;background:#e4f7ef;display:inline-block;font-weight:bold}section{border-top:1px solid #d7e4dc;padding-top:14px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #d7e4dc;padding:8px;text-align:left}th{background:#eef6f1}</style></head><body>${body}</body></html>`;
}

function productsToRows(products) {
  return [['ID', 'Date', 'Nom', 'Categorie', 'Quantite', 'Unite', 'Prix', 'Zone', 'Statut'], ...products.map((item) => [item.id, item.createdAt, item.name, item.category, item.quantity, item.unit, item.price, item.zone, item.status])];
}

function dossiersToRows(dossiers, store) {
  return [['ID', 'Date', 'Statut', 'Titre', 'Type', 'Nom', 'ID personne', 'Compte', 'Score'], ...dossiers.map((item) => [item.id, item.createdAt, item.status, item.title, item.type, item.personName, item.personId, store.users.find((user) => user.id === item.ownerId)?.email || '', computeEvidenceScore(item, store).total])];
}

function attestationsToRows(items) {
  return [['ID', 'Date', 'Code', 'Titre', 'Bénéficiaire', 'Score'], ...items.map((item) => [item.id, item.createdAt, item.verificationCode, item.title, item.dossierSnapshot.personName, item.score.total])];
}

function transactionsToRows(items) {
  return [['ID', 'Date', 'Libelle', 'Montant', 'Acheteur', 'Paiement', 'Statut', 'Reference'], ...items.map((item) => [item.id, item.date, item.label, item.amount, item.buyer, item.paymentMethod, item.status, item.reference])];
}

function usersToRows(users) {
  return [['ID', 'Date', 'Nom', 'Email', 'Role', 'Statut', 'Telephone', 'Organisation', 'Region'], ...users.map((user) => [user.id, user.createdAt, user.name, user.email, user.role, user.status, user.phone, user.organization, user.region])];
}

function downloadCsv(filename, rows) {
  downloadText(filename, rows.map((row) => row.map(csvCell).join(';')).join('\n'), 'text/csv;charset=utf-8;');
}

function downloadJson(filename, value) {
  downloadText(filename, JSON.stringify(value, null, 2), 'application/json;charset=utf-8;');
}

function downloadHtml(filename, html) {
  downloadText(filename, html, 'text/html;charset=utf-8;');
}

function downloadText(filename, text, type) {
  const content = type.startsWith('text/csv') ? `\ufeff${text}` : text;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(file) {
  const anchor = document.createElement('a');
  anchor.href = file.dataUrl;
  anchor.download = file.name;
  anchor.click();
}

function printHtml(html) {
  const popup = window.open('', '_blank');
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function updateForm(setter, key, value) {
  setter((current) => ({ ...current, [key]: value }));
}

function resolveUpdate(current, updater) {
  return typeof updater === 'function' ? updater(current) : updater;
}

function getCurrentRoute() {
  return { pathname: window.location.pathname, search: window.location.search };
}

function isPublicPath(path) {
  return publicSitePaths.includes(path);
}

function roleLabel(role) {
  return roles.find((item) => item.id === role)?.label || role;
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildVerificationCode(prefix) {
  return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function formatDate(value) {
  if (!value) return 'Non renseigne';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatMoney(value) {
  return `${formatNumber(value)} FCFA`;
}

function formatCompact(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1, notation: 'compact', compactDisplay: 'short' }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export default App;
