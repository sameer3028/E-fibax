import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Star, Flame } from 'lucide-react';

export function HeroSection({ onExploreConcerns, onExploreBestsellers }) {
  return (
    <section className="relative py-4 sm:py-6 bg-[#fbf9f4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Colorful Hero Banner Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#e8e2d5] bg-gradient-to-br from-[#1a3826] via-[#102d1d] to-[#0a1f14]">
          {/* Background Atmospheric Layers: Golden Monsoon Rays & Botanical Canopy */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/25 via-emerald-600/15 to-transparent pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,_rgba(234,88,12,0.15),transparent_60%)] pointer-events-none" />

          {/* Banner Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-10 lg:p-14 relative z-10">
            {/* Left Content Area */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              {/* Vibrant 3D Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transform -rotate-1">
                <Flame className="h-4 w-4 text-white animate-bounce" />
                <span>MONSOON & DAILY WELLNESS SPECIAL</span>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <span className="block font-heading text-sm sm:text-base font-bold text-emerald-300 uppercase tracking-widest">
                  India's 1st Certified • 100% Preservative-Free
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-md">
                  AYURVEDIC <br />
                  <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    CHYAWANPRASH &
                  </span> <br />
                  VITALITY TONICS
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-sand/90 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans font-medium">
                Traditional swaras & kwath decoctions boiled in small batches by master vaidyas. Formulated with wild forest Amla, pure Safed Musli, Ashwagandha, and 45+ authentic Himalayan herbs.
              </p>

              {/* Vibrant CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onExploreBestsellers}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white text-xs sm:text-sm font-extrabold tracking-wider uppercase transition-all shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>SHOP REMEDIES NOW</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onExploreConcerns}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold tracking-wider uppercase border border-white/25 transition-all hover:border-amber-400/80 backdrop-blur-sm"
                >
                  Shop By Concern
                </button>
              </div>

              {/* Bottom Assurance Metrics */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-emerald-100">
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>AYUSH Ministry Certified</span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>4.8/5 Rated (1,00,000+ Reviews)</span>
                </span>
              </div>
            </div>

            {/* Right Hero Product Composition */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              {/* Circular Sun Glow Backdrop */}
              <div className="absolute w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-br from-amber-400/30 via-orange-500/20 to-emerald-500/10 rounded-full blur-2xl animate-pulse-slow" />

              {/* 3D Product Presentation Display */}
              <div 
                onClick={onExploreBestsellers}
                className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-white/20 via-white/10 to-white/5 p-4 sm:p-5 backdrop-blur-md border border-white/25 shadow-2xl flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 hover:border-amber-400/60 hover:shadow-orange-500/20"
              >
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-forest-deep text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white z-10 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 fill-forest-deep" />
                  <span>PREMIUM AYURVEDA</span>
                </div>

                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative flex items-center justify-center shadow-inner">
                  <img
                    src="/uploads/fibax-hero-product.jpg"
                    alt="Fibax Ayurveda Premium Wellness Range"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="bg-brand text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                      <span>SHOP COLLECTION</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 text-center space-y-1 w-full">
                  <div className="text-white font-heading font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-1.5">
                    <span>Axe Ortho & Herbal Wellness Series</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-amber-300 font-bold">100% Botanical Extracts</span>
                    <span className="text-white/40">•</span>
                    <span className="text-emerald-300 font-semibold">Doctor Formulated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Key Stats Pills right below Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-2xl p-3.5 border border-[#e8e2d5] shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-forest flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-forest" />
            </div>
            <div>
              <div className="font-heading font-bold text-forest-deep text-xs sm:text-sm">100% Pure & Preservative-Free</div>
              <div className="text-[11px] text-charcoal-muted">Traditional Vedic preparation</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#e8e2d5] shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand flex-shrink-0">
              <HeartHandshake className="h-5 w-5 text-brand" />
            </div>
            <div>
              <div className="font-heading font-bold text-forest-deep text-xs sm:text-sm">5,00,000+ Happy Customers</div>
              <div className="text-[11px] text-charcoal-muted">Delivering across all Indian PIN codes</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#e8e2d5] shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <div className="font-heading font-bold text-forest-deep text-xs sm:text-sm">4.8★ Verified Doctor Rating</div>
              <div className="text-[11px] text-charcoal-muted">Master Vaidya approved formulas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
