import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-forest hover:bg-forest-light text-white shadow-sm focus:ring-forest-light rounded-full',
    secondary: 'bg-sand hover:bg-sand-border text-forest border border-sand-border focus:ring-forest rounded-full',
    outline: 'bg-transparent border-1.5 border-forest text-forest hover:bg-sage-soft focus:ring-forest rounded-full',
    gold: 'bg-gold hover:bg-gold-dark text-forest-deep font-semibold shadow-sm focus:ring-gold rounded-full',
    sale: 'bg-crimson hover:bg-crimson-dark text-white font-semibold shadow-sm focus:ring-crimson rounded-full',
    ghost: 'bg-transparent text-charcoal hover:bg-sand hover:text-forest rounded-lg',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
    icon: 'p-2 rounded-full',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
