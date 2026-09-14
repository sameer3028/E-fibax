import React, { useState, useEffect } from 'react';
import { ProductProvider, useProducts } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { TopAnnouncementBar } from './components/common/Header/TopAnnouncementBar';
import { Header } from './components/common/Header/Header';
import { HeroSection } from './components/sections/HeroSection';
import { TrustBar } from './components/sections/TrustBar';
import { ShopByConcernSection } from './components/sections/ShopByConcernSection';
import { CustomerStoriesSection } from './components/sections/CustomerStoriesSection';
import { BestsellersSection } from './components/sections/BestsellersSection';
import { ShopByCategoriesSection } from './components/sections/ShopByCategoriesSection';
import { ComboDealsSection } from './components/sections/ComboDealsSection';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { AppPromoSection } from './components/sections/AppPromoSection';
import { BlogsSection } from './components/sections/BlogsSection';
import { HeritageBanner } from './components/sections/HeritageBanner';
import { MediaPressBar } from './components/sections/MediaPressBar';
import { FloatingConsultationBar } from './components/sections/FloatingConsultationBar';
import { Footer } from './components/common/Footer/Footer';
import { CartDrawer } from './components/common/Cart/CartDrawer';
import { ShopView } from './components/views/ShopView';
import { ProductPageView } from './components/views/ProductPageView';
import { ProductDetailModal } from './components/views/ProductDetailModal';
import { CheckoutModal } from './components/views/CheckoutModal';
import { SearchModal } from './components/sections/SearchModal';
import { AdminLayout } from './components/admin/AdminLayout';

function StorefrontContent() {
  const { products } = useProducts();
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'shop' | 'admin' | 'product'
  const [activeConcern, setActiveConcern] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync hash routing e.g. #admin, #shop, #product/slug
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else if (hash === '#shop') {
        setCurrentView('shop');
      } else if (hash.startsWith('#product/')) {
        const identifier = decodeURIComponent(hash.replace('#product/', ''));
        const found = products.find(
          (p) => (p.slug && p.slug.toLowerCase() === identifier.toLowerCase()) || String(p.id) === identifier
        );
        if (found) {
          setSelectedProduct(found);
          setCurrentView('product');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [products]);

  const handleSelectConcern = (concernSlug) => {
    setActiveConcern(concernSlug || 'all');
    setActiveCategory('all');
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categorySlug) => {
    if (categorySlug === 'combos') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('combo-deals');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    setActiveCategory(categorySlug || 'all');
    setActiveConcern('all');
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.location.hash = `product/${product.slug || product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedProduct(null);
    setActiveConcern('all');
    setActiveCategory('all');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdmin = () => {
    setCurrentView('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If Admin View is active, render Admin Panel
  if (currentView === 'admin') {
    return <AdminLayout onExitAdmin={handleExitAdmin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-charcoal selection:bg-sage-soft selection:text-forest">
      {/* 1. Top Announcement Bar */}
      <TopAnnouncementBar />

      {/* 2. Header & Sticky Nav */}
      <Header
        onNavigateHome={handleNavigateHome}
        onSelectConcern={handleSelectConcern}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'product' && selectedProduct ? (
          <ProductPageView
            product={selectedProduct}
            allProducts={products}
            onBack={handleNavigateHome}
            onSelectProduct={handleSelectProduct}
            onCheckout={() => setIsCheckoutOpen(true)}
            onSelectConcern={handleSelectConcern}
          />
        ) : currentView === 'home' ? (
          <>
            {/* 3. Hero Campaign Banner */}
            <HeroSection
              onExploreConcerns={() => {
                const el = document.getElementById('all-concerns');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreBestsellers={() => {
                handleSelectCategory('all');
              }}
            />

            {/* 4. Deep Green USPs Ribbon */}
            <TrustBar />

            {/* 5. Shop By Concern (Pill Tabs + 4-Cards) */}
            <div id="all-concerns">
              <ShopByConcernSection
                onSelectProduct={handleSelectProduct}
                onViewAllConcern={handleSelectConcern}
              />
            </div>

            {/* 6. Customer Video Reels / Stories Carousel */}
            <CustomerStoriesSection
              onSelectProduct={handleSelectProduct}
            />

            {/* 7. Our Bestsellers */}
            <BestsellersSection
              products={products}
              onSelectProduct={handleSelectProduct}
              onViewAll={() => handleSelectCategory('all')}
            />

            {/* 8. Shop by Categories (Deep Green Section) */}
            <ShopByCategoriesSection
              onSelectCategory={handleSelectCategory}
            />

            {/* 9. Combo Deals */}
            <div id="combo-deals">
              <ComboDealsSection
                onExploreCombos={() => handleSelectCategory('combos')}
              />
            </div>

            {/* 10. Over 1,00,000+ People Trust Fibax */}
            <TestimonialsSection />

            {/* 11. Fibax App / VIP Health Club Promo */}
            <AppPromoSection />

            {/* 12. Wellness Journal / Blogs */}
            <div id="all-blogs">
              <BlogsSection />
            </div>

            {/* 13. Heritage & Organic Farms Banner */}
            <HeritageBanner />

            {/* 14. Media & Logistics Ticker */}
            <MediaPressBar />

            {/* 15. Free Ayurvedic Consultation Bar */}
            <FloatingConsultationBar />
          </>
        ) : (
          <ShopView
            products={products}
            initialConcern={activeConcern}
            initialCategory={activeCategory}
            onSelectProduct={handleSelectProduct}
            onResetFilters={() => {
              setActiveConcern('all');
              setActiveCategory('all');
            }}
          />
        )}
      </main>

      {/* 16. Universal Trust Footer */}
      <Footer
        onSelectConcern={handleSelectConcern}
        onSelectCategory={handleSelectCategory}
        onNavigateHome={handleNavigateHome}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />

      {/* Product Detail Modal (PDP Quickview if not full product page) */}
      {selectedProduct && currentView !== 'product' && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={() => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* 3-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectConcern={handleSelectConcern}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <StorefrontContent />
      </CartProvider>
    </ProductProvider>
  );
}
