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

const DRIVER = (process.env.STORAGE_DRIVER || 'json').toLowerCase();

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

export async function initStore() {
  if (DRIVER === 'mysql') {
    db = await import('./db.js');
    await db.assertConnection();
    await db.initSchema();
    for (const name of ARRAY_NAMES) {
      cache[name] = await db.loadArray(name);
    }
    for (const name of SINGLETON_NAMES) {
      cache[name] = await db.loadSingleton(name);
    }
    console.log('🗄️  Storage driver: MySQL');
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
  if (DRIVER === 'mysql') {
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
  if (DRIVER === 'mysql') {
    db.saveSingleton(name, value);
  } else {
    writeJsonFile(FILE_FOR[name], value);
  }
  return cache[name];
}

// Wait for any pending async writes (mysql only). No-op for JSON.
export async function flushStore() {
  if (DRIVER === 'mysql' && db) {
    await db.flush();
  }
}
