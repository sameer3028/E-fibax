import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { formatPrice } from '../../lib/utils';
import { Sparkles, Save, Check, ArrowUpRight } from 'lucide-react';

export function OffersManager() {
  const { products, updatePricing } = useProducts();
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(null);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditFields({
      mrp: product.mrp,
      salePrice: product.salePrice,
      isBestseller: !!product.isBestseller,
    });
  };

  const handleSave = async (id) => {
    await updatePricing(id, editFields);
    setEditingId(null);
    setSavedSuccess(id);
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-forest to-forest-dark p-6 rounded-2xl text-white shadow-botanical flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>Ayurvedic Offer & Discount Engine</span>
          </div>
          <h3 className="font-heading text-xl font-bold !text-white text-white drop-shadow-sm">
            Manage Promotional Prices & Multi-Pack Tiers
          </h3>
          <p className="text-xs !text-white/90 text-white/90 max-w-xl mt-1">
            Configure MRP, discount rates, flash sale tags, and bestseller flags. Updates instantly reflect on product cards, PDP modals, and customer carts.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 text-center">
          <div className="text-2xl font-bold text-gold">₹499+</div>
          <div className="text-[10px] text-sand/80 uppercase tracking-wider">Free Shipping Threshold</div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                <th className="py-3 px-4">Product Formulation</th>
                <th className="py-3 px-4">Regular MRP (₹)</th>
                <th className="py-3 px-4">Offer Price (₹)</th>
                <th className="py-3 px-4">Discount %</th>
                <th className="py-3 px-4">2-Pack Savings</th>
                <th className="py-3 px-4">3-Pack Savings</th>
                <th className="py-3 px-4">Bestseller Flag</th>
                <th className="py-3 px-4 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border text-xs">
              {products.map((product) => {
                const isEditing = editingId === product.id;
                const currentMrp = isEditing ? editFields.mrp : product.mrp;
                const currentSale = isEditing ? editFields.salePrice : product.salePrice;
                const currentDiscount = Math.round(((currentMrp - currentSale) / currentMrp) * 100);

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
                          <span className="font-heading font-bold text-charcoal line-clamp-1">
                            {product.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] font-bold text-forest bg-forest/5 px-1.5 py-0.5 rounded border border-forest/15">
                              {product.sku || `FBX-${product.id}`}
                            </span>
                            <span className="text-[10px] text-charcoal-subtle">{product.volumeWeight}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MRP */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFields.mrp}
                          onChange={(e) => setEditFields({ ...editFields, mrp: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded border border-sand-border text-xs font-semibold focus:ring-1 focus:ring-forest focus:outline-none"
                        />
                      ) : (
                        <span className="line-through text-charcoal-muted">{formatPrice(product.mrp)}</span>
                      )}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFields.salePrice}
                          onChange={(e) => setEditFields({ ...editFields, salePrice: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded border border-forest text-forest font-bold text-xs focus:ring-1 focus:ring-forest focus:outline-none bg-emerald-50/50"
                        />
                      ) : (
                        <span className="font-bold text-forest text-sm">{formatPrice(product.salePrice)}</span>
                      )}
                    </td>

                    {/* Discount % */}
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {currentDiscount}% OFF
                      </span>
                    </td>

                    {/* Multi-pack 2-pack */}
                    <td className="py-3 px-4 text-charcoal-muted font-medium">
                      {formatPrice(Math.round(currentSale * 2 * 0.9))} <span className="text-[10px] text-emerald-700">(-10%)</span>
                    </td>

                    {/* Multi-pack 3-pack */}
                    <td className="py-3 px-4 text-charcoal-muted font-medium">
                      {formatPrice(Math.round(currentSale * 3 * 0.85))} <span className="text-[10px] text-emerald-700">(-15%)</span>
                    </td>

                    {/* Bestseller */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editFields.isBestseller}
                          onChange={(e) => setEditFields({ ...editFields, isBestseller: e.target.checked })}
                          className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                        />
                      ) : (
                        product.isBestseller ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            YES
                          </span>
                        ) : (
                          <span className="text-charcoal-muted text-[10px]">No</span>
                        )
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSave(product.id)}
                          className="px-3 py-1 rounded-lg bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </button>
                      ) : savedSuccess === product.id ? (
                        <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 justify-end">
                          <Check className="h-4 w-4" />
                          <span>Saved!</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => startEdit(product)}
                          className="px-3 py-1 rounded-lg text-forest hover:bg-forest/10 font-bold text-xs transition-colors"
                        >
                          Edit Offer
                        </button>
                      )}
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
