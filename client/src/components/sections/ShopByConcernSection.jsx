import React, { useState } from 'react';
import { CONCERNS } from '../../data/concerns';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../common/ProductCard/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ShopByConcernSection({ onSelectProduct, onViewAllConcern }) {
  const { products } = useProducts();
  const [activeConcernSlug, setActiveConcernSlug] = useState('joint-pain-relief');

  const activeConcern = CONCERNS.find(c => c.slug === activeConcernSlug) || CONCERNS[0];
  
  // Get 8 products for this concern (2 rows of 4 cards), fallback to related bestsellers
  const concernProds = products.filter(p => p.concernId === activeConcernSlug);
  const filler = products.filter(p => p.concernId !== activeConcernSlug);
  const displayProds = [...concernProds, ...filler].slice(0, 8);

  return (
    <section className="py-14 bg-white border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-forest-deep">
              Shop By <span className="text-brand">Concern?</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Select a health category to discover targeted Ayurvedic therapies (Showing {displayProds.length} Formulations)
            </p>
          </div>
          <button
            onClick={() => onViewAllConcern && onViewAllConcern(activeConcernSlug)}
            className="text-xs font-bold text-forest hover:text-brand flex items-center gap-1 transition-colors"
          >
            <span>View all formulations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Concern Pill Tabs - Active in Fibax Orange */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CONCERNS.map((c) => {
            const isActive = c.slug === activeConcernSlug;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConcernSlug(c.slug)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 scale-102'
                    : 'bg-sand text-charcoal border-sand-border hover:border-brand/40 hover:text-brand'
                }`}
              >
                {c.image && (
                  <div className="w-5 h-5 rounded-full bg-white p-0.5 flex-shrink-0 flex items-center justify-center shadow-2xs">
                    <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <span>{c.name || c.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-sand-border text-charcoal-muted'}`}>
                  {c.productCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2 Rows of Product Grid (8 Cards: 4 per row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProds.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        {/* Bottom Action Strip */}
        <div className="mt-8 pt-6 border-t border-sand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-sand/40 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-forest">
                Looking for more targeted {activeConcern.name} treatments?
              </p>
              <p className="text-xs text-charcoal-muted">
                Explore our full catalog of doctor-curated kwaths, ghritas, oils, and churnas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewAllConcern && onViewAllConcern(activeConcernSlug)}
            className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-deep shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Explore All {activeConcern.name} ({activeConcern.productCount || 5})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
