import React from 'react';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/utils';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Truck,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function CartDrawer({ onCheckout }) {
  const {
    isOpen,
    isCartOpen,
    closeCart,
    items,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    cartSubtotal,
    freeShippingThreshold,
    amountUntilFreeShipping,
    amountNeededForFreeShipping,
    freeShippingProgress,
    totalItemsCount,
  } = useCart();

  const activeIsOpen = isOpen ?? isCartOpen;
  const activeItems = items || cartItems || [];
  const activeSubtotal = subtotal ?? cartSubtotal ?? 0;
  const activeAmountNeeded = amountUntilFreeShipping ?? amountNeededForFreeShipping ?? 0;

  if (!activeIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slideLeft border-l border-sand-border">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-sand-border flex items-center justify-between bg-sand/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h3 className="font-heading font-bold text-forest-deep text-lg">Your Cart</h3>
              <span className="text-xs bg-brand-soft text-brand font-bold px-2 py-0.5 rounded-full border border-brand-border">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-charcoal hover:bg-sand transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Meter (₹499+) with Fibax Orange Progress Bar */}
          <div className="p-4 bg-brand-soft/40 border-b border-brand-border/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal mb-1.5">
              <Truck className="h-4 w-4 text-forest" />
              {activeAmountNeeded > 0 ? (
                <span>
                  Add <strong className="text-brand font-bold">{formatPrice(activeAmountNeeded)}</strong> more for <strong className="text-forest font-bold">FREE Delhivery</strong>
                </span>
              ) : (
                <span className="text-forest font-bold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  <span>You've unlocked FREE Express Delhivery!</span>
                </span>
              )}
            </div>

            <div className="w-full h-2 rounded-full bg-sand-border overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-sand-border">
            {activeItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center text-charcoal-muted">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <p className="font-heading font-bold text-charcoal text-lg">Your cart is empty</p>
                <p className="text-xs text-charcoal-muted max-w-xs">
                  Discover pure Ayurvedic remedies crafted for joint relief, liver detox, and vitality.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              activeItems.map((item) => {
                const product = item.product || item;
                const itemId = item.cartKey || item.id || product.id;
                const itemTitle = product.title || item.title;
                const itemImg = product.featuredImage || item.featuredImage;
                const itemVol = product.volumeWeight || item.volumeWeight;
                const itemPrice = item.salePrice || product.salePrice || 0;
                const itemQty = item.quantity || 1;

                return (
                  <div key={itemId} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                    <div className="w-16 h-16 rounded-xl bg-sand p-1 border border-sand-border flex-shrink-0 flex items-center justify-center">
                      <img
                        src={itemImg}
                        alt={itemTitle}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-heading font-bold text-charcoal text-xs line-clamp-1">
                        {itemTitle}
                      </h4>
                      {item.selectedPackName ? (
                        <div className="text-[11px] text-brand font-bold">
                          {item.selectedPackName}
                        </div>
                      ) : (
                        <div className="text-[11px] text-forest font-semibold">
                          {itemVol}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-forest text-sm">
                          {formatPrice(itemPrice * itemQty)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-sand-border rounded-lg bg-sand/50">
                          <button
                            onClick={() => updateQuantity(itemId, itemQty - 1)}
                            className="p-1 text-charcoal hover:text-brand"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-charcoal">
                            {itemQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemId, itemQty + 1)}
                            className="p-1 text-charcoal hover:text-brand"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="p-1.5 text-charcoal-muted hover:text-red-600 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Bar */}
          {activeItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-sand-border bg-sand/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-charcoal-muted">
                <span>Subtotal</span>
                <span className="text-base font-bold text-forest">
                  {formatPrice(activeSubtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-charcoal-muted">
                <span>Shipping</span>
                <span className="text-xs font-bold text-forest">
                  {activeAmountNeeded === 0 ? 'FREE' : '₹49 (Delhivery)'}
                </span>
              </div>

              {/* Solid Vibrant Fibax Orange Checkout Button */}
              <button
                onClick={() => {
                  closeCart();
                  if (onCheckout) onCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-orange-glow flex items-center justify-center gap-2 transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-charcoal-muted">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-forest" />
                  <span>100% Genuine</span>
                </span>
                <span>•</span>
                <span>Delhivery Express</span>
                <span>•</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
