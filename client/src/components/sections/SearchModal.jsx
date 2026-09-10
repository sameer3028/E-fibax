import React, { useState } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { CONCERNS } from '../../data/concerns';
import { formatPrice } from '../../lib/utils';

export function SearchModal({ isOpen, onClose, onSelectProduct, onSelectConcern }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const matchedConcerns = query.trim()
    ? CONCERNS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-x-4 top-20 max-w-2xl mx-auto bg-white rounded-3xl shadow-modal border border-sand-border p-6 z-50 animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-sand-border">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-5 w-5 text-forest" />
            <input
              type="text"
              autoFocus
              placeholder="Search by health concern (e.g. Joint, Liver, Sugar) or product..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm sm:text-base font-medium text-charcoal placeholder-charcoal-subtle focus:outline-none"
            />
          </div>
          <button onClick={onClose} className="p-1 text-charcoal-muted hover:text-charcoal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="pt-4 max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div>
              <p className="text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Joint Pain Relief', 'Liver Care', 'Diabetes Sugar', 'Digestive Enzymes', 'Triphala Juice', 'Ashwagandha'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-sand text-xs font-medium text-charcoal hover:bg-sage-soft hover:text-forest transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Matched Concerns */}
              {matchedConcerns.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-sage uppercase tracking-wider mb-2">
                    Health Concerns
                  </p>
                  <div className="space-y-1.5">
                    {matchedConcerns.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectConcern(c.slug);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-sand text-left transition-colors"
                      >
                        <span className="text-sm font-semibold text-charcoal">{c.name}</span>
                        <ArrowRight className="h-4 w-4 text-forest" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Products */}
              <div>
                <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2">
                  Formulations ({filteredProducts.length})
                </p>
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-charcoal-muted py-4 text-center">
                    No formulations found matching "{query}". Try searching by health concern.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sand border border-transparent hover:border-sand-border cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.featuredImage}
                            alt={p.title}
                            className="w-10 h-10 object-contain rounded-lg bg-sand/60 p-1"
                          />
                          <div>
                            <p className="text-xs font-semibold text-charcoal line-clamp-1">{p.title}</p>
                            <p className="text-[11px] text-charcoal-muted">{p.volumeWeight} • {p.dosageForm}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-forest">{formatPrice(p.salePrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
