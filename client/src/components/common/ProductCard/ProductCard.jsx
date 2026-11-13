import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/utils';
import { Star, ShoppingBag, AlertCircle } from 'lucide-react';
import { useProductRating } from '../../../hooks/useProductRating';

export function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();
  const isOutOfStock = !product.inStock || product.stockQuantity === 0;
  const { average, count } = useProductRating(product);

  const renderStars = (avg) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 ${
          star <= Math.round(avg)
            ? 'fill-amber-400 text-amber-400'
            : 'fill-gray-100 text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group rounded-xl sm:rounded-2xl bg-white border border-sand-border p-2 sm:p-3.5 hover:shadow-botanical hover:border-brand/40 transition-shadow duration-300 flex flex-col justify-between h-full w-full overflow-hidden"
    >
      <div className="flex flex-col flex-1">
        {/* Packshot Image Container with Badges */}
        <div
          onClick={() => onSelectProduct && onSelectProduct(product)}
          className="relative aspect-square w-full rounded-lg sm:rounded-xl bg-sand/50 p-1.5 sm:p-4 mb-2 sm:mb-3 overflow-hidden flex items-center justify-center cursor-pointer select-none"
        >
          {isOutOfStock ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-charcoal text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-full uppercase tracking-wider z-10 shadow-xs pointer-events-none">
              OUT OF STOCK
            </span>
          ) : product.isBestseller ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-brand text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-full uppercase tracking-wider z-10 shadow-sm pointer-events-none">
              BESTSELLER
            </span>
          ) : product.discountPercent > 0 ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-forest text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm pointer-events-none">
              SAVE {product.discountPercent}%
            </span>
          ) : null}

          {/* Protected Centered Image Frame */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden p-0.5 sm:p-1">
            <img
              src={product.featuredImage}
              alt={product.title}
              loading="lazy"
              className="max-w-full max-h-full w-auto h-auto object-contain transform group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-0.5 sm:space-y-1 flex-1 flex flex-col justify-between">
          <div>
            {(product.volumeWeight || product.dosageForm) && (
              <p className="text-[9px] sm:text-[11px] font-semibold text-forest uppercase tracking-wider truncate mb-0.5">
                {[product.volumeWeight, product.dosageForm].filter(Boolean).join(' • ')}
              </p>
            )}

            <h4
              onClick={() => onSelectProduct && onSelectProduct(product)}
              className="font-heading font-bold text-charcoal group-hover:text-brand text-xs sm:text-sm line-clamp-2 leading-tight sm:leading-snug cursor-pointer transition-colors min-h-[2rem] sm:min-h-[2.5rem]"
              title={product.title}
            >
              {product.title}
            </h4>

            {product.shortDesc && (
              <p className="text-[10px] sm:text-xs text-charcoal-muted line-clamp-2 leading-tight mt-0.5 mb-1 hidden xs:line-clamp-2">
                {product.shortDesc}
              </p>
            )}
          </div>

          <div>
            {/* Star Rating from Single Source of Truth */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs pt-0.5 min-h-[1.25rem] sm:min-h-[1.5rem]">
              {count > 0 ? (
                <>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {renderStars(average)}
                  </div>
                  <span className="font-bold text-charcoal text-[10px] sm:text-xs ml-0.5">
                    {average.toFixed(1)}
                  </span>
                  <span className="text-[9px] sm:text-[11px] text-charcoal-subtle">
                    ({count})
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {renderStars(0)}
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-charcoal-subtle ml-0.5">
                    No reviews
                  </span>
                </>
              )}
            </div>

            {/* Price: Bold Deep Green with MRP strikethrough */}
            <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 pb-1.5 sm:pb-2">
              <span className="text-xs sm:text-base font-bold text-forest">
                {formatPrice(product.salePrice)}
              </span>
              {product.mrp > product.salePrice && (
                <span className="text-[10px] sm:text-xs text-charcoal-muted line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width CTA - Vibrant Fibax Orange for Sales & Conversion */}
      {isOutOfStock ? (
        <button
          disabled
          className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl bg-sand text-charcoal-muted text-[10px] sm:text-xs font-bold tracking-wide cursor-not-allowed flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-charcoal-subtle" />
          <span>Out of Stock</span>
        </button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addToCart(product, 1)}
          className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl bg-brand hover:bg-brand-hover text-white text-[10px] sm:text-xs font-bold tracking-wide transition-colors duration-200 shadow-xs sm:shadow-sm hover:shadow-orange-glow flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
        >
          <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <span className="truncate">Add to cart</span>
        </motion.button>
      )}
    </motion.div>
  );
}
