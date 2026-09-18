import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductProvider, useProducts } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Industries } from './pages/Industries';
import { GlobalReach } from './pages/GlobalReach';
import { Contact } from './pages/Contact';
import { Blogs } from './pages/Blogs';
import { BlogDetail } from './pages/BlogDetail';
import { BLOG_POSTS } from './data/blogs';
import { CartDrawer } from './components/common/Cart/CartDrawer';
import { CheckoutModal } from './components/views/CheckoutModal';
import { SearchModal } from './components/sections/SearchModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthModal } from './components/auth/AuthModal';
import { AccountModal } from './components/auth/AccountModal';
import { TrackOrderModal } from './components/common/TrackOrderModal';
import { BrandLoader } from './components/common/BrandLoader';

function StorefrontApp() {
  const { products } = useProducts();
  const [currentPage, setCurrentPage] = useState('home'); 
  // 'home' | 'about' | 'products' | 'product-detail' | 'industries' | 'global-reach' | 'contact' | 'admin'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConcern, setActiveConcern] = useState('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackInitialId, setTrackInitialId] = useState('');

  // Sync hash routing e.g. #home, #about, #products, #industries, #global-reach, #contact, #admin, #product/:id
  useEffect(() => {
    const handleHashRouting = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

      if (!hash || hash === 'home') {
        setCurrentPage('home');
      } else if (hash === 'about') {
        setCurrentPage('about');
      } else if (hash === 'products' || hash === 'shop') {
        setCurrentPage('products');
      } else if (hash === 'industries' || hash === 'global-reach' || hash === 'global') {
        setCurrentPage('about');
      } else if (hash === 'blogs' || hash === 'journal') {
        setCurrentPage('blogs');
      } else if (hash.startsWith('blog/')) {
        const identifier = decodeURIComponent(hash.replace('blog/', ''));
        const found = BLOG_POSTS.find(
          (b) => (b.slug && b.slug.toLowerCase() === identifier.toLowerCase()) || String(b.id) === identifier
        );
        if (found) {
          setSelectedBlogPost(found);
          setCurrentPage('blog-detail');
        } else {
          setCurrentPage('blogs');
        }
      } else if (hash === 'contact') {
        setCurrentPage('contact');
      } else if (hash === 'track' || hash.startsWith('track/')) {
        const id = hash.startsWith('track/') ? decodeURIComponent(hash.replace('track/', '')) : '';
        setTrackInitialId(id);
        setIsTrackOrderOpen(true);
      } else if (hash === 'admin' || window.location.pathname === '/admin') {
        setCurrentPage('admin');
      } else if (hash.startsWith('product/')) {
        const identifier = decodeURIComponent(hash.replace('product/', ''));
        const found = products.find(
          (p) => (p.slug && p.slug.toLowerCase() === identifier.toLowerCase()) || String(p.id) === identifier
        );
        if (found) {
          setSelectedProduct(found);
          setCurrentPage('product-detail');
        } else {
          setCurrentPage('products');
        }
      }
    };

    handleHashRouting();
    window.addEventListener('hashchange', handleHashRouting);
    return () => window.removeEventListener('hashchange', handleHashRouting);
  }, [products]);

  // Master navigation handler
  const handleNavigate = (pageId, params = null) => {
    if (params) {
      if (params.category) setActiveCategory(params.category);
      if (params.concern) setActiveConcern(params.concern);
      if (params.product) setSelectedProduct(params.product);
      if (params.post) setSelectedBlogPost(params.post);
    }

    if (pageId === 'track') {
      setTrackInitialId(params?.trackingId || '');
      setIsTrackOrderOpen(true);
      return;
    }

    if (pageId === 'product-detail' && params?.product) {
      setSelectedProduct(params.product);
      window.location.hash = `product/${params.product.slug || params.product.id}`;
    } else if (pageId === 'blog-detail' && params?.post) {
      setSelectedBlogPost(params.post);
      window.location.hash = `blog/${params.post.slug || params.post.id}`;
    } else {
      window.location.hash = pageId === 'home' ? '' : pageId;
    }

    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.location.hash = `product/${product.slug || product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categorySlug) => {
    setActiveCategory(categorySlug || 'all');
    setActiveConcern('all');
    setCurrentPage('products');
    window.location.hash = 'products';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectConcern = (concernSlug) => {
    setActiveConcern(concernSlug || 'all');
    setActiveCategory('all');
    setCurrentPage('products');
    window.location.hash = 'products';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If Admin view is active, render Admin console directly
  if (currentPage === 'admin') {
    return (
      <AdminLayout
        onExitAdmin={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-charcoal selection:bg-brand-soft selection:text-brand-dark">
      {/* 0. Initial Brand Loader */}
      <BrandLoader />

      {/* 1. Header with integrated Navbar */}
      <Header
        activePage={currentPage}
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
        onSelectConcern={handleSelectConcern}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTrackOrder={(id) => {
          setTrackInitialId(id || '');
          setIsTrackOrderOpen(true);
        }}
      />

      {/* 2. Main Page Render */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={
              currentPage === 'product-detail'
                ? `product-${selectedProduct?.id || selectedProduct?.slug}`
                : currentPage === 'blog-detail'
                ? `blog-${selectedBlogPost?.id || selectedBlogPost?.slug}`
                : currentPage
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {currentPage === 'home' && (
              <Home
                products={products}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
                onSelectConcern={handleSelectConcern}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'about' && (
              <About onNavigate={handleNavigate} />
            )}

            {currentPage === 'products' && (
              <Products
                products={products}
                initialCategory={activeCategory}
                initialConcern={activeConcern}
                onSelectProduct={handleSelectProduct}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'product-detail' && (
              <ProductDetail
                product={selectedProduct}
                allProducts={products}
                onBack={() => handleNavigate('products')}
                onSelectProduct={handleSelectProduct}
                onCheckout={() => setIsCheckoutOpen(true)}
                onSelectConcern={handleSelectConcern}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'industries' && (
              <Industries onNavigate={handleNavigate} />
            )}

            {currentPage === 'global-reach' && (
              <GlobalReach onNavigate={handleNavigate} />
            )}

            {currentPage === 'blogs' && (
              <Blogs onNavigate={handleNavigate} />
            )}

            {currentPage === 'blog-detail' && (
              <BlogDetail
                post={selectedBlogPost}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'contact' && (
              <Contact />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
        onSelectConcern={handleSelectConcern}
        onOpenTrackOrder={(id) => {
          setTrackInitialId(id || '');
          setIsTrackOrderOpen(true);
        }}
      />

      {/* 4. Slide-over Cart Drawer */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />

      {/* 5. 3-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenTrackOrder={(id) => {
          setTrackInitialId(id || '');
          setIsTrackOrderOpen(true);
        }}
      />

      {/* 6. Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSelectConcern={handleSelectConcern}
      />

      {/* 7. Customer Auth Modal (Sign In / Register) */}
      <AuthModal />

      {/* 8. Customer Account Dashboard Modal (Orders, Tracking, Profile) */}
      <AccountModal
        onExploreProducts={() => handleNavigate('products')}
        onOpenTrackOrder={(id) => {
          setTrackInitialId(id || '');
          setIsTrackOrderOpen(true);
        }}
      />

      {/* 9. Public Live Order Tracking Modal (Delhivery & Shiprocket) */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        initialTrackingId={trackInitialId}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <AuthProvider>
          <StorefrontApp />
        </AuthProvider>
      </CartProvider>
    </ProductProvider>
  );
}
