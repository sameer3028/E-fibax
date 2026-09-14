import React from 'react';
import { Smartphone, Sparkles, Check, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export function AppPromoSection() {
  return (
    <section className="py-14 bg-[#f2ede4] relative overflow-hidden border-y border-[#e5ded0]">
      {/* Background botanical foliage decorative accents */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#173e27] via-[#0f301e] to-[#0a2315] p-8 sm:p-12 text-white shadow-2xl overflow-hidden border border-[#2b593d]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-forest-deep text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>EXCLUSIVE MEMBERSHIP BENEFIT</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                FIBAX WELLNESS CLUB <br />
                <span className="text-amber-300">GET FLAT ₹100 OFF</span> ON 1ST ORDER
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans font-medium">
                Join over 1,00,000+ members enjoying direct-to-home priority dispatch, complimentary Doctor WhatsApp consultations, and seasonal discount coupons.
              </p>

              {/* Perks Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-white">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Free Delhivery tracking on all orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Direct Ayurvedic Vaidya consultation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Fresh farm harvest priority batches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span>Cash on Delivery + UPI accepted</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="https://wa.me/917657963458?text=Hello%20Fibax,%20I%20want%20to%20join%20the%20Wellness%20Club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3 rounded-full bg-gradient-to-r from-brand to-orange-500 hover:from-brand-hover hover:to-brand text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-orange-glow flex items-center gap-2"
                >
                  <span>ORDER DIRECT ON WHATSAPP</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <div className="text-[11px] text-emerald-200/90 font-medium">
                  Use Coupon: <strong className="text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">WELCOME10</strong>
                </div>
              </div>
            </div>

            {/* Right Graphic: Modern 3D Smartphone Display */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-64 sm:w-72 rounded-3xl bg-white p-3 shadow-2xl border-4 border-amber-300/40 transform hover:scale-102 transition-transform">
                <div className="rounded-2xl overflow-hidden bg-sand p-4 border border-sand-border space-y-3">
                  <div className="flex items-center justify-between border-b border-sand-border pb-2">
                    <div className="font-heading font-extrabold text-xs text-forest">Fibax Express</div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">ONLINE</span>
                  </div>

                  <div className="aspect-square rounded-xl bg-white p-3 flex items-center justify-center border border-sand-border">
                    <img
                      src="https://fibaxpharma.com/wp-content/uploads/2025/11/safed-musli-powder.webp"
                      alt="Product preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <div className="font-heading font-bold text-xs text-charcoal">Safed Musli Vitality Powder</div>
                    <div className="text-xs font-extrabold text-forest">₹600 <span className="text-[10px] text-charcoal-muted line-through">₹672</span></div>
                  </div>

                  <div className="w-full py-2 rounded-xl bg-brand text-white text-center text-xs font-bold shadow-xs">
                    Free Delivery Unlocked!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
