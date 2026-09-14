import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const FREE_SHIPPING_THRESHOLD = 499;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fibax_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('fibax_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const prodId = product.id;
      const existingIdx = prev.findIndex(item => (item.product?.id || item.id) === prodId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...product,
          product: product,
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      }
      return [...prev, { ...product, product, quantity }];
    });
    setIsOpen(true);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const itemId = item.product?.id || item.id;
        return itemId === productId ? { ...item, quantity } : item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(item => (item.product?.id || item.id) !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.salePrice || item.product?.salePrice || 0;
    return acc + (price * item.quantity);
  }, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const shippingFee = subtotal === 0 || isFreeShipping ? 0 : 49;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      const discount = Math.round(subtotal * 0.10);
      setDiscountAmount(discount);
      return { success: true, message: '10% discount applied!' };
    }
    if (cleanCode === 'AYUSH50') {
      setAppliedCoupon('AYUSH50');
      setDiscountAmount(50);
      return { success: true, message: '₹50 discount applied!' };
    }
    return { success: false, message: 'Invalid coupon code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        totalItemsCount,
        isOpen,
        isCartOpen: isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen(prev => !prev),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        cartSubtotal: subtotal,
        isFreeShipping,
        amountUntilFreeShipping,
        amountNeededForFreeShipping: amountUntilFreeShipping,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingProgress,
        shippingFee,
        appliedCoupon,
        discountAmount,
        grandTotal,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
