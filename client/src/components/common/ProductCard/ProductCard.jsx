import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/utils';
import { Star, ShoppingBag, AlertCircle } from 'lucide-react';

export function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();
  const isOutOfStock = !product.inStock || product.stockQuantity === 0;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group rounded-2xl bg-white border border-sand-border p-3.5 hover:shadow-botanical hover:border-brand/40 transition-shadow duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Packshot Image Container with Badges */}
        <div
          onClick={() => onSelectProduct && onSelectProduct(product)}
          className="relative aspect-square w-full rounded-xl bg-sand/50 p-4 mb-3 overflow-hidden flex items-center justify-center cursor-pointer"
        >
          {isOutOfStock ? (
            <span className="absolute top-2.5 left-2.5 bg-charcoal text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-xs">
              OUT OF STOCK
            </span>
          ) : product.isBestseller ? (
            <span className="absolute top-2.5 left-2.5 bg-brand text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
              BESTSELLER
            </span>
          ) : product.discountPercent > 0 ? (
            <span className="absolute top-2.5 left-2.5 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm">
              SAVE {product.discountPercent}%
            </span>
          ) : null}

          <img
            src={product.featuredImage}
            alt={product.title}
            loading="lazy"
            className={`w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />
        </div>

        {/* Product Information */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-forest uppercase tracking-wider">
            {product.volumeWeight} • {product.dosageForm}
          </p>

          <h4
            onClick={() => onSelectProduct && onSelectProduct(product)}
            className="font-heading font-bold text-charcoal group-hover:text-brand text-sm line-clamp-2 leading-snug cursor-pointer transition-colors min-h-[2.5rem]"
          >
            {product.title}
          </h4>

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-gold text-xs pt-0.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-charcoal text-xs ml-0.5">{product.ratingAverage}</span>
            <span className="text-[11px] text-charcoal-subtle">({product.ratingCount})</span>
          </div>

          {/* Price: Bold Deep Green with MRP strikethrough */}
          <div className="flex items-baseline gap-2 pt-1 pb-2">
            <span className="text-base font-bold text-forest">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-xs text-charcoal-muted line-through">
              {formatPrice(product.mrp)}
            </span>
          </div>
        </div>
      </div>

      {/* Full-width CTA - Vibrant Fibax Orange for Sales & Conversion */}
      {isOutOfStock ? (
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-xl bg-sand text-charcoal-muted text-xs font-bold tracking-wide cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <AlertCircle className="h-3.5 w-3.5 text-charcoal-subtle" />
          <span>Out of Stock</span>
        </button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addToCart(product, 1)}
          className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold tracking-wide transition-colors duration-200 shadow-sm hover:shadow-orange-glow flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Add to cart</span>
        </motion.button>
      )}
    </motion.div>
  );
}
