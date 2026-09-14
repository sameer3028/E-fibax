import React from 'react';
import { Sparkles, Sprout, Sun, CheckCircle } from 'lucide-react';

export function HeritageBanner() {
  return (
    <section className="py-10 bg-[#fbf9f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#e8e2d5] min-h-[360px] flex items-center">
          {/* Scenic Sunrise Farm Background Image */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80"
            alt="Organic Ayurvedic Cultivation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Natural Sunlight Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#072414]/90 via-[#0a381f]/75 to-transparent" />

          {/* Text Content */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-xl text-white space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-forest-deep text-xs font-extrabold uppercase tracking-wider">
              <Sprout className="h-3.5 w-3.5" />
              <span>Certified Organic Farm Cultivation</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Cultivated in Sacred Soil. <br />
              <span className="text-amber-300">Harvested at Peak Potency.</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
              Our herbs are grown organically without synthetic pesticides or chemical fertilizers. Hand-picked at dawn when essential phytonutrients are at their highest concentration.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-white/15">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Zero Chemical Fertilizers</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-white/15">
                <Sun className="h-4 w-4 text-amber-300" />
                <span>Sun-Dried Naturally</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
