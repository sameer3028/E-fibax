import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure data & upload directories exist
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}
const uploadsDir = join(__dirname, '..', 'client', 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// POST /api/upload - Handle base64 product image uploads
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanBase = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') : 'prod';
    const safeName = `${cleanBase}-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, safeName);
    writeFileSync(filePath, buffer);

    console.log(`📸 Image uploaded successfully: ${safeName}`);
    res.json({
      success: true,
      url: `/uploads/${safeName}`,
      filename: safeName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const enquiriesFile = join(dataDir, 'enquiries.json');
const productsFile = join(dataDir, 'products.json');
const ordersFile = join(dataDir, 'orders.json');

// Initialize files if not exist
if (!existsSync(enquiriesFile)) {
  writeFileSync(enquiriesFile, JSON.stringify([], null, 2));
}
if (!existsSync(ordersFile)) {
  writeFileSync(ordersFile, JSON.stringify([], null, 2));
}

// Helpers
function readProducts() {
  try {
    if (!existsSync(productsFile)) return [];
    return JSON.parse(readFileSync(productsFile, 'utf8'));
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
}

function saveProducts(products) {
  writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');
}

function readOrders() {
  try {
    if (!existsSync(ordersFile)) return [];
    return JSON.parse(readFileSync(ordersFile, 'utf8'));
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
}

// ==========================================
// 0. ADMIN AUTHENTICATION & SECURITY
// ==========================================
const adminAuthFile = join(dataDir, 'admin_auth.json');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password, salt, storedHash) {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

function getAdminConfig() {
  if (!existsSync(adminAuthFile)) {
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultHash = hashPassword('admin@fibax2026', defaultSalt);
    const initialConfig = {
      username: 'admin',
      salt: defaultSalt,
      passwordHash: defaultHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeFileSync(adminAuthFile, JSON.stringify(initialConfig, null, 2), 'utf8');
    return initialConfig;
  }
  try {
    return JSON.parse(readFileSync(adminAuthFile, 'utf8'));
  } catch (err) {
    console.error('Error reading admin auth file:', err);
    return { username: 'admin' };
  }
}

// In-memory active tokens: Map<token, { username, expiresAt }>
const activeSessions = new Map();

function generateToken(username) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeSessions.set(token, { username, expiresAt });
  return token;
}

function getSessionFromRequest(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return { ...session, token };
}

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'User ID and Password are required' });
    }

    const config = getAdminConfig();
    const isUserMatch = String(username).trim().toLowerCase() === String(config.username).trim().toLowerCase();
    const isPassMatch = verifyPassword(String(password).trim(), config.salt, config.passwordHash);

    if (!isUserMatch || !isPassMatch) {
      return res.status(401).json({ success: false, error: 'Invalid User ID or Password' });
    }

    const token = generateToken(config.username);
    console.log(`🔐 Admin login successful for user: ${config.username}`);
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      username: config.username
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// GET /api/admin/verify
app.get('/api/admin/verify', (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, valid: false, error: 'Invalid or expired session' });
  }
  return res.json({ success: true, valid: true, username: session.username });
});

// POST /api/admin/change-password
app.post('/api/admin/change-password', (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Please log in first' });
    }

    const { oldPassword, newUsername, newPassword } = req.body || {};
    if (!oldPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required to make changes' });
    }

    const config = getAdminConfig();
    const isPassMatch = verifyPassword(String(oldPassword).trim(), config.salt, config.passwordHash);
    if (!isPassMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    if (newUsername && newUsername.trim().length >= 3) {
      config.username = newUsername.trim();
    }

    if (newPassword) {
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
      }
      const newSalt = crypto.randomBytes(16).toString('hex');
      config.salt = newSalt;
      config.passwordHash = hashPassword(newPassword.trim(), newSalt);
    }

    config.updatedAt = new Date().toISOString();
    writeFileSync(adminAuthFile, JSON.stringify(config, null, 2), 'utf8');

    console.log(`🔑 Admin credentials updated for user: ${config.username}`);
    return res.json({
      success: true,
      message: 'Admin credentials successfully updated',
      username: config.username
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'Failed to update credentials' });
  }
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const session = getSessionFromRequest(req);
  if (session) {
    activeSessions.delete(session.token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// 1. PRODUCTS REST API (CRUD + OFFERS + STOCK)
// ==========================================

// GET /api/products - Get all products with optional filters
app.get('/api/products', (req, res) => {
  try {
    const { category, concern, search, inStockOnly } = req.query;
    let products = readProducts();

    if (category && category !== 'all') {
      products = products.filter(p => p.categoryId === category);
    }
    if (concern && concern !== 'all') {
      products = products.filter(p => p.concernId === concern);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    if (inStockOnly === 'true') {
      products = products.filter(p => p.inStock);
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id - Single product
app.get('/api/products/:id', (req, res) => {
  try {
    const products = readProducts();
    const product = products.find(p => String(p.id) === String(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - Add new product
app.post('/api/products', (req, res) => {
  try {
    const products = readProducts();
    const body = req.body;

    if (!body.title || !body.salePrice) {
      return res.status(400).json({ success: false, error: 'Product title and sale price are required.' });
    }

    const newId = String(Date.now());
    const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const mrp = Number(body.mrp) || Math.round(Number(body.salePrice) * 1.25);
    const salePrice = Number(body.salePrice);
    const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
    const stockQuantity = Number(body.stockQuantity) || 50;

    const newProduct = {
      id: newId,
      title: body.title.trim(),
      slug: slug,
      sku: body.sku || ('FBX-' + slug.toUpperCase().slice(0, 6) + '-' + newId.slice(-4)),
      dosageForm: body.dosageForm || 'Syrup',
      categoryId: body.categoryId || 'syrups',
      concernId: body.concernId || 'immunity-vitality',
      mrp: mrp,
      salePrice: salePrice,
      discountPercent: discountPercent,
      stockQuantity: stockQuantity,
      lowStockThreshold: Number(body.lowStockThreshold) || 15,
      inStock: stockQuantity > 0,
      featuredImage: body.featuredImage || 'https://fibaxpharma.com/wp-content/uploads/2025/11/front.webp',
      ratingAverage: body.ratingAverage || '4.8',
      ratingCount: Number(body.ratingCount) || 1,
      isBestseller: !!body.isBestseller,
      volumeWeight: body.volumeWeight || '200 ml',
      shortDesc: body.shortDesc || 'Authentic Ayurvedic formulation by Fibax Pharma.',
      keyBenefits: body.keyBenefits || [
        'Natural herbal recovery and daily wellness',
        'Standardized pure botanical extracts'
      ],
      ingredients: body.ingredients || 'Standardized Ayurvedic herbs and natural decoctions',
      dosage: body.dosage || '10-15 ml twice daily after meals with water.',
      ayushCertified: body.ayushCertified !== false,
      multiPacks: [
        { name: '1 Unit (Standard)', quantity: 1, price: salePrice, savings: 0 },
        { name: '2 Units (Value Pack)', quantity: 2, price: Math.round(salePrice * 2 * 0.9), savings: '10% OFF' },
        { name: '3-Month Course (Best Value)', quantity: 3, price: Math.round(salePrice * 3 * 0.85), savings: '15% OFF' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    saveProducts(products);

    console.log(`✅ Added new product: ${newProduct.title} (ID: ${newProduct.id})`);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const products = readProducts();
    const idx = products.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const current = products[idx];
    const body = req.body;

    const mrp = body.mrp !== undefined ? Number(body.mrp) : current.mrp;
    const salePrice = body.salePrice !== undefined ? Number(body.salePrice) : current.salePrice;
    const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
    const stockQuantity = body.stockQuantity !== undefined ? Number(body.stockQuantity) : current.stockQuantity;

    const updated = {
      ...current,
      ...body,
      mrp,
      salePrice,
      discountPercent,
      stockQuantity,
      inStock: stockQuantity > 0,
      multiPacks: [
        { name: '1 Unit (Standard)', quantity: 1, price: salePrice, savings: 0 },
        { name: '2 Units (Value Pack)', quantity: 2, price: Math.round(salePrice * 2 * 0.9), savings: '10% OFF' },
        { name: '3-Month Course (Best Value)', quantity: 3, price: Math.round(salePrice * 3 * 0.85), savings: '15% OFF' }
      ],
      updatedAt: new Date().toISOString()
    };

    products[idx] = updated;
    saveProducts(products);

    console.log(`✏️ Updated product: ${updated.title}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/products/:id/pricing - Quick price / offer adjustment
app.patch('/api/products/:id/pricing', (req, res) => {
  try {
    const { mrp, salePrice, isBestseller } = req.body;
    const products = readProducts();
    const idx = products.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

    const current = products[idx];
    const newMrp = mrp !== undefined ? Number(mrp) : current.mrp;
    const newSalePrice = salePrice !== undefined ? Number(salePrice) : current.salePrice;
    const discountPercent = Math.round(((newMrp - newSalePrice) / newMrp) * 100);

    products[idx] = {
      ...current,
      mrp: newMrp,
      salePrice: newSalePrice,
      discountPercent: discountPercent,
      isBestseller: isBestseller !== undefined ? !!isBestseller : current.isBestseller,
      multiPacks: [
        { name: '1 Unit (Standard)', quantity: 1, price: newSalePrice, savings: 0 },
        { name: '2 Units (Value Pack)', quantity: 2, price: Math.round(newSalePrice * 2 * 0.9), savings: '10% OFF' },
        { name: '3-Month Course (Best Value)', quantity: 3, price: Math.round(newSalePrice * 3 * 0.85), savings: '15% OFF' }
      ],
      updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    res.json({ success: true, data: products[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/products/:id/stock - Quick stock increment/adjustment
app.patch('/api/products/:id/stock', (req, res) => {
  try {
    const { stockQuantity, delta, lowStockThreshold } = req.body;
    const products = readProducts();
    const idx = products.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

    const current = products[idx];
    let newQty = current.stockQuantity;
    if (stockQuantity !== undefined) {
      newQty = Math.max(0, Number(stockQuantity));
    } else if (delta !== undefined) {
      newQty = Math.max(0, newQty + Number(delta));
    }

    products[idx] = {
      ...current,
      stockQuantity: newQty,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : current.lowStockThreshold,
      inStock: newQty > 0,
      updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    res.json({ success: true, data: products[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    let products = readProducts();
    const exists = products.some(p => String(p.id) === String(req.params.id));
    if (!exists) return res.status(404).json({ success: false, error: 'Product not found' });

    products = products.filter(p => String(p.id) !== String(req.params.id));
    saveProducts(products);

    console.log(`🗑️ Deleted product ID: ${req.params.id}`);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/inventory/stats - Overview metrics
app.get('/api/inventory/stats', (req, res) => {
  try {
    const products = readProducts();
    const totalUnits = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    const lowStockItems = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 15));
    const outOfStockItems = products.filter(p => !p.stockQuantity || p.stockQuantity === 0);

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalUnits: totalUnits,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockItems: lowStockItems,
        outOfStockItems: outOfStockItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. ORDERS REST API (CHECKOUT + TRACKING)
// ==========================================

// GET /api/orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = readOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders - Place order and auto-deduct inventory
app.post('/api/orders', (req, res) => {
  try {
    const orders = readOrders();
    const products = readProducts();
    const { customer, items, shipping, payment, totals } = req.body;

    const orderId = 'FBX-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const trackingId = 'DLH-' + Math.floor(100000000 + Math.random() * 900000000);

    const newOrder = {
      orderId,
      trackingId,
      courier: 'Delhivery Express',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: customer || {},
      items: items || [],
      shipping: shipping || {},
      payment: payment || { method: 'COD', status: 'Pending' },
      totals: totals || {}
    };

    // Decrement stock for ordered items
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        const pIdx = products.findIndex(p => String(p.id) === String(item.id));
        if (pIdx !== -1) {
          const qty = item.quantity || 1;
          products[pIdx].stockQuantity = Math.max(0, (products[pIdx].stockQuantity || 0) - qty);
          products[pIdx].inStock = products[pIdx].stockQuantity > 0;
        }
      });
      saveProducts(products);
    }

    orders.unshift(newOrder);
    saveOrders(orders);

    console.log(`📦 New Order placed: ${orderId} with tracking ${trackingId}`);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ENQUIRIES API
// ==========================================

// POST /api/enquiry - Handle lead form submissions
app.post('/api/enquiry', (req, res) => {
  try {
    const { name, phone, city, message, requirement } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and city are required fields.'
      });
    }

    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit phone number.'
      });
    }

    const enquiry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      message: (message || requirement || '').trim(),
      timestamp: new Date().toISOString(),
      source: req.headers.referer || 'direct',
      ip: req.ip
    };

    let enquiries = [];
    try {
      const data = readFileSync(enquiriesFile, 'utf8');
      enquiries = JSON.parse(data);
    } catch {
      enquiries = [];
    }

    enquiries.push(enquiry);
    writeFileSync(enquiriesFile, JSON.stringify(enquiries, null, 2));

    console.log(`✅ New enquiry from: ${enquiry.name} (${enquiry.city}) - ${enquiry.phone}`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been submitted. Our team will contact you shortly.'
    });
  } catch (error) {
    console.error('❌ Error saving enquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again or call us directly.'
    });
  }
});

// GET /api/enquiries
app.get('/api/enquiries', (req, res) => {
  try {
    const data = readFileSync(enquiriesFile, 'utf8');
    const enquiries = JSON.parse(data);
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch {
    res.json({ success: true, count: 0, data: [] });
  }
});

// Serve React build in production
const clientDist = join(__dirname, '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`
  🌿 Fibax Pharma Server
  =========================================
  🚀 Server running on: http://localhost:${PORT}
  📦 Products API:      GET/POST http://localhost:${PORT}/api/products
  🏷️ Pricing API:       PATCH    http://localhost:${PORT}/api/products/:id/pricing
  📊 Inventory API:     PATCH    http://localhost:${PORT}/api/products/:id/stock
  📈 Inventory Stats:   GET      http://localhost:${PORT}/api/inventory/stats
  🛒 Orders API:        GET/POST http://localhost:${PORT}/api/orders
  =========================================
  `);
});
