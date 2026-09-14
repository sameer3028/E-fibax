import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { ProductsTable } from './ProductsTable';
import { ProductModal } from './ProductModal';
import { OffersManager } from './OffersManager';
import { InventoryTable } from './InventoryTable';
import { OrdersView } from './OrdersView';
import { AdminLogin } from './AdminLogin';
import { ChangeCredentialsModal } from './ChangeCredentialsModal';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Layers,
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Plus,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react';

export function AdminLayout({ onExitAdmin }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState('admin');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isChangeCredsOpen, setIsChangeCredsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // products, offers, inventory, orders
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const { addProduct, updateProduct, stats } = useProducts();

  // Verify authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const savedUser = localStorage.getItem('fibax_admin_user') || sessionStorage.getItem('fibax_admin_user');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setIsAuthenticated(true);
          setAdminUser(data.username || savedUser || 'admin');
        } else {
          localStorage.removeItem('fibax_admin_token');
          sessionStorage.removeItem('fibax_admin_token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Offline or fallback verification
        setIsAuthenticated(!!token);
        if (savedUser) setAdminUser(savedUser);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
    try {
      if (token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch {}
    localStorage.removeItem('fibax_admin_token');
    localStorage.removeItem('fibax_admin_user');
    sessionStorage.removeItem('fibax_admin_token');
    sessionStorage.removeItem('fibax_admin_user');
    setIsAuthenticated(false);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (formData) => {
    if (productToEdit) {
      await updateProduct(productToEdit.id, formData);
    } else {
      await addProduct(formData);
    }
    setIsModalOpen(false);
  };

  // 1. Loading authentication verification state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          <div className="text-xs font-bold text-forest-deep uppercase tracking-wider">
            Verifying Admin Credentials...
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render secure login portal
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setAdminUser(user.username);
        }}
        onExit={onExitAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans text-charcoal">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-sand-border shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Storefront</span>
            </button>

            <div className="flex items-center gap-2 border-l border-sand-border pl-4">
              <img src="/fibax-logo.png" alt="Fibax Logo" className="h-8 w-auto object-contain" />
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-forest text-sm block leading-tight">Admin Portal</span>
                <span className="text-[10px] text-charcoal-muted uppercase tracking-wider block">Products & Inventory Control</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Authenticated User Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest/5 border border-forest/15 text-xs font-semibold text-forest-deep">
              <UserCheck className="h-3.5 w-3.5 text-forest" />
              <span>ID: <strong>{adminUser}</strong></span>
            </div>

            {/* Change Password / Credentials Button */}
            <button
              onClick={() => setIsChangeCredsOpen(true)}
              title="Change User ID or Password"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-semibold transition-colors border border-sand-border"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-warm" />
              <span className="hidden sm:inline">Change Password</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Logout of Admin Panel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors border border-red-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Add Product Button */}
            <button
              onClick={handleAddNew}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ml-1"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Products Catalog ({stats.totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Sparkles className="h-4 w-4 text-gold" />
            <span>Offers & Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Stock & Inventory ({stats.totalUnits} units)</span>
            {stats.lowStockCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {stats.lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Orders & Delhivery</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'products' && (
          <ProductsTable onAddNew={handleAddNew} onEditProduct={handleEdit} />
        )}
        {activeTab === 'offers' && <OffersManager />}
        {activeTab === 'inventory' && <InventoryTable />}
        {activeTab === 'orders' && <OrdersView />}
      </main>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        productToEdit={productToEdit}
      />

      {/* Change Credentials / Password Modal */}
      <ChangeCredentialsModal
        isOpen={isChangeCredsOpen}
        onClose={() => setIsChangeCredsOpen(false)}
        currentUsername={adminUser}
        onCredentialsUpdated={(newU) => setAdminUser(newU)}
      />
    </div>
  );
}
