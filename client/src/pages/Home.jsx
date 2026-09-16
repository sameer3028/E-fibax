import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { TrustBar } from '../components/sections/TrustBar';
import { ShopByConcernSection } from '../components/sections/ShopByConcernSection';
import { CustomerStoriesSection } from '../components/sections/CustomerStoriesSection';
import { BestsellersSection } from '../components/sections/BestsellersSection';
import { ShopByCategoriesSection } from '../components/sections/ShopByCategoriesSection';
import { ComboDealsSection } from '../components/sections/ComboDealsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { AppPromoSection } from '../components/sections/AppPromoSection';
import { BlogsSection } from '../components/sections/BlogsSection';
import { MediaPressBar } from '../components/sections/MediaPressBar';
import { FloatingConsultationBar } from '../components/sections/FloatingConsultationBar';
import { Building2, Globe, ShieldCheck, Factory, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { INDUSTRIES } from '../data/industries';

export function Home({
  products = [],
  onSelectProduct,
  onSelectCategory,
  onSelectConcern,
  onNavigate
}) {
  return (
    <div className="w-full bg-white space-y-0">
      {/* 1. Hero Campaign Banner */}
      <HeroSection
        onExploreConcerns={() => {
          const el = document.getElementById('all-concerns');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreBestsellers={() => {
          if (onNavigate) onNavigate('products');
        }}
      />

      {/* 2. Deep Green USPs Ribbon */}
      <TrustBar />

      {/* 3. Shop By Concern (Pill Tabs + 4-Cards) */}
      <div id="all-concerns">
        <ShopByConcernSection
          onSelectProduct={onSelectProduct}
          onViewAllConcern={(concernSlug) => {
            if (onNavigate) {
              onNavigate('products', { concern: concernSlug });
            } else if (onSelectConcern) {
              onSelectConcern(concernSlug);
            }
          }}
        />
      </div>

      {/* 4. Customer Video Reels / Stories Carousel */}
      <CustomerStoriesSection onSelectProduct={onSelectProduct} />

      {/* 5. Our Bestsellers */}
      <BestsellersSection
        products={products}
        onSelectProduct={onSelectProduct}
        onViewAll={() => {
          if (onNavigate) onNavigate('products');
        }}
      />

      {/* 6. Shop by Categories */}
      <ShopByCategoriesSection
        onSelectCategory={(catSlug) => {
          if (onNavigate) {
            onNavigate('products', { category: catSlug });
          } else if (onSelectCategory) {
            onSelectCategory(catSlug);
          }
        }}
      />

      {/* 7. Corporate & Industrial Divisions Spotlight */}
      <section className="py-16 bg-sand border-y border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
                Manufacturing & Business Verticals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
                Powering India's Ayurvedic Healthcare & Exports
              </h2>
              <p className="text-charcoal-muted text-sm mt-1 max-w-xl">
                Beyond retail wellness, Fibax Pharma operates dedicated divisions for PCD franchises, automated contract manufacturing, and international exports.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('industries')}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-hover group"
            >
              <span>Explore All 6 Industry Sectors</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INDUSTRIES.slice(0, 3).map((ind) => (
              <div
                key={ind.id}
                className="bg-white rounded-2xl p-6 border border-sand-border shadow-subtle hover:shadow-botanical transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-soft text-brand border border-brand-border">
                      {ind.badge}
                    </span>
                    <span className="text-xs text-charcoal-subtle font-medium">AYUSH / WHO-GMP</span>
                  </div>
                  <h3 className="text-lg font-bold text-forest-deep mb-2">{ind.title}</h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3 mb-4">
                    {ind.description}
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {ind.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-charcoal">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('industries')}
                  className="w-full py-2.5 px-4 rounded-xl bg-sand hover:bg-forest hover:text-white text-forest text-xs font-bold transition-colors text-center"
                >
                  View Sector Details & Pricing
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Combo Deals Section */}
      <div id="combo-deals">
        <ComboDealsSection
          onExploreCombos={() => {
            if (onNavigate) onNavigate('products', { category: 'combos' });
          }}
        />
      </div>

      {/* 9. Global Footprint Banner */}
      <section className="py-14 bg-gradient-to-r from-forest-deep via-forest to-forest-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
                Global Standards • Pan-India Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-4 drop-shadow-md">
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Exporting Certified Ayurvedic Excellence Worldwide
                </span>
              </h2>
              <p className="text-sand-warm/80 text-sm leading-relaxed mb-6">
                With a registered footprint spanning all 28 Indian states and active international consignments across Southeast Asia, the Middle East, and Africa, Fibax Pharma adheres to international CTD dossiers, Certificate of Pharmaceutical Product (COPP), and WHO-GMP standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate && onNavigate('global-reach')}
                  className="px-6 py-3 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-hover shadow-orange-glow transition-all"
                >
                  View Global Reach & Export Portfolio
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/20 border border-white/20 transition-all"
                >
                  Request PCD Monopoly District
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                <h4 className="text-3xl font-black text-amber-300">28</h4>
                <p className="text-xs font-semibold text-white mt-1">Indian States Covered</p>
                <p className="text-[11px] text-sand-warm/60 mt-0.5">500+ Monopoly Districts</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                <h4 className="text-3xl font-black text-emerald-300">100%</h4>
                <p className="text-xs font-semibold text-white mt-1">WHO-GMP & AYUSH</p>
                <p className="text-[11px] text-sand-warm/60 mt-0.5">GLP Certified Testing Lab</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                <h4 className="text-3xl font-black text-amber-300">250+</h4>
                <p className="text-xs font-semibold text-white mt-1">DCGI Formulations</p>
                <p className="text-[11px] text-sand-warm/60 mt-0.5">Syrups, Tabs, Caps, Juices</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                <h4 className="text-3xl font-black text-emerald-300">24-48h</h4>
                <p className="text-xs font-semibold text-white mt-1">Express Dispatch</p>
                <p className="text-[11px] text-sand-warm/60 mt-0.5">Guaranteed Logistics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Over 1,00,000+ People Trust Fibax */}
      <TestimonialsSection />

      {/* 11. Fibax App / VIP Health Club Promo */}
      <AppPromoSection />

      {/* 12. Wellness Journal / Blogs */}
      <div id="all-blogs">
        <BlogsSection />
      </div>

      {/* 13. Media & Logistics Ticker */}
      <MediaPressBar />

      {/* 15. Free Ayurvedic Consultation Bar */}
      <FloatingConsultationBar />
    </div>
  );
}
