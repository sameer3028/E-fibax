import React from 'react';
import { motion } from 'framer-motion';
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
import { FloatingConsultationBar } from '../components/sections/FloatingConsultationBar';
import { Building2, Globe, ShieldCheck, Factory, ArrowRight, Award, CheckCircle2, Truck, HeartHandshake, Sparkles, PhoneCall } from 'lucide-react';

function FadeInWhenVisible({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
      <FadeInWhenVisible>
        <TrustBar />
      </FadeInWhenVisible>

      {/* 3. Shop By Concern (Pill Tabs + 4-Cards) */}
      <div id="all-concerns">
        <FadeInWhenVisible>
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
        </FadeInWhenVisible>
      </div>

      {/* 4. Customer Video Reels / Stories Carousel */}
      <FadeInWhenVisible>
        <CustomerStoriesSection onSelectProduct={onSelectProduct} />
      </FadeInWhenVisible>

      {/* 5. Our Bestsellers */}
      <FadeInWhenVisible>
        <BestsellersSection
          products={products}
          onSelectProduct={onSelectProduct}
          onViewAll={() => {
            if (onNavigate) onNavigate('products');
          }}
        />
      </FadeInWhenVisible>

      {/* 6. Shop by Categories */}
      <FadeInWhenVisible>
        <ShopByCategoriesSection
          onSelectCategory={(catSlug) => {
            if (onNavigate) {
              onNavigate('products', { category: catSlug });
            } else if (onSelectCategory) {
              onSelectCategory(catSlug);
            }
          }}
        />
      </FadeInWhenVisible>

      {/* 7. Why Indian Families Choose Fibax Ayurveda */}
      <FadeInWhenVisible>
        <section className="py-16 bg-sand border-y border-sand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
                  The Fibax Ayurveda Difference
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
                  Why Thousands of Families Trust Fibax Ayurveda
                </h2>
                <p className="text-charcoal-muted text-sm mt-1 max-w-xl">
                  Formulated with 100% pure botanical extracts, standardized active bio-compounds, and backed by centuries of classical Ayurvedic knowledge.
                </p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('products')}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-hover group"
              >
                <span>Shop All Ayurvedic Remedies</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 border border-sand-border shadow-subtle hover:shadow-botanical transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Farm to Bottle
                    </span>
                    <span className="text-xs text-charcoal-subtle font-medium">100% Chemical-Free</span>
                  </div>
                  <h3 className="text-lg font-bold text-forest-deep mb-2">Pure Himalayan Botanicals</h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                    Directly sourced from certified organic cultivation belts. We select only wild-harvested, pesticide-free roots, leaves, and barks with verified bioactive potency.
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Standardized Phytochemical Extracts</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Zero Heavy Metals & Zero Contaminants</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>100% Vegetarian & Halal Formulations</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('products')}
                  className="w-full py-2.5 px-4 rounded-xl bg-sand hover:bg-forest hover:text-white text-forest text-xs font-bold transition-colors text-center"
                >
                  Explore Herbal Formulations
                </button>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 border border-sand-border shadow-subtle hover:shadow-botanical transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-soft text-brand border border-brand-border">
                      Vaidya Formulated
                    </span>
                    <span className="text-xs text-charcoal-subtle font-medium">AYUSH Certified</span>
                  </div>
                  <h3 className="text-lg font-bold text-forest-deep mb-2">Classical Science & Modern Safety</h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                    Crafted strictly according to classical Ayurvedic treatises (Charaka Samhita & Bhavaprakasha) and validated in our WHO-GMP and GLP compliant facility.
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Batch-to-Batch Potency Testing</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Clinically Researched Dosage Synergy</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Cleanroom Blister & Bottle Sealing</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('about')}
                  className="w-full py-2.5 px-4 rounded-xl bg-sand hover:bg-forest hover:text-white text-forest text-xs font-bold transition-colors text-center"
                >
                  Learn Our Science & Heritage
                </button>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 border border-sand-border shadow-subtle hover:shadow-botanical transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Pan-India Express
                    </span>
                    <span className="text-xs text-charcoal-subtle font-medium">COD Available</span>
                  </div>
                  <h3 className="text-lg font-bold text-forest-deep mb-2">Direct Doorstep Delivery</h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                    Fast, secure, and temperature-stable packaging dispatched within 24-48 hours directly to your doorstep anywhere in India with live Delhivery tracking.
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Free Delivery Above ₹499</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Cash on Delivery (COD) Pan-India</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-charcoal">
                      <CheckCircle2 className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
                      <span>Free Ayurvedic Dosage Consultation</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="w-full py-2.5 px-4 rounded-xl bg-sand hover:bg-forest hover:text-white text-forest text-xs font-bold transition-colors text-center"
                >
                  Consult an Ayurvedic Expert
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* 8. Combo Deals Section */}
      <div id="combo-deals">
        <FadeInWhenVisible>
          <ComboDealsSection
            onExploreCombos={() => {
              if (onNavigate) onNavigate('products', { category: 'combos' });
            }}
          />
        </FadeInWhenVisible>
      </div>

      {/* 9. Direct Doorstep Delivery & Customer Care Banner */}
      <FadeInWhenVisible>
        <section className="py-14 bg-gradient-to-r from-forest-deep via-forest to-forest-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
                  100% Authentic • Direct to Your Doorstep
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-4 drop-shadow-md">
                  <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Pure Ayurvedic Remedies Delivered Across India
                  </span>
                </h2>
                <p className="text-sand-warm/80 text-sm leading-relaxed mb-6">
                  Bringing ancient Ayurvedic healing wisdom directly to Indian households. Every bottle and capsule is crafted under WHO-GMP certified cleanrooms and dispatched directly to your doorstep with express tracking, tamper-evident seals, and full customer care support.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => onNavigate && onNavigate('products')}
                    className="px-6 py-3 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-hover shadow-orange-glow transition-all flex items-center gap-2"
                  >
                    <span>Shop All Ayurvedic Remedies</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate('contact')}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Free Ayurvedic Consultation</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                  <h4 className="text-3xl font-black text-amber-300">50,000+</h4>
                  <p className="text-xs font-semibold text-white mt-1">Happy Families</p>
                  <p className="text-[11px] text-sand-warm/60 mt-0.5">Across All 28 States</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                  <h4 className="text-3xl font-black text-emerald-300">100%</h4>
                  <p className="text-xs font-semibold text-white mt-1">WHO-GMP & AYUSH</p>
                  <p className="text-[11px] text-sand-warm/60 mt-0.5">Zero Chemical Toxicity</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                  <h4 className="text-3xl font-black text-amber-300">250+</h4>
                  <p className="text-xs font-semibold text-white mt-1">Herbal Remedies</p>
                  <p className="text-[11px] text-sand-warm/60 mt-0.5">Syrups, Tabs, Caps, Juices</p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                  <h4 className="text-3xl font-black text-emerald-300">24-48h</h4>
                  <p className="text-xs font-semibold text-white mt-1">Express Dispatch</p>
                  <p className="text-[11px] text-sand-warm/60 mt-0.5">Delhivery Express & COD</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* 10. Over 1,00,000+ People Trust Fibax */}
      <FadeInWhenVisible>
        <TestimonialsSection />
      </FadeInWhenVisible>

      {/* 11. Fibax App / VIP Health Club Promo */}
      <FadeInWhenVisible>
        <AppPromoSection />
      </FadeInWhenVisible>

      {/* 12. Wellness Journal / Blogs */}
      <div id="all-blogs">
        <FadeInWhenVisible>
          <BlogsSection onNavigate={onNavigate} />
        </FadeInWhenVisible>
      </div>

      {/* 13. Free Ayurvedic Consultation Bar */}
      <FloatingConsultationBar />
    </div>
  );
}
