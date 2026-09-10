import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-charcoal-muted mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-sand-border text-sm text-charcoal placeholder-charcoal-subtle bg-white transition-all',
          'focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest',
          error && 'border-crimson focus:border-crimson focus:ring-crimson',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-crimson font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
