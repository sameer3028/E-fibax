import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { formatPrice } from '../../lib/utils';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles,
  Filter
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CONCERNS } from '../../data/concerns';
import { isProductInCategory } from '../../utils/categoryUtils';

export function ProductsTable({ onAddNew, onEditProduct }) {
  const { products, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConcern, setSelectedConcern] = useState('all');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || isProductInCategory(p, selectedCategory);
    const matchesConcern = selectedConcern === 'all' || 
                           p.concernId === selectedConcern || 
                           p.concernCategory === selectedConcern || 
                           (Array.isArray(p.concerns) && p.concerns.includes(selectedConcern));
    return matchesSearch && matchesCategory && matchesConcern;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the catalog?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, or formulation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-medium text-charcoal"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedConcern}
            onChange={(e) => setSelectedConcern(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-medium text-charcoal"
          >
            <option value="all">All Concerns</option>
            {CONCERNS.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.id}>
                {c.name || c.title || c.label}
              </option>
            ))}
          </select>

          {/* Add Product CTA */}
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                <th className="py-3 px-4">Product Formulation</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Format & Concern</th>
                <th className="py-3 px-4">Regular MRP</th>
                <th className="py-3 px-4">Offer Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted">
                    No formulations found matching your query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 15);
                  const isOut = !product.stockQuantity || product.stockQuantity === 0;

                  return (
                    <tr key={product.id} className="hover:bg-sand/30 transition-colors">
                      {/* Product Formulation */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-sand border border-sand-border p-1 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={product.featuredImage}
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-bold text-charcoal text-xs hover:text-forest line-clamp-1">
                                {product.title}
                              </span>
                              {product.isBestseller && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                  BESTSELLER
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-charcoal-subtle">
                              {product.volumeWeight}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dedicated SKU Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-forest bg-forest/5 px-2.5 py-1 rounded-md border border-forest/15 inline-block">
                          {product.sku || (`FBX-${product.id}`)}
                        </span>
                      </td>

                      {/* Format & Concern */}
                      <td className="py-3 px-4 text-charcoal-muted">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-charcoal capitalize">{product.dosageForm}</span>
                          <span className="text-[9px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded capitalize">
                            {product.categoryId || 'syrups'}
                          </span>
                        </div>
                        <div className="text-[10px] text-sage">{product.concernId ? product.concernId.replace(/-/g, ' ') : 'General'}</div>
                      </td>

                      {/* Regular MRP */}
                      <td className="py-3 px-4 font-medium text-charcoal-muted line-through">
                        {formatPrice(product.mrp)}
                      </td>

                      {/* Offer Price */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-forest text-sm">
                          {formatPrice(product.salePrice)}
                        </div>
                        {product.discountPercent > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="h-3 w-3" />
                            <span>Out of Stock (0)</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Low Stock ({product.stockQuantity})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{product.stockQuantity} in stock</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 rounded-lg text-charcoal hover:text-forest hover:bg-sand transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
