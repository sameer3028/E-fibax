import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import {
  ShoppingBag,
  Search,
  PhoneCall,
  ShieldCheck,
  Truck,
  Sparkles,
  User,
  Package
} from 'lucide-react';

export function Header({
  activePage = 'home',
  onNavigate,
  onSelectConcern,
  onSelectCategory,
  onOpenSearch
}) {
  const { totalItemsCount, openCart } = useCart();
  const { currentUser, openAuthModal, openAccountModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full bg-white z-40">
      {/* 1. Top Announcement Strip */}
      <div className="bg-forest-deep text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-leaf" />
              <span>WHO-GMP & AYUSH Certified Formulations</span>
            </span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-sand-warm font-normal">
              <Truck className="h-3.5 w-3.5 text-brand-light" />
              <span>Free Express Delivery Above ₹499 Across India</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="hidden lg:inline text-emerald-200">
              100% Authentic Ayurveda • Cash on Delivery (COD) Available
            </span>
            <span className="hidden lg:inline text-white/40">|</span>
            <a
              href="tel:+918872544458"
              className="hover:text-leaf transition-colors font-semibold flex items-center gap-1 text-sand-warm"
            >
              <PhoneCall className="h-3 w-3 text-leaf" />
              <span>Doctor Helpline: +91-8872544458</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header Bar */}
      <div
        className={`w-full transition-all duration-300 border-b border-sand-border bg-white ${
          isScrolled ? 'py-2.5 shadow-subtle' : 'py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo & Tagline */}
            <div className="flex-shrink-0">
              <button
                onClick={() => onNavigate && onNavigate('home')}
                className="flex items-center gap-3 text-left focus:outline-none group"
                aria-label="Fibax Pharma Home"
              >
                <img
                  src="/fibax-logo.png"
                  alt="Fibax Pharma - Authentic Ayurveda"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </button>
            </div>

            {/* Middle Quick Search Bar (Interactive Trigger) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <button
                type="button"
                onClick={onOpenSearch}
                className="w-full flex items-center justify-between px-4 py-2 bg-sand hover:bg-sand-border/40 border border-sand-border rounded-full text-xs font-medium text-charcoal-muted transition-all text-left shadow-inner"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-forest" />
                  <span>Search 250+ Ayurvedic syrups, capsules, oils, churnas...</span>
                </span>
                <span className="bg-white px-2 py-0.5 rounded-full border border-sand-border text-[10px] font-bold text-forest">
                  Ctrl + K
                </span>
              </button>
            </div>

            {/* Right Action Icons: Search Mobile, WhatsApp Helpline, Cart Drawer */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button
                onClick={onOpenSearch}
                className="md:hidden p-2 rounded-full text-charcoal hover:text-forest hover:bg-sand transition-colors"
                aria-label="Search Formulations"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Doctor / Ayurveda WhatsApp Contact */}
              <a
                href="https://wa.me/917657963458?text=Hello%20Fibax%20Ayurveda,%20I%20need%20assistance%20with%20Ayurvedic%20products%20and%20consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-leaf-soft text-forest font-semibold border border-leaf-border text-xs hover:bg-leaf/20 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5 text-forest" />
                <span>Ayurveda Support</span>
              </a>

              {/* Customer Account Button (Sign In or Profile) */}
              {currentUser ? (
                <button
                  onClick={() => openAccountModal('orders')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-forest/10 hover:bg-forest/20 text-forest text-xs font-bold transition-all"
                  title="My Account & Orders"
                >
                  <div className="w-6 h-6 rounded-full bg-forest text-white text-[10px] font-black flex items-center justify-center">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline truncate max-w-[85px]">
                    {currentUser.name?.split(' ')[0]}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand hover:bg-sand-border/50 border border-sand-border text-charcoal text-xs font-semibold transition-all"
                  title="Login or Register"
                >
                  <User className="h-4 w-4 text-forest" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Cart Drawer Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={openCart}
                className="relative flex items-center justify-center p-2.5 rounded-full bg-brand text-white hover:bg-brand-hover shadow-md hover:shadow-orange-glow transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                <AnimatePresence>
                  {totalItemsCount > 0 && (
                    <motion.span
                      key={totalItemsCount}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: [1.25, 1], opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -top-1.5 -right-1.5 bg-forest text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-white"
                    >
                      {totalItemsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={onNavigate}
        onSelectCategory={onSelectCategory}
        onSelectConcern={onSelectConcern}
        onOpenSearch={onOpenSearch}
      />
    </header>
  );
}
