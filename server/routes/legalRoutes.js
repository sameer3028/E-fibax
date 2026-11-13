import { Router } from 'express';
import { getSingleton, setSingleton } from '../store.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Strict HTML Sanitizer for Legal Documents.
 * Strips script, iframe, object, embed, forms, links, and inline event handlers (onerror, onload, onclick, etc.).
 * Preserves headings (h1-h4), paragraphs, tables, lists, formatting, styling classes, and safe anchor links.
 */
export function sanitizeLegalHtml(html) {
  if (!html || typeof html !== 'string') return '';

  let sanitized = html;

  // 1. Remove dangerous executable tags and frames
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  sanitized = sanitized.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
  sanitized = sanitized.replace(/<link\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<meta\b[^>]*>/gi, '');

  // 2. Remove inline event handlers (onabort, onclick, onerror, onload, onmouseover, onsubmit, etc.)
  sanitized = sanitized.replace(/\son[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Remove dangerous protocols in href or src (javascript:, vbscript:, data:text/html)
  sanitized = sanitized.replace(/\s(href|src)\s*=\s*['"]\s*(?:javascript|vbscript|data):[^'"]*['"]/gi, ' $1="#"');

  // 4. Ensure target="_blank" has rel="noopener noreferrer"
  sanitized = sanitized.replace(/<a\b([^>]*target=['"]_blank['"][^>]*)>/gi, (match, attrs) => {
    if (!/rel=['"][^'"]*noopener[^'"]*['"]/i.test(attrs)) {
      return `<a ${attrs} rel="noopener noreferrer">`;
    }
    return match;
  });

  return sanitized.trim();
}

/**
 * Helper: Retrieve all legal pages singleton with default fallback
 */
function getLegalPagesStore() {
  const existing = getSingleton('legal_pages');
  if (existing && typeof existing === 'object' && (existing.terms || existing.privacy)) {
    return existing;
  }
  return {
    terms: {
      id: 'terms',
      slug: 'terms',
      pageTitle: 'Terms & Conditions',
      shortDescription: 'Official terms and conditions governing all purchases and interactions on fibaxpharma.com.',
      documentVersion: '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'published',
      publishedContent: '<p>Terms & Conditions content is currently loading...</p>',
      draftContent: '<p>Terms & Conditions content is currently loading...</p>',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      history: []
    },
    privacy: {
      id: 'privacy',
      slug: 'privacy',
      pageTitle: 'Privacy Policy',
      shortDescription: 'Official privacy policy and personal data fiduciary notice for Fibax Ayurveda.',
      documentVersion: '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'published',
      publishedContent: '<p>Privacy Policy content is currently loading...</p>',
      draftContent: '<p>Privacy Policy content is currently loading...</p>',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
      history: []
    }
  };
}

// =================================================================
// 1. PUBLIC ENDPOINTS (Storefront)
// =================================================================

/**
 * GET /api/legal/:slug
 * Public endpoint to fetch published legal page content (e.g. terms or privacy).
 * Draft changes are never exposed publicly.
 */
router.get('/legal/:slug', (req, res) => {
  const { slug } = req.params;
  const cleanSlug = String(slug).toLowerCase().trim();

  if (cleanSlug !== 'terms' && cleanSlug !== 'privacy') {
    return res.status(404).json({ success: false, error: 'Legal page not found. Supported pages: terms, privacy' });
  }

  const store = getLegalPagesStore();
  const page = store[cleanSlug];

  if (!page) {
    return res.status(404).json({ success: false, error: `Legal page '${cleanSlug}' not configured` });
  }

  // If unpublished or draft-only, do not leak draft content publicly
  if (page.status !== 'published') {
    return res.status(200).json({
      success: false,
      status: page.status,
      pageTitle: page.pageTitle,
      message: 'This document is currently undergoing scheduled administrative review and will be available shortly.'
    });
  }

  // Set fresh cache control headers for published document
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

  return res.json({
    success: true,
    data: {
      id: page.id,
      slug: page.slug || cleanSlug,
      pageTitle: page.pageTitle,
      shortDescription: page.shortDescription || '',
      documentVersion: page.documentVersion || '1.0',
      lastUpdated: page.lastUpdated || '',
      effectiveDate: page.effectiveDate || page.lastUpdated || '',
      status: page.status,
      content: page.publishedContent || '',
      updatedAt: page.updatedAt
    }
  });
});

// =================================================================
// 2. ADMIN MANAGEMENT ENDPOINTS (Protected by requireAdminAuth)
// =================================================================

/**
 * GET /api/admin/legal/:slug
 * Admin endpoint to load full page record including draftContent and revision history.
 */
router.get('/admin/legal/:slug', requireAdminAuth, (req, res) => {
  const { slug } = req.params;
  const cleanSlug = String(slug).toLowerCase().trim();

  if (cleanSlug !== 'terms' && cleanSlug !== 'privacy') {
    return res.status(404).json({ success: false, error: 'Invalid legal page slug. Choose terms or privacy.' });
  }

  const store = getLegalPagesStore();
  const page = store[cleanSlug];

  if (!page) {
    return res.status(404).json({ success: false, error: `Legal page '${cleanSlug}' not found.` });
  }

  return res.json({
    success: true,
    data: page
  });
});

/**
 * GET /api/admin/legal/:slug/preview
 * Admin endpoint to preview draftContent in authentic layout.
 */
router.get('/admin/legal/:slug/preview', requireAdminAuth, (req, res) => {
  const { slug } = req.params;
  const cleanSlug = String(slug).toLowerCase().trim();

  const store = getLegalPagesStore();
  const page = store[cleanSlug];

  if (!page) {
    return res.status(404).json({ success: false, error: `Legal page '${cleanSlug}' not found.` });
  }

  return res.json({
    success: true,
    data: {
      id: page.id,
      slug: page.slug || cleanSlug,
      pageTitle: page.pageTitle,
      shortDescription: page.shortDescription || '',
      documentVersion: page.documentVersion || '1.0',
      lastUpdated: page.lastUpdated || '',
      effectiveDate: page.effectiveDate || '',
      status: page.status,
      content: page.draftContent || page.publishedContent || '',
      updatedAt: page.updatedAt,
      isPreview: true
    }
  });
});

/**
 * PUT /api/admin/legal/:slug
 * Admin endpoint to save draft, publish, unpublish, or restore an earlier version.
 */
router.put('/admin/legal/:slug', requireAdminAuth, (req, res) => {
  const { slug } = req.params;
  const cleanSlug = String(slug).toLowerCase().trim();

  if (cleanSlug !== 'terms' && cleanSlug !== 'privacy') {
    return res.status(400).json({ success: false, error: 'Invalid legal page. Choose terms or privacy.' });
  }

  const store = getLegalPagesStore();
  const current = store[cleanSlug];

  if (!current) {
    return res.status(404).json({ success: false, error: `Legal page '${cleanSlug}' not found.` });
  }

  const body = req.body || {};
  const action = body.action || 'save_draft'; // 'save_draft' | 'publish' | 'unpublish' | 'restore_version'
  const adminUser = req.admin?.username || 'admin';
  const now = new Date().toISOString();

  // Handle Restore Version Action
  if (action === 'restore_version') {
    const revId = body.restoreVersionId || body.versionId;
    if (!revId) {
      return res.status(400).json({ success: false, error: 'Revision ID is required to restore an earlier version.' });
    }

    const history = Array.isArray(current.history) ? current.history : [];
    const targetRev = history.find(h => h.id === revId || h.version === revId);

    if (!targetRev) {
      return res.status(404).json({ success: false, error: 'Specified revision not found in document history.' });
    }

    // Restore revision content to draftContent
    current.draftContent = targetRev.content;
    current.updatedAt = now;
    current.updatedBy = adminUser;

    if (body.publishImmediately) {
      current.publishedContent = targetRev.content;
      current.status = 'published';
      current.documentVersion = targetRev.version || current.documentVersion;
    }

    // Record restore event in history
    history.unshift({
      id: `rev_${cleanSlug}_${Date.now()}`,
      version: current.documentVersion,
      savedAt: now,
      adminUser,
      status: current.status,
      note: `Restored from revision ${targetRev.version || revId} (${new Date(targetRev.savedAt).toLocaleDateString()})`,
      content: targetRev.content
    });

    current.history = history.slice(0, 25);
    store[cleanSlug] = current;
    setSingleton('legal_pages', store);

    return res.json({
      success: true,
      action: 'restored',
      message: `Successfully restored ${current.pageTitle} from revision ${targetRev.version || revId}.`,
      data: current
    });
  }

  // Handle Unpublish Action
  if (action === 'unpublish') {
    const previousStatus = current.status;
    current.status = 'unpublished';
    current.updatedAt = now;
    current.updatedBy = adminUser;

    const history = Array.isArray(current.history) ? current.history : [];
    history.unshift({
      id: `rev_${cleanSlug}_${Date.now()}`,
      version: current.documentVersion,
      savedAt: now,
      adminUser,
      status: 'unpublished',
      note: `Unpublished by ${adminUser} (previously ${previousStatus})`,
      content: current.publishedContent || current.draftContent
    });

    current.history = history.slice(0, 25);
    store[cleanSlug] = current;
    setSingleton('legal_pages', store);

    return res.json({
      success: true,
      action: 'unpublished',
      message: `${current.pageTitle} has been unpublished from the public storefront.`,
      data: current
    });
  }

  // Validation for save_draft and publish
  const pageTitle = (body.pageTitle || current.pageTitle || '').trim();
  if (!pageTitle) {
    return res.status(400).json({ success: false, error: 'Page Title is required.' });
  }

  const shortDescription = (body.shortDescription !== undefined ? body.shortDescription : current.shortDescription || '').trim();
  const documentVersion = (body.documentVersion || current.documentVersion || '1.0').trim();
  const lastUpdated = (body.lastUpdated || current.lastUpdated || new Date().toISOString().split('T')[0]).trim();
  const effectiveDate = (body.effectiveDate || current.effectiveDate || lastUpdated).trim();

  // Content sanitization
  const rawContent = body.content !== undefined ? body.content : (current.draftContent || current.publishedContent || '');
  const sanitizedContent = sanitizeLegalHtml(rawContent);

  if (action === 'publish' && sanitizedContent.length < 20) {
    return res.status(400).json({ success: false, error: 'Document content cannot be empty when publishing.' });
  }

  current.pageTitle = pageTitle;
  current.shortDescription = shortDescription;
  current.documentVersion = documentVersion;
  current.lastUpdated = lastUpdated;
  current.effectiveDate = effectiveDate;
  current.draftContent = sanitizedContent;
  current.updatedAt = now;
  current.updatedBy = adminUser;

  const history = Array.isArray(current.history) ? current.history : [];

  if (action === 'publish') {
    current.publishedContent = sanitizedContent;
    current.status = 'published';

    // Record published revision in history
    history.unshift({
      id: `rev_${cleanSlug}_${Date.now()}`,
      version: documentVersion,
      savedAt: now,
      adminUser,
      status: 'published',
      note: body.changeNote || `Published version ${documentVersion} by ${adminUser}`,
      content: sanitizedContent
    });
  } else {
    // save_draft action
    // If it was already published, it remains published publicly with the previous publishedContent,
    // while draftContent holds the pending new revisions.
    if (current.status !== 'published') {
      current.status = 'draft';
    }

    history.unshift({
      id: `rev_${cleanSlug}_${Date.now()}`,
      version: documentVersion,
      savedAt: now,
      adminUser,
      status: 'draft',
      note: body.changeNote || `Draft saved by ${adminUser}`,
      content: sanitizedContent
    });
  }

  // Cap revision history at 25 entries
  current.history = history.slice(0, 25);
  store[cleanSlug] = current;

  // Persist atomically to server/data/legal_pages.json
  setSingleton('legal_pages', store);

  return res.json({
    success: true,
    action: action === 'publish' ? 'published' : 'saved_draft',
    message: action === 'publish'
      ? `${current.pageTitle} successfully published to storefront!`
      : `Draft for ${current.pageTitle} saved successfully.`,
    data: current
  });
});

export default router;
