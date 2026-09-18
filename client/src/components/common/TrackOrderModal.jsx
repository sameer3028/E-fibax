import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (initialTrackingId) {
      setQuery(initialTrackingId);
      handleTrack(initialTrackingId);
    } else {
      setTrackingData(null);
      setError(null);
    }
  }, [initialTrackingId, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-card border border-sand-border space-y-6 my-8 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sand-border">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-forest/10 text-forest">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-forest-deep">
                Live Shipment Tracking
              </h3>
              <p className="text-xs text-charcoal-muted">
                Express Pan-India Doorstep Delivery via Delhivery Cargo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-subtle hover:bg-sand transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-charcoal-subtle" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (FBX-...) or AWB (DLH-...)"
                className="w-full pl-10 pr-4 py-2.5 bg-sand rounded-xl text-xs sm:text-sm text-charcoal font-medium border border-sand-border focus:border-forest focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              <span>{isLoading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
          <p className="text-[11px] text-charcoal-subtle">
            Tip: You can find your Order ID in your confirmation SMS/Email or in your Account dashboard.
          </p>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Tracking Notice: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Tracking Details View */}
        {trackingData && (
          <div className="space-y-6 pt-2">
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

                <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-brand" />
                  <span>
                    Est. Delivery:{' '}
                    <strong className="text-forest">
                      {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </strong>
                  </span>
                </span>
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
          </div>
        )}
      </div>
    </div>
  );
}

