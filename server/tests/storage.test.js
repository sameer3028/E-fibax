import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initStore, getArray, setArray, getSingleton, setSingleton, storageDriver } from '../store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Storage Layer Architecture Tests', async (t) => {
  await t.test('storageDriver identifies active driver correctly', () => {
    const driver = storageDriver();
    assert.ok(['json', 'mysql', 'postgres'].includes(driver));
  });

  await t.test('initStore initializes in-memory cache and loads arrays', async () => {
    await initStore();
    const products = getArray('products');
    assert.ok(Array.isArray(products));
    assert.ok(products.length > 0, 'Should load existing products from store');
  });

  await t.test('getArray returns empty array fallback for non-existent collection', () => {
    const nonExistent = getArray('non_existent_collection_xyz');
    assert.deepEqual(nonExistent, []);
  });

  await t.test('getSingleton returns null or object for singleton', () => {
    const adminAuth = getSingleton('admin_auth');
    assert.ok(adminAuth !== undefined);
  });
});
