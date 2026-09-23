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
  HeartPulse
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl border border-sand-border shadow-modal overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-forest-deep via-forest to-forest-dark text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <PhoneCall className="h-3.5 w-3.5 text-leaf" />
            <span>Free Ayurvedic Care Callback</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Request a Doctor Call Back
          </h2>
          <p className="text-xs text-sand-warm/80 mt-1">
            Leave your contact details and our certified Ayurvedic health consultants will call you back at your preferred time.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-subtle">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-forest-deep mb-2">
                Callback Request Received!
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-sm mx-auto leading-relaxed mb-6">
                Thank you! Our Ayurvedic care team has received your request and will call you back shortly during your chosen time slot.
              </p>
              <div className="p-4 rounded-2xl bg-sand border border-sand-border text-xs text-charcoal mb-6 text-left space-y-1.5 max-w-sm mx-auto">
                <p className="font-semibold text-forest flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>100% Free &amp; Confidential Consultation</span>
                </p>
                <p className="text-[11px] text-charcoal-muted">
                  • AYUSH Certified Ayurvedic Physician review<br />
                  • Dosage &amp; diet recommendations customized for you
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-colors"
              >
                Close &amp; Return to Browsing
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
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
                      className="w-full px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-charcoal-subtle">
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
                      className="w-full pl-11 pr-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
              </div>

              {/* City / Location */}
              <div>
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
                    className="w-full px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              {/* Health Topic / Concern */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Health Concern / Reason for Callback
                </label>
                <select
                  value={formData.concern}
                  onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                >
                  {HEALTH_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Call Slot */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-forest" />
                  <span>Preferred Callback Time</span>
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.id} value={slot.label}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Health Notes */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Additional Notes / Symptoms <span className="text-charcoal-subtle font-normal">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  maxLength={300}
                  placeholder="e.g. Facing joint pain in knees for 3 months, looking for Ayurvedic syrup or oil..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-sand/60 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-orange-glow transition-all flex items-center justify-center gap-2 ${
                    submitting
                      ? 'bg-charcoal-subtle text-white cursor-not-allowed'
                      : 'bg-brand hover:bg-brand-hover text-white transform active:scale-[0.99]'
                  }`}
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>{submitting ? 'Submitting Request...' : 'Request Call Back Now'}</span>
                </button>
                <p className="text-[10px] text-charcoal-subtle text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-leaf-dark" />
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
