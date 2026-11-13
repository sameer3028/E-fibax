import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { getArray, getSingleton, setSingleton, readJsonFile, writeJsonFile } from '../store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ADMIN_SESSIONS_FILE = join(__dirname, '..', 'data', 'admin_sessions.json');
const CUSTOMER_SESSIONS_FILE = join(__dirname, '..', 'data', 'customer_sessions.json');

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

export function getAdminSessionSecret() {
  const config = getAdminConfig();
  return process.env.ADMIN_SESSION_SECRET || `${config.salt}:${(config.passwordHash || '').slice(0, 32)}`;
}

// In-memory active admin tokens: Map<token, { username, expiresAt }>
export const activeAdminSessions = new Map();

// Helper to save sessions to persistent disk storage
function persistAdminSessions() {
  try {
    const obj = {};
    const now = Date.now();
    activeAdminSessions.forEach((val, key) => {
      if (val && val.expiresAt && val.expiresAt > now) {
        obj[key] = val;
      }
    });
    writeJsonFile(ADMIN_SESSIONS_FILE, obj);
  } catch (err) {
    // Non-fatal warning
  }
}

// Helper to load sessions from disk storage
function loadAdminSessionsFromFile() {
  try {
    if (existsSync(ADMIN_SESSIONS_FILE)) {
      const data = readJsonFile(ADMIN_SESSIONS_FILE, {});
      const now = Date.now();
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([token, sess]) => {
          if (sess && sess.expiresAt && sess.expiresAt > now) {
            activeAdminSessions.set(token, sess);
          }
        });
      }
    }
  } catch (_) {}
}

// Load persisted sessions on startup
loadAdminSessionsFromFile();

export function generateAdminToken(username) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const secret = getAdminSessionSecret();

  // Create HMAC-signed stateless token: adm_<base64url(payload)>.<base64url(hmac)>
  const payloadObj = {
    u: username,
    exp: expiresAt,
    r: crypto.randomBytes(16).toString('hex')
  };
  const payloadStr = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');
  const token = `adm_${payloadStr}.${sig}`;

  activeAdminSessions.set(token, { username, expiresAt });
  persistAdminSessions();
  return token;
}

export function deleteAdminSession(token) {
  if (!token) return;
  activeAdminSessions.delete(token);
  persistAdminSessions();
}

export function getAdminSessionFromRequest(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1]?.trim();
  if (!token) return null;

  // 1. Check in-memory map
  let session = activeAdminSessions.get(token);

  // 2. If missing from memory (e.g. server restart), reload from disk
  if (!session) {
    loadAdminSessionsFromFile();
    session = activeAdminSessions.get(token);
  }

  // 3. Stateless cryptographic verification (HMAC signature)
  // Survives server restarts, multi-process clustering, and ephemeral containers
  if (!session && token.startsWith('adm_')) {
    try {
      const rest = token.slice(4);
      const dot = rest.indexOf('.');
      if (dot !== -1) {
        const payloadStr = rest.slice(0, dot);
        const receivedSig = rest.slice(dot + 1);
        const secret = getAdminSessionSecret();
        const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');

        if (
          receivedSig.length === expectedSig.length &&
          crypto.timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig))
        ) {
          const parsed = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
          if (parsed && parsed.u && parsed.exp && Date.now() <= parsed.exp) {
            session = { username: parsed.u, expiresAt: parsed.exp };
            activeAdminSessions.set(token, session);
            persistAdminSessions();
          }
        }
      }
    } catch (_) {
      // Signature parse error, handled as null
    }
  }

  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    persistAdminSessions();
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

function persistCustomerSessions() {
  try {
    const obj = {};
    const now = Date.now();
    customerSessions.forEach((val, key) => {
      if (val && val.expiresAt && val.expiresAt > now) {
        obj[key] = val;
      }
    });
    writeJsonFile(CUSTOMER_SESSIONS_FILE, obj);
  } catch (_) {}
}

function loadCustomerSessionsFromFile() {
  try {
    if (existsSync(CUSTOMER_SESSIONS_FILE)) {
      const data = readJsonFile(CUSTOMER_SESSIONS_FILE, {});
      const now = Date.now();
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([token, sess]) => {
          if (sess && sess.expiresAt && sess.expiresAt > now) {
            customerSessions.set(token, sess);
          }
        });
      }
    }
  } catch (_) {}
}

loadCustomerSessionsFromFile();

export function generateCustomerToken(userId) {
  const token = 'cust_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  customerSessions.set(token, { userId, expiresAt });
  persistCustomerSessions();
  return token;
}

export function deleteCustomerSession(token) {
  if (!token) return;
  customerSessions.delete(token);
  persistCustomerSessions();
}

export function getCustomerFromRequest(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1]?.trim();
  if (!token) return null;

  let session = customerSessions.get(token);
  if (!session) {
    loadCustomerSessionsFromFile();
    session = customerSessions.get(token);
  }

  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    customerSessions.delete(token);
    persistCustomerSessions();
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
