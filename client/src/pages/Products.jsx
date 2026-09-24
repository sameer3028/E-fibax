import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '../components/common/ProductCard/ProductCard';
import { CATEGORIES } from '../data/categories';
import { CONCERNS } from '../data/concerns';
import { isProductInCategory } from '../utils/categoryUtils';
import {
  SlidersHorizontal,
  Package,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export function Products({
  products = [],
  initialCategory = 'all',
  initialConcern = 'all',
  onSelectProduct,
  onNavigate
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedConcern, setSelectedConcern] = useState(initialConcern || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialConcern) setSelectedConcern(initialConcern);
  }, [initialConcern]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Filter by Health Concern
    if (selectedConcern && selectedConcern !== 'all') {
      result = result.filter(
        (p) =>
          p.concernId === selectedConcern ||
          p.concernCategory === selectedConcern ||
          (Array.isArray(p.concerns) && p.concerns.includes(selectedConcern))
      );
    }

    // 2. Filter by Category / Dosage Format
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => isProductInCategory(p, selectedCategory));
    }

    // 3. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.shortDesc?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          (Array.isArray(p.keyBenefits) &&
            p.keyBenefits.some((b) => typeof b === 'string' && b.toLowerCase().includes(q))) ||
          (typeof p.ingredients === 'string' && p.ingredients.toLowerCase().includes(q)) ||
          (Array.isArray(p.ingredients) &&
            p.ingredients.some((ing) => (typeof ing === 'string' ? ing : ing.name)?.toLowerCase().includes(q)))
      );
    }

    // 4. Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'rating') {
      result.sort(
        (a, b) =>
          parseFloat(b.ratingAverage || b.rating || 0) - parseFloat(a.ratingAverage || a.rating || 0)
      );
    } else {
      // featured: bestsellers first
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, selectedConcern, searchQuery, sortBy]);

  const handleSelectCategoryFilter = (slug) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(window.location.search);
    if (slug !== 'all') {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
    window.history.replaceState(null, '', newUrl);
  };

  const handleSelectConcernFilter = (slug) => {
    setSelectedConcern(slug);
    const params = new URLSearchParams(window.location.search);
    if (slug !== 'all') {
      params.set('concern', slug);
    } else {
      params.delete('concern');
    }
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
    window.history.replaceState(null, '', newUrl);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedConcern('all');
    setSearchQuery('');
    setSortBy('featured');
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="bg-sand-warm min-h-screen pb-16">
      {/* 1. Filter Tabs */}
      <section className="bg-white border-b border-sand-border py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Format / Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-forest uppercase tracking-wider flex-shrink-0 flex items-center gap-1 mr-2">
              <Package className="h-3.5 w-3.5 text-brand" /> Formats:
            </span>
            <button
              onClick={() => handleSelectCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-sand hover:bg-sand-warm text-charcoal border border-sand-border'
              }`}
            >
              All Formats ({products.length})
            </button>
            <button
              onClick={() => handleSelectCategoryFilter('combos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all flex items-center gap-1 ${
                selectedCategory === 'combos'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-brand-soft text-brand border border-brand-border hover:bg-brand/15'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Combos & Value Courses</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategoryFilter(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-forest text-white shadow-xs'
                    : 'bg-sand hover:bg-sand-warm text-charcoal border border-sand-border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Health Concern Filter Chips */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-leaf-dark uppercase tracking-wider flex-shrink-0 flex items-center gap-1 mr-2">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf-dark" /> Concerns:
            </span>
            <button
              onClick={() => handleSelectConcernFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 transition-all ${
                selectedConcern === 'all'
                  ? 'bg-leaf-dark text-white'
                  : 'bg-sand hover:bg-sand-warm text-charcoal border border-sand-border'
              }`}
            >
              All Concerns
            </button>
            {CONCERNS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectConcernFilter(c.slug)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedConcern === c.slug
                    ? 'bg-leaf-dark text-white'
                    : 'bg-sand hover:bg-sand-warm text-charcoal border border-sand-border'
                }`}
              >
                {c.image && (
                  <img src={c.image} alt={c.name} className="w-3.5 h-3.5 object-contain rounded-full" />
                )}
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Products Grid & Sort Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-xs sm:text-sm font-semibold text-charcoal">
            Showing <strong className="text-forest">{filteredProducts.length}</strong> products
            {(selectedCategory !== 'all' || selectedConcern !== 'all' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="ml-3 text-xs text-brand hover:underline font-bold inline-flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Filters
              </button>
            )}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-muted font-medium flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-sand-border rounded-xl px-3 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:border-brand"
            >
              <option value="featured">Featured / Bestsellers</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(p) => {
                  if (onSelectProduct) {
                    onSelectProduct(p);
                  } else if (onNavigate) {
                    onNavigate('product-detail', { product: p });
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand-border my-8">
            <div className="w-16 h-16 rounded-full bg-sand mx-auto flex items-center justify-center text-charcoal-subtle mb-4">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-forest-deep">No Formulations Match Your Criteria</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try changing your search keywords or resetting categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
