// MySQL data access layer for Fibax Pharma.
//
// Data is stored in a single generic `collections` table so the existing
// JSON-document shapes (products, orders, users, enquiries, and the
// admin/shipping singletons) can be persisted without a rigid schema.
// Each array element is one row keyed by its natural id; ordering is
// preserved via the `position` column so list order (newest-first, etc.)
// survives a reload.

import mysql from 'mysql2/promise';

let pool = null;

// Names that are stored as an ordered array of documents.
export const ARRAY_COLLECTIONS = ['products', 'orders', 'users', 'enquiries'];
// Names that are stored as a single document.
export const SINGLETON_COLLECTIONS = ['admin_auth', 'shipping_config'];

// Natural key field per array collection (used as the row's item_id).
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
    console.error('❌ MySQL write error:', err.message);
  });
  return writeChain;
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fibax',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 5),
      queueLimit: 0,
      charset: 'utf8mb4',
      // Ensure JSON columns come back as parsed objects.
      supportBigNumbers: true
    });
  }
  return pool;
}

export async function initSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS collections (
      collection VARCHAR(64)  NOT NULL,
      item_id    VARCHAR(191) NOT NULL,
      position   INT          NOT NULL DEFAULT 0,
      data       JSON         NOT NULL,
      updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (collection, item_id),
      KEY idx_collection_position (collection, position)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// Verify connectivity; throws if the database is unreachable.
export async function assertConnection() {
  const p = getPool();
  const conn = await p.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}

function parseRow(row) {
  // mysql2 returns JSON columns already parsed, but guard against string.
  if (typeof row.data === 'string') {
    try {
      return JSON.parse(row.data);
    } catch {
      return null;
    }
  }
  return row.data;
}

export async function loadArray(name) {
  const p = getPool();
  const [rows] = await p.query(
    'SELECT data FROM collections WHERE collection = ? ORDER BY position ASC',
    [name]
  );
  return rows.map(parseRow).filter((v) => v !== null);
}

export async function loadSingleton(name) {
  const p = getPool();
  const [rows] = await p.query(
    'SELECT data FROM collections WHERE collection = ? AND item_id = ? LIMIT 1',
    [name, SINGLETON_KEY]
  );
  if (!rows.length) return null;
  return parseRow(rows[0]);
}

function keyFor(name, item, index) {
  const field = KEY_FIELD[name];
  const raw = field && item && item[field] != null ? item[field] : null;
  return String(raw != null ? raw : index);
}

// Replace the entire contents of an array collection in a single transaction.
export function saveArray(name, arr) {
  const items = Array.isArray(arr) ? arr : [];
  return enqueueWrite(async () => {
    const p = getPool();
    const conn = await p.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM collections WHERE collection = ?', [name]);
      if (items.length) {
        const values = items.map((item, i) => [
          name,
          keyFor(name, item, i),
          i,
          JSON.stringify(item)
        ]);
        await conn.query(
          'INSERT INTO collections (collection, item_id, position, data) VALUES ?',
          [values]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  });
}

export function saveSingleton(name, obj) {
  return enqueueWrite(async () => {
    const p = getPool();
    await p.query(
      `INSERT INTO collections (collection, item_id, position, data)
       VALUES (?, ?, 0, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [name, SINGLETON_KEY, JSON.stringify(obj ?? {})]
    );
  });
}

// Wait for all queued writes to finish (used by scripts and graceful shutdown).
export function flush() {
  return writeChain;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
