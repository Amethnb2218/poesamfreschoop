import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let url = process.env.TURSO_DATABASE_URL;
let authToken = process.env.TURSO_AUTH_TOKEN;

// En production, l'absence d'URL reste une erreur fatale : mieux vaut refuser
// de démarrer que d'écrire dans une base locale éphémère à l'insu de tous.
// En développement, on retombe sur un fichier SQLite local — @libsql/client
// accepte les URL `file:` avec exactement la même API, donc le reste de ce
// module est inchangé. Cela permet de lancer le projet sans identifiants cloud.
if (!url) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Turso] TURSO_DATABASE_URL non définie — impossible de démarrer');
    process.exit(1);
  }

  const dataDir = path.join(__dirname, 'data');
  mkdirSync(dataDir, { recursive: true });
  url = `file:${path.join(dataDir, 'frescoop.db')}`;
  authToken = undefined;
  console.warn('[DB] TURSO_DATABASE_URL non définie — mode développement sur SQLite local (server/data/frescoop.db).');
  console.warn('[DB] Renseignez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN dans .env pour utiliser la base partagée.');
}

const client = createClient({ url, authToken });

const COLLECTIONS = [
  'users', 'products', 'dossiers', 'attestations', 'transactions',
  'proofs', 'hubs', 'orders', 'messages', 'notifications',
  'cooperatives', 'crates', 'lots', 'lotPhotos', 'sensorDevices',
  'sensorReadings', 'qualityAssessments', 'buyers', 'buyerOrders',
  'reservations', 'dispatches', 'paymentRecords', 'payoutRecords',
  'consentRecords', 'economicProfiles', 'partnerOffers', 'alerts',
  'auditLogs', 'kpiAggregates', 'loans', 'surveyLeads',
  'activityProofs', 'ratings', 'loanRepayments', 'cashbackRecords',
];

export async function initDatabase() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS store (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (collection, id)
    )
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_store_collection ON store(collection)
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS backups (
      name TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('[Turso] Base initialisée');
}

let storeCache = null;
let cacheAge = 0;

export async function readStore() {
  if (storeCache && (Date.now() - cacheAge < 5000)) {
    return storeCache;
  }
  const result = await client.execute('SELECT collection, id, data FROM store');
  const store = Object.fromEntries(COLLECTIONS.map(c => [c, []]));
  for (const row of result.rows) {
    const col = row.collection;
    if (store[col]) {
      try {
        store[col].push(JSON.parse(row.data));
      } catch {}
    }
  }
  storeCache = store;
  cacheAge = Date.now();
  return store;
}

export function invalidateCache() {
  storeCache = null;
}

export async function writeStore(data) {
  const batch = [];
  batch.push({ sql: 'DELETE FROM store', args: [] });
  for (const col of COLLECTIONS) {
    const items = Array.isArray(data[col]) ? data[col] : [];
    for (const item of items) {
      const id = item.id || item._id || `${col}-${Math.random().toString(36).slice(2)}`;
      batch.push({
        sql: 'INSERT INTO store (collection, id, data) VALUES (?, ?, ?)',
        args: [col, id, JSON.stringify(item)],
      });
    }
  }
  await client.batch(batch, 'write');
  storeCache = data;
  cacheAge = Date.now();
}

export async function upsertItem(collection, item) {
  const id = item.id || item._id;
  if (!id) return;
  await client.execute({
    sql: 'INSERT OR REPLACE INTO store (collection, id, data, updated_at) VALUES (?, ?, ?, datetime(\'now\'))',
    args: [collection, id, JSON.stringify(item)],
  });
  invalidateCache();
}

export async function upsertItems(collection, items) {
  if (!items.length) return;
  const batch = items.map(item => ({
    sql: 'INSERT OR REPLACE INTO store (collection, id, data, updated_at) VALUES (?, ?, ?, datetime(\'now\'))',
    args: [collection, item.id || item._id, JSON.stringify(item)],
  }));
  await client.batch(batch, 'write');
  invalidateCache();
}

export async function createBackup(name, storeData) {
  await client.execute({
    sql: 'INSERT OR REPLACE INTO backups (name, data) VALUES (?, ?)',
    args: [name, JSON.stringify(storeData)],
  });
  // Keep only 10 most recent
  await client.execute(`
    DELETE FROM backups WHERE name NOT IN (
      SELECT name FROM backups ORDER BY created_at DESC LIMIT 10
    )
  `);
}

export async function listBackups() {
  const result = await client.execute(
    'SELECT name, created_at, length(data) as size FROM backups ORDER BY created_at DESC'
  );
  return result.rows.map(r => ({
    name: r.name,
    createdAt: r.created_at,
    size: r.size,
  }));
}

export async function restoreBackup(name) {
  const result = await client.execute({
    sql: 'SELECT data FROM backups WHERE name = ?',
    args: [name],
  });
  if (!result.rows.length) return null;
  return JSON.parse(result.rows[0].data);
}
