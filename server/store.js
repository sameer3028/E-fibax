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

export async function initStore() {
  if (DB_DRIVERS.includes(DRIVER)) {
    db = await import(DRIVER === 'postgres' ? './pg.js' : './db.js');
    await db.assertConnection();
    await db.initSchema();
    for (const name of ARRAY_NAMES) {
      cache[name] = await db.loadArray(name);
    }
    for (const name of SINGLETON_NAMES) {
      cache[name] = await db.loadSingleton(name);
    }
    console.log(`🗄️  Storage driver: ${DRIVER === 'postgres' ? 'PostgreSQL (Supabase)' : 'MySQL'}`);
  } else {
    ensureDataDir();
    for (const name of ARRAY_NAMES) {
      cache[name] = readJsonFile(FILE_FOR[name], []);
    }
    for (const name of SINGLETON_NAMES) {
      cache[name] = readJsonFile(FILE_FOR[name], null);
    }
    console.log('🗄️  Storage driver: JSON files');
  }
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
