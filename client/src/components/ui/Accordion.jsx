import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Accordion({ items, allowMultiple = false, className }) {
  const [openIndices, setOpenIndices] = useState([0]);

  const toggle = (idx) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setOpenIndices((prev) => (prev.includes(idx) ? [] : [idx]));
    }
  };

  return (
    <div className={cn('divide-y divide-sand-border border-y border-sand-border', className)}>
      {items.map((item, idx) => {
        const isOpen = openIndices.includes(idx);
        return (
          <div key={idx} className="py-3">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between text-left py-2 font-medium text-forest hover:text-forest-light transition-colors"
            >
              <span className="text-base font-semibold">{item.title}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-charcoal-muted transition-transform duration-200',
                  isOpen && 'transform rotate-180 text-forest'
                )}
              />
            </button>
            {isOpen && (
              <div className="pt-2 pb-3 text-sm text-charcoal-soft leading-relaxed animate-fadeIn">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
