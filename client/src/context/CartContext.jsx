import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const FREE_SHIPPING_THRESHOLD = 499;

export function CartProvider({ children }) {

  const getItemKey = (item) => {
    const baseId = item?.product?.id || item?.id;
    return item?.selectedPackName ? `${baseId}_${item.selectedPackName}` : String(baseId);
  };

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
    if (!product) return;
    const isOut = product.inStock === false || product.stockQuantity === undefined || product.stockQuantity === null || Number(product.stockQuantity) <= 0;
    if (isOut) {
      console.warn(`Product "${product.title || product.id}" is OUT OF STOCK and cannot be added to cart.`);
      return;
    }
    setItems(prev => {
      const newKey = getItemKey(product);
      const existingIdx = prev.findIndex(item => getItemKey(item) === newKey);
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
      return [...prev, { ...product, product, quantity, cartKey: newKey }];
    });
    setIsOpen(true);
  };

  const updateQuantity = (cartKeyOrId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKeyOrId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const key = item.cartKey || getItemKey(item);
        const baseId = String(item.product?.id || item.id);
        return (key === cartKeyOrId || baseId === cartKeyOrId) ? { ...item, quantity } : item;
      })
    );
  };

  const removeFromCart = (cartKeyOrId) => {
    setItems(prev => prev.filter(item => {
      const key = item.cartKey || getItemKey(item);
      const baseId = String(item.product?.id || item.id);
      return key !== cartKeyOrId && baseId !== cartKeyOrId;
    }));
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
      setDiscountAmount(Math.min(50, subtotal));
      return { success: true, message: '₹50 discount applied!' };
    }
    if (cleanCode === 'FIBAX15') {
      setAppliedCoupon('FIBAX15');
      const discount = Math.round(subtotal * 0.15);
      setDiscountAmount(discount);
      return { success: true, message: '15% Ayurvedic discount applied!' };
    }
    return { success: false, message: 'Invalid coupon code. Try WELCOME10 or AYUSH50.' };
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
