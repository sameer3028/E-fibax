import express from 'express';
import { requireAdminAuth } from '../middleware/auth.js';
import { franchiseEnquiryLimiter } from '../middleware/rateLimiter.js';
import {
  getFranchiseCmsConfig,
  updateFranchiseCmsConfig,
  submitFranchiseLead,
  queryFranchiseLeads,
  updateFranchiseLead,
  deleteFranchiseLead
} from '../services/franchiseService.js';
import { getArray } from '../store.js';

const router = express.Router();

// ========================================================
// PUBLIC FRANCHISE ENDPOINTS
// ========================================================

/**
 * GET /api/franchise/content
 * Returns active PCD Pharma Franchise page CMS content
 */
router.get('/franchise/content', (req, res) => {
  try {
    const config = getFranchiseCmsConfig();
    return res.json({
      success: true,
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

export default router;
