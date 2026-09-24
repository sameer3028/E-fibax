import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';

const CartContext = createContext(null);

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 499;

const DEFAULT_COUPONS = [];

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
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD);
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);

  // Fetch active shipping config and coupons from server
  const fetchShippingConfig = useCallback(async () => {
    try {
      const res = await apiRequest('/api/shipping/config');
      if (res.success && res.data && res.data.freeShippingThreshold !== undefined) {
        setFreeShippingThreshold(Number(res.data.freeShippingThreshold));
      }
    } catch (e) {}
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await apiRequest('/api/coupons/active');
      if (res.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      }
    } catch (e) {
      try {
        const fallbackRes = await apiRequest('/api/coupons');
        if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
          setCoupons(fallbackRes.data.filter(c => c.isActive !== false));
        }
      } catch (err) {}
    }
  }, []);

  useEffect(() => {
    fetchShippingConfig();
    fetchCoupons();
  }, [fetchShippingConfig, fetchCoupons]);

  const updateFreeShippingThreshold = async (newVal) => {
    const num = Number(newVal);
    if (isNaN(num) || num < 0) return { success: false, error: 'Invalid threshold amount' };
    setFreeShippingThreshold(num);
    try {
      const res = await apiRequest('/api/shipping/config', {
        method: 'POST',
        body: JSON.stringify({ freeShippingThreshold: num }),
      });
      if (res.success) {
        return { success: true, data: res.data };
      }
    } catch (e) {
      console.warn('Failed to save free shipping threshold to server:', e);
    }
    return { success: true };
  };

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

  const [liveShippingFee, setLiveShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [shippingRateDetails, setShippingRateDetails] = useState(null);

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setLiveShippingFee(0);
    setShippingError(null);
    setShippingRateDetails(null);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.salePrice || item.product?.salePrice || 0;
    return acc + (price * item.quantity);
  }, 0);
  const activeThreshold = freeShippingThreshold || DEFAULT_FREE_SHIPPING_THRESHOLD;
  const isFreeShipping = subtotal >= activeThreshold;
  const amountUntilFreeShipping = Math.max(0, activeThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / activeThreshold) * 100));
  const shippingFee = subtotal === 0 || isFreeShipping ? 0 : liveShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const calculateCartWeight = useCallback((cartItems) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 500;
    let totalGrams = 0;
    for (const item of cartItems) {
      const qty = item.quantity || 1;
      let itemWeight = 250;
      const vol = item.volumeWeight || item.product?.volumeWeight;
      if (vol) {
        const m = String(vol).match(/(\d+)\s*(ml|gm|g|kg|l)?/i);
        if (m) {
          let val = parseInt(m[1], 10);
          const u = (m[2] || 'gm').toLowerCase();
          if (u === 'kg' || u === 'l') val *= 1000;
          if (val > 0) itemWeight = val;
        }
      }
      totalGrams += itemWeight * qty;
    }
    return Math.max(250, totalGrams);
  }, []);

  const calculateLiveShipping = useCallback(async ({ pincode, paymentMethod = 'COD', itemsOverride } = {}) => {
    const targetItems = itemsOverride || items;
    const currentSubtotal = targetItems.reduce((acc, item) => {
      const price = item.salePrice || item.product?.salePrice || 0;
      return acc + (price * (item.quantity || 1));
    }, 0);

    const activeThresh = freeShippingThreshold || DEFAULT_FREE_SHIPPING_THRESHOLD;
    if (currentSubtotal === 0 || currentSubtotal >= activeThresh) {
      setLiveShippingFee(0);
      setIsCalculatingShipping(false);
      setShippingError(null);
      setShippingRateDetails(null);
      return { success: true, shippingFee: 0, isFreeShipping: true };
    }

    const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setLiveShippingFee(0);
      setIsCalculatingShipping(false);
      setShippingError('Please enter a valid 6-digit Indian PIN code.');
      setShippingRateDetails(null);
      return { success: false, error: 'Please enter a valid 6-digit Indian PIN code.' };
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const weight = calculateCartWeight(targetItems);
      const res = await apiRequest('/api/shipping/rates', {
        method: 'POST',
        body: JSON.stringify({
          cartTotal: currentSubtotal,
          pincode: cleanPin,
          paymentMethod,
          weight,
          items: targetItems
        })
      });

      const data = res.data || res;
      if (data && !data.calculationFailed) {
        const fee = Number(data.shippingFee || 0);
        setLiveShippingFee(fee);
        setShippingRateDetails(data);
        setIsCalculatingShipping(false);
        setShippingError(null);
        return { success: true, shippingFee: fee, data };
      } else {
        setLiveShippingFee(0);
        setShippingRateDetails(null);
        setIsCalculatingShipping(false);
        const errMsg = data?.error || 'Unable to calculate live delivery charge for the provided PIN code.';
        setShippingError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      setLiveShippingFee(0);
      setShippingRateDetails(null);
      setIsCalculatingShipping(false);
      const errMsg = err.message || 'Unable to calculate delivery charge. Please try again.';
      setShippingError(errMsg);
      return { success: false, error: errMsg };
    }
  }, [items, freeShippingThreshold, calculateCartWeight]);

  const applyCoupon = async (code) => {
    if (!code || !String(code).trim()) {
      return { success: false, message: 'Please enter a valid coupon code.' };
    }
    const cleanCode = String(code).trim().toUpperCase();

    try {
      const res = await apiRequest('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: cleanCode, cartTotal: subtotal })
      });

      if (res.success) {
        setAppliedCoupon(res.code);
        setDiscountAmount(Number(res.discountAmount || 0));
        return { success: true, message: res.message || `Coupon ${res.code} applied! Saved ₹${res.discountAmount}.` };
      } else {
        return { success: false, message: res.error || `Invalid coupon code "${cleanCode}".` };
      }
    } catch (err) {
      // Fallback local validation if server endpoint is temporarily unavailable
      const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);
      if (!coupon || coupon.isActive === false) {
        return { success: false, message: `Coupon code "${cleanCode}" is invalid or inactive.` };
      }

      if (coupon.minOrder && subtotal < coupon.minOrder) {
        return {
          success: false,
          message: `Minimum order value for ${cleanCode} is ₹${coupon.minOrder}. Add ₹${coupon.minOrder - subtotal} more to use!`
        };
      }

      let discount = 0;
      if (coupon.type === 'percent') {
        discount = Math.round((subtotal * Number(coupon.value)) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      } else {
        discount = Math.min(Number(coupon.value), subtotal);
      }

      setAppliedCoupon(cleanCode);
      setDiscountAmount(discount);
      return { success: true, message: `Coupon ${cleanCode} applied! Saved ₹${discount}.` };
    }
  };

  // Re-validate applied coupon whenever subtotal or coupons list updates
  useEffect(() => {
    if (appliedCoupon) {
      const current = coupons.find(c => c.code.toUpperCase() === appliedCoupon.toUpperCase());
      if (!current || current.isActive === false) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else if (current.minOrder && subtotal < current.minOrder) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        let discount = 0;
        if (current.type === 'percent') {
          discount = Math.round((subtotal * Number(current.value)) / 100);
          if (current.maxDiscount) discount = Math.min(discount, Number(current.maxDiscount));
        } else {
          discount = Math.min(Number(current.value), subtotal);
        }
        setDiscountAmount(discount);
      }
    }
  }, [subtotal, coupons, appliedCoupon]);

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
        freeShippingThreshold: activeThreshold,
        updateFreeShippingThreshold,
        freeShippingProgress,
        shippingFee,
        liveShippingFee,
        isCalculatingShipping,
        shippingError,
        shippingRateDetails,
        calculateLiveShipping,
        appliedCoupon,
        discountAmount,
        grandTotal,
        applyCoupon,
        removeCoupon,
        coupons,
        refreshCoupons: fetchCoupons
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
