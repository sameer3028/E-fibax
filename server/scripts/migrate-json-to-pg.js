// ============================================================================
// Future PostgreSQL / Supabase Migration Utility
// Run this script ONLY when executing database migration:
//   node server/scripts/migrate-json-to-pg.js
// ============================================================================

import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');
const schemaFile = join(__dirname, 'schema.sql');

const { Pool } = pg;

function readJson(fileName, fallback = []) {
  const filePath = join(dataDir, fileName);
  if (!existsSync(filePath)) {
    console.log(`⚠️  ${fileName} not found, skipping.`);
    return fallback;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ Error parsing ${fileName}:`, err.message);
    return fallback;
  }
}

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is required to run PostgreSQL migration.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  console.log('✅ Connected to PostgreSQL database.');

  try {
    // 1. Execute schema initialization
    if (existsSync(schemaFile)) {
      console.log('📄 Applying schema.sql...');
      const schemaSql = readFileSync(schemaFile, 'utf8');
      await client.query(schemaSql);
      console.log('✅ Schema tables and indexes verified.');
    }

    // 2. Migrate Products
    const products = readJson('products.json', []);
    console.log(`📦 Migrating ${products.length} products...`);
    for (const p of products) {
      await client.query(`
        INSERT INTO products (
          id, title, slug, sku, dosage_form, category_id, concern_id,
          mrp, sale_price, discount_percent, stock_quantity, low_stock_threshold,
          in_stock, featured_image, images, rating_average, rating_count,
          is_bestseller, volume_weight, shipping_package, short_desc,
          key_benefits, ingredients, dosage, ayush_certified, treatment_course_config,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          sale_price = EXCLUDED.sale_price,
          stock_quantity = EXCLUDED.stock_quantity,
          in_stock = EXCLUDED.in_stock,
          updated_at = EXCLUDED.updated_at;
      `, [
        String(p.id),
        p.title,
        p.slug || String(p.id),
        p.sku || null,
        p.dosageForm || null,
        p.categoryId || null,
        p.concernId || null,
        Number(p.mrp) || 0,
        Number(p.salePrice) || 0,
        Number(p.discountPercent) || 0,
        Number(p.stockQuantity) || 0,
        Number(p.lowStockThreshold) || 15,
        p.inStock !== false,
        p.featuredImage || null,
        JSON.stringify(p.images || []),
        Number(p.ratingAverage) || 4.8,
        Number(p.ratingCount) || 1,
        !!p.isBestseller,
        p.volumeWeight || null,
        JSON.stringify(p.shippingPackage || {}),
        p.shortDesc || null,
        JSON.stringify(p.keyBenefits || []),
        p.ingredients || null,
        p.dosage || null,
        p.ayushCertified !== false,
        JSON.stringify(p.treatmentCourseConfig || {}),
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString()
      ]);
    }

    // 3. Migrate Users
    const users = readJson('users.json', []);
    console.log(`👤 Migrating ${users.length} users...`);
    for (const u of users) {
      await client.query(`
        INSERT INTO users (id, name, email, phone, password_hash, salt, addresses, login_count, last_login_at, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          login_count = EXCLUDED.login_count,
          last_login_at = EXCLUDED.last_login_at;
      `, [
        String(u.id),
        u.name,
        u.email || null,
        u.phone || null,
        u.passwordHash || '',
        u.salt || '',
        JSON.stringify(u.addresses || []),
        u.loginCount || 1,
        u.lastLoginAt || null,
        u.createdAt || new Date().toISOString(),
        u.updatedAt || new Date().toISOString()
      ]);
    }

    // 4. Migrate Orders
    const orders = readJson('orders.json', []);
    console.log(`🛒 Migrating ${orders.length} orders...`);
    for (const o of orders) {
      await client.query(`
        INSERT INTO orders (
          order_id, customer_id, customer, items, shipping, payment,
          totals, status, courier, tracking_id, delhivery_awb,
          shipment, cancellation_reason, cancelled_by, cancelled_at,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT (order_id) DO UPDATE SET
          status = EXCLUDED.status,
          tracking_id = EXCLUDED.tracking_id,
          delhivery_awb = EXCLUDED.delhivery_awb,
          shipment = EXCLUDED.shipment,
          updated_at = EXCLUDED.updated_at;
      `, [
        String(o.orderId),
        o.customer?.userId || null,
        JSON.stringify(o.customer || {}),
        JSON.stringify(o.items || []),
        JSON.stringify(o.shipping || {}),
        JSON.stringify(o.payment || {}),
        JSON.stringify(o.totals || {}),
        o.status || 'Processing',
        o.courier || 'Delhivery Express',
        o.trackingId || null,
        o.delhiveryAwb || null,
        JSON.stringify(o.shipment || null),
        o.cancellationReason || null,
        o.cancelledBy || null,
        o.cancelledAt || null,
        o.createdAt || new Date().toISOString(),
        o.updatedAt || new Date().toISOString()
      ]);
    }

    // 5. Migrate Coupons
    const coupons = readJson('coupons.json', []);
    console.log(`🎟️ Migrating ${coupons.length} coupons...`);
    for (const c of coupons) {
      await client.query(`
        INSERT INTO coupons (id, code, type, value, min_order, max_discount, description, is_active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          is_active = EXCLUDED.is_active;
      `, [
        String(c.id),
        c.code,
        c.type || 'percent',
        Number(c.value) || 0,
        Number(c.minOrder) || 0,
        c.maxDiscount ? Number(c.maxDiscount) : null,
        c.description || '',
        c.isActive !== false,
        c.createdAt || new Date().toISOString(),
        c.updatedAt || new Date().toISOString()
      ]);
    }

    // 6. Migrate Reviews
    const reviews = readJson('reviews.json', []);
    console.log(`⭐ Migrating ${reviews.length} reviews...`);
    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (
          id, product_id, rating, title, content, images, video,
          customer_name, customer_email, customer_phone, status,
          verified_purchase, helpful_count, admin_note, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          helpful_count = EXCLUDED.helpful_count;
      `, [
        String(r.id),
        String(r.productId),
        Number(r.rating) || 5,
        r.title || '',
        r.content || '',
        JSON.stringify(r.images || []),
        r.video || null,
        r.customerName || null,
        r.customerEmail || null,
        r.customerPhone || null,
        r.status || 'APPROVED',
        r.verifiedPurchase !== false,
        Number(r.helpfulCount) || 0,
        r.adminNote || null,
        r.createdAt || new Date().toISOString(),
        r.updatedAt || new Date().toISOString()
      ]);
    }

    // 7. Migrate Enquiries
    const enquiries = readJson('enquiries.json', []);
    console.log(`✉️ Migrating ${enquiries.length} enquiries...`);
    for (const e of enquiries) {
      await client.query(`
        INSERT INTO enquiries (id, name, phone, email, city, experience, message, source, ip, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING;
      `, [
        String(e.id),
        e.name,
        e.phone,
        e.email || null,
        e.city || null,
        e.experience || null,
        e.message || null,
        e.source || null,
        e.ip || null,
        e.timestamp || new Date().toISOString()
      ]);
    }

    // 8. Migrate Singletons into system_settings
    const singletons = ['admin_auth.json', 'shipping_config.json', 'email_config.json'];
    for (const sFile of singletons) {
      const data = readJson(sFile, null);
      if (data) {
        const key = sFile.replace('.json', '');
        await client.query(`
          INSERT INTO system_settings (key, value, updated_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
        `, [key, JSON.stringify(data)]);
        console.log(`⚙️ Migrated settings singleton: ${key}`);
      }
    }

    console.log('\n🎉 PostgreSQL database migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
