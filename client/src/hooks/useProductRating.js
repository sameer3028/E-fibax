import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

// Shared memory cache for product rating summaries to prevent redundant network requests
const ratingCache = new Map();
const listeners = new Map();

function notifyListeners(productId, summary) {
  const cleanId = String(productId);
  if (listeners.has(cleanId)) {
    listeners.get(cleanId).forEach(cb => cb(summary));
  }
}

export function useProductRating(product) {
  const productId = product?.id || product?.slug;
  const cleanId = productId ? String(productId) : null;

  const [ratingSummary, setRatingSummary] = useState(() => {
    if (!cleanId) return { average: 0, count: 0, loaded: false };
    if (ratingCache.has(cleanId)) {
      return ratingCache.get(cleanId);
    }
    return {
      average: product?.ratingAverage ? Number(product.ratingAverage) : 0,
      count: product?.ratingCount ? Number(product.ratingCount) : 0,
      loaded: false
    };
  });

  useEffect(() => {
    if (!cleanId) return;

    // Register listener for real-time updates
    if (!listeners.has(cleanId)) {
      listeners.set(cleanId, new Set());
    }
    const callback = (newSummary) => setRatingSummary(newSummary);
    listeners.get(cleanId).add(callback);

    // If cache already has data, use it immediately
    if (ratingCache.has(cleanId)) {
      const cached = ratingCache.get(cleanId);
      setRatingSummary(cached);
    }

    let isMounted = true;
    apiRequest(`/api/reviews/product/${cleanId}`)
      .then(res => {
        if (res.success && res.data) {
          const payload = res.data;
          const summary = {
            average: payload.totalApprovedCount > 0 ? Number(payload.averageRating || 0) : 0,
            count: Number(payload.totalApprovedCount || 0),
            loaded: true
          };
          ratingCache.set(cleanId, summary);
          if (isMounted) setRatingSummary(summary);
          notifyListeners(cleanId, summary);
        }
      })
      .catch(() => {
        if (isMounted && !ratingCache.has(cleanId)) {
          const fallback = { average: 0, count: 0, loaded: true };
          ratingCache.set(cleanId, fallback);
          setRatingSummary(fallback);
        }
      });

    return () => {
      isMounted = false;
      if (listeners.has(cleanId)) {
        listeners.get(cleanId).delete(callback);
      }
    };
  }, [cleanId]);

  return ratingSummary;
}

// Function to manually invalidate rating cache when reviews change
export function invalidateRatingCache(productId) {
  if (productId) {
    const cleanId = String(productId);
    ratingCache.delete(cleanId);
    apiRequest(`/api/reviews/product/${cleanId}`)
      .then(res => {
        if (res.success && res.data) {
          const payload = res.data;
          const summary = {
            average: payload.totalApprovedCount > 0 ? Number(payload.averageRating || 0) : 0,
            count: Number(payload.totalApprovedCount || 0),
            loaded: true
          };
          ratingCache.set(cleanId, summary);
          notifyListeners(cleanId, summary);
        }
      })
      .catch(() => {});
  } else {
    ratingCache.clear();
  }
}
