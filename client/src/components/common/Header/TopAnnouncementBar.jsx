import React from 'react';
import { Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

export function TopAnnouncementBar() {
  const { freeShippingThreshold } = useCart();
  return (
    <div className="bg-forest-deep text-white text-xs py-2 px-4 border-b border-forest-dark/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left assurance with Logo Lime Leaf icon */}
        <div className="hidden md:flex items-center gap-2 text-leaf-light">
          <ShieldCheck className="h-3.5 w-3.5 text-leaf-light" />
          <span className="font-semibold tracking-wide text-[11px] text-white">
            100% AYUSH Certified Ayurvedic Formulations
          </span>
        </div>

        {/* Center shipping marquee with Logo Orange highlight */}
        <div className="flex-1 md:flex-none text-center flex items-center justify-center gap-2 font-medium text-[11px]">
          <Truck className="h-3.5 w-3.5 text-leaf-light" />
          <span>
            <strong className="text-brand-light font-bold">FREE Delivery</strong> on orders above <span className="underline decoration-brand-light font-bold text-brand-light">₹{freeShippingThreshold || 499}</span>
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:inline text-white/80">Express Delhivery Tracking</span>
        </div>

        {/* Right Helpline */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-white/90">
            Helpline: <a href="tel:+917657963458" className="font-bold text-white hover:text-brand-light transition-colors">+91 76579 63458</a>
          </span>
        </div>
      </div>
    </div>
  );
}
