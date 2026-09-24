import React from 'react';
import { Star, Edit3 } from 'lucide-react';

export default function RatingSummaryCard({ summary, onWriteReviewClick }) {
  const { average = 0, count = 0, distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } = summary || {};

  const renderStars = (ratingVal) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 ${
          star <= Math.round(ratingVal)
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-100 text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header & Rating Score */}
      <div>
        <h3 className="text-xl font-extrabold text-forest-deep mb-2">
          Customer reviews
        </h3>
        
        {count > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(Number(average) || 0)}
              </div>
              <span className="font-extrabold text-lg text-gray-900">
                {(Number(average) || 0).toFixed(1)} out of 5
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500">
              Based on <span className="font-bold text-emerald-800">{count}</span> verified customer review{count !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(0)}
              </div>
              <span className="font-bold text-sm text-gray-600">
                No reviews yet
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Be the first to review this product.
            </p>
          </div>
        )}
      </div>

      {/* Rating Distribution Bars */}
      <div className="space-y-2.5 max-w-md">
        {[5, 4, 3, 2, 1].map((starLevel) => {
          const raw = (distribution && distribution[starLevel] !== undefined) ? Number(distribution[starLevel]) : 0;
          const percentage = count > 0 ? Math.min(100, Math.max(0, Math.round(raw))) : 0;
          return (
            <div key={starLevel} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-medium text-gray-700 text-left">
                {starLevel} star
              </span>
              <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-right font-semibold text-gray-600">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Review CTA Box */}
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <h4 className="font-bold text-sm text-gray-900">
          Review this product
        </h4>
        <p className="text-xs text-gray-500">
          Share your thoughts with other customers
        </p>
        <button
          onClick={onWriteReviewClick}
          className="mt-2 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold text-xs rounded-xl shadow-xs hover:border-gray-400 transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-forest" />
          Write a product review
        </button>
      </div>
    </div>
  );
}
