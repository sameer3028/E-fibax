import { Router } from 'express';
import {
  getReviewsForProduct,
  submitReview,
  getAdminReviews,
  updateReviewStatus,
  bulkUpdateReviewStatus,
  deleteReviewPermanently,
  markReviewHelpful,
  reportReview,
  removeReviewMedia
} from '../reviews.js';
import { requireAdminAuth } from '../middleware/auth.js';

export const reviewRouter = Router();
export const adminReviewRouter = Router();

// ==========================================
// PUBLIC REVIEWS ENDPOINTS (/api/reviews)
// ==========================================

// GET /api/reviews/product/:productId - Get approved public reviews & stats for a product
reviewRouter.get('/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const data = getReviewsForProduct(productId);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews - Customer Review Submission (Forces status = PENDING)
reviewRouter.post('/', (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      content,
      images,
      video,
      customerId,
      customerName,
      customerEmail,
      customerPhone
    } = req.body || {};

    const newReview = submitReview({
      productId,
      rating,
      title,
      content,
      images,
      video,
      customerId,
      customerName,
      customerEmail,
      customerPhone
    });

    return res.json({
      success: true,
      data: newReview,
      message: 'Thank you! Your review has been submitted and is awaiting approval.'
    });
  } catch (err) {
    console.error('Error submitting customer review:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/:id/helpful - Increment review helpful count
reviewRouter.post('/:id/helpful', (req, res) => {
  try {
    const ok = markReviewHelpful(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Review not found' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews/:id/report - Report review
reviewRouter.post('/:id/report', (req, res) => {
  try {
    const ok = reportReview(req.params.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Review not found' });
    return res.json({ success: true, message: 'Review reported for administrative review.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN REVIEWS ENDPOINTS (/api/admin/reviews)
// ==========================================

// GET /api/admin/reviews - Admin Review Dashboard List & Stats
adminReviewRouter.get('/', requireAdminAuth, (req, res) => {
  try {
    const { status, rating, verified, media, reported, search } = req.query || {};
    const result = getAdminReviews({ status, rating, verified, media, reported, search });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/reviews/:id/status - Approve, Reject, or Remove Review
adminReviewRouter.put('/:id/status', requireAdminAuth, (req, res) => {
  try {
    const { status, adminNote } = req.body || {};
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }
    const updated = updateReviewStatus(req.params.id, status, adminNote);
    return res.json({ success: true, data: updated, message: `Review status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating review status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/reviews/bulk-status - Bulk Approve, Reject, or Remove Reviews
adminReviewRouter.post('/bulk-status', requireAdminAuth, (req, res) => {
  try {
    const { ids, status } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ success: false, error: 'Review IDs array and target status are required.' });
    }
    const result = bulkUpdateReviewStatus(ids, status);
    return res.json({ success: true, data: result, message: `Bulk updated ${result.updatedCount} reviews to ${status}.` });
  } catch (err) {
    console.error('Error bulk updating review status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/reviews/:id - Remove / Delete Review
adminReviewRouter.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const { permanent } = req.query || {};
    if (permanent === 'true') {
      deleteReviewPermanently(req.params.id);
      return res.json({ success: true, message: 'Review permanently deleted.' });
    }
    const updated = updateReviewStatus(req.params.id, 'REMOVED', 'Removed by admin');
    return res.json({ success: true, data: updated, message: 'Review safely removed.' });
  } catch (err) {
    console.error('Error removing review:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/reviews/:id/media - Remove individual photo or video from a review
adminReviewRouter.delete('/:id/media', requireAdminAuth, (req, res) => {
  try {
    const { mediaUrl } = req.body || req.query || {};
    if (!mediaUrl) {
      return res.status(400).json({ success: false, error: 'mediaUrl is required.' });
    }
    const updated = removeReviewMedia(req.params.id, mediaUrl);
    return res.json({ success: true, data: updated, message: 'Media item successfully removed from review.' });
  } catch (err) {
    console.error('Error removing review media:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
