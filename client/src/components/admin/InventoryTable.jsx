import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RefreshCw,
  Search
} from 'lucide-react';

export function InventoryTable() {
  const { products, stats, adjustStock, refreshProducts } = useProducts();
  const [filterMode, setFilterMode] = useState('all'); // all, low, out
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterMode === 'low') return p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 15);
    if (filterMode === 'out') return !p.stockQuantity || p.stockQuantity === 0;
    return true;
  });

  const handleQuickAdd = async (id, delta) => {
    await adjustStock(id, { delta });
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">Total Formulations</div>
          <div className="text-2xl font-bold text-charcoal mt-1">{stats.totalProducts}</div>
          <div className="text-[10px] text-sage mt-0.5">Active in system</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
          <div className="text-xs font-semibold text-charcoal-muted uppercase">Total Stock Units</div>
          <div className="text-2xl font-bold text-forest mt-1">{stats.totalUnits}</div>
          <div className="text-[10px] text-charcoal-muted mt-0.5">Physical inventory in warehouse</div>
        </div>

        <div 
          onClick={() => setFilterMode(filterMode === 'low' ? 'all' : 'low')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            filterMode === 'low' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-sand-border hover:border-amber-300'
          }`}
        >
          <div className="text-xs font-semibold text-amber-800 uppercase flex items-center justify-between">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stats.lowStockCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Click to filter (&lt; 15 units)</div>
        </div>

        <div 
          onClick={() => setFilterMode(filterMode === 'out' ? 'all' : 'out')}
          className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            filterMode === 'out' ? 'border-red-500 ring-2 ring-red-200' : 'border-sand-border hover:border-red-300'
          }`}
        >
          <div className="text-xs font-semibold text-red-800 uppercase flex items-center justify-between">
            <span>Out of Stock</span>
            <XCircle className="h-3.5 w-3.5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{stats.outOfStockCount}</div>
          <div className="text-[10px] text-red-600 mt-0.5">Click to filter (0 units)</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by title or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all' ? 'bg-forest text-white' : 'bg-sand text-charcoal hover:bg-sand-border'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Low Stock ({stats.lowStockCount})
          </button>
          <button
            onClick={() => setFilterMode('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'out' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            Out of Stock ({stats.outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Form & Pack Size</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Units On Hand</th>
                <th className="py-3 px-4">Alert Threshold</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border text-xs">
              {filtered.map((product) => {
                const isOut = !product.stockQuantity || product.stockQuantity === 0;
                const isLow = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 15);

                return (
                  <tr key={product.id} className="hover:bg-sand/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.featuredImage}
                          alt={product.title}
                          className="w-9 h-9 rounded-lg object-contain bg-sand p-1 border border-sand-border"
                        />
                        <div>
                          <span className="font-heading font-bold text-charcoal line-clamp-1">{product.title}</span>
                          <span className="text-[10px] text-charcoal-muted font-mono">{product.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-charcoal-muted">
                      <div>{product.dosageForm}</div>
                      <div className="text-[10px] text-charcoal-subtle">{product.volumeWeight}</div>
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          REORDER SOON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          HEALTHY STOCK
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-base font-bold ${
                        isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-forest'
                      }`}>
                        {product.stockQuantity || 0}
                      </span>
                      <span className="text-[10px] text-charcoal-muted ml-1">units</span>
                    </td>

                    <td className="py-3 px-4 text-charcoal-muted">
                      {product.lowStockThreshold || 15} units
                    </td>

                    {/* Quick Restock Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickAdd(product.id, 5)}
                          className="px-2.5 py-1 rounded-lg bg-sand hover:bg-forest hover:text-white text-charcoal text-[11px] font-bold transition-colors border border-sand-border"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickAdd(product.id, 25)}
                          className="px-2.5 py-1 rounded-lg bg-sand hover:bg-forest hover:text-white text-charcoal text-[11px] font-bold transition-colors border border-sand-border"
                          title="Add 25 units"
                        >
                          +25
                        </button>
                        <button
                          onClick={() => handleQuickAdd(product.id, 100)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-forest hover:text-white text-forest text-[11px] font-bold transition-colors border border-emerald-200"
                          title="Add 100 units"
                        >
                          +100
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
