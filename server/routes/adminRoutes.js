import { Router } from 'express';
import crypto from 'crypto';
import {
  getAdminConfig,
  verifyPassword,
  hashPassword,
  generateAdminToken,
  getAdminSessionFromRequest,
  requireAdminAuth,
  activeAdminSessions,
  customerSessions
} from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { getArray, setSingleton } from '../store.js';

const router = Router();

// POST /api/admin/login
router.post('/login', authLimiter, (req, res) => {
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

    const token = generateAdminToken(config.username);
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
router.get('/verify', (req, res) => {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, valid: false, error: 'Invalid or expired session' });
  }
  return res.json({ success: true, valid: true, username: session.username });
});

// POST /api/admin/change-password
router.post('/change-password', requireAdminAuth, (req, res) => {
  try {
    const session = req.admin;
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
router.post('/logout', (req, res) => {
  const session = getAdminSessionFromRequest(req);
  if (session) {
    activeAdminSessions.delete(session.token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/users - List all registered customers with stats
router.get('/users', requireAdminAuth, (req, res) => {
  try {
    const users = getArray('users');
    const orders = getArray('orders');
    const now = Date.now();

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
          (o.customer?.email && o.customer.email.toLowerCase() === (u.email || '').toLowerCase()) ||
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

export default router;
