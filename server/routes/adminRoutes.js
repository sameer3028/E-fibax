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
import { getArray, setArray, setSingleton } from '../store.js';
import { executeOrderCancellation } from './orderRoutes.js';
import { auditDuplicateCustomers } from '../services/userService.js';

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
    try {
      const config = getAdminConfig();
      if (config.tokens && config.tokens[session.token]) {
        delete config.tokens[session.token];
        setSingleton('admin_auth', config);
      }
    } catch {}
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

// GET /api/admin/users/audit-duplicates - Audit existing duplicate mobile numbers across all customer accounts
router.get('/users/audit-duplicates', requireAdminAuth, (req, res) => {
  try {
    const users = getArray('users');
    const orders = getArray('orders');
    const report = auditDuplicateCustomers(users, orders);
    return res.json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Error auditing duplicate customers:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/orders - Dedicated Admin Orders endpoint (Guaranteed Admin Auth, Strict No-Cache)
router.get('/orders', requireAdminAuth, (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const orders = getArray('orders');
    return res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/orders/:orderId/cancel - Dedicated Admin Order Cancellation Endpoint
router.post('/orders/:orderId/cancel', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, adminRemarks } = req.body || {};
    const adminSession = getAdminSessionFromRequest(req);

    const result = await executeOrderCancellation({
      orderId,
      reason,
      adminRemarks,
      isAdmin: true,
      adminUser: adminSession?.username || 'admin'
    });

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Error in admin order cancellation:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: Normalize enquiry records for consistent dashboard consumption
function normalizeEnquiryRecord(e) {
  if (!e || typeof e !== 'object') return null;
  const isDoctorCallback = (e.type === 'doctor_callback') ||
    (e.experience && String(e.experience).toLowerCase().includes('callback')) ||
    (e.message && String(e.message).toLowerCase().includes('preferred slot'));

  let concern = e.concern || '';
  if (!concern && e.experience && String(e.experience).startsWith('Callback Request - ')) {
    concern = String(e.experience).replace('Callback Request - ', '').trim();
  }

  let preferredTime = e.preferredTime || '';
  if (!preferredTime && e.message && String(e.message).includes('Preferred Slot: ')) {
    preferredTime = String(e.message).split('Preferred Slot: ')[1]?.split('|')[0]?.trim() || '';
  }

  let notes = e.notes || '';
  if (!notes && e.message && String(e.message).includes('Notes: ')) {
    notes = String(e.message).split('Notes: ')[1]?.split('|')[0]?.trim() || '';
  }

  return {
    id: e.id || `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: isDoctorCallback ? 'doctor_callback' : (e.type || 'general_enquiry'),
    name: e.name || 'Anonymous',
    phone: e.phone || '',
    email: e.email || '',
    city: e.city || 'India',
    concern: concern || (isDoctorCallback ? 'General Ayurvedic Consultation' : ''),
    preferredTime: preferredTime || '',
    notes: notes || '',
    status: e.status || 'New',
    followUpNotes: e.followUpNotes || '',
    customFields: e.customFields && typeof e.customFields === 'object' ? e.customFields : {},
    experience: e.experience || '',
    message: e.message || '',
    timestamp: e.timestamp || e.createdAt || new Date().toISOString(),
    updatedAt: e.updatedAt || e.timestamp || new Date().toISOString(),
    source: e.source || 'website',
    ip: e.ip || 'unknown'
  };
}

// GET /api/admin/enquiries - Dedicated Admin Enquiries & Doctor Callbacks endpoint
router.get('/enquiries', requireAdminAuth, (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const raw = getArray('enquiries');
    const enquiries = raw.map(normalizeEnquiryRecord).filter(Boolean);
    
    // Sort descending by timestamp (newest submissions first)
    enquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const newCount = enquiries.filter(e => e.status === 'New').length;
    const callbackCount = enquiries.filter(e => e.type === 'doctor_callback').length;
    const newCallbackCount = enquiries.filter(e => e.type === 'doctor_callback' && e.status === 'New').length;

    return res.json({
      success: true,
      count: enquiries.length,
      newCount,
      callbackCount,
      newCallbackCount,
      data: enquiries
    });
  } catch (err) {
    console.error('Error fetching admin enquiries:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/enquiries/:id - Update Enquiry Status & Follow-up Notes
router.put('/enquiries/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status, followUpNotes } = req.body || {};

    const enquiries = getArray('enquiries');
    const index = enquiries.findIndex(e => String(e.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    const validStatuses = ['New', 'Contacted', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const current = enquiries[index];
    enquiries[index] = {
      ...current,
      ...(status ? { status } : {}),
      ...(followUpNotes !== undefined ? { followUpNotes: String(followUpNotes).slice(0, 1000).trim() } : {}),
      updatedAt: new Date().toISOString()
    };

    setArray('enquiries', enquiries);
    console.log(`📝 Updated Enquiry #${id} status: ${enquiries[index].status}`);

    return res.json({
      success: true,
      message: 'Enquiry record updated successfully.',
      data: normalizeEnquiryRecord(enquiries[index])
    });
  } catch (err) {
    console.error('Error updating admin enquiry:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/enquiries/:id - Remove invalid / spam enquiry
router.delete('/enquiries/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const enquiries = getArray('enquiries');
    const filtered = enquiries.filter(e => String(e.id) !== String(id));

    if (filtered.length === enquiries.length) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    setArray('enquiries', filtered);
    console.log(`🗑️ Deleted Enquiry #${id}`);

    return res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err) {
    console.error('Error deleting admin enquiry:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
