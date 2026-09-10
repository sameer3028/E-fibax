import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { TopAnnouncementBar } from './components/common/Header/TopAnnouncementBar';
import { Header } from './components/common/Header/Header';
import { HeroSection } from './components/sections/HeroSection';
import { ShopByConcernSection } from './components/sections/ShopByConcernSection';
import { BestsellersSection } from './components/sections/BestsellersSection';
import { CombosSection } from './components/sections/CombosSection';
import { WhyFibaxSection } from './components/sections/WhyFibaxSection';
import { Footer } from './components/common/Footer/Footer';
import { CartDrawer } from './components/common/Cart/CartDrawer';
import { ShopView } from './components/views/ShopView';
import { ProductDetailModal } from './components/views/ProductDetailModal';
import { CheckoutModal } from './components/views/CheckoutModal';
import { SearchModal } from './components/sections/SearchModal';
import { PRODUCTS } from './data/products';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'shop'
  const [activeConcern, setActiveConcern] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        const el = document.getElementById('combos-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    setActiveCategory(categorySlug || 'all');
    setActiveConcern('all');
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setActiveConcern('all');
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-white font-sans text-charcoal selection:bg-sage-soft selection:text-forest">
        {/* Universal Top Announcement Bar */}
        <TopAnnouncementBar />

        {/* Universal Sticky Header */}
        <Header
          onNavigateHome={handleNavigateHome}
          onSelectConcern={handleSelectConcern}
          onSelectCategory={handleSelectCategory}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Main Content Dynamic Rendering */}
        <main className="flex-1">
          {currentView === 'home' ? (
            <>
              {/* Hero Banner */}
              <HeroSection
                onExploreConcerns={() => {
                  const el = document.getElementById('all-concerns');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onExploreBestsellers={() => {
                  handleSelectCategory('all');
                }}
              />

              {/* Shop by Health Concern Grid */}
              <ShopByConcernSection onSelectConcern={handleSelectConcern} />

              {/* Bestselling Formulations */}
              <BestsellersSection
                products={PRODUCTS}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onViewAll={() => handleSelectCategory('all')}
              />

              {/* Value Combos & Multi-pack Courses */}
              <div id="combos-section">
                <CombosSection />
              </div>

              {/* The Fibax Purity Promise */}
              <WhyFibaxSection />
            </>
          ) : (
            <ShopView
              products={PRODUCTS}
              initialConcern={activeConcern}
              initialCategory={activeCategory}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onResetFilters={() => {
                setActiveConcern('all');
                setActiveCategory('all');
              }}
            />
          )}
        </main>

        {/* Universal Trust Footer */}
        <Footer
          onSelectConcern={handleSelectConcern}
          onSelectCategory={handleSelectCategory}
        />

        {/* Global Modals & Slide Drawers */}
        <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />

        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onSelectConcern={handleSelectConcern}
        />
      </div>
    </CartProvider>
  );
}
