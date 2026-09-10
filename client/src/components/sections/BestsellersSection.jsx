import React from 'react';
import { ProductCard } from '../common/ProductCard/ProductCard';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function BestsellersSection({ products, onSelectProduct, onViewAll }) {
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);

  return (
    <section className="py-16 bg-sand-warm/60 border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-forest-deep">
              Our Most Trusted Ayurvedic Remedies
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1.5">
              Tried, tested, and recommended by Ayurvedic practitioners for rapid, natural healing.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={onViewAll}
            className="self-start md:self-auto flex items-center gap-1.5"
          >
            <span>View All 35 Formulations</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
