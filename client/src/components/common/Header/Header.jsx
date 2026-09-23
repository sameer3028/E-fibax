import React, { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { ConcernDropdown } from './ConcernDropdown';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '../../../data/categories';
import { CONCERNS } from '../../../data/concerns';

export function Header({ onSelectConcern, onSelectCategory, onNavigateHome, onOpenSearch }) {
  const { totalItemsCount, openCart } = useCart();
  const [isConcernOpen, setIsConcernOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 bg-white ${
        isScrolled ? 'shadow-subtle py-2.5' : 'py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-xl text-charcoal hover:bg-brand-soft transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo Branding - Official Fibax Ayurveda Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <img
                src="/fibax-logo.png"
                alt="Fibax Pharma - Ayurveda"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2 text-sm font-semibold text-charcoal hover:text-forest transition-colors rounded-xl hover:bg-sand"
            >
              Home
            </button>

            {/* Shop by Concern Mega Trigger */}
            <div
              className="relative"
              onMouseEnter={() => { setIsConcernOpen(true); setIsCategoryOpen(false); }}
              onMouseLeave={() => setIsConcernOpen(false)}
            >
              <button
                onClick={() => setIsConcernOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors rounded-xl ${
                  isConcernOpen ? 'text-brand bg-brand-soft' : 'text-forest hover:text-brand hover:bg-brand-soft'
                }`}
              >
                <span>Shop by Concern</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isConcernOpen ? 'rotate-180' : ''}`} />
              </button>
              <ConcernDropdown
                isOpen={isConcernOpen}
                onClose={() => setIsConcernOpen(false)}
                onSelectConcern={onSelectConcern}
              />
            </div>

            {/* Formats Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => { setIsCategoryOpen(true); setIsConcernOpen(false); }}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                onClick={() => setIsCategoryOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors rounded-xl ${
                  isCategoryOpen ? 'text-brand bg-brand-soft' : 'text-charcoal hover:text-forest hover:bg-sand'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-fadeIn">
                  <div className="w-64 bg-white rounded-2xl shadow-modal border border-sand-border p-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory(cat.slug);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-brand-soft text-sm font-medium text-charcoal hover:text-brand transition-all"
                      >
                        <span>{cat.name}</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-charcoal-muted opacity-0 hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Combos & Offers in Fibax Orange */}
            <button
              onClick={() => onSelectCategory && onSelectCategory('combos')}
              className="px-3.5 py-2 text-sm font-bold text-brand hover:text-brand-hover transition-colors rounded-xl hover:bg-brand-soft flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>Combos & Offers</span>
            </button>

            <a
              href="/about"
              className="px-3.5 py-2 text-sm font-semibold text-charcoal hover:text-forest transition-colors rounded-xl hover:bg-sand"
            >
              Our Purity
            </a>
          </nav>

          {/* Right Action Icons: Search, Helpline, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-full text-charcoal hover:text-forest hover:bg-sand transition-colors"
              aria-label="Search Formulations"
            >
              <Search className="h-5 w-5" />
            </button>

            <a
              href="https://wa.me/917657963458?text=Hello%20Fibax%20Pharma,%20I%20need%20assistance%20with%20Ayurvedic%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-leaf-soft text-forest font-semibold border border-leaf-border text-xs hover:bg-leaf/20 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-forest" />
              <span>Ayurveda Helpline</span>
            </a>

            {/* Cart Drawer Trigger in Fibax Orange */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center p-2.5 rounded-full bg-brand text-white hover:bg-brand-hover shadow-md hover:shadow-orange-glow transition-all transform active:scale-95"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-forest text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-white animate-scaleIn">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-6 border-t border-sand-border mt-3 space-y-3 animate-fadeIn">
            <div className="space-y-1">
              <button
                onClick={() => { onNavigateHome(); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl font-semibold text-forest hover:bg-sand"
              >
                Home
              </button>
              <button
                onClick={() => { if (onSelectCategory) onSelectCategory('all'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl font-semibold text-charcoal hover:bg-sand"
              >
                All Products
              </button>
              <button
                onClick={() => { if (onSelectCategory) onSelectCategory('combos'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl font-bold text-brand hover:bg-brand-soft flex items-center justify-between"
              >
                <span>Combos & Value Courses</span>
                <span className="text-xs bg-brand text-white font-bold px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>

            <div className="pt-2 border-t border-sand-border">
              <div className="px-3 mb-2">
                <p className="text-xs font-bold text-forest uppercase tracking-wider">
                  Shop by Health Concern
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {CONCERNS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectConcern(c.slug); setIsMobileMenuOpen(false); }}
                    className="p-2 bg-sand/60 hover:bg-brand-soft rounded-xl text-left text-xs font-semibold text-charcoal hover:text-brand transition-colors flex items-center gap-2"
                  >
                    {c.image && (
                      <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-sand-border flex-shrink-0 flex items-center justify-center">
                        <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
