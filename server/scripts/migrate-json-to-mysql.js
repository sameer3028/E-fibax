// One-time migration: import existing JSON data files into MySQL.
//
// Usage (from the server/ directory, with DB_* env vars set):
//   node scripts/migrate-json-to-mysql.js
//
// It reads server/data/*.json and writes each collection into the MySQL
// `collections` table. Safe to re-run: each collection is fully replaced.

import 'dotenv/config';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  assertConnection,
  initSchema,
  saveArray,
  saveSingleton,
  flush,
  closePool
} from '../db.js';

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
  console.log('🔌 Connecting to MySQL...');
  await assertConnection();
  await initSchema();
  console.log('✅ Connected. Schema ready.\n');

  console.log('📦 Migrating array collections:');
  for (const [name, file] of Object.entries(ARRAY_FILES)) {
    const arr = readJson(file, []);
    saveArray(name, Array.isArray(arr) ? arr : []);
    console.log(`   ${name}: ${Array.isArray(arr) ? arr.length : 0} records`);
  }

  console.log('\n⚙️  Migrating singletons:');
  for (const [name, file] of Object.entries(SINGLETON_FILES)) {
    const obj = readJson(file, null);
    if (obj) {
      saveSingleton(name, obj);
      console.log(`   ${name}: migrated`);
    } else {
      console.log(`   ${name}: none to migrate`);
    }
  }

  await flush();
  await closePool();
  console.log('\n🎉 Migration complete.');
}

run().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
