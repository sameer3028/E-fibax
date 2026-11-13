import crypto from 'crypto';
import { getArray, getSingleton, setSingleton } from '../store.js';

// Password hashing using scrypt
export function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password, salt, storedHash) {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

export function getAdminConfig() {
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

// In-memory active admin tokens: Map<token, { username, expiresAt }>
export const activeAdminSessions = new Map();

export function generateAdminToken(username) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeAdminSessions.set(token, { username, expiresAt });

  // Persist token in admin_auth singleton so sessions survive server restarts/deploys
  try {
    const config = getAdminConfig();
    if (!config.tokens || typeof config.tokens !== 'object') {
      config.tokens = {};
    }
    config.tokens[token] = { username: username || config.username || 'admin', expiresAt };
    // Prune expired tokens
    const now = Date.now();
    for (const [t, s] of Object.entries(config.tokens)) {
      if (!s || !s.expiresAt || s.expiresAt < now) {
        delete config.tokens[t];
      }
    }
    setSingleton('admin_auth', config);
  } catch (err) {
    console.error('Failed to persist admin session token:', err);
  }

  return token;
}

export function getAdminSessionFromRequest(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];
  
  let session = activeAdminSessions.get(token);

  // If not found in RAM (e.g. after server reboot or redeploy), check admin_auth singleton
  if (!session) {
    try {
      const config = getAdminConfig();
      if (config.tokens && config.tokens[token]) {
        const persisted = config.tokens[token];
        if (persisted.expiresAt > Date.now()) {
          session = { username: persisted.username || config.username || 'admin', expiresAt: persisted.expiresAt };
          activeAdminSessions.set(token, session);
        } else {
          delete config.tokens[token];
          setSingleton('admin_auth', config);
        }
      }
    } catch (err) {
      console.error('Error verifying persisted session:', err);
    }
  }

  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    return null;
  }
  return { ...session, token };
}

/**
 * Middleware: Strictly requires authenticated Admin session
 */
export function requireAdminAuth(req, res, next) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required.'
    });
  }
  req.admin = session;
  next();
}

// Customer User Sessions: Map<token, { userId, expiresAt }>
export const customerSessions = new Map();

export function generateCustomerToken(userId) {
  const token = 'cust_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  customerSessions.set(token, { userId, expiresAt });
  return token;
}

export function getCustomerFromRequest(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
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
  const users = getArray('users');
  const user = users.find(u => u.id === session.userId);
  if (!user) return null;
  return { ...user, sessionToken: token };
}

/**
 * Middleware: Strictly requires authenticated Customer session
 */
export function requireCustomerAuth(req, res, next) {
  const customer = getCustomerFromRequest(req);
  if (!customer) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Customer login required.'
    });
  }
  req.customer = customer;
  next();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { salt, passwordHash, ...safeUser } = user;
  return safeUser;
}
