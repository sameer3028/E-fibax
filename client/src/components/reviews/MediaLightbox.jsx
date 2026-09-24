import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export function MediaLightbox({ isOpen, onClose, mediaItems = [], currentIndex = 0, onSelectIndex }) {
  const photoItems = (mediaItems || []).filter(item => {
    const url = item.url || item.mediaUrl || '';
    return url && !url.match(/\.(mp4|webm|mov)$/i);
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onSelectIndex(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < photoItems.length - 1) onSelectIndex(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photoItems.length, onClose, onSelectIndex]);

  if (!isOpen || photoItems.length === 0) return null;

  const currentItem = photoItems[currentIndex] || photoItems[0];
  const imgUrl = currentItem.url || currentItem.mediaUrl;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        title="Close (Esc)"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Prev Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={() => onSelectIndex(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next Navigation */}
      {currentIndex < photoItems.length - 1 && (
        <button
          onClick={() => onSelectIndex(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Content Area */}
      <div className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center">
        <div className="relative max-h-[70vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10">
          <img
            src={imgUrl}
            alt={currentItem.customerPublicName || 'Customer Photo'}
            className="max-h-[70vh] max-w-full object-contain rounded-xl"
          />
        </div>

        {/* Caption Bar */}
        <div className="mt-4 text-center text-white space-y-1">
          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Customer Photo by {currentItem.customerPublicName || 'Verified Customer'}</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Photo {currentIndex + 1} of {photoItems.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MediaLightbox;
