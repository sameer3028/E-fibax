import React, { useState, useMemo } from 'react';
import { ProductCard } from '../common/ProductCard/ProductCard';
import { CONCERNS } from '../../data/concerns';
import { CATEGORIES } from '../../data/categories';
import { Button } from '../ui/Button';
import { Filter, X, ArrowUpDown, Sparkles } from 'lucide-react';

export function ShopView({
  products,
  initialConcern,
  initialCategory,
  onSelectProduct,
  onResetFilters
}) {
  const [selectedConcern, setSelectedConcern] = useState(initialConcern || 'all');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(750);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchConcern = selectedConcern === 'all' || p.concernId === selectedConcern;
      const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchPrice = p.salePrice <= maxPrice;
      return matchConcern && matchCategory && matchPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.salePrice - b.salePrice;
      if (sortBy === 'price-high') return b.salePrice - a.salePrice;
      if (sortBy === 'rating') return parseFloat(b.ratingAverage) - parseFloat(a.ratingAverage);
      return b.ratingCount - a.ratingCount; // 'popular'
    });
  }, [products, selectedConcern, selectedCategory, maxPrice, sortBy]);

  const activeConcernObj = CONCERNS.find(c => c.slug === selectedConcern);

  return (
    <div className="py-10 bg-sand-warm min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-8 p-6 rounded-3xl bg-white border border-sand-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-sage uppercase tracking-wider block mb-1">
              Fibax Herbal Dispensary
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-deep">
              {activeConcernObj ? activeConcernObj.name : 'All Ayurvedic Formulations'}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-xl">
              {activeConcernObj
                ? activeConcernObj.description
                : 'Showing 35 verified proprietary herbal medicines manufactured under strict GMP quality standards.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-charcoal-muted">
              {filteredProducts.length} Products Found
            </span>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-sand-border shadow-subtle space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <h3 className="font-serif font-bold text-forest text-base flex items-center gap-2">
                <Filter className="h-4 w-4 text-sage" />
                <span>Filter Formulations</span>
              </h3>
              {(selectedConcern !== 'all' || selectedCategory !== 'all' || maxPrice < 750) && (
                <button
                  onClick={() => {
                    setSelectedConcern('all');
                    setSelectedCategory('all');
                    setMaxPrice(750);
                    if (onResetFilters) onResetFilters();
                  }}
                  className="text-xs font-bold text-crimson hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Concern Filter */}
            <div>
              <p className="text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-2.5">
                Health Concern
              </p>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedConcern('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedConcern === 'all'
                      ? 'bg-forest text-white'
                      : 'text-charcoal hover:bg-sand'
                  }`}
                >
                  All Concerns (35)
                </button>
                {CONCERNS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConcern(c.slug)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedConcern === c.slug
                        ? 'bg-forest text-white font-semibold'
                        : 'text-charcoal hover:bg-sand'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-70">({c.productCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="pt-4 border-t border-sand-border">
              <p className="text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-2.5">
                Dosage Form
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-forest text-white'
                      : 'text-charcoal hover:bg-sand'
                  }`}
                >
                  All Forms
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-forest text-white font-semibold'
                        : 'text-charcoal hover:bg-sand'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="pt-4 border-t border-sand-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
                  Max Price
                </span>
                <span className="text-xs font-bold text-forest">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="90"
                max="750"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-charcoal-subtle mt-1">
                <span>₹90</span>
                <span>₹750</span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* Sorting Row */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-sand-border text-xs">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-sage" />
                <span className="font-semibold text-charcoal">Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-medium text-forest focus:outline-none cursor-pointer pr-2"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Customer Rating (High to Low)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-sand-border p-8">
                <Sparkles className="h-10 w-10 text-sage mx-auto mb-3" />
                <h3 className="font-serif font-bold text-forest text-xl">No Formulations Match Criteria</h3>
                <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
                  Try clearing some filters or widening your price threshold to discover remedies.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedConcern('all');
                    setSelectedCategory('all');
                    setMaxPrice(750);
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
