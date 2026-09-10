import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}) {
  const variants = {
    default: 'bg-sand text-forest border border-sand-border',
    ayurvedic: 'bg-sage-soft text-forest-dark border border-sage/30',
    bestseller: 'bg-gold-cream text-gold-dark border border-gold/40',
    discount: 'bg-crimson text-white font-bold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
