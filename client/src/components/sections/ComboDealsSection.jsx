import React, { useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { isProductInCategory } from '../../utils/categoryUtils';
import { ArrowRight } from 'lucide-react';

export function ComboDealsSection({ onSelectProduct, onExploreCombos }) {
  const { products } = useProducts();
  const { addToCart } = useCart();

  // Filter active Admin-created Combo Offers
  const activeCombos = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      const isCombo = isProductInCategory(p, 'combos');
      const isActive = p.isActive !== false;
      return isCombo && isActive;
    }).slice(0, 4); // Limit to top 4 featured active combos for Home Page
  }, [products]);

  // Hide section cleanly if zero active Admin Combo Offers exist
  if (activeCombos.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-sand-warm border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-forest-deep">
              Combo <span className="text-amber-warm">Deals</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Synergistic formulas designed to be taken together for enhanced relief
            </p>
          </div>
          <button
            onClick={onExploreCombos}
            className="text-xs font-bold text-forest hover:text-forest-light flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 2-Column Grid of Dynamic Admin Combo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCombos.map((deal) => {
            const isOut = deal.inStock === false || deal.stockQuantity === undefined || deal.stockQuantity === null || Number(deal.stockQuantity) <= 0;
            const discountPercent = deal.discountPercent || (deal.mrp > deal.salePrice ? Math.round(((deal.mrp - deal.salePrice) / deal.mrp) * 100) : 0);

            return (
              <div
                key={deal.id}
                onClick={() => onSelectProduct && onSelectProduct(deal)}
                className="p-4 rounded-2xl bg-white border border-sand-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-forest/30 transition-all cursor-pointer group"
              >
                {/* Combo Image */}
                <div className="flex items-center justify-center flex-shrink-0 bg-sand/60 p-2 rounded-xl w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border border-sand-border">
                  <img
                    src={deal.featuredImage || '/uploads/piles-kit.png'}
                    alt={deal.title}
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  {discountPercent > 0 && (
                    <span className="inline-block text-[10px] font-bold text-crimson bg-crimson/10 px-2 py-0.5 rounded uppercase">
                      SAVE {discountPercent}%
                    </span>
                  )}
                  <h4 className="font-heading font-bold text-sm text-forest-deep mt-1 truncate group-hover:text-brand transition-colors">
                    {deal.title}
                  </h4>
                  {deal.shortDesc && (
                    <p className="text-[11px] text-charcoal-muted line-clamp-1 mt-0.5">
                      {deal.shortDesc}
                    </p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                    <span className="text-base font-bold text-forest">
                      {formatPrice(deal.salePrice)}
                    </span>
                    {deal.mrp > deal.salePrice && (
                      <span className="text-xs text-charcoal-muted line-through">
                        {formatPrice(deal.mrp)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add CTA */}
                <button
                  type="button"
                  disabled={isOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOut) {
                      addToCart(deal, 1);
                    }
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isOut
                      ? 'bg-sand text-charcoal-muted border border-sand-border cursor-not-allowed'
                      : 'bg-forest hover:bg-forest-light text-white shadow-xs active:scale-95'
                  }`}
                >
                  {isOut ? 'Out of Stock' : 'Add to cart'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
