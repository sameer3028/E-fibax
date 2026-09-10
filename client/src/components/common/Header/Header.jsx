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
  Sparkles,
  Heart
} from 'lucide-react';
import { CATEGORIES } from '../../../data/categories';

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
        isScrolled ? 'shadow-subtle py-2.5' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-xl text-charcoal hover:bg-sand transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo Branding */}
          <div className="flex-shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-white shadow-sm group-hover:bg-forest-light transition-colors">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-forest-deep block leading-tight">
                  FIBAX
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-sage uppercase block">
                  PHARMA • AYURVEDA
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            <button
              onClick={onNavigateHome}
              className="px-3 py-2 text-sm font-semibold text-charcoal hover:text-forest transition-colors rounded-lg hover:bg-sand"
            >
              Home
            </button>

            {/* Shop by Concern Mega Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setIsConcernOpen(true)}
            >
              <button
                onClick={() => setIsConcernOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-forest hover:text-forest-light transition-colors rounded-lg hover:bg-sand"
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
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                onClick={() => setIsCategoryOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-charcoal hover:text-forest transition-colors rounded-lg hover:bg-sand"
              >
                <span>Categories</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-modal border border-sand-border p-3 z-50 animate-fadeIn">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.slug);
                        setIsCategoryOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-sand text-sm font-medium text-charcoal hover:text-forest transition-all"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-charcoal-muted bg-sand-border/50 px-2 py-0.5 rounded-full">
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectCategory && onSelectCategory('combos')}
              className="px-3 py-2 text-sm font-semibold text-crimson hover:text-crimson-dark transition-colors rounded-lg hover:bg-crimson/5 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
              <span>Combos & Offers</span>
            </button>

            <a
              href="#about"
              className="px-3 py-2 text-sm font-semibold text-charcoal hover:text-forest transition-colors rounded-lg hover:bg-sand"
            >
              Our Purity
            </a>
          </nav>

          {/* Right Action Icons: Search, WhatsApp Desk, Cart */}
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
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ayurveda Helpline</span>
            </a>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center p-2.5 rounded-full bg-forest text-white hover:bg-forest-light shadow-sm transition-all transform active:scale-95"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-crimson text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-scaleIn">
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
                All Products (35)
              </button>
              <button
                onClick={() => { if (onSelectCategory) onSelectCategory('combos'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl font-semibold text-crimson hover:bg-crimson/5 flex items-center justify-between"
              >
                <span>Combos & Value Courses</span>
                <span className="text-xs bg-crimson text-white font-bold px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>

            <div className="pt-2 border-t border-sand-border">
              <p className="px-3 text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-2">
                Shop by Health Need
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onSelectConcern('joint-pain-relief'); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-sand rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-sage-soft"
                >
                  Joint & Pain Relief
                </button>
                <button
                  onClick={() => { onSelectConcern('digestive-gut-health'); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-sand rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-sage-soft"
                >
                  Digestive Health
                </button>
                <button
                  onClick={() => { onSelectConcern('liver-care-detox'); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-sand rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-sage-soft"
                >
                  Liver Detox
                </button>
                <button
                  onClick={() => { onSelectConcern('diabetes-blood-sugar'); setIsMobileMenuOpen(false); }}
                  className="p-2.5 bg-sand rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-sage-soft"
                >
                  Diabetes Care
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
