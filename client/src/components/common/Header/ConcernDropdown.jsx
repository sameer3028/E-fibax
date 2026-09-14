import React from 'react';
import { CONCERNS } from '../../../data/concerns';
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
  ChevronRight,
  ArrowRight,
  Stethoscope
} from 'lucide-react';

const ICON_MAP = {
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

// Distinct Ayurvedic color accents for concern cards
const COLOR_ACCENTS = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', hoverBg: 'group-hover:bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', hoverBg: 'group-hover:bg-amber-600', badge: 'bg-amber-100 text-amber-800' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', hoverBg: 'group-hover:bg-teal-600', badge: 'bg-teal-100 text-teal-800' },
  blue: { bg: 'bg-sky-50', text: 'text-sky-700', hoverBg: 'group-hover:bg-sky-600', badge: 'bg-sky-100 text-sky-800' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', hoverBg: 'group-hover:bg-rose-600', badge: 'bg-rose-100 text-rose-800' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', hoverBg: 'group-hover:bg-orange-600', badge: 'bg-orange-100 text-orange-800' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', hoverBg: 'group-hover:bg-pink-600', badge: 'bg-pink-100 text-pink-800' },
  red: { bg: 'bg-red-50', text: 'text-red-700', hoverBg: 'group-hover:bg-red-600', badge: 'bg-red-100 text-red-800' },
  green: { bg: 'bg-green-50', text: 'text-green-700', hoverBg: 'group-hover:bg-green-600', badge: 'bg-green-100 text-green-800' },
};

export function ConcernDropdown({ isOpen, onClose, onSelectConcern }) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 lg:-left-12 xl:left-0 pt-2 z-50 animate-fadeIn"
      onMouseLeave={onClose}
    >
      <div className="w-[720px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-sand-border p-5 md:p-6">
        {/* Dropdown Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-sand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-forest text-base">Shop by Health Concern</h4>
              <p className="text-xs text-charcoal-muted">
                Clinically formulated Ayurvedic therapies for your specific wellness goals
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onSelectConcern) onSelectConcern(null);
              onClose();
            }}
            className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-brand-soft transition-colors"
          >
            <span>View All Products</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 2-Column Balanced Grid: 5 items on each column */}
        <div className="grid grid-cols-2 gap-2.5">
          {CONCERNS.map((c) => {
            const IconComponent = ICON_MAP[c.icon] || Sparkles;
            const accent = COLOR_ACCENTS[c.color] || COLOR_ACCENTS.orange;

            return (
              <button
                key={c.id}
                onClick={() => {
                  if (onSelectConcern) onSelectConcern(c.slug);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-sand/80 transition-all group border border-transparent hover:border-sand-border hover:shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Relative Product/Concern Packshot Thumbnail */}
                  <div className="relative w-12 h-12 rounded-xl bg-white p-1 border border-sand-border flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:border-brand/50 group-hover:shadow-xs transition-all duration-200">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full rounded-lg ${accent.bg} ${accent.text} flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-charcoal group-hover:text-brand transition-colors truncate">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-charcoal-muted truncate">
                      {c.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Dropdown Footer Free Consultation Banner */}
        <div className="mt-4 pt-3 border-t border-sand-border flex items-center justify-between text-xs bg-leaf-soft/40 -mx-5 -mb-5 md:-mx-6 md:-mb-6 p-3 px-5 md:px-6 rounded-b-2xl">
          <div className="flex items-center gap-2 text-forest font-medium">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span>Not sure which formulation suits your body constitution (Prakriti)?</span>
          </div>
          <a
            href="https://wa.me/917657963458?text=Hello%20Fibax%20Pharma,%20I%20would%20like%20a%20free%20Ayurvedic%20doctor%20consultation"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="font-bold text-forest hover:text-brand flex items-center gap-1 transition-colors"
          >
            <span>Ask Ayurvedic Vaidya</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
