// PostgreSQL / Supabase data access layer for Fibax Pharma.
//
// Mirrors the API of db.js (MySQL) so the storage layer (store.js) can use
// either backend interchangeably. Data lives in a single generic
// `collections` table: each array element is one row keyed by its natural id,
// with ordering preserved by the `position` column. The document itself is
// stored in a JSONB column, so it stays queryable from SQL and the Supabase
// dashboard.

import pg from 'pg';

const { Pool } = pg;

let pool = null;

export const ARRAY_COLLECTIONS = ['products', 'orders', 'users', 'enquiries'];
export const SINGLETON_COLLECTIONS = ['admin_auth', 'shipping_config'];

const KEY_FIELD = {
  products: 'id',
  orders: 'orderId',
  users: 'id',
  enquiries: 'id'
};

const SINGLETON_KEY = '_singleton';

// Serialize all writes so concurrent saves cannot interleave.
let writeChain = Promise.resolve();
function enqueueWrite(task) {
  writeChain = writeChain.then(task).catch((err) => {
    console.error('❌ PostgreSQL write error:', err.message);
  });
  return writeChain;
}

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      pool = new Pool({
        connectionString,
        // Supabase requires SSL; its cert chain is not always in the local
        // trust store, so relax verification (connection is still encrypted).
        ssl: { rejectUnauthorized: false },
        max: Number(process.env.DB_POOL_LIMIT || 5)
      });
    } else {
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
        max: Number(process.env.DB_POOL_LIMIT || 5),
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
      });
    }
  }
  return pool;
}

export async function initSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS collections (
      collection TEXT        NOT NULL,
      item_id    TEXT        NOT NULL,
      position   INTEGER     NOT NULL DEFAULT 0,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (collection, item_id)
    );
  `);
  await p.query(
    'CREATE INDEX IF NOT EXISTS idx_collections_position ON collections (collection, position);'
  );
}

export async function assertConnection() {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

function parseData(value) {
  // node-postgres returns JSONB already parsed; guard for string just in case.
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export async function loadArray(name) {
  const p = getPool();
  const { rows } = await p.query(
    'SELECT data FROM collections WHERE collection = $1 ORDER BY position ASC',
    [name]
  );
  return rows.map((r) => parseData(r.data)).filter((v) => v !== null);
}

export async function loadSingleton(name) {
  const p = getPool();
  const { rows } = await p.query(
    'SELECT data FROM collections WHERE collection = $1 AND item_id = $2 LIMIT 1',
    [name, SINGLETON_KEY]
  );
  if (!rows.length) return null;
  return parseData(rows[0].data);
}

function keyFor(name, item, index) {
  const field = KEY_FIELD[name];
  const raw = field && item && item[field] != null ? item[field] : null;
  return String(raw != null ? raw : index);
}

export function saveArray(name, arr) {
  const items = Array.isArray(arr) ? arr : [];
  return enqueueWrite(async () => {
    const p = getPool();
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM collections WHERE collection = $1', [name]);
      if (items.length) {
        const placeholders = [];
        const params = [];
        items.forEach((item, i) => {
          const base = i * 4;
          placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}::jsonb)`);
          params.push(name, keyFor(name, item, i), i, JSON.stringify(item));
        });
        await client.query(
          `INSERT INTO collections (collection, item_id, position, data) VALUES ${placeholders.join(', ')}`,
          params
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });
}

export function saveSingleton(name, obj) {
  return enqueueWrite(async () => {
    const p = getPool();
    await p.query(
      `INSERT INTO collections (collection, item_id, position, data)
       VALUES ($1, $2, 0, $3::jsonb)
       ON CONFLICT (collection, item_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [name, SINGLETON_KEY, JSON.stringify(obj ?? {})]
    );
  });
}

export function flush() {
  return writeChain;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
