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
import { Contact } from './pages/Contact';
import { Blogs } from './pages/Blogs';
import { BlogDetail } from './pages/BlogDetail';
import { BLOG_POSTS } from './data/blogs';
import { PRODUCTS as INITIAL_PRODUCTS } from './data/products';
import { CartDrawer } from './components/common/Cart/CartDrawer';
import { CheckoutModal } from './components/views/CheckoutModal';
import { CheckoutCustom } from './pages/CheckoutCustom';
import { SearchModal } from './components/sections/SearchModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthModal } from './components/auth/AuthModal';
import { AccountModal } from './components/auth/AccountModal';
import { TrackOrderModal } from './components/common/TrackOrderModal';
import { CallbackModal } from './components/common/CallbackModal';
import { BrandLoader } from './components/common/BrandLoader';

function StorefrontApp() {
  const { products } = useProducts();
  const [currentPage, setCurrentPage] = useState('home'); 
  // 'home' | 'about' | 'products' | 'product-detail' | 'blogs' | 'blog-detail' | 'contact' | 'admin'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeConcern, setActiveConcern] = useState('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackInitialId, setTrackInitialId] = useState('');
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [callbackDefaultConcern, setCallbackDefaultConcern] = useState('');

  const handleOpenCallback = (concern = '') => {
    setCallbackDefaultConcern(concern || '');
    setIsCallbackOpen(true);
  };

  // Helper to push/replace browser history state cleanly without page reload
  const navigateTo = (url, replace = false) => {
    const current = window.location.pathname + window.location.search;
    if (current !== url) {
      if (replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
    }
  };

  // Sync clean HTML5 path routing (e.g. /, /about, /products, /product/:slug, /blogs, /blog/:slug, /contact, /admin, /track)
  useEffect(() => {
    const handlePathRouting = () => {
      // 1. Auto-migrate legacy hash URLs if present (e.g. #/product/xyz -> /product/xyz)
      if (window.location.hash) {
        const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
        let migratedPath = null;
        if (!rawHash || rawHash === 'home') migratedPath = '/';
        else if (rawHash === 'about' || rawHash === 'industries' || rawHash === 'global-reach' || rawHash === 'global') migratedPath = '/about';
        else if (rawHash === 'products' || rawHash === 'shop') migratedPath = '/products';
        else if (rawHash.startsWith('product/')) migratedPath = `/${rawHash}`;
        else if (rawHash === 'blogs' || rawHash === 'journal') migratedPath = '/blogs';
        else if (rawHash.startsWith('blog/')) migratedPath = `/${rawHash}`;
        else if (rawHash === 'contact') migratedPath = '/contact';
        else if (rawHash === 'admin') migratedPath = '/admin';
        else if (rawHash === 'checkout' || rawHash === 'checkout-custom') migratedPath = '/checkout-custom';
        else if (rawHash === 'track' || rawHash.startsWith('track/')) migratedPath = `/${rawHash}`;

        if (migratedPath) {
          window.history.replaceState({}, '', migratedPath);
        }
      }

      // 2. Parse current pathname
      let pathname = window.location.pathname || '/';
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      const searchParams = new URLSearchParams(window.location.search);

      if (pathname === '/' || pathname === '') {
        setCurrentPage('home');
        document.title = 'Fibax Pharma — Pure Herbal Formulations & Ayurvedic Excellence';
      } else if (pathname === '/about' || pathname === '/industries' || pathname === '/global-reach') {
        setCurrentPage('about');
        document.title = 'About Us | Fibax Pharma';
      } else if (pathname === '/products' || pathname === '/shop') {
        const cat = searchParams.get('category');
        const con = searchParams.get('concern');
        if (cat) setActiveCategory(cat);
        if (con) setActiveConcern(con);
        setCurrentPage('products');
        document.title = 'Ayurvedic Formulations & Products | Fibax Pharma';
      } else if (pathname.startsWith('/product/')) {
        const identifier = decodeURIComponent(pathname.replace(/^\/product\//, '')).trim();
        const allAvailable = [...(products || []), ...INITIAL_PRODUCTS];
        const matchProduct = (p) => {
          if (!p) return false;
          const cleanId = String(p.id || '').toLowerCase();
          const cleanSlug = String(p.slug || '').toLowerCase();
          const cleanTitle = String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cleanIdent = identifier.toLowerCase();
          return cleanId === cleanIdent || cleanSlug === cleanIdent || cleanTitle === cleanIdent;
        };

        const found = allAvailable.find(matchProduct);

        if (found) {
          setSelectedProduct(found);
          setCurrentPage('product-detail');
          document.title = `${found.title} | Fibax Pharma`;
        } else if (selectedProduct) {
          // Keep existing selectedProduct if already set
          setCurrentPage('product-detail');
          document.title = `${selectedProduct.title} | Fibax Pharma`;
        } else if (allAvailable.length > 0) {
          setSelectedProduct(allAvailable[0]);
          setCurrentPage('product-detail');
          document.title = `${allAvailable[0].title} | Fibax Pharma`;
        }
      } else if (pathname === '/blogs' || pathname === '/journal') {
        setCurrentPage('blogs');
        document.title = 'Ayurvedic Health Journal | Fibax Pharma';
      } else if (pathname.startsWith('/blog/')) {
        const identifier = decodeURIComponent(pathname.replace(/^\/blog\//, '')).trim();
        const found = BLOG_POSTS.find(
          (b) => (b.slug && b.slug.toLowerCase() === identifier.toLowerCase()) || String(b.id) === identifier
        );
        if (found) {
          setSelectedBlogPost(found);
          setCurrentPage('blog-detail');
          document.title = `${found.title} | Fibax Pharma`;
        } else {
          setCurrentPage('blogs');
          document.title = 'Ayurvedic Health Journal | Fibax Pharma';
        }
      } else if (pathname === '/contact') {
        setCurrentPage('contact');
        document.title = 'Contact Us | Fibax Pharma';
      } else if (pathname === '/admin') {
        setCurrentPage('admin');
        document.title = 'Admin Console | Fibax Pharma';
      } else if (pathname === '/checkout' || pathname === '/checkout-custom') {
        setCurrentPage('checkout');
        document.title = 'Checkout | Fibax Ayurveda';
      } else if (pathname === '/track' || pathname.startsWith('/track/')) {
        const id = pathname.startsWith('/track/') ? decodeURIComponent(pathname.replace(/^\/track\//, '')).trim() : '';
        setTrackInitialId(id);
        setIsTrackOrderOpen(true);
      }
    };

    handlePathRouting();
    window.addEventListener('popstate', handlePathRouting);
    return () => window.removeEventListener('popstate', handlePathRouting);
  }, [products]);

  // Master navigation handler with clean URLs
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
      navigateTo('/track');
      return;
    }

    let targetUrl = '/';
    if (pageId === 'home') {
      targetUrl = '/';
      setCurrentPage('home');
      document.title = 'Fibax Pharma — Pure Herbal Formulations & Ayurvedic Excellence';
    } else if (pageId === 'about') {
      targetUrl = '/about';
      setCurrentPage('about');
      document.title = 'About Us | Fibax Pharma';
    } else if (pageId === 'products') {
      const searchParams = new URLSearchParams();
      const cat = params?.category !== undefined ? params.category : activeCategory;
      const con = params?.concern !== undefined ? params.concern : activeConcern;
      if (cat && cat !== 'all') searchParams.set('category', cat);
      if (con && con !== 'all') searchParams.set('concern', con);
      const qs = searchParams.toString();
      targetUrl = qs ? `/products?${qs}` : '/products';
      setCurrentPage('products');
      document.title = 'Ayurvedic Formulations & Products | Fibax Pharma';
    } else if (pageId === 'product-detail' && params?.product) {
      setSelectedProduct(params.product);
      targetUrl = `/product/${params.product.slug || params.product.id}`;
      setCurrentPage('product-detail');
      document.title = `${params.product.title} | Fibax Pharma`;
    } else if (pageId === 'blogs') {
      targetUrl = '/blogs';
      setCurrentPage('blogs');
      document.title = 'Ayurvedic Health Journal | Fibax Pharma';
    } else if (pageId === 'blog-detail' && params?.post) {
      setSelectedBlogPost(params.post);
      targetUrl = `/blog/${params.post.slug || params.post.id}`;
      setCurrentPage('blog-detail');
      document.title = `${params.post.title} | Fibax Pharma`;
    } else if (pageId === 'contact') {
      targetUrl = '/contact';
      setCurrentPage('contact');
      document.title = 'Contact Us | Fibax Pharma';
    } else if (pageId === 'admin') {
      targetUrl = '/admin';
      setCurrentPage('admin');
      document.title = 'Admin Console | Fibax Pharma';
    } else if (pageId === 'checkout' || pageId === 'checkout-custom') {
      targetUrl = '/checkout-custom';
      setCurrentPage('checkout');
      document.title = 'Checkout | Fibax Ayurveda';
    }

    navigateTo(targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    document.title = `${product.title} | Fibax Pharma`;
    navigateTo(`/product/${product.slug || product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categorySlug) => {
    const cat = categorySlug || 'all';
    setActiveCategory(cat);
    setActiveConcern('all');
    setCurrentPage('products');
    const url = cat !== 'all' ? `/products?category=${encodeURIComponent(cat)}` : '/products';
    navigateTo(url);
    document.title = 'Ayurvedic Formulations & Products | Fibax Pharma';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectConcern = (concernSlug) => {
    const con = concernSlug || 'all';
    setActiveConcern(con);
    setActiveCategory('all');
    setCurrentPage('products');
    const url = con !== 'all' ? `/products?concern=${encodeURIComponent(con)}` : '/products';
    navigateTo(url);
    document.title = 'Ayurvedic Formulations & Products | Fibax Pharma';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If Dedicated Kapiva-style Checkout page is active, render directly without storefront noise
  if (currentPage === 'checkout') {
    return (
      <>
        <BrandLoader />
        <CheckoutCustom
          onNavigate={handleNavigate}
          onOpenTrackOrder={(id) => {
            setTrackInitialId(id || '');
            setIsTrackOrderOpen(true);
          }}
        />
        <TrackOrderModal
          isOpen={isTrackOrderOpen}
          onClose={() => setIsTrackOrderOpen(false)}
          initialTrackingId={trackInitialId}
        />
        <AuthModal />
        <AccountModal />
      </>
    );
  }

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
        onOpenCallback={handleOpenCallback}
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
                onCheckout={() => handleNavigate('checkout')}
                onSelectConcern={handleSelectConcern}
                onNavigate={handleNavigate}
              />
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
              <Contact onOpenCallback={handleOpenCallback} />
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
        onOpenCallback={handleOpenCallback}
      />

      {/* 4. Slide-over Cart Drawer */}
      <CartDrawer onCheckout={() => handleNavigate('checkout')} />

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

      {/* 10. Ayurvedic Care Call Back Request Modal */}
      <CallbackModal
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        defaultConcern={callbackDefaultConcern}
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
