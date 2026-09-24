import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REVIEWS_FILE = join(__dirname, 'data', 'reviews.json');
const ORDERS_FILE = join(__dirname, 'data', 'orders.json');

export function readReviews() {
  try {
    if (existsSync(REVIEWS_FILE)) {
      const data = readFileSync(REVIEWS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('Error reading reviews.json:', err.message);
  }
  return [];
}

export function saveReviews(reviews) {
  try {
    writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing reviews.json:', err.message);
    return false;
  }
}

function readOrders() {
  try {
    if (existsSync(ORDERS_FILE)) {
      const data = readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('Error reading orders.json:', err.message);
  }
  return [];
}

// Generate public customer name (e.g. "Kabul Singh" -> "Kabul S.")
export function formatPublicName(name) {
  if (!name || !name.trim()) return 'Verified Customer';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

// Check if customer has actually purchased this product in any order
export function checkVerifiedPurchase(customerId, customerPhone, customerEmail, productId) {
  const orders = readOrders();
  if (!orders || orders.length === 0) return false;

  const cleanProdId = String(productId);
  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, '') : '';

  for (const order of orders) {
    // Check customer match
    const matchesCustomer = (
      (customerId && (String(order.customerId) === String(customerId) || String(order.userId) === String(customerId))) ||
      (cleanPhone && order.customer?.phone && order.customer.phone.replace(/\D/g, '') === cleanPhone) ||
      (customerEmail && order.customer?.email && order.customer.email.toLowerCase() === customerEmail.toLowerCase())
    );

    if (matchesCustomer && Array.isArray(order.items)) {
      const boughtItem = order.items.find(item => {
        const iId = String(item.id || item.productId || item.product?.id || '');
        return iId === cleanProdId;
      });
      if (boughtItem) return true;
    }
  }
  return false;
}

// Get public approved reviews & stats for a specific product
export function getReviewsForProduct(productId) {
  const reviews = readReviews();
  const cleanProdId = String(productId);

  const approvedReviews = reviews.filter(
    r => String(r.productId) === cleanProdId && r.status === 'APPROVED'
  );

  const totalApproved = approvedReviews.length;
  let averageRating = 0;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalApproved > 0) {
    let sum = 0;
    approvedReviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      starCounts[star] = (starCounts[star] || 0) + 1;
      sum += star;
    });
    averageRating = Number((sum / totalApproved).toFixed(1));
  }

  const starPercentages = {
    5: totalApproved > 0 ? Math.round((starCounts[5] / totalApproved) * 100) : 0,
    4: totalApproved > 0 ? Math.round((starCounts[4] / totalApproved) * 100) : 0,
    3: totalApproved > 0 ? Math.round((starCounts[3] / totalApproved) * 100) : 0,
    2: totalApproved > 0 ? Math.round((starCounts[2] / totalApproved) * 100) : 0,
    1: totalApproved > 0 ? Math.round((starCounts[1] / totalApproved) * 100) : 0
  };

  // Collect all approved customer photo media
  const customerMedia = [];
  approvedReviews.forEach(r => {
    if (Array.isArray(r.images)) {
      r.images.forEach(imgUrl => {
        if (imgUrl && !imgUrl.match(/\.(mp4|webm|mov)$/i)) {
          customerMedia.push({
            url: imgUrl,
            type: 'image',
            reviewId: r.id,
            customerPublicName: r.customerPublicName || formatPublicName(r.customerName)
          });
        }
      });
    }
  });

  // Public safe reviews (remove sensitive info & strip videos)
  const publicReviews = approvedReviews.map(r => {
    const photoList = Array.isArray(r.images)
      ? r.images.filter(img => img && !img.match(/\.(mp4|webm|mov)$/i))
      : [];
    return {
      id: r.id,
      rating: Number(r.rating) || 5,
      title: r.title || '',
      content: r.content || '',
      customerPublicName: r.customerPublicName || formatPublicName(r.customerName),
      verifiedPurchase: !!r.verifiedPurchase,
      images: photoList,
      photos: photoList,
      helpfulCount: Number(r.helpfulCount) || 0,
      createdAt: r.createdAt
    };
  });

  return {
    totalApprovedCount: totalApproved,
    averageRating: totalApproved > 0 ? averageRating : 0,
    starCounts,
    starPercentages,
    customerMedia,
    mediaList: customerMedia,
    reviews: publicReviews,
    summary: {
      average: totalApproved > 0 ? averageRating : 0,
      count: totalApproved,
      distribution: starPercentages,
      starCounts
    }
  };
}

// Submit a new review (forces status: PENDING and photo-only media)
export function submitReview({
  productId,
  rating,
  title,
  content,
  images = [],
  customerId = null,
  customerName = '',
  customerEmail = '',
  customerPhone = ''
}) {
  if (!productId) throw new Error('Product ID is required.');
  if (!rating || Number(rating) < 1 || Number(rating) > 5) throw new Error('Star rating must be between 1 and 5.');
  if (!content || !content.trim()) throw new Error('Review description is required.');

  const isVerified = checkVerifiedPurchase(customerId, customerPhone, customerEmail, productId);
  const reviews = readReviews();
  const safeName = customerName.trim() || 'Verified Customer';
  const publicName = formatPublicName(safeName);

  // Reject/strip any video media submitted
  const photoImages = (Array.isArray(images) ? images : [])
    .filter(Boolean)
    .filter(img => typeof img === 'string' && !img.match(/\.(mp4|webm|mov)$/i));

  const newReview = {
    id: `rev_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    productId: String(productId),
    customerId: customerId ? String(customerId) : null,
    customerName: safeName,
    customerPublicName: publicName,
    customerEmail: customerEmail || '',
    customerPhone: customerPhone || '',
    rating: Number(rating),
    title: title ? title.trim() : '',
    content: content.trim(),
    images: photoImages,
    verifiedPurchase: isVerified,
    status: 'PENDING', // MUST require Admin approval
    helpfulCount: 0,
    reported: false,
    adminNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  return newReview;
}

// Admin API: Get reviews with filtering and dashboard summary stats
export function getAdminReviews({
  status = 'ALL',
  rating = 'ALL',
  verified = 'ALL',
  media = 'ALL',
  reported = 'ALL',
  search = ''
} = {}) {
  const allReviews = readReviews();

  // Strip videos from all returned reviews so Admin UI handles images only
  const sanitizedReviews = allReviews.map(r => {
    const photoImages = Array.isArray(r.images)
      ? r.images.filter(img => img && !img.match(/\.(mp4|webm|mov)$/i))
      : [];
    const { video, ...cleanReview } = r;
    return {
      ...cleanReview,
      images: photoImages
    };
  });

  // Active reviews (excluding soft-deleted / REMOVED reviews)
  const activeReviews = sanitizedReviews.filter(r => r.status !== 'REMOVED');

  const totalReviews = activeReviews.length;
  const pendingReviews = sanitizedReviews.filter(r => r.status === 'PENDING').length;
  const approvedReviews = sanitizedReviews.filter(r => r.status === 'APPROVED').length;
  const rejectedReviews = sanitizedReviews.filter(r => r.status === 'REJECTED').length;
  const removedReviews = sanitizedReviews.filter(r => r.status === 'REMOVED').length;
  const reviewsWithPhotos = activeReviews.filter(r => Array.isArray(r.images) && r.images.length > 0).length;

  let filtered = [...sanitizedReviews];

  const statusUpper = String(status || 'ALL').toUpperCase();
  if (statusUpper === 'ALL') {
    // Default "Status: All" excludes soft-deleted / REMOVED reviews
    filtered = filtered.filter(r => r.status !== 'REMOVED');
  } else {
    filtered = filtered.filter(r => r.status === statusUpper);
  }

  if (rating !== 'ALL') {
    const star = Number(rating);
    if (!isNaN(star)) {
      filtered = filtered.filter(r => Number(r.rating) === star);
    }
  }

  if (verified !== 'ALL') {
    const isVer = verified.toUpperCase() === 'TRUE' || verified.toUpperCase() === 'VERIFIED';
    filtered = filtered.filter(r => !!r.verifiedPurchase === isVer);
  }

  if (media !== 'ALL') {
    const mUpper = media.toUpperCase();
    if (mUpper === 'PHOTOS' || mUpper === 'WITH_PHOTOS') {
      filtered = filtered.filter(r => Array.isArray(r.images) && r.images.length > 0);
    } else if (mUpper === 'NO_PHOTOS' || mUpper === 'WITHOUT_PHOTOS') {
      filtered = filtered.filter(r => !Array.isArray(r.images) || r.images.length === 0);
    } else if (mUpper === 'VIDEOS' || mUpper === 'WITH_VIDEOS') {
      filtered = []; // Customer video reviews removed completely
    }
  }

  if (reported !== 'ALL') {
    if (reported.toUpperCase() === 'REPORTED' || reported.toUpperCase() === 'TRUE') {
      filtered = filtered.filter(r => !!r.reported);
    }
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(r => (
      (r.customerName && r.customerName.toLowerCase().includes(q)) ||
      (r.customerPublicName && r.customerPublicName.toLowerCase().includes(q)) ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.content && r.content.toLowerCase().includes(q)) ||
      (r.productId && String(r.productId).toLowerCase().includes(q))
    ));
  }

  return {
    stats: {
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      removedReviews,
      reviewsWithPhotos
    },
    reviews: filtered
  };
}

// Hard delete review permanently
export function deleteReviewPermanently(id) {
  const reviews = readReviews();
  const initialCount = reviews.length;
  const filtered = reviews.filter(r => String(r.id) !== String(id));
  if (filtered.length === initialCount) {
    throw new Error(`Review with ID "${id}" not found.`);
  }
  saveReviews(filtered);
  return true;
}

// Update review status (APPROVED, REJECTED, REMOVED)
export function updateReviewStatus(id, newStatus, adminNote = '') {
  const reviews = readReviews();
  const idx = reviews.findIndex(r => String(r.id) === String(id));
  if (idx === -1) throw new Error(`Review with ID "${id}" not found.`);

  const statusUpper = newStatus.toUpperCase();
  if (!['APPROVED', 'REJECTED', 'REMOVED', 'PENDING'].includes(statusUpper)) {
    throw new Error(`Invalid review status "${newStatus}".`);
  }

  reviews[idx].status = statusUpper;
  if (adminNote) reviews[idx].adminNote = adminNote;
  reviews[idx].updatedAt = new Date().toISOString();

  saveReviews(reviews);
  return reviews[idx];
}

// Bulk update review statuses
export function bulkUpdateReviewStatus(ids, newStatus) {
  if (!Array.isArray(ids) || ids.length === 0) return { updatedCount: 0 };
  const reviews = readReviews();
  const statusUpper = newStatus.toUpperCase();
  let updatedCount = 0;

  const idSet = new Set(ids.map(id => String(id)));
  reviews.forEach(r => {
    if (idSet.has(String(r.id))) {
      r.status = statusUpper;
      r.updatedAt = new Date().toISOString();
      updatedCount++;
    }
  });

  if (updatedCount > 0) saveReviews(reviews);
  return { updatedCount };
}

// Increment helpful count
export function markReviewHelpful(id) {
  const reviews = readReviews();
  const idx = reviews.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return false;

  reviews[idx].helpfulCount = (Number(reviews[idx].helpfulCount) || 0) + 1;
  saveReviews(reviews);
  return true;
}

// Report a review
export function reportReview(id) {
  const reviews = readReviews();
  const idx = reviews.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return false;

  reviews[idx].reported = true;
  saveReviews(reviews);
  return true;
}

// Remove specific media (photo or video) from a review
export function removeReviewMedia(reviewId, mediaUrl) {
  const reviews = readReviews();
  const idx = reviews.findIndex(r => String(r.id) === String(reviewId));
  if (idx === -1) throw new Error(`Review with ID "${reviewId}" not found.`);

  const review = reviews[idx];
  const targetUrl = String(mediaUrl || '').trim();
  if (!targetUrl) throw new Error('Media URL is required.');

  const getFilename = (u) => String(u || '').split('?')[0].split('#')[0].split('/').pop();
  const targetFilename = getFilename(targetUrl);

  let removed = false;

  // 1. Check video match
  if (review.video) {
    const videoFilename = getFilename(review.video);
    if (
      review.video === targetUrl ||
      targetUrl.endsWith(review.video) ||
      review.video.endsWith(targetUrl) ||
      (targetFilename && videoFilename === targetFilename)
    ) {
      review.video = null;
      removed = true;
    }
  }

  // 2. Check images match
  if (Array.isArray(review.images)) {
    const initialCount = review.images.length;
    review.images = review.images.filter(img => {
      const imgFilename = getFilename(img);
      const isMatch =
        img === targetUrl ||
        targetUrl.endsWith(img) ||
        img.endsWith(targetUrl) ||
        (targetFilename && imgFilename === targetFilename);
      return !isMatch;
    });
    if (review.images.length < initialCount) {
      removed = true;
    }
  }

  if (removed) {
    review.updatedAt = new Date().toISOString();
    saveReviews(reviews);
  }

  return review;
}
