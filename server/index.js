import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import crypto from 'crypto';
import {
  initShipping,
  getShippingConfig,
  saveShippingConfig,
  checkPincodeServiceability,
  calculateShippingFee,
  createShipmentForOrder,
  createDelhiveryShipment,
  requestDelhiveryPickup,
  syncOrderTracking,
  getTrackingDetails,
  generatePrintableLabel
} from './shipping.js';
import {
  initStore,
  storageDriver,
  getArray,
  setArray,
  getSingleton,
  setSingleton,
  flushStore
} from './store.js';
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPaymentSignature
} from './payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  getReviewsForProduct,
  submitReview,
  getAdminReviews,
  updateReviewStatus,
  bulkUpdateReviewStatus,
  deleteReviewPermanently,
  markReviewHelpful,
  reportReview,
  removeReviewMedia
} from './reviews.js';

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure data & upload directories exist
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}
const possibleUploadDirs = [
  process.env.UPLOADS_DIR,
  join(__dirname, 'uploads'),
  join(__dirname, '..', 'client', 'public', 'uploads'),
  join(__dirname, '..', 'client', 'dist', 'uploads'),
  join(__dirname, '..', 'dist', 'uploads'),
  join(__dirname, '..', 'public_html', 'uploads')
].filter(Boolean);

let uploadsDir = possibleUploadDirs.find((d) => existsSync(d)) || join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically from all available locations
possibleUploadDirs.forEach((d) => {
  if (existsSync(d)) {
    app.use('/uploads', express.static(d));
  }
});

// POST /api/upload - Handle base64 product image and video uploads
app.post('/api/upload', (req, res) => {
  try {
    const { image, file, filename } = req.body;
    const mediaData = image || file;
    if (!mediaData) {
      return res.status(400).json({ success: false, error: 'No media data provided' });
    }

    const matches = mediaData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'jpg';
    let isVideo = false;

    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov', 'video/x-matroska'];
      
      if (!allowedImageMimes.includes(mime) && !allowedVideoMimes.includes(mime)) {
        return res.status(400).json({ success: false, error: 'Supported formats: JPG, PNG, WebP for photos, and MP4, WebM, MOV for video.' });
      }

      if (allowedVideoMimes.includes(mime)) {
        isVideo = true;
        if (mime.includes('mp4')) ext = 'mp4';
        else if (mime.includes('webm')) ext = 'webm';
        else if (mime.includes('quicktime') || mime.includes('mov')) ext = 'mov';
        else ext = 'mp4';
      } else {
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        else ext = 'jpg';
      }
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(mediaData, 'base64');
    }

    // Size check: 5 MB max for images, 50 MB max for videos
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      const limitMb = isVideo ? '50 MB' : '5 MB';
      return res.status(400).json({ success: false, error: `File size must be ${limitMb} or smaller.` });
    }

    const cleanBase = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') : (isVideo ? 'video' : 'img');
    const safeName = `${cleanBase}-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, safeName);
    writeFileSync(filePath, buffer);

    // Also write to client/public/uploads if dir exists for dev environment sync
    const clientPublicUploadsDir = join(__dirname, '..', 'client', 'public', 'uploads');
    if (existsSync(clientPublicUploadsDir)) {
      try {
        writeFileSync(join(clientPublicUploadsDir, safeName), buffer);
      } catch (e) {}
    }

    console.log(`📸 Media uploaded successfully (${isVideo ? 'Video' : 'Photo'}): ${safeName}`);
    return res.json({
      success: true,
      url: `/uploads/${safeName}`,
      filename: safeName,
      isVideo
    });
  } catch (err) {
    console.error('Error handling media upload:', err);
    return res.status(500).json({ success: false, error: 'Internal server upload error' });
  }
});

// Data helpers (backed by the storage layer: JSON files or MySQL)
function readProducts() {
  return getArray('products');
}

function saveProducts(products) {
  setArray('products', products);
}

function readOrders() {
  return getArray('orders');
}

function saveOrders(orders) {
  setArray('orders', orders);
}

function readEnquiries() {
  return getArray('enquiries');
}

function saveEnquiries(enquiries) {
  setArray('enquiries', enquiries);
}

// ==========================================
// 0. ADMIN AUTHENTICATION & SECURITY
// ==========================================
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
  const existing = getSingleton('admin_auth');
  if (existing) return existing;

  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultHash = hashPassword('admin@fibax2026', defaultSalt);
  const initialConfig = {
    username: 'admin',
    salt: defaultSalt,
    passwordHash: defaultHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  setSingleton('admin_auth', initialConfig);
  return initialConfig;
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
    setSingleton('admin_auth', config);

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
function readUsers() {
  return getArray('users');
}

function saveUsers(users) {
  setArray('users', users);
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

// In-memory OTP storage for rapid OTP verification
const otpStore = new Map();

// POST /api/auth/send-otp - Send OTP to mobile number
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Keep the last 10 digits if country code is included
    const standardPhone = cleanPhone.slice(-10);
    // Generate 4-digit OTP
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    otpStore.set(standardPhone, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      attempts: 0
    });

    console.log(`📱 [Fibax OTP Service] Generated OTP for +91 ${standardPhone}: ${generatedOtp}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to +91 ${standardPhone}`,
      phone: standardPhone,
      testOtp: generatedOtp // Provided for frictionless testing & demo
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/verify-otp - Verify OTP and auto-authenticate customer
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp, name } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and OTP are required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const cleanOtp = String(otp).trim();

    // Check OTP record or allow fallback master OTP '1234'
    const record = otpStore.get(cleanPhone);
    const isValid = cleanOtp === '1234' || (record && record.otp === cleanOtp && Date.now() < record.expiresAt);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP. Use 1234 or request a new OTP.' });
    }

    // Consume OTP
    otpStore.delete(cleanPhone);

    const users = readUsers();
    let user = users.find(u => u.phone === cleanPhone);

    if (!user) {
      // Auto-create customer without cumbersome registration forms
      const userId = 'USR-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6).toUpperCase();
      const cleanName = (name && name.trim()) || 'Fibax Customer';
      const cleanEmail = `${cleanPhone}@customer.fibaxpharma.com`;
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(Math.random().toString(36), salt);

      user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        salt,
        passwordHash,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        loginCount: 1,
        lastLoginAt: new Date().toISOString()
      };

      users.push(user);
      saveUsers(users);
      console.log(`👤 New OTP customer created: ${user.name} (+91 ${user.phone})`);
    } else {
      user.lastLoginAt = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;
      if (name && name.trim() && (!user.name || user.name === 'Fibax Customer')) {
        user.name = name.trim();
      }
      saveUsers(users);
      console.log(`🔑 Existing customer logged in via OTP: ${user.name} (+91 ${user.phone})`);
    }

    const token = generateCustomerToken(user.id);

    return res.json({
      success: true,
      message: 'Mobile number verified successfully!',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, error: 'OTP verification failed. Please try again.' });
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
// 0C. COUPONS & DISCOUNT OFFERS API
// ==========================================
function readCoupons() {
  return getArray('coupons');
}

function saveCoupons(coupons) {
  setArray('coupons', coupons);
}

// GET /api/coupons - List all promo coupons (for Admin Portal)
app.get('/api/coupons', (req, res) => {
  try {
    const coupons = readCoupons();
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/coupons/active - List active customer-visible coupons (for Checkout & Cart)
app.get('/api/coupons/active', (req, res) => {
  try {
    const coupons = readCoupons();
    const activeCoupons = coupons.filter(c => c.isActive !== false);
    res.json({ success: true, count: activeCoupons.length, data: activeCoupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/coupons/validate - Backend Authoritative Coupon Validation Endpoint
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, cartTotal } = req.body || {};
    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, error: 'Please enter a valid coupon code.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupons = readCoupons();
    const coupon = coupons.find(c => String(c.code).toUpperCase() === cleanCode);

    if (!coupon || coupon.isActive === false) {
      return res.status(400).json({ success: false, error: `Coupon code "${cleanCode}" is invalid or inactive.` });
    }

    const subtotal = Number(cartTotal) || 0;
    const minOrder = Number(coupon.minOrder) || 0;

    if (minOrder > 0 && subtotal < minOrder) {
      const needed = minOrder - subtotal;
      return res.status(400).json({
        success: false,
        error: `Minimum order value for ${cleanCode} is ₹${minOrder}. Add ₹${needed} more items to use this offer!`
      });
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((subtotal * Number(coupon.value)) / 100);
      if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && coupon.maxDiscount !== '' && Number(coupon.maxDiscount) > 0) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Math.min(Number(coupon.value), subtotal);
    }

    return res.json({
      success: true,
      code: coupon.code,
      discountAmount: discount,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      description: coupon.description,
      message: `Coupon ${coupon.code} applied! Saved ₹${discount}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/coupons - Create new coupon code
app.post('/api/coupons', (req, res) => {
  try {
    const coupons = readCoupons();
    const { code, type, value, minOrder, maxDiscount, description, isActive } = req.body || {};

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Coupon code is required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      return res.status(400).json({ success: false, error: `Coupon code "${cleanCode}" already exists.` });
    }

    const newCoupon = {
      id: 'c_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      code: cleanCode,
      type: type === 'flat' ? 'flat' : 'percent',
      value: Number(value) || 0,
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount !== undefined && maxDiscount !== '' && maxDiscount !== null ? Number(maxDiscount) : null,
      description: (description || '').trim(),
      isActive: isActive !== undefined ? !!isActive : true,
      createdAt: new Date().toISOString()
    };

    coupons.unshift(newCoupon);
    saveCoupons(coupons);

    console.log(`🎟️ New coupon created: ${newCoupon.code} (${newCoupon.type === 'percent' ? newCoupon.value + '%' : '₹' + newCoupon.value})`);
    return res.status(201).json({ success: true, message: 'Coupon offer created successfully!', data: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/coupons/:id - Update existing coupon
app.put('/api/coupons/:id', (req, res) => {
  try {
    const coupons = readCoupons();
    const idx = coupons.findIndex(c => String(c.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }

    const { code, type, value, minOrder, maxDiscount, description, isActive } = req.body || {};

    if (code && code.trim()) {
      const cleanCode = code.trim().toUpperCase();
      if (coupons.some(c => String(c.id) !== String(req.params.id) && c.code.toUpperCase() === cleanCode)) {
        return res.status(400).json({ success: false, error: `Coupon code "${cleanCode}" already exists.` });
      }
      coupons[idx].code = cleanCode;
    }

    if (type) coupons[idx].type = type === 'flat' ? 'flat' : 'percent';
    if (value !== undefined) coupons[idx].value = Number(value);
    if (minOrder !== undefined) coupons[idx].minOrder = Number(minOrder);
    if (maxDiscount !== undefined) coupons[idx].maxDiscount = maxDiscount !== null && maxDiscount !== '' ? Number(maxDiscount) : null;
    if (description !== undefined) coupons[idx].description = description.trim();
    if (isActive !== undefined) coupons[idx].isActive = !!isActive;
    coupons[idx].updatedAt = new Date().toISOString();

    saveCoupons(coupons);
    console.log(`🎟️ Coupon updated: ${coupons[idx].code}`);
    return res.json({ success: true, message: 'Coupon offer updated successfully!', data: coupons[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/coupons/:id - Delete coupon
app.delete('/api/coupons/:id', (req, res) => {
  try {
    let coupons = readCoupons();
    const target = coupons.find(c => String(c.id) === String(req.params.id));
    if (!target) {
      return res.status(404).json({ success: false, error: 'Coupon not found.' });
    }
    coupons = coupons.filter(c => String(c.id) !== String(req.params.id));
    saveCoupons(coupons);
    console.log(`🗑️ Coupon deleted: ${target.code}`);
    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 1. PRODUCTS REST API (CRUD + OFFERS + STOCK)
// ==========================================

// Helper to attach dynamic approved review statistics
function attachReviewStatsToProduct(p) {
  if (!p) return p;
  const stats = getReviewsForProduct(p.id);
  const totalCount = stats.totalApprovedCount || 0;
  return {
    ...p,
    ratingAverage: totalCount > 0 ? stats.averageRating : 0,
    ratingCount: totalCount
  };
}

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

    const enrichedProducts = products.map(attachReviewStatsToProduct);

    res.json({
      success: true,
      count: enrichedProducts.length,
      data: enrichedProducts
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
    const enrichedProduct = attachReviewStatsToProduct(product);
    res.json({ success: true, data: enrichedProduct });
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

    const pkgInput = body.shippingPackage || {};
    const weightGrams = Number(pkgInput.weightGrams !== undefined ? pkgInput.weightGrams : (body.packageWeightGrams || 0));
    const lengthCm = Number(pkgInput.lengthCm !== undefined ? pkgInput.lengthCm : (body.packageLengthCm || 0));
    const widthCm = Number(pkgInput.widthCm !== undefined ? pkgInput.widthCm : (body.packageWidthCm || 0));
    const heightCm = Number(pkgInput.heightCm !== undefined ? pkgInput.heightCm : (body.packageHeightCm || 0));

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
      featuredImage: body.featuredImage || (Array.isArray(body.images) && body.images[0]) || 'https://fibaxpharma.com/wp-content/uploads/2025/11/front.webp',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : (body.featuredImage ? [body.featuredImage] : []),
      ratingAverage: body.ratingAverage || '4.8',
      ratingCount: Number(body.ratingCount) || 1,
      isBestseller: !!body.isBestseller,
      volumeWeight: body.volumeWeight || '200 ml',
      shippingPackage: {
        weightGrams: weightGrams > 0 ? weightGrams : 0,
        lengthCm: lengthCm > 0 ? lengthCm : 0,
        widthCm: widthCm > 0 ? widthCm : 0,
        heightCm: heightCm > 0 ? heightCm : 0
      },
      packageWeightGrams: weightGrams > 0 ? weightGrams : 0,
      packageLengthCm: lengthCm > 0 ? lengthCm : 0,
      packageWidthCm: widthCm > 0 ? widthCm : 0,
      packageHeightCm: heightCm > 0 ? heightCm : 0,
      shortDesc: body.shortDesc || 'Authentic Ayurvedic formulation by Fibax Pharma.',
      keyBenefits: body.keyBenefits || [
        'Natural herbal recovery and daily wellness',
        'Standardized pure botanical extracts'
      ],
      ingredients: body.ingredients || 'Standardized Ayurvedic herbs and natural decoctions',
      dosage: body.dosage || '10-15 ml twice daily after meals with water.',
      ayushCertified: body.ayushCertified !== false,
      treatmentCourseConfig: body.treatmentCourseConfig !== undefined ? body.treatmentCourseConfig : {
        enabled: false,
        heading: "SELECT TREATMENT COURSE / VALUE PACK:",
        recommendationText: "Recommended 90-Day Course for Best Results",
        packs: []
      },
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

    const currentPkg = current.shippingPackage || {};
    const bodyPkg = body.shippingPackage || {};

    const weightGrams = Number(bodyPkg.weightGrams !== undefined ? bodyPkg.weightGrams : (body.packageWeightGrams !== undefined ? body.packageWeightGrams : (currentPkg.weightGrams !== undefined ? currentPkg.weightGrams : (current.packageWeightGrams || 0))));
    const lengthCm = Number(bodyPkg.lengthCm !== undefined ? bodyPkg.lengthCm : (body.packageLengthCm !== undefined ? body.packageLengthCm : (currentPkg.lengthCm !== undefined ? currentPkg.lengthCm : (current.packageLengthCm || 0))));
    const widthCm = Number(bodyPkg.widthCm !== undefined ? bodyPkg.widthCm : (body.packageWidthCm !== undefined ? body.packageWidthCm : (currentPkg.widthCm !== undefined ? currentPkg.widthCm : (current.packageWidthCm || 0))));
    const heightCm = Number(bodyPkg.heightCm !== undefined ? bodyPkg.heightCm : (body.packageHeightCm !== undefined ? body.packageHeightCm : (currentPkg.heightCm !== undefined ? currentPkg.heightCm : (current.packageHeightCm || 0))));

    const updated = {
      ...current,
      ...body,
      mrp,
      salePrice,
      discountPercent,
      stockQuantity,
      inStock: stockQuantity > 0,
      shippingPackage: {
        weightGrams: weightGrams > 0 ? weightGrams : 0,
        lengthCm: lengthCm > 0 ? lengthCm : 0,
        widthCm: widthCm > 0 ? widthCm : 0,
        heightCm: heightCm > 0 ? heightCm : 0
      },
      packageWeightGrams: weightGrams > 0 ? weightGrams : 0,
      packageLengthCm: lengthCm > 0 ? lengthCm : 0,
      packageWidthCm: widthCm > 0 ? widthCm : 0,
      packageHeightCm: heightCm > 0 ? heightCm : 0,
      treatmentCourseConfig: body.treatmentCourseConfig !== undefined ? body.treatmentCourseConfig : {
        enabled: false,
        heading: "SELECT TREATMENT COURSE / VALUE PACK:",
        recommendationText: "Recommended 90-Day Course for Best Results",
        packs: []
      },
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
      treatmentCourseConfig: body.treatmentCourseConfig !== undefined ? body.treatmentCourseConfig : {
        enabled: false,
        heading: "SELECT TREATMENT COURSE / VALUE PACK:",
        recommendationText: "Recommended 90-Day Course for Best Results",
        packs: []
      },
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
app.post('/api/orders', async (req, res) => {
  try {
    const orders = readOrders();
    const products = readProducts();
    const productsMap = {};
    products.forEach(p => { productsMap[String(p.id)] = p; });

    const { customer, items, shipping, payment, totals } = req.body || {};
    const authenticatedCustomer = getCustomerFromRequest(req);
    const resolvedUserId = authenticatedCustomer?.id || customer?.userId || null;
    const resolvedEmail = authenticatedCustomer?.email || customer?.email || '';

    const orderId = 'FBX-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();

    // 1. Calculate item weights and server-side subtotal
    let cartWeight = 0;
    const itemsList = Array.isArray(items) ? items : [];
    const calculatedSubtotal = itemsList.reduce((acc, item) => {
      const pId = String(item.id || item.product?.id || '');
      const p = productsMap[pId];
      const price = Number(item.price || item.salePrice || p?.salePrice || 0);
      const qty = Number(item.quantity) || 1;

      let itemWeight = 250;
      const vol = item.volumeWeight || p?.volumeWeight;
      if (vol) {
        const m = String(vol).match(/(\d+)\s*(ml|gm|g|kg|l)?/i);
        if (m) {
          let val = parseInt(m[1], 10);
          const u = (m[2] || 'gm').toLowerCase();
          if (u === 'kg' || u === 'l') val *= 1000;
          if (val > 0) itemWeight = val;
        }
      }
      cartWeight += itemWeight * qty;
      return acc + (price * qty);
    }, 0);

    if (cartWeight <= 0) cartWeight = 500;

    // 2. Server-side validation of Delhivery shipping fee
    const paymentMode = payment?.method?.includes('COD') ? 'COD' : (payment?.method || 'Prepaid');
    const shippingCalc = await calculateShippingFee({
      cartTotal: calculatedSubtotal,
      pincode: shipping?.pincode,
      paymentMethod: paymentMode,
      weight: cartWeight
    });

    if (shippingCalc.calculationFailed && shippingCalc.rateMode === 'live') {
      return res.status(400).json({
        success: false,
        error: shippingCalc.error || 'Unable to calculate live Delhivery shipping rate for the destination PIN code. Order placement blocked.'
      });
    }

    const verifiedShippingFee = Number(shippingCalc.shippingFee || 0);
    const verifiedCodFee = Number(shippingCalc.codFee || 0);
    let verifiedDiscount = 0;
    if (totals?.couponCode) {
      const coupons = readCoupons();
      const cleanCode = String(totals.couponCode).trim().toUpperCase();
      const coupon = coupons.find(c => String(c.code).toUpperCase() === cleanCode);
      if (coupon && coupon.isActive !== false && calculatedSubtotal >= (Number(coupon.minOrder) || 0)) {
        if (coupon.type === 'percent') {
          verifiedDiscount = Math.round((calculatedSubtotal * Number(coupon.value)) / 100);
          if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && coupon.maxDiscount !== '' && Number(coupon.maxDiscount) > 0) {
            verifiedDiscount = Math.min(verifiedDiscount, Number(coupon.maxDiscount));
          }
        } else {
          verifiedDiscount = Math.min(Number(coupon.value), calculatedSubtotal);
        }
      }
    }
    const verifiedGrandTotal = Math.max(0, calculatedSubtotal - verifiedDiscount + verifiedShippingFee + verifiedCodFee);

    // Auto-generate rich shipment data with tracking
    const tempOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: {
        ...(customer || {}),
        userId: resolvedUserId,
        email: resolvedEmail || customer?.email || ''
      },
      items: itemsList,
      shipping: shipping || {},
      payment: payment || { method: 'COD', status: 'Pending' },
      totals: {
        subtotal: calculatedSubtotal,
        discountAmount: verifiedDiscount,
        couponCode: totals?.couponCode || null,
        shippingFee: verifiedShippingFee,
        codFee: verifiedCodFee,
        grandTotal: verifiedGrandTotal
      }
    };

    const config = getShippingConfig();
    const courierName = config.defaultCourier || 'Delhivery Express';

    const newOrder = {
      ...tempOrder,
      trackingId: null, // AWB assigned only after admin ships via Delhivery
      courier: courierName,
      status: 'Processing',
      delhiveryAwb: null,
      shipment: null
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

    console.log(`📦 New Order placed: ${orderId} — ${courierName} (AWB pending admin dispatch)`);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2B. SHIPPING & LOGISTICS PLATFORM API
// ==========================================

// GET /api/shipping/config - Get active shipping platform configuration
// Helpers for About Us Hero Banners
const ABOUT_BANNERS_FILE = join(dataDir, 'about_banners.json');

const readAboutBanners = () => {
  try {
    if (!existsSync(ABOUT_BANNERS_FILE)) {
      const initialData = [
        {
          id: 'banner_default',
          title: 'Default About Us Hero',
          enabled: true,
          status: 'published',
          sortOrder: 1,
          desktopImage: '',
          mobileImage: '',
          badgeText: 'AUTHENTIC AYURVEDIC HERITAGE',
          heading: 'Pioneering Pure Ayurvedic Healthcare & Natural Wellness',
          description: 'Fibax Ayurveda is a premier herbal wellness brand dedicated to formulating authentic, research-driven botanical remedies. Backed by WHO-GMP certified infrastructure, we deliver pure, chemical-free healthcare solutions directly to households across India.',
          primaryBtnText: 'Browse 250+ Formulations',
          primaryBtnUrl: 'products',
          secondaryBtnText: 'Contact Us',
          secondaryBtnUrl: 'contact',
          trustPoints: [
            'Pure & Natural Ingredients',
            'WHO-GMP Certified',
            'Safe & Effective Formulations',
            'Made for Healthier India'
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      writeFileSync(ABOUT_BANNERS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const data = readFileSync(ABOUT_BANNERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading about_banners.json:', err);
    return [];
  }
};

const saveAboutBanners = (banners) => {
  try {
    writeFileSync(ABOUT_BANNERS_FILE, JSON.stringify(banners, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving about_banners.json:', err);
    return false;
  }
};

// GET /api/website/about-banners - Get all About Us Hero Banners
app.get('/api/website/about-banners', (req, res) => {
  try {
    const banners = readAboutBanners();
    banners.sort((a, b) => (a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 999) - (b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 999));
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch about banners' });
  }
});

// GET /api/website/about-banners/active - Get active published hero banner for frontend
app.get('/api/website/about-banners/active', (req, res) => {
  try {
    const banners = readAboutBanners();
    const published = banners
      .filter(b => b.status === 'published' && b.enabled !== false)
      .sort((a, b) => (a.sortOrder !== undefined && a.sortOrder !== null ? Number(a.sortOrder) : 999) - (b.sortOrder !== undefined && b.sortOrder !== null ? Number(b.sortOrder) : 999));

    if (published.length > 0) {
      res.json({ success: true, data: published[0], allActive: published });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch active about banner' });
  }
});

// POST /api/website/about-banners - Create new About Us Hero Banner
app.post('/api/website/about-banners', (req, res) => {
  try {
    const banners = readAboutBanners();
    const body = req.body || {};

    const newBanner = {
      id: 'banner_' + Date.now(),
      title: body.title?.trim() || 'New About Us Hero Banner',
      enabled: body.enabled !== false,
      status: body.status || 'published',
      sortOrder: body.sortOrder !== undefined && body.sortOrder !== null ? Number(body.sortOrder) : (banners.length + 1),
      desktopImage: body.desktopImage || '',
      mobileImage: body.mobileImage || '',
      badgeText: body.badgeText || 'AUTHENTIC AYURVEDIC HERITAGE',
      heading: body.heading || 'Pioneering Pure Ayurvedic Healthcare & Natural Wellness',
      description: body.description || '',
      primaryBtnText: body.primaryBtnText || 'Browse 250+ Formulations',
      primaryBtnUrl: body.primaryBtnUrl || 'products',
      secondaryBtnText: body.secondaryBtnText || 'Contact Us',
      secondaryBtnUrl: body.secondaryBtnUrl || 'contact',
      trustPoints: Array.isArray(body.trustPoints) && body.trustPoints.length > 0 
        ? body.trustPoints 
        : ['Pure & Natural Ingredients', 'WHO-GMP Certified', 'Safe & Effective Formulations', 'Made for Healthier India'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    banners.push(newBanner);
    saveAboutBanners(banners);
    res.json({ success: true, data: newBanner });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create about banner' });
  }
});

// PUT /api/website/about-banners/:id - Update About Us Hero Banner
app.put('/api/website/about-banners/:id', (req, res) => {
  try {
    const banners = readAboutBanners();
    const idx = banners.findIndex(b => String(b.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    const current = banners[idx];
    const body = req.body || {};

    const updated = {
      ...current,
      ...body,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : current.sortOrder,
      updatedAt: new Date().toISOString()
    };

    banners[idx] = updated;
    saveAboutBanners(banners);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update about banner' });
  }
});

// DELETE /api/website/about-banners/:id - Delete About Us Hero Banner
app.delete('/api/website/about-banners/:id', (req, res) => {
  try {
    let banners = readAboutBanners();
    const initialLen = banners.length;
    banners = banners.filter(b => String(b.id) !== String(req.params.id));
    if (banners.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }
    saveAboutBanners(banners);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete about banner' });
  }
});

app.get('/api/shipping/config', (req, res) => {
  try {
    const config = getShippingConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/config - Save shipping platform configuration
app.post('/api/shipping/config', (req, res) => {
  try {
    const updated = saveShippingConfig(req.body || {});
    res.json({ success: true, message: 'Shipping platform configuration saved', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/check-serviceability - Real-time PIN code verification
app.post('/api/shipping/check-serviceability', async (req, res) => {
  try {
    const { pincode } = req.body || {};
    const result = await checkPincodeServiceability(pincode);
    res.json({ success: result.serviceable, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/rates - Dynamic Shipping & COD Fee Calculation
app.post('/api/shipping/rates', async (req, res) => {
  try {
    const { cartTotal, pincode, paymentMethod, weight, items } = req.body || {};
    const productsList = readProducts();
    const result = await calculateShippingFee({
      cartTotal,
      pincode,
      paymentMethod,
      weight,
      items,
      productsList,
      combosList: productsList.filter(p => p.isCombo || p.categoryId === 'combos')
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// REVIEWS & RATINGS SYSTEM API ENDPOINTS
// ====================================================

// GET /api/reviews/product/:productId - Get approved public reviews & stats for a product
app.get('/api/reviews/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const data = getReviewsForProduct(productId);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews - Customer Review Submission (Forces status = PENDING)
app.post('/api/reviews', (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      content,
      images,
      video,
      customerId,
      customerName,
      customerEmail,
      customerPhone
    } = req.body || {};

    const newReview = submitReview({
      productId,
      rating,
      title,
      content,
      images,
      video,
      customerId,
      customerName,
      customerEmail,
      customerPhone
    });

    return res.json({
      success: true,
      data: newReview,
      message: 'Thank you! Your review has been submitted and is awaiting approval.'
    });
  } catch (err) {
    console.error('Error submitting customer review:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/:id/helpful - Increment review helpful count
app.post('/api/reviews/:id/helpful', (req, res) => {
  try {
    const ok = markReviewHelpful(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Review not found' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/:id/report - Report review
app.post('/api/reviews/:id/report', (req, res) => {
  try {
    const ok = reportReview(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Review not found' });
    return res.json({ success: true, message: 'Review reported for administrative review.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/reviews - Admin Review Dashboard List & Stats
app.get('/api/admin/reviews', (req, res) => {
  try {
    const { status, rating, verified, media, reported, search } = req.query || {};
    const result = getAdminReviews({ status, rating, verified, media, reported, search });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/reviews/:id/status - Approve, Reject, or Remove Review
app.put('/api/admin/reviews/:id/status', (req, res) => {
  try {
    const { status, adminNote } = req.body || {};
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }
    const updated = updateReviewStatus(req.params.id, status, adminNote);
    return res.json({ success: true, data: updated, message: `Review status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating review status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/reviews/bulk-status - Bulk Approve, Reject, or Remove Reviews
app.post('/api/admin/reviews/bulk-status', (req, res) => {
  try {
    const { ids, status } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ success: false, error: 'Review IDs array and target status are required.' });
    }
    const result = bulkUpdateReviewStatus(ids, status);
    return res.json({ success: true, data: result, message: `Bulk updated ${result.updatedCount} reviews to ${status}.` });
  } catch (err) {
    console.error('Error bulk updating review status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/reviews/:id - Remove / Delete Review
app.delete('/api/admin/reviews/:id', (req, res) => {
  try {
    const { permanent } = req.query || {};
    if (permanent === 'true') {
      deleteReviewPermanently(req.params.id);
      return res.json({ success: true, message: 'Review permanently deleted.' });
    }
    const updated = updateReviewStatus(req.params.id, 'REMOVED', 'Removed by admin');
    return res.json({ success: true, data: updated, message: 'Review safely removed.' });
  } catch (err) {
    console.error('Error removing review:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/reviews/:id/media - Remove individual photo or video from a review
app.delete('/api/admin/reviews/:id/media', (req, res) => {
  try {
    const { mediaUrl } = req.body || req.query || {};
    if (!mediaUrl) {
      return res.status(400).json({ success: false, error: 'mediaUrl is required.' });
    }
    const updated = removeReviewMedia(req.params.id, mediaUrl);
    return res.json({ success: true, data: updated, message: 'Media item successfully removed from review.' });
  } catch (err) {
    console.error('Error removing review media:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/ship-order/:id - 1-Click Order Fulfillment / Real Delhivery AWB Creation
app.post('/api/shipping/ship-order/:id', async (req, res) => {
  try {
    const orders = readOrders();
    const idx = orders.findIndex(o => o.orderId === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orders[idx];

    // Call real Delhivery shipment creation API
    const delhiveryResult = await createDelhiveryShipment(order, req.body || {});

    if (!delhiveryResult.success) {
      const errorMsg = delhiveryResult.existingAwb
        ? `Shipment already created — AWB: ${delhiveryResult.existingAwb}`
        : (delhiveryResult.error || 'Failed to create Delhivery shipment');
      return res.status(400).json({
        success: false,
        error: errorMsg,
        existingAwb: delhiveryResult.existingAwb || null
      });
    }

    const awb = delhiveryResult.awb || delhiveryResult.waybill;

    // Optional: Auto-trigger pickup request
    try {
      await requestDelhiveryPickup(order);
    } catch (pickupErr) {
      console.warn('Auto pickup request failed (non-blocking):', pickupErr.message);
    }

    orders[idx] = {
      ...order,
      status: 'Manifested',
      trackingId: awb,
      delhiveryAwb: awb,
      courier: delhiveryResult.courier || 'Delhivery Express',
      shipment: delhiveryResult,
      updatedAt: new Date().toISOString()
    };

    saveOrders(orders);
    console.log(`🚚 Delhivery Shipment Created & Manifested for ${order.orderId}: AWB ${awb}`);
    res.json({ success: true, message: 'Shipment created successfully with Delhivery AWB ' + awb, data: orders[idx] });
  } catch (err) {
    console.error('Ship order error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipping/track/:id - Public Tracking Lookup (by orderId or trackingId/AWB)
app.get('/api/shipping/track/:id', async (req, res) => {
  try {
    const orders = readOrders();
    const tracking = await getTrackingDetails(req.params.id, orders);
    if (!tracking) {
      return res.status(404).json({
        success: false,
        error: `No shipment found matching tracking ID or Order number "${req.params.id}". Please verify and try again.`
      });
    }
    res.json({ success: true, data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipping/label/:orderId - Printable Shipping Label HTML
app.get('/api/shipping/label/:orderId', (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find(o => o.orderId === req.params.orderId || o.trackingId === req.params.orderId);
    if (!order) {
      return res.status(404).send('<h3>Order not found for shipping label</h3>');
    }
    const html = generatePrintableLabel(order);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error generating shipping label: ' + err.message);
  }
});

// PATCH /api/shipping/status/:orderId - Update shipment status and location remarks
app.patch('/api/shipping/status/:orderId', (req, res) => {
  try {
    const { status, location, remark } = req.body || {};
    const orders = readOrders();
    const idx = orders.findIndex(o => o.orderId === req.params.orderId || o.trackingId === req.params.orderId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orders[idx];
    const currentTimeline = order.shipment?.timeline || createShipmentForOrder(order).timeline;

    const newMilestone = {
      status: status || order.status,
      title: status || 'Status Update',
      location: location || 'Transit Hub',
      timestamp: new Date().toISOString(),
      completed: true,
      description: remark || `Package status updated to ${status}`
    };

    orders[idx] = {
      ...order,
      status: status || order.status,
      shipment: {
        ...(order.shipment || {}),
        status: status || order.status,
        timeline: [...currentTimeline, newMilestone]
      },
      updatedAt: new Date().toISOString()
    };

    saveOrders(orders);
    res.json({ success: true, message: 'Shipment status updated', data: orders[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// RAZORPAY PAYMENT GATEWAY ENDPOINTS
// ==========================================

// GET /api/payment/config - Public Razorpay Key ID
app.get('/api/payment/config', (req, res) => {
  try {
    const config = getPaymentConfig();
    res.json({ success: true, ...config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/create-order - Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body || {};
    const orderData = await createRazorpayOrder({ amount, receipt, notes });
    res.json(orderData);
  } catch (err) {
    console.error('Create payment order error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/verify - Verify Razorpay Payment Signature
app.post('/api/payment/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    const result = verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, error: err.message });
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

    const enquiries = readEnquiries();
    enquiries.push(sanitizedEnquiry);
    saveEnquiries(enquiries);

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
    const enquiries = readEnquiries();
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

// Start server after the storage layer (JSON files or MySQL) is ready
async function bootstrap() {
  try {
    await initStore();
    await initShipping();
  } catch (err) {
    // initStore already falls back to JSON on DB errors, so reaching here is
    // unexpected. Log it but still start the server so the site is reachable.
    console.error('❌ Storage initialization error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`
  🌿 Fibax Pharma Server
  =========================================
  🚀 Server running on: http://localhost:${PORT}
  🗄️ Storage:           ${storageDriver().toUpperCase()}
  📦 Products API:      GET/POST http://localhost:${PORT}/api/products
  🏷️ Pricing API:       PATCH    http://localhost:${PORT}/api/products/:id/pricing
  📊 Inventory API:     PATCH    http://localhost:${PORT}/api/products/:id/stock
  📈 Inventory Stats:   GET      http://localhost:${PORT}/api/inventory/stats
  🛒 Orders API:        GET/POST http://localhost:${PORT}/api/orders
  =========================================
  `);
  });
}

// Flush pending writes on shutdown so nothing is lost.
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
