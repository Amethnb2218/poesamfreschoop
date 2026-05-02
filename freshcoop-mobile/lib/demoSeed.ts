// Générateur de données de démo crédibles pour impressionner le jury POESAM.
// Idempotent : détecte si le store contient déjà des données et ne fait rien.

import { Store } from './api';
import { sha256Js } from './sha256';

const REGIONS = [
  'Thiès', 'Dakar', 'Kaolack', 'Fatick', 'Saint-Louis',
  'Diourbel', 'Louga', 'Ziguinchor', 'Tambacounda', 'Matam',
];

const ZONES = [
  'Niayes', 'Vallée du fleuve', 'Bassin arachidier', 'Casamance',
  'Ferlo', 'Thiaroye', 'Mbour', 'Pikine', 'Rufisque', 'Kaffrine',
];

const FIRST_NAMES = [
  'Fatou', 'Aminata', 'Mariama', 'Awa', 'Aïssatou', 'Khady', 'Ndèye',
  'Coumba', 'Sokhna', 'Rama', 'Penda', 'Bineta', 'Adja', 'Astou',
  'Diarra', 'Maty', 'Maimouna', 'Yacine', 'Rokhaya', 'Oumou',
  'Bousso', 'Mame Diarra', 'Seynabou', 'Marième', 'Nafissatou',
];

const LAST_NAMES = [
  'Diop', 'Ndiaye', 'Fall', 'Sow', 'Ba', 'Diallo', 'Sarr', 'Gueye',
  'Mbaye', 'Faye', 'Seck', 'Thiam', 'Sy', 'Diagne', 'Camara',
  'Sagna', 'Wade', 'Mbengue', 'Dia', 'Cissé',
];

const COOPERATIVES = [
  'Coop Femmes Niayes', 'GIE Ndèye Jarin', 'Coop Kaffrine Union',
  'Femmes du Fleuve', 'GIE Diamono', 'Coop Thiaroye Gox',
  'Union Maraîchère Mbour', 'GIE Jëkkët', 'Coop Kaolack Bokk',
  'Femmes Casamance Sud',
];

const PRODUCT_CATALOG: {
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  description: string;
}[] = [
  { name: 'Tomates fraîches', category: 'Maraîchage', unit: 'kg', basePrice: 700, description: 'Tomates variété Mongal, calibrées, récoltées le matin même.' },
  { name: 'Tomates cerises', category: 'Maraîchage', unit: 'kg', basePrice: 1500, description: 'Variété haut de gamme, idéale restauration.' },
  { name: 'Oignons violets', category: 'Maraîchage', unit: 'kg', basePrice: 450, description: 'Oignons de la vallée, piquants et sucrés.' },
  { name: 'Pommes de terre', category: 'Maraîchage', unit: 'kg', basePrice: 500, description: 'Variété locale, conservation longue.' },
  { name: 'Carottes', category: 'Maraîchage', unit: 'kg', basePrice: 600, description: 'Carottes bottes, premier choix.' },
  { name: 'Aubergines africaines', category: 'Maraîchage', unit: 'kg', basePrice: 800, description: 'Djakhatou, récolte traditionnelle.' },
  { name: 'Gombo', category: 'Maraîchage', unit: 'kg', basePrice: 900, description: 'Jeunes gousses tendres, Casamance.' },
  { name: 'Piments verts', category: 'Maraîchage', unit: 'kg', basePrice: 1200, description: 'Piments frais, parfum intense.' },
  { name: 'Salade laitue', category: 'Maraîchage', unit: 'unité', basePrice: 300, description: 'Laitue bio des Niayes.' },
  { name: 'Concombres', category: 'Maraîchage', unit: 'kg', basePrice: 500, description: 'Concombres longs, pour salades.' },
  { name: 'Bissap séché', category: 'Transformation', unit: 'kg', basePrice: 2500, description: 'Fleurs d\'hibiscus séchées au soleil, qualité export.' },
  { name: 'Arachides grillées', category: 'Transformation', unit: 'kg', basePrice: 1800, description: 'Arachides du bassin, grillées artisanalement.' },
  { name: 'Huile d\'arachide', category: 'Transformation', unit: 'litre', basePrice: 1500, description: 'Pressage à froid, sans additifs.' },
  { name: 'Couscous mil', category: 'Transformation', unit: 'kg', basePrice: 1200, description: 'Mil précuit, facile à préparer.' },
  { name: 'Mangues Kent', category: 'Fruits', unit: 'kg', basePrice: 900, description: 'Mangues mûres à point, Casamance.' },
  { name: 'Papayes solo', category: 'Fruits', unit: 'kg', basePrice: 700, description: 'Papayes sucrées, récolte récente.' },
  { name: 'Bananes plantain', category: 'Fruits', unit: 'kg', basePrice: 600, description: 'Bananes plantain, calibrage moyen.' },
  { name: 'Citrons verts', category: 'Fruits', unit: 'kg', basePrice: 1000, description: 'Citrons juteux pour jus frais.' },
  { name: 'Riz paddy local', category: 'Céréales', unit: 'sac', basePrice: 18000, description: 'Riz de la vallée, sac 50 kg.' },
  { name: 'Mil', category: 'Céréales', unit: 'sac', basePrice: 22000, description: 'Mil paddy, récolte 2026.' },
  { name: 'Sorgho', category: 'Céréales', unit: 'sac', basePrice: 16000, description: 'Sorgho blanc, sac 50 kg.' },
  { name: 'Œufs fermiers', category: 'Élevage', unit: 'panier', basePrice: 2500, description: 'Panier de 30 œufs, poules au sol.' },
  { name: 'Lait caillé', category: 'Élevage', unit: 'litre', basePrice: 800, description: 'Lait caillé fermier, sous réfrigération.' },
];

const ORDER_STATUSES = [
  'Paiement confirme', 'Preparation', 'Prete', 'En livraison', 'Livree', 'Livree', 'Livree',
];

function pick<T>(list: T[], idx: number): T {
  return list[Math.abs(idx) % list.length];
}

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Indique si le store contient des entités issues du seed (ids préfixés "-demo-")
export function hasDemoData(store: Store): boolean {
  const keys: (keyof Store)[] = [
    'users', 'products', 'orders', 'hubs', 'lots',
    'transactions', 'proofs', 'attestations',
  ];
  for (const k of keys) {
    const list = (store[k] || []) as any[];
    if (list.some((item: any) => String(item?.id || '').includes('-demo-'))) return true;
  }
  return false;
}

// Retire toutes les entités créées par generateDemoSeed. On identifie par l'id
// qui commence par "{prefix}-demo-". Conserve les données réelles du site.
export function removeDemoData(store: Store): Store {
  const isDemo = (item: any) => String(item?.id || '').includes('-demo-');
  const cleaned: any = { ...store };
  const listKeys: (keyof Store)[] = [
    'users', 'products', 'orders', 'hubs', 'lots',
    'transactions', 'proofs', 'attestations',
  ];
  for (const k of listKeys) {
    const list = (store[k] || []) as any[];
    cleaned[k] = list.filter((item: any) => !isDemo(item));
  }
  // On enlève aussi les KPI agrégés (ils sont juste un cache d'affichage)
  cleaned.kpiAggregates = [];
  return cleaned as Store;
}

export async function isStoreBootstrapped(store: Store): Promise<boolean> {
  // On considère bootstrappé dès qu'on a au moins 10 productrices ET 30 produits
  const sellers = (store.users || []).filter((u: any) => u.role === 'agriculteur').length;
  return sellers >= 10 && (store.products || []).length >= 30;
}

export async function generateDemoSeed(current: Store): Promise<Store> {
  const rand = pseudoRandom(20260430);
  const passwordHash = await Promise.resolve(sha256Js('demo1234'));
  const now = Date.now();

  // Garder les utilisateurs existants (admin, comptes réels)
  const existing = current.users || [];
  const existingEmails = new Set(existing.map((u: any) => String(u.email || '').toLowerCase()));

  // 50 productrices fictives
  const producers: any[] = [];
  for (let i = 0; i < 50; i++) {
    const first = pick(FIRST_NAMES, i * 7);
    const last = pick(LAST_NAMES, i * 13 + 3);
    const name = `${first} ${last}`;
    const region = pick(REGIONS, i);
    const org = pick(COOPERATIVES, i * 3);
    const email = `${first.toLowerCase().replace(/\s/g, '')}.${last.toLowerCase()}.${i}@frescoop.demo`;
    if (existingEmails.has(email)) continue;
    const createdOffset = Math.floor(rand() * 120) * 86400000; // jusqu'à 120j en arrière
    producers.push({
      id: `usr-demo-prod-${i.toString(36)}`,
      createdAt: new Date(now - createdOffset).toISOString(),
      name,
      email,
      phone: `+221 77 ${String(100 + Math.floor(rand() * 899)).padStart(3, '0')} ${String(Math.floor(rand() * 9999)).padStart(4, '0')}`,
      role: 'agriculteur',
      status: 'Actif',
      organization: org,
      region,
      bio: `Productrice membre de ${org}. Spécialisée en maraîchage et transformation.`,
      passwordHash,
    });
  }

  // 15 acheteurs B2B fictifs
  const buyers: any[] = [];
  const b2bNames = [
    'Resto Saveurs Dakar', 'Supermarché Terroir', 'Hôtel Teranga',
    'Cantine Sonatel', 'GIE Transform', 'Auchan Sénégal',
    'Restaurant Chez Loutcha', 'Cooper Export', 'Senegal Organic',
    'Market Fresh', 'Hôtel Radisson', 'Cuisine Corporate SA',
    'Boulangerie Moderne', 'Pizza Inn', 'Jumia Food',
  ];
  for (let i = 0; i < b2bNames.length; i++) {
    const email = `contact-${i}@${b2bNames[i].toLowerCase().replace(/[^a-z]/g, '')}.demo`;
    if (existingEmails.has(email)) continue;
    buyers.push({
      id: `usr-demo-b2b-${i}`,
      createdAt: new Date(now - Math.floor(rand() * 90) * 86400000).toISOString(),
      name: b2bNames[i],
      email,
      phone: `+221 33 ${String(820 + i).padStart(3, '0')} ${String(Math.floor(rand() * 9999)).padStart(4, '0')}`,
      role: 'acheteurB2B',
      status: 'Actif',
      organization: b2bNames[i],
      region: pick(REGIONS, i),
      bio: '',
      passwordHash,
    });
  }

  // 3 transporteurs
  const transporters: any[] = [];
  ['Mamadou Transport', 'SN Cold Chain', 'Sunu Car'].forEach((name, i) => {
    const email = `transport.${i}@frescoop.demo`;
    if (existingEmails.has(email)) return;
    transporters.push({
      id: `usr-demo-trans-${i}`,
      createdAt: new Date(now - 45 * 86400000).toISOString(),
      name,
      email,
      phone: `+221 77 ${String(700 + i).padStart(3, '0')} 0000`,
      role: 'transporteur',
      status: 'Actif',
      organization: name,
      region: pick(REGIONS, i),
      bio: '',
      passwordHash,
    });
  });

  // 2 agents terrain
  const agents: any[] = [];
  ['Cheikh Faye', 'Binta Camara'].forEach((name, i) => {
    const email = `agent.${i}@frescoop.demo`;
    if (existingEmails.has(email)) return;
    agents.push({
      id: `usr-demo-agent-${i}`,
      createdAt: new Date(now - 60 * 86400000).toISOString(),
      name,
      email,
      phone: `+221 76 ${String(200 + i).padStart(3, '0')} 0000`,
      role: 'agentTerrain',
      status: 'Actif',
      organization: 'FresCoop Field',
      region: pick(REGIONS, i * 3),
      bio: '',
      passwordHash,
    });
  });

  // 2 partenaires finance
  const partners: any[] = [];
  ['BNDE FresCoop', 'Microcred Sénégal'].forEach((name, i) => {
    const email = `finance.${i}@frescoop.demo`;
    if (existingEmails.has(email)) return;
    partners.push({
      id: `usr-demo-part-${i}`,
      createdAt: new Date(now - 90 * 86400000).toISOString(),
      name,
      email,
      phone: `+221 33 ${String(839 + i).padStart(3, '0')} 0000`,
      role: 'partenaire',
      status: 'Actif',
      organization: name,
      region: 'Dakar',
      bio: '',
      passwordHash,
    });
  });

  const allNewUsers = [...producers, ...buyers, ...transporters, ...agents, ...partners];
  const users = [...existing, ...allNewUsers];

  // 200 produits répartis entre les productrices
  const products: any[] = [...(current.products || [])];
  for (let i = 0; i < 200; i++) {
    const producer = producers[i % producers.length] || producers[0];
    if (!producer) break;
    const catalog = pick(PRODUCT_CATALOG, i * 5);
    const qty = Math.floor(10 + rand() * 200);
    const priceVariation = 0.9 + rand() * 0.2;
    const createdOffset = Math.floor(rand() * 30) * 86400000;
    products.push({
      id: `prd-demo-${i.toString(36)}`,
      createdAt: new Date(now - createdOffset).toISOString(),
      updatedAt: new Date(now - createdOffset).toISOString(),
      ownerId: producer.id,
      name: catalog.name,
      category: catalog.category,
      quantity: qty,
      unit: catalog.unit,
      price: Math.round(catalog.basePrice * priceVariation),
      zone: pick(ZONES, i),
      description: catalog.description,
      status: 'Publie',
      images: [],
    });
  }

  // 150 commandes
  const orders: any[] = [...(current.orders || [])];
  for (let i = 0; i < 150; i++) {
    const buyer = buyers[i % buyers.length] || buyers[0];
    const product = products[Math.floor(rand() * products.length)] || products[0];
    if (!buyer || !product) break;
    const quantity = Math.max(1, Math.floor(1 + rand() * 30));
    const createdOffset = Math.floor(rand() * 90) * 86400000;
    orders.push({
      id: `ord-demo-${i.toString(36)}`,
      createdAt: new Date(now - createdOffset).toISOString(),
      productId: product.id,
      sellerId: product.ownerId,
      clientId: buyer.id,
      userId: buyer.id,
      buyerId: buyer.id,
      buyerEmail: buyer.email,
      customer: { name: buyer.name, email: buyer.email, phone: buyer.phone },
      quantity,
      unit: product.unit,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      total: product.price * quantity,
      status: pick(ORDER_STATUSES, i * 3),
      paymentStatus: 'Paye',
      assignedAgentId: pick(transporters, i)?.id || '',
      agentWorkflow: {},
      productSnapshot: {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        zone: product.zone,
        ownerId: product.ownerId,
      },
    });
  }

  // 8 hubs répartis au Sénégal
  const hubLocations = [
    { name: 'Hub Niayes', region: 'Thiès', location: 'Rufisque' },
    { name: 'Hub Kaolack Centre', region: 'Kaolack', location: 'Kaolack' },
    { name: 'Hub Fleuve', region: 'Saint-Louis', location: 'Richard-Toll' },
    { name: 'Hub Casamance', region: 'Ziguinchor', location: 'Bignona' },
    { name: 'Hub Fatick Bokk', region: 'Fatick', location: 'Fatick' },
    { name: 'Hub Thiaroye', region: 'Dakar', location: 'Thiaroye' },
    { name: 'Hub Mbour', region: 'Thiès', location: 'Mbour' },
    { name: 'Hub Tambacounda', region: 'Tambacounda', location: 'Tambacounda' },
  ];
  const hubs: any[] = [...(current.hubs || [])];
  hubLocations.forEach((h, i) => {
    hubs.push({
      id: `hub-demo-${i}`,
      createdAt: new Date(now - (180 - i * 10) * 86400000).toISOString(),
      ownerId: existing.find((u: any) => u.role === 'admin')?.id || '',
      name: h.name,
      region: h.region,
      location: h.location,
      manager: pick(producers, i * 3)?.name || 'FresCoop',
      capacityKg: 2000 + i * 500,
      currentStockKg: Math.floor(500 + rand() * 1500),
      temperature: Math.round(4 + rand() * 4),
      batteryPercent: Math.floor(70 + rand() * 30),
      lossAvoidedKg: Math.floor(200 + rand() * 800),
    });
  });

  // 80 lots pour montrer la traçabilité
  const lots: any[] = [...(current.lots || [])];
  for (let i = 0; i < 80; i++) {
    const producer = producers[i % producers.length];
    const product = products.find((p) => p.ownerId === producer?.id);
    if (!producer || !product) continue;
    const createdOffset = Math.floor(rand() * 60) * 86400000;
    const weight = Math.floor(20 + rand() * 150);
    lots.push({
      id: `lot-demo-${i.toString(36)}`,
      reference: `LOT-${String(1000 + i).padStart(4, '0')}`,
      createdAt: new Date(now - createdOffset).toISOString(),
      ownerId: producer.id,
      sellerId: producer.id,
      productId: product.id,
      productName: product.name,
      weight,
      origin: `${producer.region}, ${pick(ZONES, i)}`,
      harvestDate: new Date(now - createdOffset).toISOString().slice(0, 10),
      hubId: pick(hubs, i)?.id || '',
      status: pick(
        ['Récolté', 'Contrôle qualité', 'En hub froid', 'En tournée', 'Livré', 'Payé'],
        i * 2,
      ),
      lossAvoidedKg: Math.floor(rand() * 15),
    });
  }

  // Transactions et preuves (50)
  const transactions: any[] = [...(current.transactions || [])];
  const proofs: any[] = [...(current.proofs || [])];
  for (let i = 0; i < 50; i++) {
    const producer = producers[i % producers.length];
    if (!producer) continue;
    const amount = Math.floor(10000 + rand() * 150000);
    const createdAt = new Date(now - Math.floor(rand() * 90) * 86400000).toISOString();
    transactions.push({
      id: `trx-demo-${i}`,
      createdAt,
      date: createdAt,
      userId: producer.id,
      ownerId: producer.id,
      label: `Vente ${pick(PRODUCT_CATALOG, i).name}`,
      amount,
      paymentMethod: pick(['Wave', 'Orange Money', 'Espèces', 'Virement'], i),
      status: 'Paye',
      buyer: pick(buyers, i * 2)?.name || 'Client',
    });
    if (i % 2 === 0) {
      proofs.push({
        id: `prf-demo-${i}`,
        createdAt,
        date: createdAt,
        userId: producer.id,
        ownerId: producer.id,
        label: `Reçu vente ${pick(PRODUCT_CATALOG, i).name}`,
        amount,
        paymentMethod: 'Wave',
      });
    }
  }

  // Attestations (20)
  const attestations: any[] = [...(current.attestations || [])];
  for (let i = 0; i < 20; i++) {
    const producer = producers[i * 2];
    if (!producer) continue;
    attestations.push({
      id: `att-demo-${i}`,
      createdAt: new Date(now - (90 - i) * 86400000).toISOString(),
      issuedAt: new Date(now - (80 - i) * 86400000).toISOString(),
      userId: producer.id,
      ownerId: producer.id,
      type: 'Attestation économique',
      title: `Attestation ${producer.name}`,
      personName: producer.name,
      beneficiary: producer.name,
      reference: `ATT-${String(100 + i).padStart(3, '0')}`,
    });
  }

  // KPI agrégés — pour la page Impact
  const kpiAggregates = [
    {
      id: 'kpi-women',
      label: 'Productrices accompagnées',
      value: producers.length,
      unit: 'femmes',
      target: 500,
    },
    {
      id: 'kpi-volume',
      label: 'Volume tracé',
      value: lots.reduce((a, l) => a + Number(l.weight || 0), 0),
      unit: 'kg',
      target: 50000,
    },
    {
      id: 'kpi-loss',
      label: 'Pertes évitées',
      value: lots.reduce((a, l) => a + Number(l.lossAvoidedKg || 0), 0) * 10,
      unit: 'kg',
      target: 10000,
    },
    {
      id: 'kpi-revenue',
      label: 'Revenus protégés',
      value: transactions.reduce((a, t) => a + Number(t.amount || 0), 0),
      unit: 'FCFA',
      target: 50000000,
    },
  ];

  return {
    ...current,
    users,
    products,
    orders,
    hubs,
    lots,
    transactions,
    proofs,
    attestations,
    kpiAggregates,
  };
}
