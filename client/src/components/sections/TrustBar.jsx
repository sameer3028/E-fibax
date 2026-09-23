import React from 'react';
import { ShieldCheck, Truck, Award, Sparkles, UserCheck, CreditCard } from 'lucide-react';

export function TrustBar() {
  const assurances = [
    { icon: Sparkles, title: '100% Ayurvedic', sub: 'Pure Herbal Actives' },
    { icon: Truck, title: 'Free Delhivery', sub: 'Orders Above ₹499' },
    { icon: Award, title: 'AYUSH Approved', sub: 'Govt. GMP Certified' },
    { icon: ShieldCheck, title: 'Lab Tested', sub: 'No Heavy Metals' },
    { icon: UserCheck, title: 'Free Vaidya Advice', sub: 'Ayurvedic Helpline' },
    { icon: CreditCard, title: 'Cash on Delivery', sub: 'UPI & COD Available' },
  ];

  return (
    <div className="bg-[#124225] text-white py-3.5 border-y border-[#0c311b] shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {assurances.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 py-1 px-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-xs text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-emerald-200/80 truncate">{item.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
