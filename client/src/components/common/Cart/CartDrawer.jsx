import React, { useState } from 'react';
import { useCart, FREE_SHIPPING_THRESHOLD } from '../../../context/CartContext';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { formatPrice } from '../../../lib/utils';
import {
  Trash2,
  Plus,
  Minus,
  Truck,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { PRODUCTS } from '../../../data/products';

export function CartDrawer({ onCheckout }) {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    isFreeShipping,
    amountUntilFreeShipping,
    freeShippingProgress,
    shippingFee,
    appliedCoupon,
    discountAmount,
    grandTotal,
    applyCoupon,
    removeCoupon,
    addToCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = applyCoupon(couponCode);
    setCouponMessage(res);
  };

  // Cross-sell items (products under 250 not already in cart)
  const crossSellProds = PRODUCTS.filter(
    p => p.salePrice <= 260 && !items.some(it => it.product.id === p.id)
  ).slice(0, 2);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={closeCart}
      title="Your Ayurvedic Healing Cart"
      side="right"
      className="max-w-lg"
    >
      <div className="flex flex-col h-full justify-between">
        {/* Top: Free Shipping Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-sand border border-sand-border">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-forest">
              <Truck className="h-4 w-4 text-sage" />
              {isFreeShipping ? (
                <strong className="text-emerald-700">Congratulations! FREE Delivery Unlocked</strong>
              ) : (
                <span>
                  Add <strong className="text-forest font-bold">{formatPrice(amountUntilFreeShipping)}</strong> more for FREE Shipping
                </span>
              )}
            </span>
            <span className="text-charcoal-muted">{freeShippingProgress}%</span>
          </div>

          <div className="w-full bg-sand-border h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sage to-forest h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-charcoal-muted mt-2 text-center">
            Standard India-wide shipping threshold: ₹{FREE_SHIPPING_THRESHOLD} (Dispatched via Delhivery)
          </p>
        </div>

        {/* Middle: Items List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-3 text-charcoal-muted">
                <ShoppingBag className="h-8 w-8 text-sage" />
              </div>
              <h4 className="font-serif font-bold text-forest text-lg">Your Cart is Empty</h4>
              <p className="text-xs text-charcoal-muted mt-1 max-w-xs mx-auto">
                Explore our pure Ayurvedic formulations and natural symptom remedies to start your healing.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-5"
                onClick={closeCart}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-sand-border bg-white shadow-subtle hover:border-sage/40 transition-all"
              >
                <img
                  src={product.featuredImage}
                  alt={product.title}
                  className="w-16 h-16 object-contain rounded-xl bg-sand p-1 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-semibold text-charcoal line-clamp-1 leading-snug">
                    {product.title}
                  </h5>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">
                    {product.volumeWeight} • {product.dosageForm}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-forest">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-[11px] text-charcoal-muted line-through">
                      {formatPrice(product.mrp)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-sand-border rounded-lg bg-sand overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1.5 hover:bg-sand-border text-charcoal transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-forest min-w-[20px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-1.5 hover:bg-sand-border text-charcoal transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-charcoal-muted hover:text-crimson transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* In-Drawer Quick Cross-Sells */}
          {items.length > 0 && crossSellProds.length > 0 && (
            <div className="mt-6 pt-4 border-t border-sand-border">
              <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Frequently Paired Add-ons
              </p>
              <div className="space-y-2">
                {crossSellProds.map((cross) => (
                  <div
                    key={cross.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-sand/60 border border-sand-border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={cross.featuredImage}
                        alt={cross.title}
                        className="w-10 h-10 object-contain rounded-lg bg-white p-1"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-charcoal truncate">
                          {cross.title}
                        </p>
                        <p className="text-[11px] font-bold text-forest">
                          {formatPrice(cross.salePrice)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(cross, 1)}
                      className="text-xs py-1 px-3"
                    >
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Totals & Checkout CTA */}
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-sand-border space-y-3 bg-white">
            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-charcoal-muted" />
                <input
                  type="text"
                  placeholder="Coupon: WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-sand-border focus:outline-none focus:border-forest"
                />
              </div>
              <Button variant="secondary" size="sm" type="submit">
                Apply
              </Button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Code <strong>{appliedCoupon}</strong> applied (-{formatPrice(discountAmount)})</span>
                <button onClick={removeCoupon} className="text-crimson font-bold text-xs underline">
                  Remove
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-charcoal">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Delivery (Delhivery Express)</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-crimson">
                  <span>Special Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-forest-deep pt-2 border-t border-sand-border">
                <span>Grand Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Direct Checkout CTA */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base py-3.5 font-bold shadow-md flex items-center justify-center gap-2"
              onClick={() => {
                closeCart();
                if (onCheckout) onCheckout();
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-charcoal-muted pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sage" />
                100% Secure Checkout
              </span>
              <span>•</span>
              <span>UPI, Cards & COD</span>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
