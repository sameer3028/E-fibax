import React from 'react';
import { CONCERNS } from '../../../data/concerns';
import { ChevronRight, Sparkles } from 'lucide-react';

export function ConcernDropdown({ isOpen, onClose, onSelectConcern }) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 w-full max-w-4xl bg-white rounded-2xl shadow-modal border border-sand-border p-6 z-50 animate-fadeIn"
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-sand-border">
        <div>
          <h4 className="font-serif font-bold text-forest text-lg">Shop by Health Concern</h4>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Targeted Ayurvedic formulations categorized for your physiological wellness needs
          </p>
        </div>
        <a
          href="#all-concerns"
          onClick={() => { onClose(); onSelectConcern && onSelectConcern(null); }}
          className="text-xs font-semibold text-forest hover:text-forest-light flex items-center gap-1 group"
        >
          <span>View All Solutions</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CONCERNS.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              if (onSelectConcern) onSelectConcern(c.slug);
              onClose();
            }}
            className="flex items-start gap-3 p-3 rounded-xl text-left hover:bg-sand transition-all group border border-transparent hover:border-sand-border"
          >
            <div className="p-2.5 rounded-xl bg-sage-soft/60 group-hover:bg-forest group-hover:text-white text-forest transition-colors flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal group-hover:text-forest transition-colors">
                {c.name}
              </p>
              <p className="text-[11px] text-charcoal-muted line-clamp-1 mt-0.5">
                {c.description}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-sage bg-sage-soft/50 px-2 py-0.5 rounded-full">
                {c.productCount} Formulations
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
