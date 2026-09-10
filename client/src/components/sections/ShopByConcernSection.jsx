import React from 'react';
import { CONCERNS } from '../../data/concerns';
import {
  Activity,
  Flame,
  Shield,
  Droplets,
  HeartPulse,
  Sparkles,
  Zap,
  Heart,
  Smile,
  ArrowRight
} from 'lucide-react';

const iconMap = {
  Activity,
  Flame,
  Shield,
  Droplets,
  HeartPulse,
  Sparkles,
  Zap,
  Heart,
  Smile,
};

export function ShopByConcernSection({ onSelectConcern }) {
  return (
    <section id="all-concerns" className="py-16 bg-white border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-sage uppercase tracking-widest block mb-1.5">
            Symptom-Based Natural Healing
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-forest-deep">
            What Health Concern Can We Help You With?
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
            Select your health goal to explore clinically balanced Ayurvedic formulations designed for targeted relief.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {CONCERNS.map((concern) => {
            const IconComponent = iconMap[concern.icon] || Sparkles;
            return (
              <button
                key={concern.id}
                onClick={() => onSelectConcern && onSelectConcern(concern.slug)}
                className="group p-4 rounded-2xl bg-sand/60 border border-sand-border hover:border-forest/30 hover:bg-white hover:shadow-botanical transition-all duration-200 text-center flex flex-col items-center justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-subtle flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-gold transition-colors mb-3">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-charcoal group-hover:text-forest transition-colors">
                    {concern.name}
                  </h4>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-sage">
                    {concern.productCount} Formulations
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
