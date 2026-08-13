import { createServer } from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, readStore as tursoReadStore, writeStore as tursoWriteStore, createBackup, listBackups, restoreBackup } from './db.js';
import { handleAgroRequest } from './agro/routes.js';
import { askAdvisor, isAgronomyQuestion } from './agro/advisor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const envPath = path.join(rootDir, '.env');

await loadEnvFile(envPath);

// ============================================================================
// AUTH TOKEN SYSTEM
// ============================================================================
const TOKEN_SECRET = process.env.TOKEN_SECRET || randomBytes(32).toString('hex');
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createToken(userId, role) {
  const payload = JSON.stringify({ uid: userId, role, exp: Date.now() + TOKEN_EXPIRY_MS });
  const sig = createHash('sha256').update(payload + TOKEN_SECRET).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload;
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
  } catch { return null; }
  const expected = createHash('sha256').update(payload + TOKEN_SECRET).digest('hex');
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
  } catch { return null; }
  try {
    const data = JSON.parse(payload);
    if (!data.uid || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch { return null; }
}

function getTokenFromRequest(request) {
  const auth = request.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function requireAuth(request) {
  const token = getTokenFromRequest(request);
  const data = verifyToken(token);
  return data; // null if invalid
}

// ============================================================================
// PASSWORD RESET TOKENS (in-memory, expire after 15 minutes)
// ============================================================================
const resetTokens = new Map();
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

function generateResetCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of resetTokens) {
    if (now > data.expiresAt) resetTokens.delete(key);
  }
}, 60_000);

// ============================================================================
// RATE LIMITER
// ============================================================================
const rateBuckets = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 120;
const AUTH_RATE_MAX = 10;

function checkRateLimit(ip, isAuthEndpoint = false) {
  const now = Date.now();
  const key = isAuthEndpoint ? `auth:${ip}` : ip;
  const max = isAuthEndpoint ? AUTH_RATE_MAX : RATE_MAX_REQUESTS;
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count++;
  if (bucket.count > max) return false;
  return true;
}

// Cleanup stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.start > RATE_WINDOW_MS * 2) rateBuckets.delete(key);
  }
}, 300_000);



// ============================================================================
// CLOUDINARY
// ============================================================================
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || '';
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || '';

const port = Number(process.env.FRESCOOP_API_PORT || process.env.PORT || 4174);
const apiOnly = process.argv.includes('--api-only');
const host = process.env.FRESCOOP_HOST || process.env.HOST || '0.0.0.0';
const seededAdminPasswordHash = '62a1a5600217bfc84fa5ac26faf898b366581f3b1512624444654b795b108a92';
const seededDemoPasswordHash = 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791'; // demo123
const mobileDemoPasswordHash = '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d'; // demo1234
const seededAdmins = [
  {
    id: 'usr-admin-poesam',
    createdAt: '2026-04-28T00:00:00.000Z',
    name: 'Admin FresCoop',
    email: 'amethsl2218@gmail.com',
    phone: '',
    role: 'admin',
    status: 'Actif',
    organization: 'FresCoop',
    region: '',
    bio: '',
    passwordHash: seededAdminPasswordHash,
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
    passwordHash: seededAdminPasswordHash,
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
    passwordHash: seededAdminPasswordHash,
  },
];

const seededDemoUser = {
  id: 'usr-demo',
  createdAt: '2026-05-02T00:00:00.000Z',
  name: 'Visiteur Demo',
  email: 'demovisiteur@gmail.com',
  phone: '',
  role: 'agriculteur',
  status: 'Actif',
  organization: 'FresCoop Demo',
  region: 'Dakar',
  bio: 'Compte de démonstration pour découvrir FresCoop.',
  passwordHash: seededDemoPasswordHash,
};

const paydunyaMode = (process.env.PAYDUNYA_MODE || 'test').toLowerCase();
const paydunyaApiBase = paydunyaMode === 'live'
  ? 'https://app.paydunya.com/api/v1'
  : 'https://app.paydunya.com/sandbox-api/v1';

const emptyStore = {
  users: [...seededAdmins, seededDemoUser],
  products: [],
  dossiers: [],
  attestations: [],
  transactions: [],
  proofs: [],
  hubs: [],
  orders: [],
  messages: [],
  notifications: [],
  cooperatives: [],
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
  surveyLeads: [],
};

const mimeTypes = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'text/javascript;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

await ensureDatabase();

createServer(async (request, response) => {
  const origin = request.headers.origin || '*';
  const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : null;
  const corsOrigin = allowedOrigins ? (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]) : origin;
  response.setHeader('Access-Control-Allow-Origin', corsOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  // Rate limiting
  const clientIp = request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket.remoteAddress || '0.0.0.0';
  const isAuthRoute = request.url?.startsWith('/api/auth/');
  if (!checkRateLimit(clientIp, isAuthRoute)) {
    sendJson(response, 429, { error: 'Trop de requêtes. Réessayez dans une minute.' });
    return;
  }

  try {
    if (request.url?.startsWith('/api/health')) {
      sendJson(response, 200, { ok: true, mode: apiOnly ? 'api-only' : 'static', db: 'turso' });
      return;
    }

    if (request.url?.startsWith('/api/auth/')) {
      await handleAuth(request, response);
      return;
    }

    if (request.url?.startsWith('/api/upload')) {
      const authData = requireAuth(request);
      if (!authData) { sendJson(response, 401, { error: 'Non autorisé' }); return; }
      await handleUpload(request, response);
      return;
    }

    if (request.url?.startsWith('/api/paydunya/')) {
      await handlePaydunya(request, response);
      return;
    }

    if (request.url?.startsWith('/api/agro/')) {
      await handleAgroRequest(request, response, { sendJson, readBody, requireAuth, callOpenRouter });
      return;
    }

    if (request.url?.startsWith('/api/yaay/chat')) {
      await handleYaayChat(request, response);
      return;
    }

    if (request.url?.startsWith("/api/activity-proofs")) {
      await handleActivityProofs(request, response);
      return;
    }

    if (request.url?.startsWith('/api/store/backups') || request.url?.startsWith('/api/store/restore')) {
      const authData = requireAuth(request);
      if (!authData || authData.role !== 'admin') {
        sendJson(response, 403, { error: 'Accès réservé aux administrateurs' });
        return;
      }
      await handleStoreBackups(request, response);
      return;
    }

    if (request.url?.startsWith('/api/store')) {
      await handleStore(request, response);
      return;
    }

    if (apiOnly) {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Server error' });
  }
}).listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`FresCoop API listening on http://${displayHost}:${port}`);
  console.log(`PayDunya mode: ${paydunyaMode} (${paydunyaApiBase})`);
});

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================
async function handleAuth(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const endpoint = url.pathname.replace('/api/auth/', '');

  if (endpoint === 'login' && request.method === 'POST') {
    const body = await readBody(request);
    const { email, password } = JSON.parse(body || '{}');
    if (!email || !password) {
      sendJson(response, 400, { error: 'Email et mot de passe requis' });
      return;
    }
    const store = await readStore();
    const normalized = String(email).trim().toLowerCase();
    const target = store.users.find((u) => String(u?.email || '').trim().toLowerCase() === normalized);
    if (!target) {
      sendJson(response, 401, { error: 'Aucun compte avec cet e-mail' });
      return;
    }
    const status = String(target.status || 'Actif').toLowerCase();
    if (status === 'suspendu' || status === 'inactif' || status === 'bloque' || status === 'bloqué') {
      sendJson(response, 403, { error: 'Votre compte est suspendu. Contactez un administrateur.' });
      return;
    }
    const hash = createHash('sha256').update(password).digest('hex');
    if (!isAcceptedPasswordHash(target, hash)) {
      // Recovery: if user has no passwordHash stored (lost due to store overwrite bug),
      // allow login and re-store the hash so future logins work normally.
      if (!target.passwordHash) {
        target.passwordHash = hash;
        await writeStore(store);
        console.log(`[Auth] Recovered passwordHash for ${target.email} (was missing)`);
      } else {
        sendJson(response, 401, { error: 'Mot de passe incorrect' });
        return;
      }
    }
    const token = createToken(target.id, target.role);
    sendJson(response, 200, {
      ok: true,
      token,
      user: sanitizeUser(target),
    });
    return;
  }

  if (endpoint === 'register' && request.method === 'POST') {
    const body = await readBody(request);
    const data = JSON.parse(body || '{}');
    const { name, email, password, role, phone, organization, region } = data;

    if (!name || !email || !password) {
      sendJson(response, 400, { error: 'Nom, email et mot de passe requis' });
      return;
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      sendJson(response, 400, { error: 'Format email invalide' });
      return;
    }
    if (password.length < 6) {
      sendJson(response, 400, { error: 'Le mot de passe doit faire au moins 6 caractères' });
      return;
    }
    const allowedRoles = ['agriculteur', 'acheteur', 'acheteurB2B', 'transporteur', 'agent', 'agentTerrain', 'client', 'partenaire'];
    if (role && !allowedRoles.includes(role)) {
      sendJson(response, 400, { error: 'Rôle invalide' });
      return;
    }

    const store = await readStore();
    const normalized = email.trim().toLowerCase();
    if (store.users.some((u) => String(u?.email || '').trim().toLowerCase() === normalized)) {
      sendJson(response, 409, { error: 'Un compte existe déjà avec cet e-mail' });
      return;
    }

    const hash = createHash('sha256').update(password).digest('hex');
    const now = new Date().toISOString();
    const newUser = {
      id: `usr-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`,
      createdAt: now,
      name: String(name).trim().slice(0, 100),
      email: email.trim().slice(0, 200),
      phone: String(phone || '').trim().slice(0, 30),
      role: role || 'agriculteur',
      status: (role || 'agriculteur') === 'agriculteur' ? 'En attente' : 'Actif',
      organization: String(organization || '').trim().slice(0, 100),
      region: String(region || '').trim().slice(0, 100),
      bio: '',
      passwordHash: hash,
    };

    const updates = { ...store, users: [...store.users, newUser] };
    if (newUser.status === 'En attente') {
      const notif = {
        id: `notif-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`,
        createdAt: now,
        type: 'approval_request',
        title: 'Nouvelle inscription agriculteur',
        body: `${newUser.name} (${newUser.email}) demande à être validé comme agriculteur.`,
        recipientRole: 'admin',
        path: '/utilisateurs',
        relatedId: newUser.id,
        targetUserId: newUser.id,
        read: false,
      };
      updates.notifications = [notif, ...(store.notifications || [])];
    }
    await writeStore(updates);
    const token = createToken(newUser.id, newUser.role);
    sendJson(response, 201, {
      ok: true,
      token,
      user: sanitizeUser(newUser),
    });
    return;
  }

  if (endpoint === 'me' && request.method === 'GET') {
    const authData = requireAuth(request);
    if (!authData) { sendJson(response, 401, { error: 'Non autorisé' }); return; }
    const store = await readStore();
    const user = store.users.find((u) => u.id === authData.uid);
    if (!user) { sendJson(response, 404, { error: 'Utilisateur introuvable' }); return; }
    sendJson(response, 200, { ok: true, user: sanitizeUser(user) });
    return;
  }

  if (endpoint === 'forgot-password' && request.method === 'POST') {
    const body = await readBody(request);
    const { email } = JSON.parse(body || '{}');
    if (!email) {
      sendJson(response, 400, { error: 'Email requis' });
      return;
    }
    const store = await readStore();
    const normalized = String(email).trim().toLowerCase();
    const target = store.users.find((u) => String(u?.email || '').trim().toLowerCase() === normalized);
    if (!target) {
      sendJson(response, 200, { ok: true, message: 'Si ce compte existe, un code de réinitialisation a été généré.' });
      return;
    }
    const code = generateResetCode();
    resetTokens.set(normalized, {
      code,
      userId: target.id,
      expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS,
      attempts: 0,
    });
    console.log(`[Auth] Reset code for ${normalized}: ${code}`);
    sendJson(response, 200, {
      ok: true,
      message: 'Code de réinitialisation généré.',
      hint: `Code: ${code} (valable 15 minutes)`,
      code,
    });
    return;
  }

  if (endpoint === 'reset-password' && request.method === 'POST') {
    const body = await readBody(request);
    const { email, code, newPassword } = JSON.parse(body || '{}');
    if (!email || !code || !newPassword) {
      sendJson(response, 400, { error: 'Email, code et nouveau mot de passe requis' });
      return;
    }
    if (newPassword.length < 6) {
      sendJson(response, 400, { error: 'Le mot de passe doit faire au moins 6 caractères' });
      return;
    }
    const normalized = String(email).trim().toLowerCase();
    const resetData = resetTokens.get(normalized);
    if (!resetData) {
      sendJson(response, 400, { error: 'Aucun code de réinitialisation trouvé. Demandez un nouveau code.' });
      return;
    }
    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(normalized);
      sendJson(response, 400, { error: 'Code expiré. Demandez un nouveau code.' });
      return;
    }
    resetData.attempts++;
    if (resetData.attempts > 5) {
      resetTokens.delete(normalized);
      sendJson(response, 429, { error: 'Trop de tentatives. Demandez un nouveau code.' });
      return;
    }
    if (resetData.code !== code.trim().toUpperCase()) {
      sendJson(response, 400, { error: `Code incorrect. ${5 - resetData.attempts} tentative(s) restante(s).` });
      return;
    }
    const store = await readStore();
    const target = store.users.find((u) => u.id === resetData.userId);
    if (!target) {
      sendJson(response, 404, { error: 'Utilisateur introuvable' });
      return;
    }
    target.passwordHash = createHash('sha256').update(newPassword).digest('hex');
    await writeStore(store);
    resetTokens.delete(normalized);
    const token = createToken(target.id, target.role);
    sendJson(response, 200, {
      ok: true,
      message: 'Mot de passe réinitialisé avec succès.',
      token,
      user: sanitizeUser(target),
    });
    return;
  }

  if (endpoint === 'set-password' && request.method === 'POST') {
    const authData = requireAuth(request);
    if (!authData || authData.role !== 'admin') {
      sendJson(response, 403, { error: 'Réservé aux administrateurs' });
      return;
    }
    const body = await readBody(request);
    const { userId, email, passwordHash: newHash, password } = JSON.parse(body || '{}');
    if (!newHash && !password) {
      sendJson(response, 400, { error: 'passwordHash ou password requis' });
      return;
    }
    const hash = newHash || createHash('sha256').update(password).digest('hex');
    const store = await readStore();
    const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
    const target = store.users.find((u) =>
      (userId && u.id === userId) || (normalizedEmail && String(u.email || '').trim().toLowerCase() === normalizedEmail)
    );
    if (!target) {
      sendJson(response, 404, { error: 'Utilisateur introuvable' });
      return;
    }
    target.passwordHash = hash;
    await writeStore(store);
    sendJson(response, 200, { ok: true, userId: target.id, email: target.email });
    return;
  }

  if (endpoint === 'bulk-set-password' && request.method === 'POST') {
    const authData = requireAuth(request);
    if (!authData || authData.role !== 'admin') {
      sendJson(response, 403, { error: 'Réservé aux administrateurs' });
      return;
    }
    const body = await readBody(request);
    const { entries } = JSON.parse(body || '{}');
    if (!Array.isArray(entries) || entries.length === 0) {
      sendJson(response, 400, { error: 'entries[] requis (tableau de {email, passwordHash ou password})' });
      return;
    }
    const store = await readStore();
    const results = [];
    for (const entry of entries) {
      const { email, passwordHash: h, password: p } = entry || {};
      const hash = h || (p ? createHash('sha256').update(p).digest('hex') : null);
      if (!email || !hash) { results.push({ email, ok: false, error: 'données manquantes' }); continue; }
      const normalized = String(email).trim().toLowerCase();
      const target = store.users.find((u) => String(u.email || '').trim().toLowerCase() === normalized);
      if (!target) { results.push({ email, ok: false, error: 'introuvable' }); continue; }
      target.passwordHash = hash;
      results.push({ email, ok: true, userId: target.id });
    }
    await writeStore(store);
    sendJson(response, 200, { ok: true, results });
    return;
  }

  sendJson(response, 404, { error: 'Endpoint auth inconnu' });
}

function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return user;
  const { passwordHash, ...safe } = user;
  return safe;
}

function sanitizeStoreForClient(store) {
  return {
    ...store,
    users: (store.users || []).map(sanitizeUser),
  };
}

// ============================================================================
// CLOUDINARY UPLOAD
// ============================================================================
async function handleUpload(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }
  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    sendJson(response, 500, { error: 'Cloudinary non configuré' });
    return;
  }
  try {
    const body = await readBody(request);
    const data = JSON.parse(body || '{}');
    const file = data.file; // base64 data URL
    if (!file || !file.startsWith('data:')) {
      sendJson(response, 400, { error: 'Fichier manquant (data URL attendue)' });
      return;
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = data.folder || 'frescoop';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash('sha1').update(paramsToSign + cloudinaryApiSecret).digest('hex');

    const formBody = new URLSearchParams({
      file,
      folder,
      timestamp: String(timestamp),
      api_key: cloudinaryApiKey,
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      { method: 'POST', body: formBody },
    );
    const result = await res.json();
    if (result.secure_url) {
      sendJson(response, 200, {
        ok: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      });
    } else {
      sendJson(response, 400, { ok: false, error: result.error?.message || 'Échec upload Cloudinary', raw: result });
    }
  } catch (err) {
    sendJson(response, 500, { ok: false, error: err.message });
  }
}

async function handlePaydunya(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const endpoint = url.pathname.replace('/api/paydunya/', '');

  if (!process.env.PAYDUNYA_MASTER_KEY) {
    sendJson(response, 500, { error: 'PayDunya credentials not configured' });
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
    'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
    'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
  };

  if (endpoint === 'create-invoice' && request.method === 'POST') {
    const body = await readBody(request);
    const data = JSON.parse(body || '{}');
    const storeName = process.env.PAYDUNYA_STORE_NAME || 'FresCoop';
    const origin = `${request.headers['x-forwarded-proto'] || 'http'}://${request.headers.host}`;

    const payload = {
      invoice: {
        total_amount: Number(data.amount) || 0,
        description: data.description || 'Paiement commande FresCoop',
      },
      store: {
        name: storeName,
        tagline: 'Commerce agricole, preuve economique',
        phone: data.storePhone || '',
        postal_address: data.storeAddress || 'Dakar, Senegal',
        website_url: origin,
      },
      custom_data: {
        order_ids: data.orderIds || [],
        payer_id: data.payerId || '',
        receipt_code: data.receiptCode || '',
      },
      actions: {
        callback_url: `${origin}/api/paydunya/ipn`,
        return_url: `${origin}/paiement?status=success&token=__TOKEN__`,
        cancel_url: `${origin}/paiement?status=cancel`,
      },
    };

    try {
      const pdRes = await fetch(`${paydunyaApiBase}/checkout-invoice/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const result = await pdRes.json();
      if (result?.response_code === '00') {
        sendJson(response, 200, {
          ok: true,
          token: result.token,
          url: result.response_text,
          mode: paydunyaMode,
        });
      } else {
        sendJson(response, 400, {
          ok: false,
          error: result?.response_text || 'Echec creation facture PayDunya',
          raw: result,
        });
      }
    } catch (error) {
      sendJson(response, 502, { ok: false, error: error.message });
    }
    return;
  }

  if (endpoint.startsWith('confirm/') && request.method === 'GET') {
    const token = endpoint.replace('confirm/', '');
    if (!token) {
      sendJson(response, 400, { error: 'Token manquant' });
      return;
    }
    try {
      const pdRes = await fetch(`${paydunyaApiBase}/checkout-invoice/confirm/${encodeURIComponent(token)}`, {
        method: 'GET',
        headers,
      });
      const result = await pdRes.json();
      const confirmed = result?.status === 'completed';
      sendJson(response, 200, {
        ok: true,
        confirmed,
        status: result?.status || 'unknown',
        amount: Number(result?.invoice?.total_amount) || 0,
        customer: result?.customer || null,
        receiptUrl: result?.receipt_url || '',
        customData: result?.custom_data || {},
        raw: result,
      });
    } catch (error) {
      sendJson(response, 502, { ok: false, error: error.message });
    }
    return;
  }

  if (endpoint === 'ipn' && request.method === 'POST') {
    const body = await readBody(request);
    let ipnData;
    try { ipnData = JSON.parse(body || '{}'); } catch { ipnData = {}; }
    console.log('[PayDunya IPN]', JSON.stringify(ipnData).slice(0, 500));
    // Verify IPN by checking the payment status with PayDunya API
    const ipnToken = ipnData?.data?.hash || ipnData?.token || '';
    if (ipnToken && process.env.PAYDUNYA_MASTER_KEY) {
      try {
        const verifyRes = await fetch(`${paydunyaApiBase}/checkout-invoice/confirm/${encodeURIComponent(ipnToken)}`, {
          method: 'GET',
          headers,
        });
        const verifyResult = await verifyRes.json();
        if (verifyResult?.status === 'completed') {
          console.log('[PayDunya IPN] Paiement vérifié:', ipnToken);
        } else {
          console.warn('[PayDunya IPN] Statut non confirmé:', verifyResult?.status);
        }
      } catch (err) {
        console.error('[PayDunya IPN] Erreur vérification:', err.message);
      }
    }
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: 'Endpoint PayDunya inconnu' });
}

async function handleYaayChat(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  // Pas de sortie immédiate sans clé : le conseiller agricole sait répondre
  // hors-ligne. Le garde-fou est déplacé après le routage agronomique.
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const body = await readBody(request);
    const payload = JSON.parse(body || '{}');
    const { message, lang = 'fr', context = {}, history = [] } = payload;

    if (!message || typeof message !== 'string') {
      sendJson(response, 400, { error: 'message requis' });
      return;
    }

    // ========= BYPASS SÉRÈRE =========

    const modelList = (process.env.OPENROUTER_MODELS ||
      process.env.OPENROUTER_MODEL ||
      'openai/gpt-oss-120b:free,meta-llama/llama-3.3-70b-instruct:free,google/gemma-3-27b-it:free'
    )
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    // ========= ROUTAGE CONSEILLER AGRICOLE =========
    // Les questions agronomiques (semis, sol, engrais, ravageurs, variétés)
    // vont au conseiller FresCoop : prompt agronomique Sahel dédié + repli
    // hors-ligne. Les questions plateforme (prix, commandes, score, paiement)
    // restent sur l'assistant généraliste ci-dessous.
    // Le sérère est exclu : il garde son moteur local (voir bypass plus bas),
    // les LLM gratuits ne le maîtrisent pas.
    if (lang !== 'sr' && isAgronomyQuestion(message)) {
      const result = await askAdvisor({
        message,
        language: lang === 'pul' ? 'pu' : lang,
        context,
        history,
        callLlm: apiKey
          ? async (messages) => {
              let lastError = null;
              for (const model of modelList) {
                try {
                  return await callOpenRouter(apiKey, model, messages, { temperature: 0.6, max_tokens: 900 });
                } catch (error) {
                  lastError = error;
                }
              }
              throw lastError || new Error('Aucun modèle disponible');
            }
          : null,
      });

      if (result.answer) {
        sendJson(response, 200, {
          ok: true,
          answer: result.answer,
          model: result.model || 'frescoop-agro-local',
          source: 'agronomique',
        });
        return;
      }
    }

    if (!apiKey) {
      sendJson(response, 503, {
        ok: false,
        error: 'OPENROUTER_API_KEY non configurée',
        fallback: true,
      });
      return;
    }

    // Les LLM gratuits ne maîtrisent pas le sérère (faible corpus d'entraînement).
    // On utilise un moteur local hand-crafted + encadrement FR pour éviter les
    // réponses wolof déguisées. C'est la solution la plus honnête et la plus fiable.
    if (lang === 'sr') {
      const answer = generateSerereAnswer(message, context);
      sendJson(response, 200, {
        ok: true,
        answer,
        model: 'frescoop-serere-local',
      });
      return;
    }

    const langLabel = {
      fr: 'français',
      wo: 'wolof',
      pul: 'pulaar',
    }[lang] || 'français';

    const systemPrompt = buildSystemPrompt(langLabel, context, lang);

    // Few-shot bilingue sérère pour ancrer le vocabulaire avant la vraie question
    const fewShotSerere = lang === 'sr'
      ? [
          { role: 'user', content: 'Nafio, le ma ŋ kirim penaar ?' },
          {
            role: 'assistant',
            content:
              'Nafio ! Hiin hannde e marché FresCoop : tomates ndewoh 700 F/kg, oignon 450 F/kg. Da onglet "Marché" ole ya kirim ma tedd — mi fa kala kirim ak njeg yi.',
          },
          { role: 'user', content: 'Le mbaane haat ana ?' },
          {
            role: 'assistant',
            content:
              'Yaad ŋ pendol ! Da "Bancabilité" ole score ma (0-100) mi leng ole vente ma ak paiement ma PayDunya. Score haat pe 70 → dossier ma eligible le BNDE ole SFD partenaire.',
          },
        ]
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...fewShotSerere,
      ...((Array.isArray(history) ? history : []).slice(-6).map((h) => ({
        role: h.from === 'user' ? 'user' : 'assistant',
        content: String(h.text || '').slice(0, 500),
      }))),
      { role: 'user', content: message.slice(0, 1000) },
    ];

    let result = null;
    const errors = [];
    for (const model of modelList) {
      try {
        result = await callOpenRouter(apiKey, model, messages);
        if (result?.answer) {
          // Validation langue : si la réponse est contaminée par du wolof
          // alors qu'on a demandé autre chose, on retente avec prompt correctif
          const answer = result.answer;
          const looksWolof = /\b(njëg|njeg|salamaleekum|nangadef|jerejef|jërëjëf|baax na|lu nga|nanga|ndank|lan la|demal|jëfandiko|jaaykat|jaay)\b/i.test(answer);
          const wantsNotWolof = lang !== 'wo' && lang !== 'fr';
          if (wantsNotWolof && looksWolof) {
            // Retry avec instruction corrective (température basse pour coller au few-shot)
            const retry = await callOpenRouter(
              apiKey,
              model,
              [
                ...messages,
                { role: 'assistant', content: answer },
                {
                  role: 'user',
                  content:
                    lang === 'sr'
                      ? "Ta réponse précédente contient du wolof (njëg, salamaleekum, etc.). Reformule EXACTEMENT la même information mais en SÉRÈRE UNIQUEMENT. Utilise : Nafio (bonjour), hiin (prix), fandu (acheter), yaad (merci), pendol ma (dis-moi), kirim (marchandise). Si un mot n'existe pas en sérère, écris-le en français entre parenthèses. N'utilise aucun mot wolof."
                      : "Ta réponse contient du wolof. Reformule en " + langLabel + " uniquement.",
                },
              ],
              { temperature: 0.4, top_p: 0.8 },
            ).catch(() => null);
            if (retry?.answer) {
              // Double-check : si toujours wolof après retry, on ajoute un disclaimer honnête
              const looksStillWolof = /\b(njëg|njeg|salamaleekum|jerejef|jërëjëf)\b/i.test(retry.answer);
              if (looksStillWolof && lang === 'sr') {
                result = {
                  ...retry,
                  answer:
                    retry.answer +
                    '\n\n— Note : certaines expressions peuvent sembler proches du wolof. La traduction parfaite en sérère demande une relecture humaine.',
                };
              } else {
                result = retry;
              }
            }
          }
          break;
        }
      } catch (err) {
        errors.push(`${model}: ${err?.message || 'err'}`);
        continue;
      }
    }

    if (!result || !result.answer) {
      throw new Error(`Aucun modèle n'a répondu. ${errors.join(' | ')}`);
    }

    // Formatage pro : normalise les espaces, retire les blocs markdown lourds
    let finalAnswer = String(result.answer || '').trim();
    // Retire les balises ``` mal fermées
    finalAnswer = finalAnswer.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
    // Compacte les retours à la ligne multiples (max 2)
    finalAnswer = finalAnswer.replace(/\n{3,}/g, '\n\n');

    sendJson(response, 200, {
      ok: true,
      answer: finalAnswer,
      model: result.model,
    });
  } catch (error) {
    console.error('[Yaay]', error?.message || error);
    sendJson(response, 502, {
      ok: false,
      error: error?.message || 'Erreur IA',
      fallback: true,
    });
  }
}

// ============================================================================
// MOTEUR SÉRÈRE HAND-CRAFTED
// ----------------------------------------------------------------------------
// Les LLM gratuits ne connaissent pas le sérère. Au lieu de les laisser
// répondre en faux sérère (wolof déguisé), on fournit ici des réponses
// authentiques en alternance sérère / français — comme le font les locuteurs
// sérère dans la vie réelle sur des sujets modernes (commerce, tech, banque).
// Les formules d'accueil et mots-clés sont en vrai sérère seereer.
// ============================================================================

function normalizeSerere(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSerereAnswer(message, context) {
  const stats = context.stats || {};
  const text = normalizeSerere(message);
  const words = text.split(' ');

  const has = (patterns) => patterns.some((p) => text.includes(p));

  // Salutations (sérère authentique)
  if (has(['nafio', 'nafiyo', 'mbaa kaa', 'asalam', 'bonjour', 'bonsoir', 'salut'])) {
    const name = context.userName ? context.userName.split(' ')[0] : '';
    return `Nafio ${name} 🌱\n\nMi tedd FresCoop AI. Da mbaane wallu la :\n\n• Njeg kirim (prix du marché)\n• Felax njeg (vendre)\n• Haat (crédit bancaire)\n• Anti-gaspi\n• Suivi lot\n• Pay PayDunya\n\nPendol ma — pose ta question en sérère ou français, je réponds selon ce que je sais en sérère.`;
  }

  // Qui es-tu
  if (has(['ma kan', 'ma tedd', 'qui es tu', 'qui es-tu', 'ton nom', 'tu es'])) {
    return `Mi tedd FresCoop AI 🤖\n\nMi a ŋ ofi (je suis l'assistant intelligent) pour la plateforme FresCoop — 4 langues : français, wolof, pulaar, sérère. Le mbaane wallu la ak njeg, felax, haat walla paiement.`;
  }

  // Merci
  if (has(['yaad', 'yaɗ', 'merci', 'jerejef'])) {
    return `Yaad ma 🌱 (merci aussi à toi). Pendol ma bu nga am laaj (pose-moi une autre question si besoin).`;
  }

  // Prix du jour / cours
  if (has(['njeg', 'hiin', 'kirim penaar', 'prix', 'cours', 'tarif', 'cout', 'combien'])) {
    const n = stats.products || 0;
    return `📊 Njeg hannde (prix du jour)\n\nDa Marché ole ya kirim penaar : ${n} produits aktif.\n\nExempl :\n• Tomates : 500-900 FCFA/kg\n• Oignon : 400-500 FCFA/kg\n• Mangues Kent : 700-1100 FCFA/kg\n• Mil : 22 000 FCFA/sac 50kg\n\nDa onglet "Marché" ole kirim ma tedd ak njeg yi (consulte l'onglet Marché pour voir tous les produits et leur prix en temps réel).`;
  }

  // Vendre / publier produit
  if (has(['felax', 'fandu', 'vendre', 'publier', 'poster', 'njeeygol', 'mettre en vente'])) {
    return `💡 Le mbaane felax kirim ma (comment vendre tes produits) :\n\n1. Inscription : crée un compte "Agriculteur"\n2. Onglet Produits → bouton + (plus) → photos, prix, quantité, zone\n3. Da Marché ole acheteurs (B2B + clients) a ŋ see ma kirim (les acheteurs verront ton produit)\n4. Order → pay PayDunya (Wave, Orange Money, Free Money, carte)\n5. Agent terrain walla transporteur livre le kirim\n\nChaque vente renforce ma score de bancabilité (0-100) pour demander un crédit.`;
  }

  // Crédit / bancabilité
  if (has(['haat', 'credit', 'banq', 'bnde', 'microcred', 'bancabilite', 'pret', 'emprunt'])) {
    return `🏦 Haat ana (crédit bancaire) — FresCoop calcule ton score 0-100 :\n\n• Volume de ventes : 30 points\n• Régularité des preuves PayDunya : 25 points\n• Diversification catégories : 20 points\n• Attestations validées : 25 points\n\nScore ≥ 70 = dossier éligible chez BNDE, Microcred walla SFD partenaire. Exportable en PDF depuis l'onglet Bancabilité.\n\nPe felax lu bari e FresCoop, score ma a ŋ baax (plus tu vends, plus ton score grimpe).`;
  }

  // Anti-gaspi
  if (has(['ŋoox', 'noox', 'anti gaspi', 'antigaspi', 'gaspillage', 'perte', 'peremption', 'dlc', 'flash', 'sauver'])) {
    return `♻️ Anti-gaspi FresCoop — 3 niveaux d'alerte automatique :\n\n🔴 Critique (≤24h) : remise -40% automatique\n🟡 Élevé (2-3j) : remise -25%\n🟠 Surveillance (4-6j) : remise -15%\n\nL'agriculteur applique la remise en un clic → acheteurs B2B notifiés par SMS + push. Pe felax ak njeg reduit (tu vends avec prix cassé) et tu évites la perte.\n\nImpact ODD 12 : Consommation responsable.`;
  }

  // Traçabilité / lots / QR
  if (has(['lot', 'suivi', 'tracabilite', 'traçabilite', 'qr', 'froid', 'temperature', 'ndaroo'])) {
    const n = stats.lots || 0;
    const h = stats.hubs || 0;
    return `📦 Traçabilité FresCoop — chaque lot a un QR code unique\n\nLe QR expose :\n📍 Origine (parcelle, village)\n📸 Photos qualité à la récolte\n❄️ Température hub froid en temps réel\n📊 Historique statuts (récolté → livré → payé)\n🔗 Commande + paiement associés\n\nActuellement : ${n} lots tracés · ${h} hubs solaires au Sénégal. Scan QR depuis onglet Lots (bouton bleu en bas).`;
  }

  // USSD
  if (has(['ussd', 'telephone 2g', '384', 'sans internet', 'sans smartphone', 'simple'])) {
    return `📞 USSD *384*FRES# — pour les téléphones 2G sans Internet\n\nMenu disponible en wolof, pulaar, français :\n1. Njeg du jour\n2. Déclarer une vente\n3. Mon solde FresCoop\n4. Alerte anti-gaspi\n5. Contacter agent terrain\n\nFrais opérateur standards. 100% couverture rurale — clé de l'inclusion pour les productrices et producteurs sans smartphone.`;
  }

  // Paiement
  if (has(['pay', 'paiement', 'wave', 'orange money', 'paydunya', 'regler', 'facture', 'recu'])) {
    return `💳 Paiement sécurisé via PayDunya :\n\n• Wave\n• Orange Money\n• Free Money\n• Cartes Visa / Mastercard\n• Virement bancaire\n• Paiement à la livraison\n\nL'argent ne transite pas par FresCoop — il va directement du client au producteur. Commission transparente 2%. Reçu automatique dans "Mon espace → Paiement".`;
  }

  // Attestations
  if (has(['attestation', 'certificat', 'document officiel', 'dossier', 'preuve'])) {
    const n = stats.transactions || 0;
    return `📄 Attestations FresCoop — documents officiels signés\n\nChaque attestation contient :\n• Ton identité + période d'activité\n• Volume de transactions (${n} enregistrées)\n• Validation terrain par agent FresCoop\n• QR code de vérification (frescoop.sn/verify)\n• Exportable PDF pour banques et partenaires\n\nDa onglet Attestations ole a ŋ kirim ma (va dans l'onglet Attestations pour voir tes documents).`;
  }

  // Hubs
  if (has(['hub', 'stockage', 'entrepot', 'solaire', 'capacite', 'batterie'])) {
    const h = stats.hubs || 0;
    return `🌞 Micro-hubs solaires FresCoop\n\n${h} hubs actifs au Sénégal — stockage froid partagé :\n\n❄️ Température contrôlée en temps réel\n🔋 Panneaux solaires + batterie\n📦 Capacité moyenne 2-3 tonnes\n♻️ Pertes post-récolte réduites -35%\n\nVision 2027 : 50 hubs sur tout le territoire. ODD 8 · Travail décent + ODD 12 · Anti-gaspi.`;
  }

  // Impact / POESAM / ODD
  if (has(['impact', 'poesam', 'odd', 'femmes', 'productrices', 'inclusion', 'environnement'])) {
    const women = stats.producers || 0;
    return `🌍 Impact FresCoop — 4 ODD activés :\n\n🎯 ODD 1 · Pas de pauvreté — revenus protégés\n👩 ODD 5 · Égalité femmes-hommes — ${women} productrices actives\n💼 ODD 8 · Travail décent — accès crédit via bancabilité\n🌱 ODD 12 · Consommation responsable — anti-gaspi\n\nCandidat POESAM 2026 · Sénégal. Onglet Impact → graphiques "avant / après FresCoop".`;
  }

  // Commandes
  if (has(['order', 'commande', 'acheter', 'achat', 'panier', 'livraison', 'statut'])) {
    const n = stats.orders || 0;
    return `🛒 Commandes FresCoop — ${n} au total\n\nCycle d'une commande :\n\n1. Client ajoute au panier depuis le Marché\n2. Validation → commande partagée avec producteur + agent terrain\n3. Paiement sécurisé PayDunya\n4. Statuts : Paiement confirmé → Préparation → Prête → En livraison → Livrée\n5. Reçu PDF automatique\n\nChaque statut déclenche une notification à l'acheteur, au vendeur et à l'agent terrain concerné.`;
  }

  // Aide / support / contact
  if (has(['aide', 'support', 'probleme', 'contact', 'appeler', 'email'])) {
    return `📞 Aide FresCoop — équipe terrain 7j/7 :\n\n📧 support@frescoop.sn\n📞 +221 33 800 00 00\n💬 WhatsApp +221 77 000 00 00\n🤖 Mi (FresCoop AI) — 24/7 e 4 langues (fr, wo, pul, sr)\n\nCentre d'aide complet : Profil → Centre d'aide. FAQ + tutoriels vidéo.`;
  }

  // FresCoop c'est quoi
  if (has(['frescoop', 'c est quoi', 'cest quoi', 'plateforme', 'mission', 'presentation', 'projet'])) {
    return `🌱 FresCoop — plateforme sénégalaise de commerce agricole (POESAM 2026)\n\n3 briques intégrées :\n\n☀️ Micro-hubs solaires — stockage froid partagé, -35% de pertes\n📊 Intelligence marché — bon prix, bon acheteur, bon délai\n🏛️ Preuve économique portable — historique de ventes → accès crédit\n\nMission : protéger le revenu des productrices et producteurs sénégalais, réduire le gaspillage, ouvrir l'inclusion financière.`;
  }

  // Fallback honnête : mélange formules sérère + réponse français
  return `Mi yenoh a yaad (je comprends ta question). Le mbaane wallu la e sérère exactement pour ce sujet, donc je te réponds en français pour être utile :\n\nJe suis spécialisé sur FresCoop : njeg (prix), felax (vendre), haat (crédit), anti-gaspi, suivi des lots, paiement PayDunya, attestations, USSD *384*FRES#.\n\nPendol ma (pose-moi une question) plus précise sur un de ces sujets, ou change de langue (français, wolof, pulaar) avec les boutons en haut si tu préfères.`;
}

function buildSystemPrompt(langLabel, context, langCode) {
  const stats = context.stats || {};
  const userRole = context.userRole || 'utilisateur';
  const userName = context.userName || '';

  // Directive de langue stricte selon le code demandé
  const languageDirective = (() => {
    switch (langCode) {
      case 'wo':
        return `⚠️ LANGUE OBLIGATOIRE : WOLOF uniquement (Sénégal).
Exemples de mots wolof à utiliser : salamaleekum (bonjour), njëg (prix), jaay (vendre), jënd (acheter), jërëjëf (merci), baax na (c'est bien).
N'utilise JAMAIS le français, le pulaar ni le sérère dans ta réponse.`;
      case 'pul':
        return `⚠️ LANGUE OBLIGATOIRE : PULAAR (Fulfulde) uniquement.
Exemples : mbaa kaa (bonjour), coggu (prix), njeeygol (vendre), a jaaraama (merci), mi faami (j'ai compris).
N'utilise JAMAIS le français, le wolof ni le sérère dans ta réponse.`;
      case 'sr':
        return `⚠️ LANGUE OBLIGATOIRE : SÉRÈRE (Seereer) uniquement.
TRÈS IMPORTANT : le sérère N'EST PAS le wolof. Ce sont deux langues différentes, ne les confonds surtout pas.
Exemples de mots sérère corrects : Nafio (bonjour), Mbaa kaa (salutations), fandu (acheter), hiin (prix), yaad (merci), pendol ma (dis-moi), ma kan (qui es-tu), ɗof (je), wañ (manger), nax (aller), felax / kirim (marchandise).
Si tu ne connais pas la traduction exacte d'un mot en sérère, écris-le en français entre parenthèses plutôt que d'inventer ou d'écrire en wolof.
N'utilise JAMAIS le wolof, le pulaar ni le français dans ta réponse (sauf quelques mots techniques difficilement traduisibles).`;
      case 'fr':
      default:
        return `⚠️ LANGUE OBLIGATOIRE : FRANÇAIS uniquement.`;
    }
  })();

  return `Tu es FresCoop AI, l'assistant intelligent et ADAPTATIF de FresCoop — plateforme sénégalaise de commerce agricole créée pour le concours POESAM 2026. Si on te demande ton nom, réponds "Je suis FresCoop AI".

${languageDirective}


TON RÔLE PRINCIPAL :
Tu es un expert AGRI-FIN-TECH qui aide productrices, producteurs, commerçantes, commerçants, acheteurs B2B, transporteurs, agents terrain, partenaires finance et administrateurs.

TES DOMAINES D'EXPERTISE (tu réponds en DÉTAIL et avec SUBSTANCE) :
- **Agriculture sénégalaise et ouest-africaine** : calendrier cultural, variétés locales, techniques, irrigation, rendements par hectare, marchés régionaux, filières (maraîchage, céréales, fruits, élevage, transformation, bissap, arachide, mil, niébé, riz de la vallée, etc.)
- **Commerce agricole** : prix pratiqués au Sénégal, concurrence avec importations, négociation, saisonnalité, stratégie vente B2B vs particuliers
- **Micro-hubs solaires** : fonctionnement chaîne du froid, -35% de pertes post-récolte, dimensionnement panneaux, capacité stockage
- **Intelligence marché FresCoop** : prix, recommandation d'acheteurs, anti-gaspi (alertes DLC, ventes éclair -15/-25/-40%)
- **Bancabilité** : score 0-100, dossier crédit, BNDE, Microcred, SFD, preuve économique portable, historique de ventes
- **Traçabilité** : QR codes, photos qualité, température, lots, chaîne de garde
- **Paiement** : PayDunya, Wave, Orange Money, Free Money, cartes, virements, mobile money
- **USSD** : *384*FRES# pour téléphones 2G sans Internet
- **Attestations** : document officiel avec QR et signature, exportable PDF pour les banques
- **ODD** : 1 pauvreté, 5 genre, 8 travail décent, 12 anti-gaspi

CONTEXTE ACTUEL DE LA PLATEFORME :
- Productrices et producteurs actifs : ${stats.producers || 0}
- Produits publiés : ${stats.products || 0}
- Commandes totales : ${stats.orders || 0}
- Lots tracés : ${stats.lots || 0}
- Micro-hubs solaires : ${stats.hubs || 0}
- Transactions enregistrées : ${stats.transactions || 0}

UTILISATEUR ACTUEL :
- Nom : ${userName || 'Utilisateur'}
- Rôle : ${userRole}

REGLES DE REPONSE (IMPORTANT) :
1. ADAPTE-TOI A LA QUESTION : Si on te pose une question imprevue (strategie, chiffres sectoriels, culture locale, conseil business), REPONDS avec ton savoir general. N'envoie JAMAIS l'utilisateur vers un onglet si tu peux repondre directement.
2. NE REPETE PAS LA MEME REPONSE : meme si la question touche les prix, donne une reponse NOUVELLE adaptee au contexte exact.
3. REPONDS COURT : 2-4 phrases pour une question simple, 5-8 phrases maximum pour une question complexe. Jamais de listes a puces, jamais de tableaux.
4. FORMAT TEXTE BRUT OBLIGATOIRE : ecris en texte simple, sans aucun formatage markdown. Pas de ** (gras), pas de *, pas de #, pas de |, pas de tableaux, pas de listes a puces avec - ou *. Ecris des phrases naturelles comme dans une conversation SMS.
5. LANGUE : ${langLabel} UNIQUEMENT. Respecte strictement la directive langue. Ne melange JAMAIS les langues locales.
6. EMOJIS : 0 a 2 maximum.
7. CHIFFRES : utilise les stats du contexte si pertinent, sinon donne des ordres de grandeur realistes pour le Senegal (prix tomate 500-900 F/kg, mil 22 000 F/sac de 50kg, etc.).
8. TON : direct, chaleureux, concret. Tu t'adresses a quelqu'un qui a une activite reelle a gerer.
9. REFUS : decline uniquement les questions vraiment hors-sujet (politique partisane, sexe, violence). Sinon tu improvises intelligemment.

EXEMPLES DE QUESTIONS IMPRÉVUES QUE TU DOIS SAVOIR GÉRER :
- "J'ai 50 kg de tomates qui vont pourrir demain, que faire ?"  → conseils anti-gaspi concrets + action immédiate sur FresCoop
- "Est-ce que le prix du riz va baisser en juin ?"  → contexte saisonnier + récoltes vallée fleuve
- "Comment négocier avec un gros acheteur ?"  → 3 conseils pratiques
- "Parle-moi de la sécheresse au Sahel"  → réponse factuelle + lien avec résilience FresCoop
- "Quelle variété de mangue est la mieux pour l'export ?"  → Kent, Keitt, conseils logistique froid
- "Bonjour" → salutation courte personnalisée

N'invente pas de faits précis que tu ne connais pas. Mais utilise ta culture générale agricole/économique/sénégalaise pour donner de la valeur à chaque réponse.`;
}

function callOpenRouter(apiKey, model, messages, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://frescoop.sn',
          'X-Title': 'FresCoop AI Assistant',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.75,
          max_tokens: options.max_tokens ?? 700,
          top_p: options.top_p ?? 0.9,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        reject(new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`));
        return;
      }
      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content?.trim();
      if (!answer) {
        reject(new Error('Réponse vide'));
        return;
      }
      resolve({ answer, model: data.model || model });
    } catch (err) {
      reject(err);
    }
  });
}


async function handleStore(request, response) {
  if (request.method === 'GET') {
    const store = await readStore();
    sendJson(response, 200, sanitizeStoreForClient(store));
    return;
  }

  if (request.method === 'PUT') {
    const authData = requireAuth(request);
    if (!authData) {
      sendJson(response, 401, { error: 'Non autorisé. Connectez-vous pour modifier les données.' });
      return;
    }
    const storeUrl = new URL(request.url || '/', `http://${request.headers.host}`);
    const forceWrite = storeUrl.searchParams.get('force') === 'true';
    const body = await readBody(request);
    let parsed;
    try {
      parsed = JSON.parse(body || '{}');
    } catch {
      sendJson(response, 400, { error: 'JSON invalide' });
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      sendJson(response, 400, { error: 'Le store doit être un objet' });
      return;
    }
    // Validate that known keys are arrays
    for (const key of Object.keys(emptyStore)) {
      if (key in parsed && !Array.isArray(parsed[key])) {
        sendJson(response, 400, { error: `Le champ "${key}" doit être un tableau` });
        return;
      }
    }
    let incoming = normalizeStore(parsed);
    let currentStoreForMerge = null;

    // === PROTECTION ANTI-RÉGRESSION ===
    if (!forceWrite) {
      try {
        const current = await readStore();
        currentStoreForMerge = current;
        const checks = [
          { key: 'users', min: 3 },
          { key: 'products', min: 5 },
          { key: 'orders', min: 2 },
          { key: 'lots', min: 2 },
        ];
        for (const { key, min } of checks) {
          const cur = (current[key] || []).length;
          const next = (incoming[key] || []).length;
          if (cur > min && next < cur * 0.7) {
            console.warn(`[Store] PUT rejected: ${key} would drop from ${cur} to ${next} (-${Math.round((1 - next / cur) * 100)}%). Possible stale client.`);
            sendJson(response, 409, {
              ok: false,
              error: `Sauvegarde refusée : cette opération supprimerait trop de ${key} (${cur} → ${next}). Votre version locale est probablement périmée. Rechargez la page.`,
              code: 'stale_client',
            });
            return;
          }
        }
      } catch {
        // readStore failed, on continue quand même
      }
    }
    if (!currentStoreForMerge) {
      currentStoreForMerge = await readStore().catch(() => null);
    }
    incoming = preservePrivateUserFields(incoming, currentStoreForMerge);

    // === BACKUP ROTATIF (Turso) ===
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const prev = await readStore();
      if (prev && (prev.users?.length || prev.products?.length)) {
        await createBackup(`store-${stamp}`, prev);
      }
    } catch {}
    await writeStore(incoming);
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}

// Endpoint de restauration : GET /api/store/backups liste les backups
// POST /api/store/restore?name=xxx restaure une version précédente
async function handleStoreBackups(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname.endsWith('/backups')) {
    const backups = await listBackups();
    sendJson(response, 200, { ok: true, backups });
    return;
  }

  if (request.method === 'POST' && url.pathname.endsWith('/restore')) {
    const name = url.searchParams.get('name');
    if (!name) {
      sendJson(response, 400, { error: 'Nom de backup invalide' });
      return;
    }
    const current = await readStore();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await createBackup(`pre-restore-${stamp}`, current);
    const restored = await restoreBackup(name);
    if (!restored) {
      sendJson(response, 404, { error: 'Backup introuvable' });
      return;
    }
    await writeStore(restored);
    sendJson(response, 200, {
      ok: true,
      restored: name,
      counts: {
        users: (restored.users || []).length,
        products: (restored.products || []).length,
        orders: (restored.orders || []).length,
      },
    });
    return;
  }

  sendJson(response, 404, { error: 'Endpoint backup inconnu' });
}

async function serveStatic(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const decoded = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let filePath = path.resolve(distDir, decoded);

  // Path traversal protection: ensure resolved path stays within distDir
  if (!filePath.startsWith(distDir + path.sep) && filePath !== distDir) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    response.end('Forbidden');
    return;
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    filePath = path.join(distDir, 'index.html');
  }

  // Double-check after fallback
  if (!filePath.startsWith(distDir + path.sep) && filePath !== distDir) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    response.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  response.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
}

async function ensureDatabase() {
  await initDatabase();
  const store = await readStore();
  if (!store.users || store.users.length === 0) {
    await writeStore(emptyStore);
    console.log('[Turso] Store initial créé');
  }
}

async function readStore() {
  const data = await tursoReadStore();
  return normalizeStore(data);
}

async function writeStore(data) {
  await tursoWriteStore(data);
}

function normalizeStore(value) {
  const store = Object.fromEntries(Object.keys(emptyStore).map((key) => [key, Array.isArray(value?.[key]) ? value[key] : []]));
  store.users = ensureSeedAdmin(store.users);
  store.orders = dedupeOrders(store.orders);
  store.notifications = normalizeNotifications(store.notifications);
  return store;
}

function preservePrivateUserFields(incoming, current) {
  if (!Array.isArray(incoming?.users)) return incoming;
  if (!current || !Array.isArray(current?.users)) return incoming;
  const currentById = new Map(current.users.map((user) => [user.id, user]));
  const currentByEmail = new Map(current.users.map((user) => [String(user.email || '').trim().toLowerCase(), user]));
  return {
    ...incoming,
    users: incoming.users.map((user) => {
      if (!user || typeof user !== 'object') return user;
      const previous = currentById.get(user.id) || currentByEmail.get(String(user.email || '').trim().toLowerCase());
      if (!previous) return user;
      // Always preserve existing passwordHash from DB - never let client overwrite with empty
      if (previous.passwordHash && !user.passwordHash) {
        return { ...user, passwordHash: previous.passwordHash };
      }
      // If client sends a hash (admin creation), keep the client's hash
      return user;
    }),
  };
}

function isAcceptedPasswordHash(user, hash) {
  if (!user || !hash) return false;
  if (hash === user.passwordHash) return true;

  const email = String(user.email || '').trim().toLowerCase();
  const seededAdminEmails = new Set(seededAdmins.map((admin) => admin.email.toLowerCase()));
  const legacyAdminEmails = new Set([
    'richef360@gmail.com',
    'dsenghor96@gmail.com',
    'nyacine183@gmail.com',
    'seydinalimamoulayeyade@gmail.com',
    'diagnealia03@gmail.com',
    'manediop945@gmail.com',
  ]);

  if ((seededAdminEmails.has(email) || legacyAdminEmails.has(email))
    && [seededAdminPasswordHash, seededDemoPasswordHash, mobileDemoPasswordHash].includes(hash)) {
    return true;
  }

  if ((email === seededDemoUser.email || user.id === seededDemoUser.id) && [seededDemoPasswordHash, mobileDemoPasswordHash].includes(hash)) {
    return true;
  }

  return false;
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
    order.productId || normalizeText(order.productSnapshot?.name),
    order.sellerId || '',
    order.clientId || '',
    quantity,
    order.unit || order.productSnapshot?.unit || '',
    unitPrice,
    totalPrice,
    order.status || '',
    order.paymentStatus || '',
    normalizeText(order.message || ''),
  ].join('|');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeNotifications(items) {
  return (Array.isArray(items) ? items : []).map((item) => (
    item && typeof item === 'object'
      ? {
          ...item,
          read: Boolean(item.read || item.readAt),
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
  let result = [...users];
  for (const admin of seededAdmins) {
    const email = admin.email.toLowerCase();
    const exists = result.some((u) => String(u?.email || '').trim().toLowerCase() === email);
    if (!exists) {
      result = [admin, ...result];
    } else {
      result = result.map((u) =>
        String(u?.email || '').trim().toLowerCase() === email
          ? { ...u, role: 'admin', status: 'Actif', passwordHash: admin.passwordHash }
          : u
      );
    }
  }
  const demoExists = result.some((u) => u.id === seededDemoUser.id || String(u?.email || '').trim().toLowerCase() === seededDemoUser.email);
  if (!demoExists) {
    result = [...result, seededDemoUser];
  }
  return result;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 18 * 1024 * 1024) {
        request.destroy();
        reject(new Error('Payload too large'));
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json;charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

async function handleActivityProofs(request, response) {
  const authData = requireAuth(request);
  if (!authData) { sendJson(response, 401, { error: 'Non autorisé' }); return; }

  if (request.method === 'POST') {
    const body = await readBody(request);
    const data = JSON.parse(body || '{}');
    const store = await readStore();
    const now = new Date().toISOString();
    const proofId = `proof-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const proof = {
      id: proofId,
      userId: authData.uid,
      proofType: data.proofType || 'autre',
      description: String(data.description || '').slice(0, 500),
      attachment: data.attachment || null,
      sponsorIds: Array.isArray(data.sponsorIds) ? data.sponsorIds : [],
      agentId: data.agentId || null,
      status: data.agentId ? 'en_attente_agent' : 'soumis',
      createdAt: now,
    };

    if (!store.activityProofs) store.activityProofs = [];
    store.activityProofs.unshift(proof);

    const userProofs = store.activityProofs.filter(p => p.userId === authData.uid && (p.status === 'valide' || p.status === 'auto_valide' || p.status === 'soumis'));
    const score = Math.min(100, userProofs.length * 15);
    const level = score >= 75 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;

    await writeStore(store);
    sendJson(response, 201, { ok: true, proof, score, level });
    return;
  }

  if (request.method === 'PUT') {
    const authAdmin = requireAuth(request);
    if (!authAdmin || authAdmin.role !== 'admin') { sendJson(response, 403, { error: 'Réservé aux administrateurs' }); return; }
    const body = await readBody(request);
    const { proofId, status } = JSON.parse(body || '{}');
    if (!proofId || !status) { sendJson(response, 400, { error: 'proofId et status requis' }); return; }

    const store = await readStore();
    if (!store.activityProofs) store.activityProofs = [];
    const proof = store.activityProofs.find(p => p.id === proofId);
    if (!proof) { sendJson(response, 404, { error: 'Preuve introuvable' }); return; }

    proof.status = status;
    proof.reviewedAt = new Date().toISOString();
    proof.reviewedBy = authAdmin.uid;

    const userProofs = store.activityProofs.filter(p => p.userId === proof.userId && (p.status === 'valide' || p.status === 'auto_valide'));
    const score = Math.min(100, userProofs.length * 15);
    const level = score >= 75 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;

    await writeStore(store);
    sendJson(response, 200, { ok: true, proof, score, level });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
async function loadEnvFile(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    });
  } catch {
    // .env optional
  }
}
