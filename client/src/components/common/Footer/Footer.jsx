import React from 'react';
import {
  ShieldCheck,
  Truck,
  Leaf,
  Award,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';
import { CONCERNS } from '../../../data/concerns';
import { CATEGORIES } from '../../../data/categories';

export function Footer({ onSelectConcern, onSelectCategory }) {
  return (
    <footer className="bg-forest-deep text-sand border-t border-forest-dark pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-forest/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-sage flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-serif text-sm font-semibold text-white">AYUSH Approved</h5>
              <p className="text-xs text-sand/70">Certified authentic formulations</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-gold flex-shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-serif text-sm font-semibold text-white">GMP Certified</h5>
              <p className="text-xs text-sand/70">Pharmaceutical purity standards</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-sage flex-shrink-0">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-serif text-sm font-semibold text-white">100% Herbal Actives</h5>
              <p className="text-xs text-sand/70">Zero synthetic chemical fillers</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-gold flex-shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-serif text-sm font-semibold text-white">Delhivery Express</h5>
              <p className="text-xs text-sand/70">Fast Pan-India delivery & COD</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-forest/50 text-xs leading-relaxed">
          {/* Col 1: About & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-gold">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                FIBAX PHARMA
              </span>
            </div>
            <p className="text-sand/80 max-w-sm">
              Fibax Pharma is dedicated to formulating scientifically standardized Ayurvedic remedies that restore balance, vitality, and natural healing to modern lives.
            </p>

            <div className="space-y-2 pt-2 text-sand/90">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sage" />
                <span>Customer Care: +91 76579 63458 / +91 90563 44458</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sage" />
                <span>Email: fibaxpharma@gmail.com</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />
                <span>Headquarters: Fibax Pharma Ayurvedic Healthcare, Punjab, India</span>
              </p>
            </div>
          </div>

          {/* Col 2: Health Concerns */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-3">Shop by Concern</h5>
            <ul className="space-y-2">
              {CONCERNS.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectConcern && onSelectConcern(c.slug)}
                    className="hover:text-gold transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-3">Formulations</h5>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                    className="hover:text-gold transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust & Policies */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm mb-3">Customer Support</h5>
            <ul className="space-y-2">
              <li>
                <a href="#track-order" className="hover:text-gold transition-colors">
                  Track Your Order (Delhivery)
                </a>
              </li>
              <li>
                <a href="#shipping-policy" className="hover:text-gold transition-colors">
                  Shipping & Free Delivery Policy
                </a>
              </li>
              <li>
                <a href="#refund-returns-policy" className="hover:text-gold transition-colors">
                  Refund & Return Policy
                </a>
              </li>
              <li>
                <a href="#terms-conditions" className="hover:text-gold transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy-policy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* AYUSH Regulatory Disclaimer */}
        <div className="pt-8 pb-4 text-[11px] text-sand/60 text-center leading-relaxed max-w-4xl mx-auto">
          <p>
            <strong>Regulatory & AYUSH Compliance Disclaimer:</strong> Products sold on this website are Ayurvedic proprietary medicines and herbal dietary supplements formulated with natural botanical extracts. They are not intended to diagnose, treat, cure, or prevent severe clinical pathologies without professional medical consultation. Results may vary depending on individual physiological constitution (Prakriti).
          </p>
          <p className="mt-3 text-sand/40">
            © {new Date().getFullYear()} Fibax Pharma. All Rights Reserved. Clean Architecture. Zero WordPress Code.
          </p>
        </div>
      </div>
    </footer>
  );
}
