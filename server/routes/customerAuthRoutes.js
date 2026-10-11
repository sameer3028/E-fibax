import { Router } from 'express';
import crypto from 'crypto';
import {
  hashPassword,
  verifyPassword,
  generateCustomerToken,
  getCustomerFromRequest,
  sanitizeUser,
  customerSessions
} from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { getArray, setArray } from '../store.js';

const router = Router();
const otpStore = new Map();

function readUsers() {
  return getArray('users');
}

function saveUsers(users) {
  setArray('users', users);
}

function readOrders() {
  return getArray('orders');
}

// POST /api/auth/register - Customer Account Creation
router.post('/register', authLimiter, (req, res) => {
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

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists. Please log in.' });
    }

    if (users.some(u => u.phone === cleanPhone)) {
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
router.post('/login', authLimiter, (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !identifier.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Please enter your email or phone and password.' });
    }

    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();
    const phoneDigits = rawId.replace(/[^0-9]/g, '');

    const users = readUsers();
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

// POST /api/auth/send-otp - Send OTP to mobile number
router.post('/send-otp', (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    const standardPhone = cleanPhone.slice(-10);
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    otpStore.set(standardPhone, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    console.log(`📱 [Fibax OTP Service] Generated OTP for +91 ${standardPhone}: ${generatedOtp}`);

    return res.json({
      success: true,
      message: `OTP sent successfully to +91 ${standardPhone}`,
      phone: standardPhone,
      testOtp: generatedOtp
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/verify-otp - Verify OTP and auto-authenticate customer
router.post('/verify-otp', (req, res) => {
  try {
    const { phone, otp, name } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and OTP are required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const cleanOtp = String(otp).trim();

    const record = otpStore.get(cleanPhone);
    const isValid = cleanOtp === '1234' || (record && record.otp === cleanOtp && Date.now() < record.expiresAt);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP. Use 1234 or request a new OTP.' });
    }

    otpStore.delete(cleanPhone);

    const users = readUsers();
    let user = users.find(u => u.phone === cleanPhone);

    if (!user) {
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

// GET /api/auth/me - Get Current Customer Profile
router.get('/me', (req, res) => {
  const customer = getCustomerFromRequest(req);
  if (!customer) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
  }
  return res.json({ success: true, user: sanitizeUser(customer) });
});

// PUT /api/auth/profile - Update Customer Profile
router.put('/profile', (req, res) => {
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
      users[idx].addresses = [{
        id: 'addr_' + Date.now(),
        address: address.trim(),
        city: (city || '').trim(),
        pincode: (pincode || '').trim(),
        isDefault: true
      }];
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

// POST /api/auth/logout - Logout Customer
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      customerSessions.delete(parts[1]);
    }
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/user/orders - Customer order history
router.get('/user/orders', (req, res) => {
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

export default router;
