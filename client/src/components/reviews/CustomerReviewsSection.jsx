import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import RatingSummaryCard from './RatingSummaryCard';
import CustomerMediaGallery from './CustomerMediaGallery';
import TopReviewsList from './TopReviewsList';
import WriteReviewModal from './WriteReviewModal';
import MediaLightbox from './MediaLightbox';

export default function CustomerReviewsSection({ product }) {
  const { currentUser, token, isAuthenticated, openAuthModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [mediaList, setMediaList] = useState([]);

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    mediaList: [],
    initialIndex: 0
  });

  const productId = product?.id || product?.slug;

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/api/reviews/product/${productId}`);
      if (res.success) {
        const payload = res.data || res;
        const reviewList = payload.reviews || res.reviews || [];
        const reviewSummary = payload.summary || res.summary || {
          average: payload.averageRating ?? 0,
          count: payload.totalApprovedCount ?? 0,
          distribution: payload.starPercentages || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          starCounts: payload.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
        const media = payload.customerMedia || payload.mediaList || res.customerMedia || res.mediaList || [];

        setReviews(reviewList);
        setSummary(reviewSummary);
        setMediaList(media);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setIsWriteModalOpen(true);
  };

  const handleOpenMedia = (mediaItem, index, customList = null) => {
    const activeList = customList || mediaList;
    const targetIdx = index !== undefined ? index : activeList.findIndex(m => m.url === mediaItem.url || m.mediaUrl === mediaItem.mediaUrl);
    setLightboxState({
      isOpen: true,
      mediaList: activeList,
      initialIndex: targetIdx >= 0 ? targetIdx : 0
    });
  };

  const handleHelpful = async (reviewId) => {
    try {
      await apiRequest(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
    } catch (err) {
      console.error('Helpful action failed:', err);
    }
  };

  const handleReport = async (reviewId) => {
    try {
      await apiRequest(`/api/reviews/${reviewId}/report`, { method: 'POST' });
    } catch (err) {
      console.error('Report action failed:', err);
    }
  };

  return (
    <section id="reviews" className="py-10 border-t border-gray-200 space-y-10">
      {/* Top 2-Column Section: Rating Summary (Left) & Customer Photos (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-gray-200">
        <div className="lg:col-span-5">
          <RatingSummaryCard
            summary={summary}
            onWriteReviewClick={handleWriteReviewClick}
          />
        </div>
        <div className="lg:col-span-7">
          <CustomerMediaGallery
            mediaList={mediaList}
            onMediaClick={(item, idx) => handleOpenMedia(item, idx, mediaList)}
          />
        </div>
      </div>

      {/* Bottom Section: Top Approved Customer Reviews */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading customer reviews...
        </div>
      ) : (
        <TopReviewsList
          reviews={reviews}
          onMediaClick={(item, idx, customList) => handleOpenMedia(item, idx, customList)}
          onHelpful={handleHelpful}
          onReport={handleReport}
        />
      )}

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <WriteReviewModal
          product={product}
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          onSubmitted={() => {
            fetchReviews();
          }}
        />
      )}

      {/* Media Lightbox */}
      {lightboxState.isOpen && (
        <MediaLightbox
          isOpen={lightboxState.isOpen}
          mediaItems={lightboxState.mediaList.map(m => ({
            url: m.url || m.mediaUrl,
            type: 'photo',
            customerPublicName: m.customerName || m.customerPublicName || 'Customer'
          }))}
          currentIndex={lightboxState.initialIndex}
          onSelectIndex={(newIdx) => setLightboxState(prev => ({ ...prev, initialIndex: newIdx }))}
          onClose={() => setLightboxState({ isOpen: false, mediaList: [], initialIndex: 0 })}
        />
      )}
    </section>
  );
}
