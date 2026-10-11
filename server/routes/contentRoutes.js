import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, existsSync } from 'fs';
import { requireAdminAuth } from '../middleware/auth.js';
import { contactLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import { getArray, setArray, readJsonFile, writeJsonFile } from '../store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const dataDir = join(__dirname, '..', 'data');
const uploadsDir = join(__dirname, '..', 'uploads');
const ABOUT_BANNERS_FILE = join(dataDir, 'about_banners.json');

// ==========================================
// 1. ABOUT US HERO BANNERS
// ==========================================

const readAboutBanners = () => {
  return readJsonFile(ABOUT_BANNERS_FILE, [
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
  ]);
};

const saveAboutBanners = (banners) => {
  return writeJsonFile(ABOUT_BANNERS_FILE, banners);
};

// GET /api/website/about-banners - Get all About Us Hero Banners
router.get('/website/about-banners', (req, res) => {
  try {
    const banners = readAboutBanners();
    banners.sort((a, b) => (Number(a.sortOrder || 999)) - (Number(b.sortOrder || 999)));
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch about banners' });
  }
});

// GET /api/website/about-banners/active - Get active published hero banner for frontend
router.get('/website/about-banners/active', (req, res) => {
  try {
    const banners = readAboutBanners();
    const published = banners
      .filter(b => b.status === 'published' && b.enabled !== false)
      .sort((a, b) => (Number(a.sortOrder || 999)) - (Number(b.sortOrder || 999)));

    if (published.length > 0) {
      res.json({ success: true, data: published[0], allActive: published });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch active about banner' });
  }
});

// POST /api/website/about-banners - Create new About Us Hero Banner (Admin only)
router.post('/website/about-banners', requireAdminAuth, (req, res) => {
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

// PUT /api/website/about-banners/:id - Update About Us Hero Banner (Admin only)
router.put('/website/about-banners/:id', requireAdminAuth, (req, res) => {
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

// DELETE /api/website/about-banners/:id - Delete About Us Hero Banner (Admin only)
router.delete('/website/about-banners/:id', requireAdminAuth, (req, res) => {
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

// ==========================================
// 2. COUPONS & PROMOTIONAL OFFERS
// ==========================================

function readCoupons() {
  return getArray('coupons');
}

function saveCoupons(coupons) {
  setArray('coupons', coupons);
}

// GET /api/coupons - List all promo coupons (for Admin Portal)
router.get('/coupons', (req, res) => {
  try {
    const coupons = readCoupons();
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/coupons/active - List active customer-visible coupons (for Checkout & Cart)
router.get('/coupons/active', (req, res) => {
  try {
    const coupons = readCoupons();
    const activeCoupons = coupons.filter(c => c.isActive !== false);
    res.json({ success: true, count: activeCoupons.length, data: activeCoupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/coupons/validate - Authoritative Coupon Validation Endpoint
router.post('/coupons/validate', (req, res) => {
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

// POST /api/coupons - Create new coupon code (Admin only)
router.post('/coupons', requireAdminAuth, (req, res) => {
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

    console.log(`🎟️ New coupon created: ${newCoupon.code}`);
    return res.status(201).json({ success: true, message: 'Coupon offer created successfully!', data: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/coupons/:id - Update existing coupon (Admin only)
router.put('/coupons/:id', requireAdminAuth, (req, res) => {
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

// DELETE /api/coupons/:id - Delete coupon (Admin only)
router.delete('/coupons/:id', requireAdminAuth, (req, res) => {
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
// 3. ENQUIRIES & LEAD CAPTURE
// ==========================================

const INJECTION_PATTERNS = [
  /<\s*script[^>]*>/i,
  /<\s*\/\s*script\s*>/i,
  /<\s*(iframe|object|embed|svg|img|style|link|meta|body|input|button|form)\b[^>]*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on\w+\s*=/i,
  /(eval|setTimeout|setInterval|Function)\s*\(/i,
  /(\${|{{|<%|%>|`)/,
  /(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from|update\s+\w+\s+set|exec\s*\(|xp_)/i,
  /(;|\||&&|\$\()\s*(curl|wget|bash|sh|powershell|cmd|nc|netcat)/i,
  /document\.(location|cookie|write)/i
];

function containsInjectionPayload(str) {
  if (typeof str !== 'string') return false;
  return INJECTION_PATTERNS.some(pattern => pattern.test(str));
}

function sanitizeInput(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

function readEnquiries() {
  return getArray('enquiries');
}

function saveEnquiries(enquiries) {
  setArray('enquiries', enquiries);
}

// POST /api/enquiry
router.post('/enquiry', contactLimiter, (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const { name, phone, city, message, requirement, email, experience, hp_field } = req.body || {};

    if (hp_field && String(hp_field).trim() !== '') {
      console.warn(`🤖 Honeypot trap triggered from: ${clientIp}`);
      return res.status(400).json({ success: false, error: 'Invalid submission.' });
    }

    if (!name || !phone || !city) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and city/state are required fields.'
      });
    }

    const rawInputs = [name, phone, city, message, requirement, email, experience].filter(Boolean);
    for (const input of rawInputs) {
      if (typeof input === 'string' && containsInjectionPayload(input)) {
        console.warn(`🚨 Code injection attempt detected from ${clientIp}:`, input.slice(0, 100));
        return res.status(400).json({
          success: false,
          error: 'Security alert: Unsafe code or script characters are strictly prohibited.'
        });
      }
    }

    const cleanName = String(name).trim();
    if (!/^[a-zA-Z\s.\-']{2,70}$/.test(cleanName)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid full name (2-70 letters; numbers and script code are not permitted).'
      });
    }

    const phoneClean = String(phone).replace(/[^0-9]/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      });
    }

    const cleanCity = String(city).trim();
    if (!/^[a-zA-Z0-9\s,.\-()]{2,100}$/.test(cleanCity)) {
      return res.status(400).json({
        success: false,
        error: 'City / District contains invalid characters.'
      });
    }

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

    const combinedMessage = (message || requirement || '').trim();
    const sanitizedEnquiry = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
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

// GET /api/enquiries - Admin review enquiries
router.get('/enquiries', requireAdminAuth, (req, res) => {
  try {
    const enquiries = readEnquiries();
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch {
    res.json({ success: true, count: 0, data: [] });
  }
});

// ==========================================
// 4. HARDENED MEDIA UPLOADS
// ==========================================

function validateFileMagicBytes(buffer, mime) {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (mime.includes('jpeg') || mime.includes('jpg')) {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  // PNG: 89 50 4E 47
  if (mime.includes('png')) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  // WebP: RIFF ... WEBP
  if (mime.includes('webp')) {
    return buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';
  }
  // MP4 / MOV: ftyp box
  if (mime.includes('mp4') || mime.includes('quicktime') || mime.includes('mov')) {
    const headerStr = buffer.slice(4, 12).toString('ascii');
    return headerStr.includes('ftyp') || headerStr.includes('moov') || buffer[0] === 0x00;
  }
  // WebM: EBML header 1A 45 DF A3
  if (mime.includes('webm') || mime.includes('matroska')) {
    return buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3;
  }
  return true;
}

// POST /api/upload - Secure media file upload
router.post('/upload', uploadLimiter, (req, res) => {
  try {
    const { image, file, filename } = req.body || {};
    const mediaData = image || file;
    if (!mediaData || typeof mediaData !== 'string') {
      return res.status(400).json({ success: false, error: 'No valid media data provided' });
    }

    const matches = mediaData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid media format. Supported formats: JPG, PNG, WebP for photos, and MP4, WebM, MOV for video.'
      });
    }

    const mime = matches[1].toLowerCase();
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov', 'video/x-matroska'];

    if (!allowedImageMimes.includes(mime) && !allowedVideoMimes.includes(mime)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported media format. Permitted: JPG, PNG, WebP, MP4, WebM, MOV.'
      });
    }

    const isVideo = allowedVideoMimes.includes(mime);
    let ext = 'jpg';
    if (isVideo) {
      if (mime.includes('mp4')) ext = 'mp4';
      else if (mime.includes('webm')) ext = 'webm';
      else if (mime.includes('quicktime') || mime.includes('mov')) ext = 'mov';
      else ext = 'mp4';
    } else {
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else ext = 'jpg';
    }

    const buffer = Buffer.from(matches[2], 'base64');

    // Strict size limits: 5 MB photos, 50 MB videos
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      const limitMb = isVideo ? '50 MB' : '5 MB';
      return res.status(400).json({ success: false, error: `File size must be ${limitMb} or smaller.` });
    }

    // Magic bytes verification to block file disguise attacks
    if (!validateFileMagicBytes(buffer, mime)) {
      return res.status(400).json({
        success: false,
        error: 'File content does not match the declared media header.'
      });
    }

    const cleanBase = filename ? String(filename).replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40) : (isVideo ? 'video' : 'img');
    const safeName = `${cleanBase}-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, safeName);
    writeFileSync(filePath, buffer);

    const clientPublicUploadsDir = join(__dirname, '..', '..', 'client', 'public', 'uploads');
    if (existsSync(clientPublicUploadsDir)) {
      try {
        writeFileSync(join(clientPublicUploadsDir, safeName), buffer);
      } catch (_) {}
    }

    console.log(`📸 Hardened Media Uploaded (${isVideo ? 'Video' : 'Photo'}): ${safeName}`);
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

export default router;
