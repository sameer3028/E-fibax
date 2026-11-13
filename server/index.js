import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { DATA_DIR, getUploadsDir, ensureDirectories } from './config/paths.js';
import { createAutomatedBackup, verifyDataIntegrity } from './services/backupService.js';
import { initShipping } from './shipping.js';
import { initStore, storageDriver, getArray, flushStore } from './store.js';

// Ensure data, default_data, uploads, and backups directories exist
ensureDirectories();

// Verify data integrity on startup and create automated point-in-time snapshot
const integrity = verifyDataIntegrity();
if (integrity.issues.length > 0) {
  console.warn('⚠️ Data integrity notices on boot:', integrity.issues);
}
if (integrity.repaired.length > 0) {
  console.log('🛡️ Auto-repaired data files:', integrity.repaired);
}
if (process.env.NODE_ENV !== 'test') {
  createAutomatedBackup('server_boot');
}

// Modular Route Handlers
import adminRoutes from './routes/adminRoutes.js';
import customerAuthRoutes from './routes/customerAuthRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { reviewRouter, adminReviewRouter } from './routes/reviewRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import blogRoutes, { getBlogs } from './routes/blogRoutes.js';

// Middleware
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// Core Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images and videos statically from the unified uploads directory
const uploadsDir = getUploadsDir();
app.use('/uploads', express.static(uploadsDir));
const clientPublicUploadsDir = join(__dirname, '..', 'client', 'public', 'uploads');
if (existsSync(clientPublicUploadsDir) && clientPublicUploadsDir !== uploadsDir) {
  app.use('/uploads', express.static(clientPublicUploadsDir));
}

// ==========================================
// API HEALTH CHECK ENDPOINT
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    storageDriver: storageDriver(),
    dataDir: DATA_DIR,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Quick Inventory Metrics Endpoint (called by ProductContext)
app.get('/api/inventory/stats', (req, res) => {
  try {
    const products = getArray('products');
    const totalUnits = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    const lowStockItems = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 15));
    const outOfStockItems = products.filter(p => !p.stockQuantity || p.stockQuantity === 0);

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalUnits,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockItems,
        outOfStockItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// MOUNT MODULAR API ROUTERS
// ==========================================
app.use('/api/admin/reviews', adminReviewRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', customerAuthRoutes);
app.use('/api', customerAuthRoutes); // Backwards compatibility for /api/user/orders
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRouter);
app.use('/api/email', emailRoutes);
app.use('/api', contentRoutes); // Includes /api/coupons, /api/website/about-banners, /api/enquiry, /api/upload
app.use('/api', blogRoutes); // Includes /api/blogs, /api/admin/blogs, categories, SEO

// ==========================================
// SEO & SEARCH ENGINE CRAWLER ROUTES
// ==========================================
app.get('/sitemap.xml', (req, res) => {
  const distSitemap = join(__dirname, '..', 'client', 'dist', 'sitemap.xml');
  const publicSitemap = join(__dirname, '..', 'client', 'public', 'sitemap.xml');
  const sitemapPath = existsSync(distSitemap) ? distSitemap : publicSitemap;
  if (existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(sitemapPath);
  }
  res.status(404).type('text/plain').send('Sitemap not found');
});

app.get('/robots.txt', (req, res) => {
  const distRobots = join(__dirname, '..', 'client', 'dist', 'robots.txt');
  const publicRobots = join(__dirname, '..', 'client', 'public', 'robots.txt');
  const robotsPath = existsSync(distRobots) ? distRobots : publicRobots;
  if (existsSync(robotsPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(robotsPath);
  }
  res.status(404).type('text/plain').send('User-agent: *\nAllow: /\n');
});

// API 404 Catch-All (prevents returning index.html for unknown /api/* routes)
app.all('/api/*', notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ==========================================
// SERVE PRODUCTION FRONTEND SPA
// ==========================================
const clientDist = join(__dirname, '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// ==========================================
// SERVER BOOTSTRAP & GRACEFUL SHUTDOWN
// ==========================================
async function bootstrap() {
  try {
    await initStore();
    await initShipping();
    await getBlogs();
  } catch (err) {
    console.error('❌ Storage initialization error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`
  🌿 Fibax Ayurveda Server
  =========================================
  🚀 Server running on: http://localhost:${PORT}
  🗄️ Storage:           ${storageDriver().toUpperCase()}
  📦 Products API:      GET/POST http://localhost:${PORT}/api/products
  🏷️ Orders API:        GET/POST http://localhost:${PORT}/api/orders
  🚚 Shipping API:      http://localhost:${PORT}/api/shipping
  💳 Payment API:       http://localhost:${PORT}/api/payment
  ❤️ Health Check:      http://localhost:${PORT}/api/health
  =========================================
  `);
  });
}

async function shutdown() {
  try {
    await flushStore();
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

bootstrap();
