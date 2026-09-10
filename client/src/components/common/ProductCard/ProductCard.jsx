import React from 'react';
import { useCart } from '../../../context/CartContext';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { formatPrice } from '../../../lib/utils';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';

export function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();

  return (
    <div className="group relative rounded-2xl bg-white border border-sand-border p-4 shadow-subtle hover:shadow-botanical hover:border-sage/40 transition-all duration-300 flex flex-col justify-between">
      {/* Top badges */}
      <div className="relative aspect-square w-full rounded-xl bg-sand/60 p-4 mb-3 overflow-hidden flex items-center justify-center">
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isBestseller && (
            <Badge variant="bestseller">BESTSELLER</Badge>
          )}
          {product.discountPercent > 0 && (
            <Badge variant="discount">SAVE {product.discountPercent}%</Badge>
          )}
        </div>

        <img
          src={product.featuredImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Dosage & Ratings */}
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1.5">
            <span className="font-semibold text-sage uppercase tracking-wider text-[11px]">
              {product.volumeWeight} • {product.dosageForm}
            </span>
            <div className="flex items-center gap-1 text-gold">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold text-charcoal text-xs">{product.ratingAverage}</span>
              <span className="text-[10px] text-charcoal-subtle">({product.ratingCount})</span>
            </div>
          </div>

          {/* Title */}
          <h4
            onClick={() => onSelectProduct && onSelectProduct(product)}
            className="font-serif font-bold text-charcoal group-hover:text-forest text-sm line-clamp-2 leading-snug cursor-pointer transition-colors"
          >
            {product.title}
          </h4>

          {/* Short description */}
          <p className="text-[11px] text-charcoal-muted line-clamp-1 mt-1">
            {product.shortDesc}
          </p>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-sand-border flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-forest-deep">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs text-charcoal-muted line-through">
                {formatPrice(product.mrp)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => addToCart(product, 1)}
            className="text-xs px-3.5 py-1.5 flex items-center gap-1"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
