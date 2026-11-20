import { Router } from 'express';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { requireAdminAuth } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { UPLOADS_DIR } from '../config/paths.js';
import {
  getPublicCustomerStories,
  getAdminCustomerStories,
  updateSectionSettings,
  createStory,
  updateStory,
  deleteStory,
  reorderStories
} from '../services/customerStoriesService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const customerStoriesRouter = Router();

function validateMediaMagicBytes(buffer, mime) {
  if (!buffer || buffer.length < 4) return false;
  if (mime.includes('jpeg') || mime.includes('jpg')) {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (mime.includes('png')) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  if (mime.includes('webp')) {
    return buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';
  }
  if (mime.includes('mp4') || mime.includes('quicktime') || mime.includes('mov')) {
    const headerStr = buffer.slice(4, 12).toString('ascii');
    return headerStr.includes('ftyp') || headerStr.includes('moov') || buffer[0] === 0x00;
  }
  if (mime.includes('webm') || mime.includes('matroska')) {
    return buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3;
  }
  return true;
}

// ==========================================
// 1. PUBLIC ENDPOINTS
// ==========================================

/**
 * GET /api/website/customer-stories
 * Public endpoint for storefront. Returns only active & approved stories.
 */
customerStoriesRouter.get('/website/customer-stories', (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const result = getPublicCustomerStories();
    res.json(result);
  } catch (err) {
    console.error('Error fetching public customer stories:', err);
    res.status(500).json({ success: false, error: 'Failed to load customer stories.' });
  }
});

// ==========================================
// 2. ADMIN ENDPOINTS (requireAdminAuth)
// ==========================================

/**
 * GET /api/admin/website/customer-stories
 * Returns full CMS configuration and all stories for management.
 */
customerStoriesRouter.get('/admin/website/customer-stories', requireAdminAuth, (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const result = getAdminCustomerStories();
    res.json(result);
  } catch (err) {
    console.error('Error fetching admin customer stories:', err);
    res.status(500).json({ success: false, error: 'Failed to load admin customer stories.' });
  }
});

/**
 * PUT /api/admin/website/customer-stories/settings
 * Updates master section settings (enabled, titles, colors, etc.)
 */
customerStoriesRouter.put('/admin/website/customer-stories/settings', requireAdminAuth, (req, res) => {
  try {
    const updatedSettings = updateSectionSettings(req.body || {}, req.adminUser);
    res.json({
      success: true,
      message: 'Customer stories section settings updated successfully.',
      settings: updatedSettings
    });
  } catch (err) {
    console.error('Error updating customer stories settings:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to update section settings.' });
  }
});

/**
 * POST /api/admin/website/customer-stories
 * Creates a new customer story card.
 */
customerStoriesRouter.post('/admin/website/customer-stories', requireAdminAuth, (req, res) => {
  try {
    const newStory = createStory(req.body || {}, req.adminUser);
    res.status(201).json({
      success: true,
      message: 'Customer story created successfully.',
      story: newStory
    });
  } catch (err) {
    console.error('Error creating customer story:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to create customer story.' });
  }
});

/**
 * PUT /api/admin/website/customer-stories/reorder
 * Reorders customer stories by accepting an array of story IDs.
 */
customerStoriesRouter.put('/admin/website/customer-stories/reorder', requireAdminAuth, (req, res) => {
  try {
    const { storyIds } = req.body || {};
    const result = reorderStories(storyIds, req.adminUser);
    res.json({
      success: true,
      message: 'Customer stories reordered successfully.',
      stories: result.stories
    });
  } catch (err) {
    console.error('Error reordering customer stories:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to reorder stories.' });
  }
});

/**
 * PUT /api/admin/website/customer-stories/:id
 * Updates an existing customer story card.
 */
customerStoriesRouter.put('/admin/website/customer-stories/:id', requireAdminAuth, (req, res) => {
  try {
    const updatedStory = updateStory(req.params.id, req.body || {}, req.adminUser);
    res.json({
      success: true,
      message: 'Customer story updated successfully.',
      story: updatedStory
    });
  } catch (err) {
    console.error('Error updating customer story:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to update customer story.' });
  }
});

/**
 * DELETE /api/admin/website/customer-stories/:id
 * Deletes (soft deletes) a customer story card.
 */
customerStoriesRouter.delete('/admin/website/customer-stories/:id', requireAdminAuth, (req, res) => {
  try {
    const result = deleteStory(req.params.id, req.adminUser);
    res.json({
      success: true,
      message: 'Customer story removed successfully.',
      deletedId: result.deletedId
    });
  } catch (err) {
    console.error('Error deleting customer story:', err);
    res.status(400).json({ success: false, error: err.message || 'Failed to delete customer story.' });
  }
});

/**
 * POST /api/admin/website/customer-stories/upload-media
 * Secure media uploader for customer thumbnails and videos.
 */
customerStoriesRouter.post('/admin/website/customer-stories/upload-media', requireAdminAuth, uploadLimiter, (req, res) => {
  try {
    const { media, filename } = req.body || {};
    if (!media || typeof media !== 'string') {
      return res.status(400).json({ success: false, error: 'No valid media data provided' });
    }

    const matches = media.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      const limitMb = isVideo ? '50 MB' : '5 MB';
      return res.status(400).json({ success: false, error: `File size must be ${limitMb} or smaller.` });
    }

    if (!validateMediaMagicBytes(buffer, mime)) {
      return res.status(400).json({
        success: false,
        error: 'File content does not match the declared media header.'
      });
    }

    const cleanBase = filename ? String(filename).replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30) : (isVideo ? 'story_video' : 'story_thumb');
    const safeName = `customer_${cleanBase}-${Date.now()}.${ext}`;
    const filePath = join(UPLOADS_DIR, safeName);
    writeFileSync(filePath, buffer);

    const clientPublicUploadsDir = join(__dirname, '..', '..', 'client', 'public', 'uploads');
    if (existsSync(clientPublicUploadsDir)) {
      try {
        writeFileSync(join(clientPublicUploadsDir, safeName), buffer);
      } catch (_) {}
    }

    const relativeUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: relativeUrl,
      isVideo,
      filename: safeName
    });
  } catch (err) {
    console.error('Error uploading customer story media:', err);
    res.status(500).json({ success: false, error: 'Media upload failed: ' + err.message });
  }
});
