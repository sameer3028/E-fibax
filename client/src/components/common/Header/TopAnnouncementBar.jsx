import React from 'react';
import { Truck, ShieldCheck, Sparkles } from 'lucide-react';

export function TopAnnouncementBar() {
  return (
    <div className="bg-forest-deep text-white text-xs py-2 px-4 border-b border-forest-dark/40 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center p-1 bg-forest-light rounded-full text-sage-soft">
            <Truck className="h-3 w-3" />
          </span>
          <p className="font-medium tracking-wide">
            Orders over <span className="text-gold font-bold">₹499</span> qualify for <span className="text-sage-light font-bold">FREE Delivery</span> across India
          </p>
        </div>

        <div className="hidden md:flex items-center gap-5 text-sand/80 text-[11px]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-sage" />
            AYUSH Approved & GMP Certified
          </span>
          <span className="text-sand/30">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            100% Pure Botanical Extracts
          </span>
          <span className="text-sand/30">•</span>
          <a
            href="#track-order"
            className="hover:text-gold transition-colors font-medium underline underline-offset-2"
          >
            Track with Delhivery
          </a>
        </div>
      </div>
    </div>
  );
}
