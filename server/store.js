// Unified storage abstraction for Fibax Pharma.
//
// Two interchangeable backends selected by the STORAGE_DRIVER env var:
//   - "json"  (default): read/write local JSON files under server/data.
//               No database required — ideal for local development.
//   - "mysql":           persist to a MySQL database (used in production
//               on Hostinger). Data is loaded into an in-memory cache at
//               startup; every save updates the cache and is written
//               through to MySQL.
//
// Route handlers use the synchronous getters/setters below and never need
// to know which backend is active. Call `await initStore()` once at boot
// before serving requests.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Normalize driver aliases: json | mysql | postgres
function normalizeDriver(raw) {
  const d = (raw || 'json').toLowerCase();
  if (d === 'supabase' || d === 'pg' || d === 'postgresql') return 'postgres';
  return d;
}
const DRIVER = normalizeDriver(process.env.STORAGE_DRIVER);

const ARRAY_NAMES = ['products', 'orders', 'users', 'enquiries'];
const SINGLETON_NAMES = ['admin_auth', 'shipping_config'];

const dataDir = join(__dirname, 'data');
const FILE_FOR = {
  products: join(dataDir, 'products.json'),
  orders: join(dataDir, 'orders.json'),
  users: join(dataDir, 'users.json'),
  enquiries: join(dataDir, 'enquiries.json'),
  admin_auth: join(dataDir, 'admin_auth.json'),
  shipping_config: join(dataDir, 'shipping_config.json')
};

// In-memory cache. Arrays default to []; singletons default to null.
const cache = {
  products: [],
  orders: [],
  users: [],
  enquiries: [],
  admin_auth: null,
  shipping_config: null
};

let db = null; // lazily imported mysql module when driver === 'mysql'

export function storageDriver() {
  return DRIVER;
}

function ensureDataDir() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
}

function readJsonFile(file, fallback) {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
    return fallback;
  }
}

function writeJsonFile(file, value) {
  try {
    ensureDataDir();
    writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
  }
}

const DB_DRIVERS = ['mysql', 'postgres'];

function loadFromJsonFiles() {
  ensureDataDir();
  for (const name of ARRAY_NAMES) {
    cache[name] = readJsonFile(FILE_FOR[name], []);
  }
  for (const name of SINGLETON_NAMES) {
    cache[name] = readJsonFile(FILE_FOR[name], null);
  }
}

// When the Supabase REST credentials are present, prefer the HTTPS REST
// driver (supabase.js) over a direct Postgres socket connection (pg.js),
// since shared hosting often blocks outbound DB ports.
function pickDbModule() {
  if (DRIVER === 'postgres' && process.env.SUPABASE_URL && process.env.SUPABASE_API_KEY) {
    return './supabase.js';
  }
  return DRIVER === 'postgres' ? './pg.js' : './db.js';
}

export async function initStore() {
  if (DB_DRIVERS.includes(DRIVER)) {
    try {
      const modulePath = pickDbModule();
      db = await import(modulePath);
      await db.assertConnection();
      await db.initSchema();
      for (const name of ARRAY_NAMES) {
        cache[name] = await db.loadArray(name);
      }
      for (const name of SINGLETON_NAMES) {
        cache[name] = await db.loadSingleton(name);
      }
      const label =
        modulePath === './supabase.js' ? 'Supabase (REST)' :
        DRIVER === 'postgres' ? 'PostgreSQL (Supabase)' : 'MySQL';
      console.log(`🗄️  Storage driver: ${label}`);
      return;
    } catch (err) {
      // Do not crash the whole app on a DB problem — fall back to JSON files so
      // the site stays up, and log loudly so the misconfig is obvious.
      db = null;
      console.error(`❌ Database (${DRIVER}) init failed: ${err.message}`);
      console.error('⚠️  Falling back to JSON file storage so the app stays online.');
      console.error('   Data will NOT be saved to the database until STORAGE_DRIVER / DATABASE_URL are fixed.');
    }
  }

  loadFromJsonFiles();
  console.log('🗄️  Storage driver: JSON files');
}

export function getArray(name) {
  return cache[name] || [];
}

export function setArray(name, arr) {
  cache[name] = Array.isArray(arr) ? arr : [];
  if (db) {
    db.saveArray(name, cache[name]);
  } else {
    writeJsonFile(FILE_FOR[name], cache[name]);
  }
  return cache[name];
}

export function getSingleton(name) {
  return cache[name];
}

export function setSingleton(name, value) {
  cache[name] = value;
  if (db) {
    db.saveSingleton(name, value);
  } else {
    writeJsonFile(FILE_FOR[name], value);
  }
  return cache[name];
}

// Wait for any pending async writes (database backends only). No-op for JSON.
export async function flushStore() {
  if (db) {
    await db.flush();
  }
}

// Close the underlying DB pool (used by scripts so the process can exit).
export async function closeStore() {
  if (db && typeof db.closePool === 'function') {
    await db.closePool();
  }
}
