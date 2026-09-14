import React, { useRef, useState, useEffect } from 'react';
import { ProductCard } from '../common/ProductCard/ProductCard';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export function BestsellersSection({ products, onSelectProduct, onViewAll }) {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Top trusted bestseller products matching customer favorites (prioritize flagship bestsellers from screenshot)
  const priorityIds = ['102', '95', '94', '3620', '3430', '3413', '104'];
  const sortedBestsellers = [...products]
    .filter(p => p.isBestseller || p.ratingAverage >= 4.7)
    .sort((a, b) => {
      const aIdx = priorityIds.indexOf(String(a.id));
      const bIdx = priorityIds.indexOf(String(b.id));
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    })
    .slice(0, 12);

  const displayProducts = sortedBestsellers.length >= 4 ? sortedBestsellers : products.slice(0, 10);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = sliderRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (current) current.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [displayProducts]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const cardWidth = 310 + 20; // card width + gap
      const scrollDistance = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      sliderRef.current.scrollBy({
        left: scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 bg-sand-warm/60 border-b border-sand-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Slider Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Customer Favorites & Highest Rated</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-forest-deep tracking-tight">
              Our Most Trusted Ayurvedic Remedies
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1.5">
              Tried, tested, and recommended by Ayurvedic practitioners for rapid, natural healing.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`w-10 h-10 rounded-full border border-sand-border bg-white flex items-center justify-center transition-all duration-200 shadow-sm ${
                  canScrollLeft
                    ? 'text-forest hover:bg-brand hover:text-white hover:border-brand cursor-pointer'
                    : 'text-charcoal-muted/40 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`w-10 h-10 rounded-full border border-sand-border bg-white flex items-center justify-center transition-all duration-200 shadow-sm ${
                  canScrollRight
                    ? 'text-forest hover:bg-brand hover:text-white hover:border-brand cursor-pointer'
                    : 'text-charcoal-muted/40 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={onViewAll}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <span>View All ({products.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Single Slideable Row of Trusted Products */}
        <div
          ref={sliderRef}
          className="flex items-stretch gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-6 no-scrollbar touch-pan-x"
        >
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="w-[270px] sm:w-[290px] md:w-[305px] flex-shrink-0 snap-start flex flex-col"
            >
              <ProductCard
                product={product}
                onSelectProduct={onSelectProduct}
              />
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex items-center justify-between mt-2 pt-2 text-xs text-charcoal-muted border-t border-sand-border/50 sm:hidden">
          <span>← Swipe horizontally to explore →</span>
          <span className="font-semibold text-forest">{displayProducts.length} Top Remedies</span>
        </div>
      </div>
    </section>
  );
}
