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
const defaultClientUploads = join(__dirname, '..', 'client', 'public', 'uploads');
const uploadsDir = process.env.UPLOADS_DIR || (existsSync(join(__dirname, '..', 'client')) ? defaultClientUploads : join(__dirname, 'uploads'));
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
// 0B. CUSTOMER USER AUTHENTICATION & ACCOUNT
// ==========================================
const usersFile = join(dataDir, 'users.json');
if (!existsSync(usersFile)) {
  writeFileSync(usersFile, JSON.stringify([], null, 2), 'utf8');
}

function readUsers() {
  try {
    if (!existsSync(usersFile)) return [];
    return JSON.parse(readFileSync(usersFile, 'utf8'));
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
}

function saveUsers(users) {
  writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

// In-memory customer sessions: Map<token, { userId, expiresAt }>
const customerSessions = new Map();

function generateCustomerToken(userId) {
  const token = 'cust_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  customerSessions.set(token, { userId, expiresAt });
  return token;
}

function getCustomerFromRequest(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];
  const session = customerSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    customerSessions.delete(token);
    return null;
  }
  const users = readUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) return null;
  return { ...user, sessionToken: token };
}

function sanitizeUser(user) {
  if (!user) return null;
  const { salt, passwordHash, ...safeUser } = user;
  return safeUser;
}

// POST /api/auth/register - Customer Account Creation
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password, address, city, pincode } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    const cleanName = name.replace(/[<>]/g, '').trim();
    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
    }

    const users = readUsers();

    // Check existing email or phone
    const existingEmail = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists. Please log in.' });
    }

    const existingPhone = users.find(u => u.phone === cleanPhone);
    if (existingPhone) {
      return res.status(400).json({ success: false, error: 'An account with this mobile number already exists. Please log in.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const userId = 'USR-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6).toUpperCase();

    const addresses = [];
    if (address && address.trim()) {
      addresses.push({
        id: 'addr_' + Date.now(),
        address: address.trim(),
        city: (city || '').trim(),
        pincode: (pincode || '').trim(),
        isDefault: true
      });
    }

    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      salt,
      passwordHash,
      addresses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateCustomerToken(userId);
    console.log(`👤 New customer registered: ${newUser.name} (${newUser.email}) - ID: ${newUser.id}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login - Customer Login (Email or Phone)
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !identifier.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Please enter your email or phone and password.' });
    }

    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();
    const phoneDigits = rawId.replace(/[^0-9]/g, '');

    const users = readUsers();
    // Search by email or phone
    const user = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      (phoneDigits.length >= 10 && u.phone === phoneDigits)
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this email or mobile number.' });
    }

    const isMatch = verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    const token = generateCustomerToken(user.id);
    user.lastLoginAt = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;
    saveUsers(users);

    console.log(`🔑 Customer logged in: ${user.name} (${user.email}) - Total logins: ${user.loginCount}`);

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});

// GET /api/admin/users - List all registered customers, active sessions, and order stats
app.get('/api/admin/users', (req, res) => {
  try {
    const users = readUsers();
    const orders = readOrders();
    const now = Date.now();

    // Active session user IDs
    const activeUserIds = new Set();
    customerSessions.forEach((session) => {
      if (now < session.expiresAt) {
        activeUserIds.add(session.userId);
      }
    });

    const usersWithStats = users.map((u) => {
      const userOrders = orders.filter(
        (o) =>
          (o.customer?.userId && o.customer.userId === u.id) ||
          (o.customer?.email && o.customer.email.toLowerCase() === u.email.toLowerCase()) ||
          (o.customer?.phone && o.customer.phone === u.phone)
      );
      const totalSpend = userOrders.reduce((sum, o) => sum + (o.totals?.grandTotal || 0), 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        addresses: u.addresses || [],
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || u.createdAt,
        loginCount: u.loginCount || 1,
        isOnline: activeUserIds.has(u.id),
        ordersCount: userOrders.length,
        totalSpend
      };
    });

    return res.json({
      success: true,
      totalUsers: users.length,
      activeSessions: activeUserIds.size,
      data: usersWithStats
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me - Get Current Customer Profile
app.get('/api/auth/me', (req, res) => {
  const customer = getCustomerFromRequest(req);
  if (!customer) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
  }
  return res.json({ success: true, user: sanitizeUser(customer) });
});

// PUT /api/auth/profile - Update Customer Profile
app.put('/api/auth/profile', (req, res) => {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const users = readUsers();
    const idx = users.findIndex(u => u.id === customer.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const { name, phone, address, city, pincode } = req.body || {};
    if (name && name.trim()) {
      users[idx].name = name.replace(/[<>]/g, '').trim();
    }
    if (phone && phone.replace(/[^0-9]/g, '').length >= 10) {
      users[idx].phone = phone.replace(/[^0-9]/g, '');
    }

    if (address && address.trim()) {
      if (!users[idx].addresses) users[idx].addresses = [];
      const existingDefault = users[idx].addresses.find(a => a.isDefault);
      if (existingDefault) {
        existingDefault.address = address.trim();
        if (city) existingDefault.city = city.trim();
        if (pincode) existingDefault.pincode = pincode.trim();
      } else {
        users[idx].addresses.push({
          id: 'addr_' + Date.now(),
          address: address.trim(),
          city: (city || '').trim(),
          pincode: (pincode || '').trim(),
          isDefault: true
        });
      }
    }

    users[idx].updatedAt = new Date().toISOString();
    saveUsers(users);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizeUser(users[idx])
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// GET /api/user/orders - Get Orders for Authenticated Customer
app.get('/api/user/orders', (req, res) => {
  try {
    const customer = getCustomerFromRequest(req);
    if (!customer) {
      return res.status(401).json({ success: false, error: 'Please log in to view your orders.' });
    }

    const allOrders = readOrders();
    const userOrders = allOrders.filter(o => 
      (o.customer?.userId && o.customer.userId === customer.id) ||
      (o.customer?.email && o.customer.email.toLowerCase() === customer.email.toLowerCase()) ||
      (o.customer?.phone && o.customer.phone === customer.phone)
    );

    return res.json({
      success: true,
      count: userOrders.length,
      data: userOrders
    });
  } catch (err) {
    console.error('User orders error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch order history.' });
  }
});

// POST /api/auth/logout - Logout Customer
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      customerSessions.delete(parts[1]);
    }
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
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
    const { customer, items, shipping, payment, totals } = req.body || {};
    const authenticatedCustomer = getCustomerFromRequest(req);
    const resolvedUserId = authenticatedCustomer?.id || customer?.userId || null;
    const resolvedEmail = authenticatedCustomer?.email || customer?.email || '';

    const orderId = 'FBX-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const trackingId = 'DLH-' + Math.floor(100000000 + Math.random() * 900000000);

    const newOrder = {
      orderId,
      trackingId,
      courier: 'Delhivery Express',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: {
        ...(customer || {}),
        userId: resolvedUserId,
        email: resolvedEmail || customer?.email || ''
      },
      items: items || [],
      shipping: shipping || {},
      payment: payment || { method: 'COD', status: 'Pending' },
      totals: totals || {}
    };

    // If customer is logged in and has no saved address, auto-save this address
    if (authenticatedCustomer && shipping?.address) {
      try {
        const users = readUsers();
        const uIdx = users.findIndex(u => u.id === authenticatedCustomer.id);
        if (uIdx !== -1 && (!users[uIdx].addresses || users[uIdx].addresses.length === 0)) {
          users[uIdx].addresses = [{
            id: 'addr_' + Date.now(),
            address: shipping.address,
            city: shipping.city || '',
            pincode: shipping.pincode || '',
            isDefault: true
          }];
          saveUsers(users);
        }
      } catch (err) {
        console.error('Error auto-saving address:', err);
      }
    }

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
// 3. ENQUIRIES API (WITH ANTI-INJECTION SECURITY & VALIDATION)
// ==========================================

// Rate-limiting map: ip -> array of timestamps
const enquiryRateLimit = new Map();

// Known malicious code injection patterns (XSS, SQLi, Shell, Template Injection)
const INJECTION_PATTERNS = [
  /<\s*script[^>]*>/i,                          // Script tags
  /<\s*\/\s*script\s*>/i,                       // Closing script tags
  /<\s*(iframe|object|embed|svg|img|style|link|meta|body|input|button|form)\b[^>]*>/i, // Unsafe HTML tags
  /javascript\s*:/i,                            // Javascript URI scheme
  /vbscript\s*:/i,                              // VBScript URI scheme
  /data\s*:\s*text\/html/i,                     // Data URI scheme
  /on\w+\s*=/i,                                 // Event handlers (onerror, onload, onclick, etc.)
  /(eval|setTimeout|setInterval|Function)\s*\(/i, // Code execution functions
  /(\${|{{|<%|%>|`)/,                           // Template / Expression injection
  /(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from|update\s+\w+\s+set|exec\s*\(|xp_)/i, // SQL injection
  /(;|\||&&|\$\()\s*(curl|wget|bash|sh|powershell|cmd|nc|netcat)/i, // Command injection
  /document\.(location|cookie|write)/i          // DOM access attempts
];

function containsInjectionPayload(str) {
  if (typeof str !== 'string') return false;
  return INJECTION_PATTERNS.some(pattern => pattern.test(str));
}

function sanitizeInput(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  // Truncate to maximum permitted length
  const truncated = str.slice(0, maxLength);
  // Encode dangerous HTML special characters to prevent any render-time injection
  return truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// POST /api/enquiry - Handle lead form submissions with strict validation
app.post('/api/enquiry', (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // 1. Anti-Spam Rate Limiting (max 25 requests per 10 minutes per IP)
    const timestamps = enquiryRateLimit.get(clientIp) || [];
    const recent = timestamps.filter(t => now - t < 10 * 60 * 1000);
    if (recent.length >= 25) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests from this device. Please wait a few minutes before submitting another enquiry.'
      });
    }
    recent.push(now);
    enquiryRateLimit.set(clientIp, recent);

    const { name, phone, city, message, requirement, email, experience, hp_field } = req.body || {};

    // 2. Honeypot Anti-Bot Check
    if (hp_field && String(hp_field).trim() !== '') {
      console.warn(`🤖 Bot trap triggered from IP: ${clientIp}`);
      return res.status(400).json({ success: false, error: 'Invalid submission.' });
    }

    // 3. Required Fields Check
    if (!name || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and city/state are required fields.'
      });
    }

    const rawInputs = [name, phone, city, message, requirement, email, experience].filter(Boolean);

    // 4. Code Injection Detection across all submitted strings
    for (const input of rawInputs) {
      if (typeof input === 'string' && containsInjectionPayload(input)) {
        console.warn(`🚨 Code injection attempt detected from ${clientIp}:`, input.slice(0, 100));
        return res.status(400).json({
          success: false,
          error: 'Security alert: Unsafe code or script characters are strictly prohibited.'
        });
      }
    }

    // 5. Strict Name Validation (alphabetic characters, spaces, dots, and hyphens only, 2-70 chars)
    const cleanName = String(name).trim();
    if (!/^[a-zA-Z\s.\-']{2,70}$/.test(cleanName)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid full name (2-70 letters; numbers and script code are not permitted).'
      });
    }

    // 6. Strict Phone Validation (must be 10-15 digits, typically standard Indian 10 digits)
    const phoneClean = String(phone).replace(/[^0-9]/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      });
    }

    // 7. Strict City / Location Validation (letters, numbers, commas, periods, hyphens, 2-100 chars)
    const cleanCity = String(city).trim();
    if (!/^[a-zA-Z0-9\s,.\-()]{2,100}$/.test(cleanCity)) {
      return res.status(400).json({
        success: false,
        error: 'City / District contains invalid characters.'
      });
    }

    // 8. Strict Email Validation (if provided)
    let cleanEmail = '';
    if (email && String(email).trim()) {
      cleanEmail = String(email).trim().toLowerCase();
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail) || cleanEmail.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }
    }

    // 9. Sanitize and escape all content before persistence
    const combinedMessage = (message || requirement || '').trim();
    const sanitizedEnquiry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: sanitizeInput(cleanName, 70),
      phone: sanitizeInput(phoneClean, 15),
      email: cleanEmail ? sanitizeInput(cleanEmail, 100) : '',
      city: sanitizeInput(cleanCity, 100),
      experience: experience ? sanitizeInput(String(experience), 60) : 'General Inquiry',
      message: sanitizeInput(combinedMessage, 1000),
      timestamp: new Date().toISOString(),
      source: req.headers.referer || 'contact_page',
      ip: clientIp
    };

    let enquiries = [];
    try {
      if (existsSync(enquiriesFile)) {
        const data = readFileSync(enquiriesFile, 'utf8');
        enquiries = JSON.parse(data);
      }
    } catch {
      enquiries = [];
    }

    enquiries.push(sanitizedEnquiry);
    writeFileSync(enquiriesFile, JSON.stringify(enquiries, null, 2));

    console.log(`✅ Secure enquiry logged: ${sanitizedEnquiry.name} (${sanitizedEnquiry.city}) - ${sanitizedEnquiry.phone}`);

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

// Catch-all 404 handler specifically for API routes (prevent returning index.html for API requests)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
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
