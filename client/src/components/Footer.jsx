import React from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  Heart,
  Building2,
  Globe
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CONCERNS } from '../data/concerns';

export function Footer({ onNavigate, onSelectCategory, onSelectConcern, onOpenTrackOrder }) {
  const handleNav = (pageId, param = null) => {
    if (onNavigate) {
      onNavigate(pageId, param);
    }
  };

  return (
    <footer className="bg-forest-deep text-white/90 pt-16 pb-8 border-t border-forest-dark">
      {/* 4 Trust Value Pillars Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-leaf/20 text-leaf">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">WHO-GMP Certified</h4>
              <p className="text-xs text-sand-warm/70 mt-1 leading-relaxed">
                State-of-the-art automated manufacturing adhering to strict AYUSH standards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-brand/20 text-brand-light">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct Farm-to-Bottle</h4>
              <p className="text-xs text-sand-warm/70 mt-1 leading-relaxed">
                100% natural, lab-tested herbal formulations delivered fresh to your doorstep.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-leaf/20 text-leaf">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pan-India Express Delivery</h4>
              <p className="text-xs text-sand-warm/70 mt-1 leading-relaxed">
                Rapid 24-48 hr dispatch across all 28 states with Delhivery live tracking & COD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Pure Herbal Extracts</h4>
              <p className="text-xs text-sand-warm/70 mt-1 leading-relaxed">
                Standardized phytochemicals, zero adulteration, zero heavy metals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Corporate Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/fibax-logo.png"
                alt="Fibax Pharma"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-xs sm:text-sm text-sand-warm/80 leading-relaxed max-w-md">
              <strong>Fibax Ayurveda</strong> is India's trusted direct-to-consumer Ayurvedic wellness brand. Formulating authentic, science-backed botanical remedies under WHO-GMP, ISO 9001:2015, and Ministry of AYUSH guidelines for your family's lifelong health and vitality.
            </p>
            
            <div className="pt-2">
              <span className="text-xs font-bold text-leaf uppercase tracking-wider block mb-2">
                Verified Certifications:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-medium">WHO-GMP Compliant</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-medium">ISO 9001:2015</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-medium">Ministry of AYUSH</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-medium">GLP Approved Lab</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Explore & Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-warm/80">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-leaf transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="h-3 w-3 text-leaf" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-leaf transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="h-3 w-3 text-leaf" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('products')}
                  className="hover:text-leaf transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="h-3 w-3 text-leaf" />
                  <span>All Remedies & Formulations</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('blogs')}
                  className="hover:text-leaf transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="h-3 w-3 text-leaf" />
                  <span>Ayurvedic Health Blog</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-leaf transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="h-3 w-3 text-leaf" />
                  <span>Contact Us & Support</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenTrackOrder && onOpenTrackOrder()}
                  className="text-leaf font-semibold hover:underline transition-colors flex items-center gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5 text-leaf" />
                  <span>Track Your Order</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Formats */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Dosage Formats
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-warm/80">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat.slug);
                      handleNav('products', { category: cat.slug });
                    }}
                    className="hover:text-leaf transition-colors text-left w-full block"
                  >
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Corporate Office & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Corporate Office
            </h4>
            <div className="space-y-3 text-xs text-sand-warm/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-leaf flex-shrink-0 mt-0.5" />
                <span>
                  SCO. 29, Metro Plaza, Zirakpur, Punjab - 140603, India
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-leaf flex-shrink-0" />
                <a href="tel:+918872544458" className="hover:text-white">
                  +91-8872544458 / +91-7657963458
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-leaf flex-shrink-0" />
                <a href="mailto:fibaxpharma@gmail.com" className="hover:text-white">
                  fibaxpharma@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-leaf flex-shrink-0" />
                <span>Mon - Sat: 9:30 AM – 7:00 PM</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => handleNav('contact')}
                className="w-full py-2 px-3 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-hover transition-colors shadow-xs text-center"
              >
                Consult Ayurvedic Doctor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal, Disclaimer & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-warm/60">
          <p>
            &copy; {new Date().getFullYear()} <strong>Fibax Pharma Private Limited</strong>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => onOpenTrackOrder && onOpenTrackOrder()}
              className="text-leaf hover:underline flex items-center gap-1 font-medium"
            >
              <Truck className="h-3 w-3 inline" /> Track Order
            </button>
            <span>•</span>
            <a href="#about" onClick={() => handleNav('about')} className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#about" onClick={() => handleNav('about')} className="hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="#contact" onClick={() => handleNav('contact')} className="hover:underline">Shipping & Return Policy</a>
          </div>
        </div>
        <p className="text-[10px] text-sand-warm/40 mt-3 text-center sm:text-left leading-relaxed">
          *Disclaimer: The statements and formulations listed on this portal are approved under Ayurvedic and Indian Pharmacopoeia standards. These herbal preparations are intended to support general health and natural healing. Always consult an Ayurvedic physician or healthcare practitioner before beginning any new healthcare regimen.
        </p>
      </div>
    </footer>
  );
}
