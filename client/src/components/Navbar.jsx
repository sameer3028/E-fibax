import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Menu, X, Sparkles, Phone, ShieldCheck, Globe, Building2, Package, ArrowRight, User, Truck } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CONCERNS } from '../data/concerns';

export function Navbar({
  activePage = 'home',
  onNavigate,
  onSelectCategory,
  onSelectConcern,
  onOpenSearch,
  onOpenTrackOrder
}) {
  const { currentUser, openAuthModal, openAccountModal } = useAuth();
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (pageId, param = null) => {
    setIsProductsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(pageId, param);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'products', label: 'Products', hasDropdown: true },
    { id: 'blogs', label: 'Blog' },
    { id: 'contact', label: 'Contact Us' }
  ];

  return (
    <nav className="w-full bg-white border-b border-sand-border/80 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;

              if (link.id === 'products') {
                return (
                  <div
                    key={link.id}
                    className="relative"
                    onMouseEnter={() => setIsProductsDropdownOpen(true)}
                    onMouseLeave={() => setIsProductsDropdownOpen(false)}
                  >
                    <button
                      onClick={() => handleNavClick('products')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? 'text-forest bg-forest/10 font-bold'
                          : 'text-charcoal hover:text-forest hover:bg-sand'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isProductsDropdownOpen ? 'rotate-180 text-forest' : 'text-charcoal-muted'
                        }`}
                      />
                    </button>

                    {/* Products Mega Dropdown */}
                    {isProductsDropdownOpen && (
                      <div className="absolute top-full left-0 w-[540px] bg-white rounded-2xl shadow-modal border border-sand-border p-4 pt-3 z-50 animate-fadeIn grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-sand-border">
                            <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5 text-brand" /> Dosage Categories
                            </span>
                            <button
                              onClick={() => handleNavClick('products', { category: 'all' })}
                              className="text-xs text-brand hover:underline font-semibold"
                            >
                              View All
                            </button>
                          </div>
                          <div className="space-y-1">
                            {CATEGORIES.slice(0, 6).map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  if (onSelectCategory) onSelectCategory(cat.slug);
                                  handleNavClick('products', { category: cat.slug });
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-brand-soft text-xs font-semibold text-charcoal hover:text-brand transition-colors"
                              >
                                <span>{cat.name}</span>
                                <span className="text-[10px] text-charcoal-subtle bg-sand px-1.5 py-0.5 rounded">
                                  AYUSH
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-sand-border">
                            <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-leaf-dark" /> Top Health Concerns
                            </span>
                          </div>
                          <div className="space-y-1">
                            {CONCERNS.slice(0, 6).map((con) => (
                              <button
                                key={con.id}
                                onClick={() => {
                                  if (onSelectConcern) onSelectConcern(con.slug);
                                  handleNavClick('products', { concern: con.slug });
                                }}
                                className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-leaf-soft text-xs font-semibold text-charcoal hover:text-forest transition-colors"
                              >
                                {con.image && (
                                  <img
                                    src={con.image}
                                    alt={con.name}
                                    className="w-5 h-5 object-contain rounded"
                                  />
                                )}
                                <span className="truncate">{con.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-forest bg-forest/10 font-bold'
                      : 'text-charcoal hover:text-forest hover:bg-sand'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Highlighted Combos & Offers button */}
            <button
              onClick={() => handleNavClick('products', { category: 'combos' })}
              className="px-3.5 py-1.5 ml-1 text-sm font-bold text-brand hover:text-brand-hover bg-brand-soft hover:bg-brand/15 border border-brand-border rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Combos & Offers</span>
              <span className="text-[10px] bg-brand text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                Save 20%
              </span>
            </button>
          </div>

          {/* Quick Contact / Ayurvedic Helpline Pill */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+918872544458"
              className="flex items-center gap-2 text-xs font-semibold text-forest-deep bg-sand px-3 py-1.5 rounded-full border border-sand-border hover:bg-sand-warm transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-forest" />
              <span>Ayurvedic Care: <strong className="text-forest">+91-8872544458</strong></span>
            </a>
          </div>

          {/* Mobile Menu Trigger Button */}
          <div className="flex lg:hidden w-full justify-between items-center py-2">
            <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-brand" />
              {navLinks.find((l) => l.id === activePage)?.label || 'Menu'}
            </span>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal hover:bg-sand transition-colors flex items-center gap-1.5 text-xs font-bold border border-sand-border"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? (
                <>
                  <X className="h-4 w-4 text-crimson" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu className="h-4 w-4 text-forest" />
                  <span>Browse Menu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Accordion / Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sand-border py-4 space-y-2 animate-fadeIn bg-white">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-sand-border">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`p-2.5 rounded-xl text-left text-xs font-bold transition-colors ${
                    activePage === link.id
                      ? 'bg-forest text-white shadow-xs'
                      : 'bg-sand text-charcoal hover:bg-brand-soft hover:text-brand'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleNavClick('products', { category: 'combos' })}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-200" />
                <span>Combos & Value Courses</span>
              </span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">Save up to 25%</span>
            </button>

            {/* Mobile Customer Account Trigger */}
            <div className="pt-1">
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAccountModal('orders');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-forest text-white text-[10px] font-black flex items-center justify-center">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                    </div>
                    <span>My Account ({currentUser.name?.split(' ')[0]})</span>
                  </span>
                  <span className="text-[11px] text-brand underline font-semibold">View Orders</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-forest text-white text-xs font-bold shadow-xs"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}

              {/* Mobile Track Order Trigger */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenTrackOrder) onOpenTrackOrder();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-leaf-soft/50 border border-leaf-border text-forest text-xs font-bold mt-2"
              >
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-forest" />
                  <span>Track Your Order</span>
                </span>
                <span className="text-[10px] bg-forest text-white px-2 py-0.5 rounded-full font-bold">Delhivery Live</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <a
                href="https://wa.me/917657963458?text=Hello%20Fibax%20Ayurveda,%20I%20have%20an%20inquiry%20about%20your%20products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-leaf-soft text-forest text-xs font-bold border border-leaf-border hover:bg-leaf/20 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-forest" />
                <span>Chat on WhatsApp (+91-7657963458)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
