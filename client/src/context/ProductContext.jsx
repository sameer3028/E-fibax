import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const ProductContext = createContext(null);
const API_BASE = 'http://localhost:5000/api';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: INITIAL_PRODUCTS.length,
    totalUnits: INITIAL_PRODUCTS.reduce((acc, p) => acc + (p.stockQuantity || 0), 0),
    lowStockCount: INITIAL_PRODUCTS.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 15)).length,
    outOfStockCount: INITIAL_PRODUCTS.filter(p => !p.stockQuantity || p.stockQuantity === 0).length,
  });

  // Fetch live products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.warn('Backend offline or unreachable, using local state:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch inventory stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch {
      // fallback to recalculating from local products
      const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
      const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 15)).length;
      const outOfStock = products.filter(p => !p.stockQuantity || p.stockQuantity === 0).length;
      setStats({
        totalProducts: products.length,
        totalUnits,
        lowStockCount: lowStock,
        outOfStockCount: outOfStock,
      });
    }
  }, [products]);

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [fetchProducts, fetchStats]);

  // 1. Add Product
  const addProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => [data.data, ...prev]);
        fetchStats();
        return { success: true, product: data.data };
      }
      throw new Error(data.error || 'Failed to create product');
    } catch (err) {
      // Local fallback
      const newId = String(Date.now());
      const mrp = Number(productData.mrp) || Math.round(Number(productData.salePrice) * 1.25);
      const salePrice = Number(productData.salePrice);
      const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
      const stock = Number(productData.stockQuantity) || 50;
      const fallbackProd = {
        ...productData,
        id: newId,
        mrp,
        salePrice,
        discountPercent,
        stockQuantity: stock,
        inStock: stock > 0,
        createdAt: new Date().toISOString(),
      };
      setProducts(prev => [fallbackProd, ...prev]);
      fetchStats();
      return { success: true, product: fallbackProd };
    }
  };

  // 2. Update Product
  const updateProduct = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => prev.map(p => String(p.id) === String(id) ? data.data : p));
        fetchStats();
        return { success: true, product: data.data };
      }
      throw new Error(data.error || 'Failed to update product');
    } catch (err) {
      // Local fallback
      setProducts(prev => prev.map(p => {
        if (String(p.id) === String(id)) {
          const mrp = updatedFields.mrp !== undefined ? Number(updatedFields.mrp) : p.mrp;
          const salePrice = updatedFields.salePrice !== undefined ? Number(updatedFields.salePrice) : p.salePrice;
          const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
          const stock = updatedFields.stockQuantity !== undefined ? Number(updatedFields.stockQuantity) : p.stockQuantity;
          return {
            ...p,
            ...updatedFields,
            mrp,
            salePrice,
            discountPercent,
            stockQuantity: stock,
            inStock: stock > 0,
          };
        }
        return p;
      }));
      fetchStats();
      return { success: true };
    }
  };

  // 3. Delete Product
  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete failed, performing local removal:', err.message);
    }
    setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    fetchStats();
    return { success: true };
  };

  // 4. Update Offer & Pricing
  const updatePricing = async (id, pricingData) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => prev.map(p => String(p.id) === String(id) ? data.data : p));
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend pricing update failed, applying locally:', err.message);
    }

    setProducts(prev => prev.map(p => {
      if (String(p.id) === String(id)) {
        const mrp = pricingData.mrp !== undefined ? Number(pricingData.mrp) : p.mrp;
        const salePrice = pricingData.salePrice !== undefined ? Number(pricingData.salePrice) : p.salePrice;
        const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
        return {
          ...p,
          mrp,
          salePrice,
          discountPercent,
          isBestseller: pricingData.isBestseller !== undefined ? !!pricingData.isBestseller : p.isBestseller,
        };
      }
      return p;
    }));
    return { success: true };
  };

  // 5. Adjust Stock Quantity
  const adjustStock = async (id, { stockQuantity, delta }) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity, delta }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => prev.map(p => String(p.id) === String(id) ? data.data : p));
        fetchStats();
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend stock adjustment failed, updating locally:', err.message);
    }

    setProducts(prev => prev.map(p => {
      if (String(p.id) === String(id)) {
        let newQty = p.stockQuantity;
        if (stockQuantity !== undefined) newQty = Math.max(0, Number(stockQuantity));
        else if (delta !== undefined) newQty = Math.max(0, newQty + Number(delta));
        return {
          ...p,
          stockQuantity: newQty,
          inStock: newQty > 0,
        };
      }
      return p;
    }));
    fetchStats();
    return { success: true };
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        stats,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        updatePricing,
        adjustStock,
        refreshProducts: fetchProducts,
        fetchStats,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
