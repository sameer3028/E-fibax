import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  X,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { formatPrice } from '../../lib/utils';

export function TrackOrderModal({ isOpen, onClose, initialTrackingId = '' }) {
  const [query, setQuery] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTrackingId) {
        setQuery(initialTrackingId);
        handleTrack(initialTrackingId);
      } else {
        setTrackingData(null);
        setError(null);
      }
    }
  }, [initialTrackingId, isOpen]);

  // Lock background body scroll and save/restore focus
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    // Focus search input on open
    const focusTimer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Escape key handler & focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTrack = async (searchId) => {
    const target = (searchId || query || '').trim();
    if (!target) {
      setError('Please enter your Order ID or AWB Tracking Number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiRequest(`/api/shipping/track/${encodeURIComponent(target)}`);
      if (res.success && res.data) {
        setTrackingData(res.data);
      } else {
        setError(res.error || 'No shipment found with this ID.');
        setTrackingData(null);
      }
    } catch (err) {
      setError('Failed to fetch tracking details. Please try again.');
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-order-modal-title"
        aria-describedby="track-order-modal-desc"
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-modal border border-sand-border flex flex-col w-[calc(100vw-16px)] sm:w-full sm:max-w-[680px] max-h-[calc(100vh-16px)] sm:max-h-[calc(100vh-32px)] [max-height:calc(100dvh-16px)] sm:[max-height:calc(100dvh-32px)] overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-sand-border bg-white z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="p-2 sm:p-2.5 rounded-2xl bg-forest/10 text-forest flex-shrink-0">
                <Truck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3
                  id="track-order-modal-title"
                  className="font-heading text-base sm:text-lg font-bold text-forest-deep leading-snug truncate"
                >
                  Live Shipment Tracking
                </h3>
                <p
                  id="track-order-modal-desc"
                  className="text-[11px] sm:text-xs text-charcoal-muted leading-tight truncate"
                >
                  Express Pan-India Doorstep Delivery via Delhivery Cargo
                </p>
              </div>
            </div>

            {/* Clearly Visible Top-Right Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 -mr-1 -mt-1 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand focus:outline-none focus:ring-2 focus:ring-forest transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label="Close tracking"
              title="Close tracking"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Order ID (FBX-...) or AWB (DLH-...)"
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-sand rounded-xl text-xs sm:text-sm text-charcoal font-medium border border-sand-border focus:border-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                <Truck className="h-4 w-4" />
                <span>{isLoading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-charcoal-subtle">
              Tip: You can find your Order ID in your confirmation SMS/Email or in your Account dashboard.
            </p>
          </form>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Tracking Notice: </strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-8 h-8 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
              <p className="text-xs text-charcoal-muted font-medium">Fetching real-time tracking updates from Delhivery...</p>
            </div>
          )}

          {/* Initial Blank State (Before search) */}
          {!trackingData && !error && !isLoading && (
            <div className="py-8 sm:py-12 text-center text-charcoal-subtle space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-sand flex items-center justify-center text-forest/50">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-charcoal-muted">
                Enter your Order ID (e.g. FBX-...) or Delhivery AWB above to view live progress.
              </p>
            </div>
          )}

          {/* Tracking Details View */}
          {trackingData && !isLoading && (
            <div className="space-y-6">
              {/* Status Highlight Card */}
              <div className="p-4 rounded-2xl bg-sand/60 border border-sand-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-forest text-white">
                      {trackingData.status || 'In Transit'}
                    </span>
                    <span className="text-xs font-mono font-bold text-forest">
                      AWB: {trackingData.trackingId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {trackingData.estimatedDelivery && (
                      <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-brand flex-shrink-0" />
                        <span>
                          Est. Delivery:{' '}
                          <strong className="text-forest">
                            {(() => {
                              const d = new Date(trackingData.estimatedDelivery);
                              return isNaN(d.getTime())
                                ? trackingData.estimatedDelivery
                                : d.toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  });
                            })()}
                          </strong>
                        </span>
                      </span>
                    )}

                    {trackingData.trackingId && (
                      <a
                        href={`https://www.delhivery.com/track/package/${trackingData.trackingId.replace(/[^0-9a-zA-Z]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-forest hover:text-brand hover:underline bg-forest/5 px-2 py-0.5 rounded-md"
                      >
                        <span>Delhivery Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-sand-border/60">
                  <div>
                    <span className="text-charcoal-subtle block">Courier Partner:</span>
                    <strong className="text-forest font-semibold">{trackingData.courier || 'Delhivery Express'}</strong>
                  </div>
                  <div>
                    <span className="text-charcoal-subtle block">Origin:</span>
                    <strong className="text-charcoal font-semibold">{trackingData.warehouse?.city || 'Zirakpur'}, PB</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-charcoal-subtle block">Destination:</span>
                    <strong className="text-charcoal font-semibold">
                      {trackingData.customer?.city || 'India'} ({trackingData.customer?.pincode || ''})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Visual Milestones Stepper */}
              <div>
                <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-4">
                  Delivery Progress
                </h4>
                <div className="space-y-4">
                  {trackingData.timeline?.map((step, idx) => {
                    const isDone = step.completed;
                    const isCurrent = step.current;

                    return (
                      <div key={idx} className="flex items-start gap-3 relative">
                        {/* Vertical line connecting milestones */}
                        {idx !== trackingData.timeline.length - 1 && (
                          <div
                            className={`absolute left-3.5 top-6 bottom-0 w-0.5 -mb-4 ${
                              isDone ? 'bg-forest' : 'bg-sand-border'
                            }`}
                          />
                        )}

                        {/* Icon Circle */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            isDone
                              ? 'bg-forest text-white'
                              : isCurrent
                              ? 'bg-brand text-white animate-pulse'
                              : 'bg-sand border border-sand-border text-charcoal-subtle'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Text */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${isDone || isCurrent ? 'text-forest-deep' : 'text-charcoal-subtle'}`}>
                              {step.title || step.status}
                            </span>
                            <span className="text-[10px] text-charcoal-subtle">
                              {step.timestamp
                                ? new Date(step.timestamp).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-charcoal-muted mt-0.5">
                            {step.description}
                          </p>
                          {step.location && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-brand mt-0.5">
                              <MapPin className="h-3 w-3" />
                              <span>{step.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Contents Preview */}
              {trackingData.items && trackingData.items.length > 0 && (
                <div className="pt-3 border-t border-sand-border">
                  <span className="text-xs font-bold text-charcoal block mb-2">Package Formulations:</span>
                  <div className="space-y-1.5">
                    {trackingData.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-charcoal bg-sand/40 p-2 rounded-xl">
                        <span className="truncate">
                          <strong className="text-forest">{it.quantity}x</strong> {it.title}
                        </span>
                        <span className="font-bold flex-shrink-0">
                          {formatPrice(it.price * (it.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badge at Bottom of Scroll */}
              <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 flex items-center gap-2.5 text-[11px] text-forest">
                <ShieldCheck className="h-4 w-4 text-forest flex-shrink-0" />
                <span>Tamper-evident sealed packaging & verified temperature-controlled dispatch.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
