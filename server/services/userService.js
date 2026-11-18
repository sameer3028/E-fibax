/**
 * Fibax Ayurveda — User Service & Phone Normalization Layer
 *
 * Enforces:
 *   1. Canonical Indian mobile number normalization (e.g. +91, 91, 0, spaces -> 10 digits)
 *   2. Database-level / storage-level uniqueness validation for mobile numbers
 *   3. Concurrency protection via serialized registration mutex
 *   4. Safe audit of historical duplicate accounts without modifying production data
 */

import crypto from 'crypto';
import { hashPassword, generateCustomerToken, sanitizeUser } from '../middleware/auth.js';
import { getArray, setArray } from '../store.js';

/**
 * Normalizes Indian mobile numbers to standard 10-digit format.
 * Supported variations:
 *   - "9876543210"        -> "9876543210"
 *   - "+919876543210"     -> "9876543210"
 *   - "919876543210"      -> "9876543210"
 *   - "09876543210"       -> "9876543210"
 *   - "+91 98765 43210"   -> "9876543210"
 *   - "+91-98765-43210"   -> "9876543210"
 *   - "9109876543210"     -> "9876543210"
 *
 * Validation:
 *   Must resolve to exactly 10 digits starting with 6, 7, 8, or 9 (TRAI standard).
 *   Returns null if input is empty, non-numeric, or not a valid 10-digit Indian mobile.
 *
 * @param {string|number} phone
 * @returns {string|null} Canonical 10-digit Indian mobile number or null
 */
export function normalizeIndianMobileNumber(phone) {
  if (phone === null || phone === undefined) return null;

  // 1. Strip all non-digit characters
  const rawDigits = String(phone).replace(/\D/g, '');
  if (!rawDigits) return null;

  let candidate = null;

  // 2. Handle specific Indian dialling prefixes
  if (rawDigits.length === 10) {
    candidate = rawDigits;
  } else if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
    // Leading trunk 0: e.g. 09876543210
    candidate = rawDigits.slice(1);
  } else if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
    // Standard country code without +: e.g. 919876543210
    candidate = rawDigits.slice(2);
  } else if (rawDigits.length === 13 && rawDigits.startsWith('910')) {
    // Country code + trunk 0: e.g. 9109876543210
    candidate = rawDigits.slice(3);
  } else if (rawDigits.length > 10) {
    // Safe fallback: take last 10 digits
    candidate = rawDigits.slice(-10);
  }

  // 3. Indian mobile numbers must be 10 digits and begin with 6, 7, 8, or 9
  if (candidate && candidate.length === 10 && /^[6-9]\d{9}$/.test(candidate)) {
    return candidate;
  }

  return null;
}

/**
 * Validates whether the given phone number is a valid Indian mobile number.
 * @param {string|number} phone
 * @returns {boolean}
 */
export function isValidIndianMobileNumber(phone) {
  return normalizeIndianMobileNumber(phone) !== null;
}

/**
 * Find the first customer account matching the normalized mobile number.
 * Inspects both normalized u.phone and raw digits fallback.
 * @param {Array} users
 * @param {string} phone
 * @returns {Object|null}
 */
export function findUserByMobile(users, phone) {
  const normalized = normalizeIndianMobileNumber(phone);
  if (!normalized || !Array.isArray(users)) return null;

  return users.find(u => {
    const uNorm = normalizeIndianMobileNumber(u.phone) || String(u.phone || '').replace(/\D/g, '').slice(-10);
    return uNorm === normalized;
  }) || null;
}

/**
 * Find all customer accounts matching the normalized mobile number (for auditing & multi-account login).
 * @param {Array} users
 * @param {string} phone
 * @returns {Array}
 */
export function findUsersByMobile(users, phone) {
  const normalized = normalizeIndianMobileNumber(phone);
  if (!normalized || !Array.isArray(users)) return [];

  return users.filter(u => {
    const uNorm = normalizeIndianMobileNumber(u.phone) || String(u.phone || '').replace(/\D/g, '').slice(-10);
    return uNorm === normalized;
  });
}

/**
 * Find a customer account matching an email address (case-insensitive).
 * @param {Array} users
 * @param {string} email
 * @returns {Object|null}
 */
export function findUserByEmail(users, email) {
  if (!email || !Array.isArray(users)) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  return users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail) || null;
}

/**
 * Find candidate users matching an identifier (email address or normalized mobile number).
 * @param {Array} users
 * @param {string} identifier
 * @returns {Array} List of matching candidate users
 */
export function findUsersByIdentifier(users, identifier) {
  if (!identifier || !Array.isArray(users)) return [];
  const raw = String(identifier).trim();
  const cleanEmail = raw.toLowerCase();

  // 1. Try email match first
  const byEmail = users.filter(u => (u.email || '').trim().toLowerCase() === cleanEmail);
  if (byEmail.length > 0) return byEmail;

  // 2. Try normalized mobile match
  const normalizedPhone = normalizeIndianMobileNumber(raw);
  if (normalizedPhone) {
    const byPhone = findUsersByMobile(users, normalizedPhone);
    if (byPhone.length > 0) return byPhone;
  }

  // 3. Fallback: match raw phone digits (for legacy/international numbers if any)
  const rawDigits = raw.replace(/\D/g, '');
  if (rawDigits.length >= 10) {
    const byDigits = users.filter(u => {
      const uDigits = String(u.phone || '').replace(/\D/g, '');
      return uDigits === rawDigits || uDigits.slice(-10) === rawDigits.slice(-10);
    });
    if (byDigits.length > 0) return byDigits;
  }

  return [];
}

/**
 * Registration Mutex: Serializes registration operations to prevent race conditions.
 */
let registrationLock = Promise.resolve();

export function withRegistrationLock(taskFn) {
  const run = registrationLock.then(() => taskFn());
  // Chain next task, catching previous errors so lock never deadlocks
  registrationLock = run.catch(() => {});
  return run;
}

/**
 * Atomic Customer Registration with Concurrency & Uniqueness Protection
 *
 * @param {Object} data Registration payload
 * @param {string} data.name Full customer name
 * @param {string} data.email Customer email
 * @param {string} data.phone Customer mobile number
 * @param {string} data.password Plain password
 * @param {string} [data.address] Optional address
 * @param {string} [data.city] Optional city
 * @param {string} [data.pincode] Optional pincode
 * @returns {Promise<Object>} Result object with status, success, and user/token or error
 */
export async function registerCustomerAtomic({ name, email, phone, password, address, city, pincode }) {
  return withRegistrationLock(async () => {
    // 1. Validate required inputs
    if (!name || !name.trim()) {
      return { success: false, status: 400, error: 'Full name is required.' };
    }
    if (!email || !email.trim()) {
      return { success: false, status: 400, error: 'Email address is required.' };
    }
    if (!phone || !String(phone).trim()) {
      return { success: false, status: 400, error: 'Mobile number is required.' };
    }
    if (!password || password.length < 6) {
      return { success: false, status: 400, error: 'Password must be at least 6 characters long.' };
    }

    const cleanName = name.replace(/[<>]/g, '').trim();
    if (cleanName.length < 2) {
      return { success: false, status: 400, error: 'Name must be at least 2 characters.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      return { success: false, status: 400, error: 'Please enter a valid email address.' };
    }

    // 2. Normalize and validate mobile number
    const normalizedPhone = normalizeIndianMobileNumber(phone);
    if (!normalizedPhone) {
      return {
        success: false,
        status: 400,
        error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210).'
      };
    }

    // 3. Re-read latest users from storage within the serialized lock
    const users = getArray('users');

    // 4. Enforce Mobile Number Uniqueness
    const existingUserWithPhone = findUserByMobile(users, normalizedPhone);
    if (existingUserWithPhone) {
      return {
        success: false,
        status: 400,
        error: 'This mobile number is already registered. Please sign in or use Forgot Password.',
        errorCode: 'PHONE_ALREADY_REGISTERED',
        normalizedPhone
      };
    }

    // 5. Enforce Email Uniqueness
    const existingUserWithEmail = findUserByEmail(users, cleanEmail);
    if (existingUserWithEmail) {
      return {
        success: false,
        status: 400,
        error: 'An account with this email address already exists. Please log in.',
        errorCode: 'EMAIL_ALREADY_REGISTERED',
        email: cleanEmail
      };
    }

    // 6. Generate cryptographic credentials and canonical user record
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
      phone: normalizedPhone, // Stored in canonical 10-digit format
      salt,
      passwordHash,
      addresses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginCount: 1,
      lastLoginAt: new Date().toISOString()
    };

    // 7. Atomic write-through
    users.push(newUser);
    setArray('users', users);

    const token = generateCustomerToken(userId);
    console.log(`👤 [Registration] New customer registered: ${newUser.name} (+91 ${newUser.phone}, ${newUser.email}) - ID: ${newUser.id}`);

    return {
      success: true,
      status: 201,
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(newUser)
    };
  });
}

/**
 * Audit Existing Duplicate Mobile Numbers across All Customer Accounts
 * Does NOT modify or delete any customer accounts or orders.
 *
 * @param {Array} users Array of customer objects
 * @param {Array} orders Array of order objects (for cross-referencing order counts)
 * @returns {Object} Comprehensive audit report
 */
export function auditDuplicateCustomers(users = [], orders = []) {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Map of normalized phone -> array of user accounts
  const phoneMap = new Map();
  const unparseablePhones = [];

  // Group accounts by normalized phone number
  safeUsers.forEach(user => {
    const raw = user.phone || '';
    const normalized = normalizeIndianMobileNumber(raw) || (String(raw).replace(/\D/g, '').length >= 10 ? String(raw).replace(/\D/g, '').slice(-10) : null);

    if (normalized) {
      if (!phoneMap.has(normalized)) {
        phoneMap.set(normalized, []);
      }
      phoneMap.get(normalized).push(user);
    } else {
      unparseablePhones.push({
        id: user.id,
        name: user.name,
        email: user.email,
        rawPhone: raw,
        createdAt: user.createdAt
      });
    }
  });

  // Cross-reference customer orders by customer ID or email or phone
  const ordersByCustomer = new Map();
  safeOrders.forEach(order => {
    const custId = order.customer?.id || order.customerId;
    const custEmail = (order.customer?.email || '').trim().toLowerCase();
    const custPhone = normalizeIndianMobileNumber(order.customer?.phone) || String(order.customer?.phone || '').replace(/\D/g, '').slice(-10);

    const keys = [custId, custEmail, custPhone].filter(Boolean);
    keys.forEach(k => {
      if (!ordersByCustomer.has(k)) ordersByCustomer.set(k, []);
      ordersByCustomer.get(k).push(order.orderId);
    });
  });

  const duplicateGroups = [];
  let totalAffectedAccounts = 0;

  for (const [normPhone, accounts] of phoneMap.entries()) {
    if (accounts.length > 1) {
      totalAffectedAccounts += accounts.length;

      const auditedAccounts = accounts.map(acc => {
        // Find orders associated with this specific account
        const relatedOrderIds = new Set([
          ...(ordersByCustomer.get(acc.id) || []),
          ...(ordersByCustomer.get((acc.email || '').toLowerCase()) || [])
        ]);

        return {
          id: acc.id,
          name: acc.name,
          email: acc.email,
          rawPhone: acc.phone,
          normalizedPhone: normPhone,
          createdAt: acc.createdAt || null,
          lastLoginAt: acc.lastLoginAt || null,
          loginCount: acc.loginCount || 0,
          orderCount: relatedOrderIds.size,
          orderIds: Array.from(relatedOrderIds)
        };
      });

      // Sort accounts newest first
      auditedAccounts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      duplicateGroups.push({
        normalizedPhone: normPhone,
        duplicateCount: auditedAccounts.length,
        accounts: auditedAccounts
      });
    }
  }

  // Sort duplicate groups by highest count first
  duplicateGroups.sort((a, b) => b.duplicateCount - a.duplicateCount);

  return {
    timestamp: new Date().toISOString(),
    totalUsers: safeUsers.length,
    uniquePhoneNumbers: phoneMap.size,
    duplicateGroupsCount: duplicateGroups.length,
    totalAffectedAccounts,
    unparseablePhonesCount: unparseablePhones.length,
    unparseablePhones,
    duplicateGroups
  };
}
