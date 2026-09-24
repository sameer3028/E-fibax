import React from 'react';
import { Camera } from 'lucide-react';

export default function CustomerMediaGallery({ mediaList = [], onMediaClick }) {
  const photoList = (mediaList || []).filter(item => {
    const url = item.mediaUrl || item.url || '';
    return url && !url.match(/\.(mp4|webm|mov)$/i);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-forest-deep flex items-center gap-2">
          Customer Photos
        </h3>
        {photoList.length > 0 && (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {photoList.length} Photo{photoList.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {photoList.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {photoList.map((item, index) => {
            const imgUrl = item.mediaUrl || item.url;
            return (
              <div
                key={index}
                onClick={() => onMediaClick && onMediaClick(item, index)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <img
                  src={imgUrl}
                  alt={item.caption || "Customer uploaded photo"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-medium text-gray-500">
            No customer photos yet.
          </p>
        </div>
      )}
    </div>
  );
}
