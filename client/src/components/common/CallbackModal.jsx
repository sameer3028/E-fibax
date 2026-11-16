import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  HeartPulse,
  ChevronDown
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

const TIME_SLOTS = [
  { id: 'asap', label: 'As soon as possible (Next 30 mins)' },
  { id: 'morning', label: 'Morning (10:00 AM – 1:00 PM)' },
  { id: 'afternoon', label: 'Afternoon (1:00 PM – 5:00 PM)' },
  { id: 'evening', label: 'Evening (5:00 PM – 8:00 PM)' }
];

const HEALTH_TOPICS = [
  'General Ayurvedic Consultation',
  'Joint & Arthritis Pain Relief',
  'Digestive & Gut Health / Acidity',
  'Liver Health & Detoxification',
  'Kidney & Urinary Care',
  'Diabetes & Blood Sugar Balance',
  'Men\'s Vitality & Stamina',
  'Women\'s Hormonal Wellness',
  'Skin, Hair & Personal Care',
  'Product Dosage & Usage Guidance',
  'Order Status & Delivery Query'
];

export function CallbackModal({ isOpen, onClose, defaultConcern = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    concern: defaultConcern || HEALTH_TOPICS[0],
    preferredTime: TIME_SLOTS[0].label,
    notes: '',
    hp_field: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (defaultConcern && HEALTH_TOPICS.includes(defaultConcern)) {
      setFormData(prev => ({ ...prev, concern: defaultConcern }));
    }
  }, [defaultConcern]);

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    const cleanCity = formData.city.trim() || 'India';

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (at least 2 letters).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiRequest('/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          city: cleanCity,
          experience: `Callback Request - ${formData.concern}`,
          message: `Preferred Slot: ${formData.preferredTime} | Notes: ${formData.notes.trim() || 'None'}`,
          hp_field: formData.hp_field
        })
      });

      if (res.success) {
        setSuccess(true);
        setFormData({
          name: '',
          phone: '',
          city: '',
          concern: HEALTH_TOPICS[0],
          preferredTime: TIME_SLOTS[0].label,
          notes: '',
          hp_field: ''
        });
      } else {
        setError(res.error || 'Unable to submit callback request. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="callback-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-sand-border shadow-modal overflow-hidden my-auto sm:my-8 box-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-forest-deep via-forest to-forest-dark text-white p-4 sm:p-6 md:p-7 relative box-border">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 max-w-[calc(100%-2.5rem)]">
            <PhoneCall className="h-3.5 w-3.5 text-leaf flex-shrink-0" />
            <span className="truncate">Free Ayurvedic Care Callback</span>
          </div>

          <h2 id="callback-modal-title" className="text-lg sm:text-2xl font-black tracking-tight text-white pr-9 sm:pr-0 leading-snug">
            Request a Doctor Call Back
          </h2>
          <p className="text-xs text-sand-warm/90 mt-1 sm:mt-1.5 leading-relaxed pr-2 sm:pr-0">
            Leave your contact details and our certified Ayurvedic health consultants will call you back at your preferred time.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-8 box-border">
          {success ? (
            <div className="text-center py-4 sm:py-6 animate-fadeIn">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3 sm:mb-4 shadow-subtle">
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-forest-deep mb-2">
                Callback Request Received!
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-sm mx-auto leading-relaxed mb-5 sm:mb-6">
                Thank you! Our Ayurvedic care team has received your request and will call you back shortly during your chosen time slot.
              </p>
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-sand border border-sand-border text-xs text-charcoal mb-5 sm:mb-6 text-left space-y-1.5 max-w-sm mx-auto">
                <p className="font-semibold text-forest flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Free &amp; Confidential Consultation</span>
                </p>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  • AYUSH Certified Ayurvedic Physician review<br />
                  • Dosage &amp; diet recommendations customized for you
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors cursor-pointer"
              >
                Close &amp; Return to Browsing
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
              {error && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Invisible Honeypot anti-spam field */}
              <div style={{ display: 'none', position: 'absolute', opacity: 0, zIndex: -1 }}>
                <input
                  type="text"
                  name="hp_field"
                  value={formData.hp_field}
                  onChange={(e) => setFormData({ ...formData, hp_field: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full max-w-full box-border px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-charcoal-subtle">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: digits });
                      }}
                      className="w-full max-w-full box-border pl-12 pr-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* City / Location */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-charcoal mb-1">
                  City / State <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucknow, Uttar Pradesh"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full max-w-full box-border px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Health Topic / Concern */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Health Concern / Reason for Callback
                </label>
                <div className="relative">
                  <select
                    value={formData.concern}
                    onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                    className="w-full max-w-full box-border px-3.5 pr-9 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest focus:bg-white transition-colors appearance-none cursor-pointer truncate"
                  >
                    {HEALTH_TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-subtle">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Preferred Call Slot */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-forest flex-shrink-0" />
                  <span>Preferred Callback Time</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full max-w-full box-border px-3.5 pr-9 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest focus:bg-white transition-colors appearance-none cursor-pointer truncate"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.id} value={slot.label}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-subtle">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Additional Notes / Symptoms */}
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-charcoal">
                    Additional Notes / Symptoms <span className="text-charcoal-subtle font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-charcoal-subtle">
                    {formData.notes.length}/300
                  </span>
                </div>
                <textarea
                  rows="3"
                  maxLength={300}
                  placeholder="e.g. Joint pain in knees for 3 months, looking for herbal syrup or oil recommendations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full max-w-full box-border px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors resize-none leading-relaxed min-h-[76px] sm:min-h-[82px] overflow-y-auto"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-1.5 sm:pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full max-w-full box-border py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm shadow-orange-glow transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    submitting
                      ? 'bg-charcoal-subtle text-white cursor-not-allowed'
                      : 'bg-brand hover:bg-brand-hover text-white transform active:scale-[0.99]'
                  }`}
                >
                  <PhoneCall className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{submitting ? 'Submitting Request...' : 'Request Call Back Now'}</span>
                </button>
                <p className="text-[10px] sm:text-[11px] text-charcoal-subtle text-center mt-2 flex items-center justify-center gap-1 leading-tight">
                  <ShieldCheck className="h-3 w-3 text-leaf-dark flex-shrink-0" />
                  <span>Your number is 100% private. No spam, only genuine Ayurvedic assistance.</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
