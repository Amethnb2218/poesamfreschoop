import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('[Turso] TURSO_DATABASE_URL non définie — impossible de démarrer');
  process.exit(1);
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

export async function readStore() {
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
  return store;
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
