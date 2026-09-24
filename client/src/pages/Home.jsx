import React from 'react';
import { motion } from 'framer-motion';
import { HeroBannerSlider } from '../components/sections/HeroBannerSlider';
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
import { ArrowRight, PhoneCall } from 'lucide-react';

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
      {/* 1. Hero Campaign Banner Slider (3 High-Res Graphic Sliders: Multivitamin, Axe Ortho, Triphala) */}
      <HeroBannerSlider
        products={products}
        onSelectProduct={onSelectProduct}
        onNavigate={onNavigate}
        onSelectConcern={onSelectConcern}
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

      {/* 7. Dual Promotional Banners Grid (Livupchar Liver Tonic & Aloe Vera Neem Face Wash) */}
      <FadeInWhenVisible>
        <section className="py-10 sm:py-14 bg-[#fbf9f4] border-y border-sand-border/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
              {/* Left Banner: Livupchar Liver Tonic */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  const matched = products.find(
                    (p) =>
                      p.slug === 'livupchar-ayurvedic-liver-care-syrup-200ml' ||
                      p.title?.toLowerCase().includes('livupchar')
                  );
                  if (matched && onSelectProduct) {
                    onSelectProduct(matched);
                  } else if (onNavigate) {
                    onNavigate('products', { concern: 'liver-care' });
                  }
                }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-sand-border/80 bg-stone-900 cursor-pointer group aspect-[2/1]"
                title="Fibax Livupchar Liver Tonic - Click to shop"
              >
                <img
                  src="/banners/banner-livupchar.jpg"
                  alt="Fibax Ayurveda Livupchar Liver Tonic Banner"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </motion.div>

              {/* Right Banner: Aloe Vera Neem Face Wash */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  const matched = products.find(
                    (p) =>
                      p.slug === 'fibax-neem-aloevera-facewash' ||
                      p.title?.toLowerCase().includes('facewash')
                  );
                  if (matched && onSelectProduct) {
                    onSelectProduct(matched);
                  } else if (onNavigate) {
                    onNavigate('products', { concern: 'skin-hair-care' });
                  }
                }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-sand-border/80 bg-stone-900 cursor-pointer group aspect-[2/1]"
                title="Fibax Aloe Vera Neem Face Wash - Click to shop"
              >
                <img
                  src="/banners/banner-neem-facewash.jpg"
                  alt="Fibax Ayurveda Aloe Vera Neem Face Wash Banner"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* 8. Combo Deals Section */}
      <div id="combo-deals">
        <FadeInWhenVisible>
          <ComboDealsSection
            onSelectProduct={onSelectProduct}
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
