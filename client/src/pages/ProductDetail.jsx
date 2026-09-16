import React, { useEffect } from 'react';
import { ProductPageView } from '../components/views/ProductPageView';
import { ArrowLeft, Package } from 'lucide-react';

export function ProductDetail({
  product,
  allProducts = [],
  onBack,
  onSelectProduct,
  onCheckout,
  onSelectConcern,
  onNavigate
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-sand">
        <div className="w-16 h-16 rounded-2xl bg-white border border-sand-border flex items-center justify-center text-forest mb-4 shadow-subtle">
          <Package className="h-8 w-8 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-forest-deep mb-2">No Product Selected</h2>
        <p className="text-xs text-charcoal-muted max-w-sm mb-6">
          Please select a formulation from our catalog to view detailed composition, multi-pack pricing, and usage guidelines.
        </p>
        <button
          onClick={() => {
            if (onNavigate) onNavigate('products');
            else if (onBack) onBack();
          }}
          className="px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Product Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <ProductPageView
        product={product}
        allProducts={allProducts}
        onBack={() => {
          if (onBack) onBack();
          else if (onNavigate) onNavigate('products');
        }}
        onSelectProduct={onSelectProduct}
        onCheckout={onCheckout}
        onSelectConcern={onSelectConcern}
      />
    </div>
  );
}
