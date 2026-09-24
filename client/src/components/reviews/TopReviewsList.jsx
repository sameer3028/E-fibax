import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, Flag } from 'lucide-react';

export default function TopReviewsList({ reviews = [], onMediaClick, onHelpful, onReport }) {
  const [helpfulStates, setHelpfulStates] = useState({});
  const [reportedStates, setReportedStates] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500 font-medium text-xs">
          No customer reviews for this product yet.
        </p>
      </div>
    );
  }

  const displayedReviews = reviews.slice(0, visibleCount);

  const handleHelpfulClick = async (reviewId, currentCount) => {
    if (helpfulStates[reviewId]) return;
    setHelpfulStates(prev => ({ ...prev, [reviewId]: true }));
    if (onHelpful) {
      await onHelpful(reviewId);
    }
  };

  const handleReportClick = async (reviewId) => {
    if (reportedStates[reviewId]) return;
    setReportedStates(prev => ({ ...prev, [reviewId]: true }));
    if (onReport) {
      await onReport(reviewId);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-100 text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-xl font-extrabold text-forest-deep">
          Top Reviews
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          Showing {displayedReviews.length} of {reviews.length} approved review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {displayedReviews.map((review) => {
          const isHelpfulMarked = helpfulStates[review.id];
          const isReported = reportedStates[review.id];
          const helpfulCount = (review.helpfulCount || 0) + (isHelpfulMarked ? 1 : 0);
          const displayName = review.customerPublicName || review.customerName || 'Verified Customer';
          
          // Filter for photo media only
          const rawMediaList = Array.isArray(review.media) && review.media.length > 0 ? review.media : [
            ...(Array.isArray(review.photos) ? review.photos.map(url => (typeof url === 'string' ? { url, type: 'photo' } : url)) : []),
            ...(Array.isArray(review.images) ? review.images.map(url => ({ url, type: 'photo' })) : [])
          ];

          const reviewMedia = rawMediaList.filter(item => {
            const url = typeof item === 'string' ? item : item?.url;
            return item?.type !== 'video' && (!url || !url.match(/\.(mp4|webm|mov)$/i));
          });

          return (
            <div
              key={review.id}
              className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              {/* User Avatar + Public Name */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm">
                    {displayName}
                  </h5>
                  <p className="text-[11px] text-gray-400">
                    Reviewed in India on {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>

              {/* Rating + Title + Verified Purchase Badge */}
              <div className="flex items-center flex-wrap gap-2.5 mb-2.5">
                <div className="flex items-center gap-0.5">
                  {renderStars(review.rating)}
                </div>
                {review.title && (
                  <span className="font-bold text-gray-900 text-sm">
                    {review.title}
                  </span>
                )}
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Verified Purchase
                  </span>
                )}
              </div>

              {/* Review Content Text */}
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-line">
                {review.content}
              </p>

              {/* Review Attached Photos */}
              {reviewMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {reviewMedia.map((item, mIdx) => {
                    const imageUrl = typeof item === 'string' ? item : item.url;
                    return (
                      <div
                        key={mIdx}
                        onClick={() => onMediaClick && onMediaClick(item, mIdx, reviewMedia)}
                        className="group relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer shadow-xs hover:border-emerald-600 transition-all"
                      >
                        <img
                          src={imageUrl}
                          alt={`Review photo ${mIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons: Helpful & Report */}
              <div className="flex items-center gap-4 pt-2.5 border-t border-gray-100 text-xs">
                <button
                  onClick={() => handleHelpfulClick(review.id, review.helpfulCount)}
                  disabled={isHelpfulMarked}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium text-xs transition-colors ${
                    isHelpfulMarked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{isHelpfulMarked ? 'Helpful' : 'Helpful'}</span>
                  {helpfulCount > 0 && <span className="font-bold">({helpfulCount})</span>}
                </button>

                <button
                  onClick={() => handleReportClick(review.id)}
                  disabled={isReported}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                    isReported
                      ? 'text-red-500 font-semibold'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span>{isReported ? 'Reported' : 'Report'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* See More Reviews Load-More Button */}
      {reviews.length > visibleCount && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-50 border border-gray-300 font-bold text-gray-800 text-xs rounded-xl shadow-xs hover:border-gray-400 transition-all cursor-pointer"
          >
            See more reviews
          </button>
        </div>
      )}
    </div>
  );
}
