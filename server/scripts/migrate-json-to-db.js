// One-time migration: import existing JSON data files into the configured
// database (MySQL or PostgreSQL/Supabase), selected by STORAGE_DRIVER.
//
// Usage (from the server/ directory, with the DB env vars set):
//   npm run migrate
//   # or: node scripts/migrate-json-to-db.js
//
// It reads server/data/*.json and writes each collection through the storage
// layer. Safe to re-run: each collection is fully replaced.

import 'dotenv/config';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  initStore,
  storageDriver,
  setArray,
  setSingleton,
  flushStore,
  closeStore
} from '../store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');

const ARRAY_FILES = {
  products: 'products.json',
  orders: 'orders.json',
  users: 'users.json',
  enquiries: 'enquiries.json'
};

const SINGLETON_FILES = {
  admin_auth: 'admin_auth.json',
  shipping_config: 'shipping_config.json'
};

function readJson(file, fallback) {
  const full = join(dataDir, file);
  if (!existsSync(full)) {
    console.log(`   (skip) ${file} not found`);
    return fallback;
  }
  try {
    return JSON.parse(readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`   Error parsing ${file}:`, err.message);
    return fallback;
  }
}

async function run() {
  console.log(`🔌 Initializing storage (driver: ${storageDriver()})...`);
  await initStore();

  if (storageDriver() === 'json') {
    console.log('\n⚠️  STORAGE_DRIVER is "json" — nothing to migrate.');
    console.log('   Set STORAGE_DRIVER=postgres (or mysql) and DB creds, then re-run.');
    await closeStore();
    return;
  }

  console.log('\n📦 Migrating array collections:');
  for (const [name, file] of Object.entries(ARRAY_FILES)) {
    const arr = readJson(file, []);
    setArray(name, Array.isArray(arr) ? arr : []);
    console.log(`   ${name}: ${Array.isArray(arr) ? arr.length : 0} records`);
  }

  console.log('\n⚙️  Migrating singletons:');
  for (const [name, file] of Object.entries(SINGLETON_FILES)) {
    const obj = readJson(file, null);
    if (obj) {
      setSingleton(name, obj);
      console.log(`   ${name}: migrated`);
    } else {
      console.log(`   ${name}: none to migrate`);
    }
  }

  await flushStore();
  await closeStore();
  console.log('\n🎉 Migration complete.');
}

run().catch(async (err) => {
  console.error('\n❌ Migration failed:', err.message);
  try { await closeStore(); } catch { /* ignore */ }
  process.exit(1);
});
