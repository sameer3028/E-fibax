import express from 'express';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { requireAdminAuth } from '../middleware/auth.js';
import { franchiseEnquiryLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import {
  getFranchiseCmsConfig,
  updateFranchiseCmsConfig,
  getFranchiseCmsFull,
  saveFranchiseCmsDraft,
  publishFranchiseCms,
  revertFranchiseCmsDraft,
  submitFranchiseLead,
  queryFranchiseLeads,
  updateFranchiseLead,
  deleteFranchiseLead
} from '../services/franchiseService.js';
import { getArray } from '../store.js';
import { UPLOADS_DIR } from '../config/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// ========================================================
// PUBLIC FRANCHISE ENDPOINTS
// ========================================================

/**
 * GET /api/franchise/content
 * Returns active PCD Pharma Franchise page CMS content (published by default)
 * If mode=draft and admin token provided, returns draft for preview
 */
router.get('/franchise/content', (req, res) => {
  try {
    const mode = req.query.mode === 'draft' ? 'draft' : 'published';
    const config = getFranchiseCmsConfig(mode);
    return res.json({
      success: true,
      mode,
      data: config
    });
  } catch (err) {
    console.error('Error fetching franchise content:', err);
    return res.status(500).json({ success: false, error: 'Failed to load franchise content.' });
  }
});

/**
 * POST /api/franchise/enquiry
 * Submits a new PCD Pharma Franchise Lead
 */
router.post('/franchise/enquiry', franchiseEnquiryLimiter, async (req, res) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
    const result = await submitFranchiseLead(req.body, clientIp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error('Error submitting franchise enquiry:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your franchise enquiry. Please try again.'
    });
  }
});

// ========================================================
// ADMIN AUTHENTICATED FRANCHISE ENDPOINTS
// ========================================================

/**
 * GET /api/admin/franchise/leads
 * Queries franchise leads with search, filters & statistics
 */
router.get('/admin/franchise/leads', requireAdminAuth, (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const result = queryFranchiseLeads(req.query);
    return res.json(result);
  } catch (err) {
    console.error('Error querying franchise leads:', err);
    return res.status(500).json({ success: false, error: 'Failed to load franchise leads.' });
  }
});

/**
 * GET /api/admin/franchise/leads/export/csv
 * Exports all matching leads to CSV format
 */
router.get('/admin/franchise/leads/export/csv', requireAdminAuth, (req, res) => {
  try {
    const { leads } = queryFranchiseLeads(req.query);

    const headers = [
      'Lead ID',
      'Submission Date',
      'Full Name',
      'Mobile Number',
      'WhatsApp Number',
      'Email Address',
      'State',
      'District / City',
      'Business Type',
      'Pharma Experience',
      'Expected Investment',
      'Lead Status',
      'Assigned Staff',
      'Follow-up Date',
      'Message',
      'Latest Internal Note'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map((l) => {
      const latestNote = Array.isArray(l.internalNotes) && l.internalNotes.length > 0
        ? `[${l.internalNotes[0].author}] ${l.internalNotes[0].text}`
        : '';
      return [
        escapeCsv(l.id),
        escapeCsv(new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
        escapeCsv(l.name),
        escapeCsv(l.phone),
        escapeCsv(l.whatsapp || l.phone),
        escapeCsv(l.email),
        escapeCsv(l.state),
        escapeCsv(l.city),
        escapeCsv(l.businessType),
        escapeCsv(l.experience),
        escapeCsv(l.investmentRange),
        escapeCsv(l.status),
        escapeCsv(l.assignedStaff),
        escapeCsv(l.followUpDate || 'None'),
        escapeCsv(l.message),
        escapeCsv(latestNote)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const filename = `Fibax_Franchise_Leads_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send('\uFEFF' + csvContent); // Include UTF-8 BOM for Excel
  } catch (err) {
    console.error('Error exporting franchise leads:', err);
    return res.status(500).json({ success: false, error: 'Failed to export franchise leads.' });
  }
});

/**
 * GET /api/admin/franchise/leads/:id
 * Fetches single franchise lead details
 */
router.get('/admin/franchise/leads/:id', requireAdminAuth, (req, res) => {
  try {
    const leads = getArray('franchise_leads');
    const lead = leads.find((l) => l.id === req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }
    return res.json({ success: true, lead });
  } catch (err) {
    console.error('Error fetching franchise lead:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve lead.' });
  }
});

/**
 * PUT /api/admin/franchise/leads/:id
 * Updates lead status, notes, assignment, follow-up date
 */
router.put('/admin/franchise/leads/:id', requireAdminAuth, (req, res) => {
  try {
    const adminUser = req.admin?.username || 'admin';
    const result = updateFranchiseLead(req.params.id, req.body, adminUser);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Error updating franchise lead:', err);
    return res.status(500).json({ success: false, error: 'Failed to update lead.' });
  }
});

/**
 * DELETE /api/admin/franchise/leads/:id
 * Deletes a franchise lead record
 */
router.delete('/admin/franchise/leads/:id', requireAdminAuth, (req, res) => {
  try {
    const result = deleteFranchiseLead(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Error deleting franchise lead:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete lead.' });
  }
});

/**
 * GET /api/admin/franchise/content
 * Returns full franchise CMS configuration for Admin
 */
router.get('/admin/franchise/content', requireAdminAuth, (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const config = getFranchiseCmsConfig();
    return res.json({ success: true, data: config });
  } catch (err) {
    console.error('Error loading admin franchise CMS:', err);
    return res.status(500).json({ success: false, error: 'Failed to load franchise CMS configuration.' });
  }
});

/**
 * PUT /api/admin/franchise/content
 * Updates franchise CMS configuration
 */
router.put('/admin/franchise/content', requireAdminAuth, (req, res) => {
  try {
    const adminUser = req.admin?.username || 'admin';
    const updated = updateFranchiseCmsConfig(req.body, adminUser);
    return res.json({
      success: true,
      message: 'Franchise page settings saved successfully.',
      data: updated
    });
  } catch (err) {
    console.error('Error saving franchise CMS content:', err);
    return res.status(500).json({ success: false, error: 'Failed to save franchise page settings.' });
  }
});

/**
 * GET /api/admin/franchise/cms
 * Returns full CMS structure: published, draft, history, and dirty status
 */
router.get('/admin/franchise/cms', requireAdminAuth, (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const full = getFranchiseCmsFull();
    return res.json({
      success: true,
      ...full
    });
  } catch (err) {
    console.error('Error loading admin franchise CMS full structure:', err);
    return res.status(500).json({ success: false, error: 'Failed to load franchise CMS data.' });
  }
});

/**
 * PUT /api/admin/franchise/cms/draft
 * Saves draft configuration without affecting live website
 */
router.put('/api/admin/franchise/cms/draft', requireAdminAuth, (req, res) => {
  try {
    const adminUser = req.admin?.username || 'admin';
    const result = saveFranchiseCmsDraft(req.body, adminUser);
    return res.json({
      success: true,
      message: 'Draft saved successfully.',
      ...result
    });
  } catch (err) {
    console.error('Error saving franchise CMS draft:', err);
    return res.status(500).json({ success: false, error: 'Failed to save franchise draft.' });
  }
});

// Also support route without redundant /api prefix
router.put('/admin/franchise/cms/draft', requireAdminAuth, (req, res) => {
  try {
    const adminUser = req.admin?.username || 'admin';
    const result = saveFranchiseCmsDraft(req.body, adminUser);
    return res.json({
      success: true,
      message: 'Draft saved successfully.',
      ...result
    });
  } catch (err) {
    console.error('Error saving franchise CMS draft:', err);
    return res.status(500).json({ success: false, error: 'Failed to save franchise draft.' });
  }
});

/**
 * POST /api/admin/franchise/cms/publish
 * Publishes draft changes to the live production website
 */
router.post('/admin/franchise/cms/publish', requireAdminAuth, (req, res) => {
  try {
    const adminUser = req.admin?.username || 'admin';
    const summary = req.body?.summary || 'Published PCD Franchise updates to live site';
    const result = publishFranchiseCms(adminUser, summary);
    return res.json({
      success: true,
      message: 'Changes published successfully to live website.',
      ...result
    });
  } catch (err) {
    console.error('Error publishing franchise CMS:', err);
    return res.status(500).json({ success: false, error: 'Failed to publish franchise changes.' });
  }
});

/**
 * POST /api/admin/franchise/cms/revert
 * Discards draft edits and resets draft to current published state
 */
router.post('/admin/franchise/cms/revert', requireAdminAuth, (req, res) => {
  try {
    const adminUser = req.admin?.username || 'admin';
    const result = revertFranchiseCmsDraft(adminUser);
    return res.json({
      success: true,
      message: 'Draft changes discarded and reset to published state.',
      ...result
    });
  } catch (err) {
    console.error('Error reverting franchise CMS draft:', err);
    return res.status(500).json({ success: false, error: 'Failed to revert franchise draft.' });
  }
});

/**
 * POST /api/admin/franchise/upload-image
 * Authenticated upload endpoint specifically for franchise CMS media
 */
router.post('/admin/franchise/upload-image', requireAdminAuth, uploadLimiter, (req, res) => {
  try {
    const { image, file, filename } = req.body || {};
    const mediaData = image || file;

    if (!mediaData || typeof mediaData !== 'string') {
      return res.status(400).json({ success: false, error: 'No valid image data provided' });
    }

    const matches = mediaData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'Invalid base64 image encoding' });
    }

    const mime = matches[1].toLowerCase();
    const base64Content = matches[2];

    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!ALLOWED_MIMES.includes(mime)) {
      return res.status(400).json({ success: false, error: `Disallowed mime type: ${mime}` });
    }

    const buffer = Buffer.from(base64Content, 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum 10MB limit' });
    }

    let ext = 'jpg';
    if (mime === 'image/png') ext = 'png';
    else if (mime === 'image/webp') ext = 'webp';
    else if (mime === 'image/gif') ext = 'gif';
    else if (mime === 'image/svg+xml') ext = 'svg';

    const cleanBase = filename
      ? String(filename).replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
      : 'franchise_media';
    const safeName = `franchise-${cleanBase}-${Date.now()}.${ext}`;
    const filePath = join(UPLOADS_DIR, safeName);
    writeFileSync(filePath, buffer);

    const clientPublicUploadsDir = join(__dirname, '..', '..', 'client', 'public', 'uploads');
    if (existsSync(clientPublicUploadsDir)) {
      try {
        writeFileSync(join(clientPublicUploadsDir, safeName), buffer);
      } catch (_) {}
    }

    return res.json({
      success: true,
      url: `/uploads/${safeName}`,
      filename: safeName
    });
  } catch (err) {
    console.error('Error uploading franchise media:', err);
    return res.status(500).json({ success: false, error: 'Failed to upload franchise image.' });
  }
});

export default router;
