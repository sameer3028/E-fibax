import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sheet({ isOpen, onClose, title, children, side = 'right', className }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full z-50',
          side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
        )}
      >
        <div
          className={cn(
            'w-screen max-w-md bg-white shadow-modal flex flex-col',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand-warm">
            <h3 className="text-lg font-heading font-semibold text-forest-deep">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
