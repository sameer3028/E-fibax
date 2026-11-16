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
  ChevronDown,
  Lock,
  Leaf,
  Send,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

export const ICON_MAP = {
  phone: PhoneCall,
  shield: ShieldCheck,
  lock: Lock,
  sparkles: Sparkles,
  heart: HeartPulse,
  clock: Clock,
  check: CheckCircle2,
  leaf: Leaf,
  send: Send,
  calendar: Calendar
};

export function renderFormIcon(name, className = "h-3.5 w-3.5") {
  const IconComponent = ICON_MAP[(name || '').toLowerCase()] || PhoneCall;
  return <IconComponent className={className} />;
}

export const DEFAULT_CALLBACK_CONFIG = {
  enabled: true,
  status: 'active',
  showOnDesktop: true,
  showOnMobile: true,
  popupEnabled: true,
  header: {
    badgeText: 'FREE AYURVEDIC CARE CALLBACK',
    badgeIcon: 'phone',
    heading: 'Request a Doctor Call Back',
    description: 'Leave your contact details and our certified Ayurvedic health consultants will call you back at your preferred time.',
    bgColor: '#173e27',
    headingColor: '#ffffff',
    descriptionColor: 'rgba(243, 238, 221, 0.9)',
    badgeBgColor: 'rgba(255, 255, 255, 0.12)',
    badgeTextColor: '#6ee7b7'
  },
  fields: [
    {
      id: 'name',
      name: 'name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'e.g. Ramesh Kumar',
      required: true,
      enabled: true,
      system: true,
      order: 1
    },
    {
      id: 'phone',
      name: 'phone',
      type: 'tel',
      label: 'Mobile Number',
      placeholder: '9876543210',
      countryCode: '+91',
      required: true,
      enabled: true,
      system: true,
      order: 2
    },
    {
      id: 'city',
      name: 'city',
      type: 'text',
      label: 'City / State',
      placeholder: 'e.g. Lucknow, Uttar Pradesh',
      required: true,
      enabled: true,
      system: true,
      order: 3
    },
    {
      id: 'concern',
      name: 'concern',
      type: 'select',
      label: 'Health Concern',
      placeholder: 'Select your health concern',
      required: false,
      enabled: true,
      system: true,
      order: 4,
      options: [
        'General Ayurvedic Consultation',
        'Joint & Pain Care',
        'Digestive & Gut Health',
        'Hair & Skin Care',
        'Women\'s Wellness',
        'Men\'s Wellness',
        'Other'
      ]
    },
    {
      id: 'preferredTime',
      name: 'preferredTime',
      type: 'select',
      label: 'Preferred Callback Time',
      placeholder: 'Select preferred time',
      required: false,
      enabled: true,
      system: true,
      order: 5,
      options: [
        'As soon as possible (Next 30 mins)',
        'Within 1–2 hours',
        'Morning',
        'Afternoon',
        'Evening'
      ]
    },
    {
      id: 'notes',
      name: 'notes',
      type: 'textarea',
      label: 'Additional Notes / Symptoms',
      placeholder: 'e.g. Joint pain in knees for 3 months, looking for herbal syrup or oil recommendations...',
      maxLength: 300,
      required: false,
      enabled: true,
      system: true,
      order: 6
    }
  ],
  submitButton: {
    text: 'Request Call Back Now',
    icon: 'phone',
    bgColor: '#ea580c',
    textColor: '#ffffff',
    enabled: true
  },
  privacy: {
    enabled: true,
    message: 'Your number is 100% private. No spam, only genuine Ayurvedic assistance.',
    textColor: '#6b7280',
    icon: 'shield'
  },
  design: {
    modalBgColor: '#ffffff',
    headerBgColor: '#173e27',
    formBgColor: '#ffffff',
    borderRadius: '24px',
    desktopWidth: '520px',
    maxHeight: '90vh',
    inputBorderColor: '#e2d9cc',
    inputBgColor: '#f8f6f0',
    buttonBorderRadius: '12px'
  }
};

export function CallbackModal({
  isOpen,
  onClose,
  defaultConcern = '',
  previewConfig = null,
  inPreviewContainer = false
}) {
  const [liveConfig, setLiveConfig] = useState(previewConfig || DEFAULT_CALLBACK_CONFIG);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Sync preview config when provided from Admin editor
  useEffect(() => {
    if (previewConfig) {
      setLiveConfig(previewConfig);
    }
  }, [previewConfig]);

  // Fetch live configuration on mount or when modal opens (if not in preview)
  useEffect(() => {
    if (previewConfig) return;

    let isMounted = true;
    const fetchFormConfig = async () => {
      try {
        const res = await apiRequest('/api/website/callback-form');
        if (isMounted && res && res.success && res.data) {
          setLiveConfig(res.data);
        }
      } catch (err) {
        // Fall back gracefully to DEFAULT_CALLBACK_CONFIG
      }
    };

    fetchFormConfig();
    return () => { isMounted = false; };
  }, [previewConfig, isOpen]);

  const config = previewConfig || liveConfig || DEFAULT_CALLBACK_CONFIG;

  // Initialize form state dynamically from active fields
  useEffect(() => {
    const initial = { hp_field: '' };
    const fields = Array.isArray(config.fields) ? config.fields : [];
    fields.forEach(field => {
      if (field.id === 'concern') {
        const defaultOptions = Array.isArray(field.options) ? field.options : [];
        initial[field.id] = (defaultConcern && defaultOptions.includes(defaultConcern))
          ? defaultConcern
          : (defaultOptions[0] || '');
      } else if (field.id === 'preferredTime') {
        const defaultSlots = Array.isArray(field.options) ? field.options : [];
        initial[field.id] = defaultSlots[0] || '';
      } else {
        initial[field.id] = '';
      }
    });
    setFormData(initial);
  }, [config.fields, defaultConcern]);

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Storefront visibility checks (bypass in admin preview)
  if (!previewConfig) {
    const isPaused = config.status === 'paused' || config.enabled === false || config.popupEnabled === false;
    if (isPaused) return null;

    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      if (isMobile && config.showOnMobile === false) return null;
      if (!isMobile && config.showOnDesktop === false) return null;
    }
  }

  const enabledFields = (Array.isArray(config.fields) ? config.fields : [])
    .filter(f => f.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields dynamically
    for (const field of enabledFields) {
      if (field.required) {
        const val = formData[field.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          setError(`Please fill in required field: ${field.label}`);
          return;
        }
      }
    }

    const cleanName = (formData.name || '').trim();
    const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
    const cleanCity = (formData.city || '').trim() || 'India';

    if (enabledFields.some(f => f.id === 'name' && f.required) && cleanName.length < 2) {
      setError('Please enter a valid full name (at least 2 letters).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    // Construct enriched message from custom fields & notes
    const selectedConcern = formData.concern || 'General Ayurvedic Consultation';
    const selectedSlot = formData.preferredTime || 'Not specified';
    const notesText = (formData.notes || '').trim();

    const customFields = enabledFields.filter(f => !['name', 'phone', 'city', 'concern', 'preferredTime', 'notes'].includes(f.id));
    const customSummary = customFields.map(f => `${f.label}: ${formData[f.id] || 'N/A'}`).join(' | ');

    const messageParts = [
      selectedSlot ? `Preferred Slot: ${selectedSlot}` : '',
      notesText ? `Notes: ${notesText}` : '',
      customSummary ? `Additional Details: [${customSummary}]` : ''
    ].filter(Boolean);

    try {
      const res = await apiRequest('/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName || 'Anonymous',
          phone: cleanPhone,
          city: cleanCity,
          experience: `Callback Request - ${selectedConcern}`,
          message: messageParts.join(' | ') || 'Doctor callback request',
          hp_field: formData.hp_field
        })
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Unable to submit callback request. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if Name and Phone are both present and enabled for responsive 2-column pairing
  const hasName = enabledFields.some(f => f.id === 'name');
  const hasPhone = enabledFields.some(f => f.id === 'phone');
  const pairNamePhone = hasName && hasPhone;

  // Custom styling extracted from configuration
  const headerStyle = {
    backgroundColor: config.header?.bgColor || '#173e27',
    color: config.header?.headingColor || '#ffffff'
  };

  const badgeStyle = {
    backgroundColor: config.header?.badgeBgColor || 'rgba(255, 255, 255, 0.12)',
    color: config.header?.badgeTextColor || '#6ee7b7'
  };

  const buttonStyle = {
    backgroundColor: config.submitButton?.bgColor || '#ea580c',
    color: config.submitButton?.textColor || '#ffffff',
    borderRadius: config.design?.buttonBorderRadius || '12px'
  };

  const modalContainerStyle = {
    backgroundColor: config.design?.modalBgColor || '#ffffff',
    borderRadius: config.design?.borderRadius || '24px',
    maxWidth: inPreviewContainer ? '100%' : (config.design?.desktopWidth || '520px'),
    maxHeight: config.design?.maxHeight || '90vh'
  };

  const inputStyle = {
    borderColor: config.design?.inputBorderColor || '#e2d9cc',
    backgroundColor: config.design?.inputBgColor || '#f8f6f0'
  };

  const content = (
    <div
      style={modalContainerStyle}
      className={`relative w-full border border-sand-border shadow-modal overflow-hidden box-border flex flex-col my-auto animate-scaleIn ${
        inPreviewContainer ? 'shadow-none border-0' : 'sm:my-8'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div style={headerStyle} className="p-4 sm:p-6 md:p-7 relative box-border transition-colors">
        {!inPreviewContainer && (
          <button
            onClick={onClose}
            type="button"
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Top Badge */}
        {config.header?.badgeText && (
          <div
            style={badgeStyle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 max-w-[calc(100%-2.5rem)] shadow-2xs"
          >
            {renderFormIcon(config.header?.badgeIcon || 'phone', "h-3.5 w-3.5 flex-shrink-0")}
            <span className="truncate">{config.header.badgeText}</span>
          </div>
        )}

        {/* Main Heading */}
        <h2
          id="callback-modal-title"
          style={{ color: config.header?.headingColor || '#ffffff' }}
          className="text-lg sm:text-2xl font-black tracking-tight pr-9 sm:pr-0 leading-snug"
        >
          {config.header?.heading || 'Request a Doctor Call Back'}
        </h2>

        {/* Description */}
        {config.header?.description && (
          <p
            style={{ color: config.header?.descriptionColor || 'rgba(243, 238, 221, 0.9)' }}
            className="text-xs mt-1 sm:mt-1.5 leading-relaxed pr-2 sm:pr-0"
          >
            {config.header.description}
          </p>
        )}
      </div>

      {/* Modal Body */}
      <div
        style={{ backgroundColor: config.design?.formBgColor || '#ffffff' }}
        className="p-4 sm:p-6 md:p-8 box-border overflow-y-auto flex-1"
      >
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

            {/* Honeypot field for anti-spam */}
            <div style={{ display: 'none', position: 'absolute', opacity: 0, zIndex: -1 }}>
              <input
                type="text"
                name="hp_field"
                value={formData.hp_field || ''}
                onChange={(e) => handleFieldChange('hp_field', e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Dynamic Fields List */}
            {(() => {
              const renderedElements = [];
              let skipPhone = false;

              for (let i = 0; i < enabledFields.length; i++) {
                const field = enabledFields[i];

                // Check for paired Name + Phone in a 2-column grid
                if (field.id === 'name' && pairNamePhone && !skipPhone) {
                  const phoneField = enabledFields.find(f => f.id === 'phone');
                  if (phoneField) {
                    skipPhone = true;
                    renderedElements.push(
                      <div key="paired_name_phone" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                        {/* Name */}
                        <div className="min-w-0">
                          <label className="block text-xs font-bold text-charcoal mb-1">
                            {field.label} {field.required && <span className="text-rose-600">*</span>}
                          </label>
                          <input
                            type="text"
                            required={field.required}
                            placeholder={field.placeholder || 'e.g. Ramesh Kumar'}
                            value={formData.name || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            style={inputStyle}
                            className="w-full max-w-full box-border px-3.5 py-2.5 border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors"
                          />
                        </div>

                        {/* Phone */}
                        <div className="min-w-0">
                          <label className="block text-xs font-bold text-charcoal mb-1">
                            {phoneField.label} {phoneField.required && <span className="text-rose-600">*</span>}
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-charcoal-subtle">
                              {phoneField.countryCode || '+91'}
                            </span>
                            <input
                              type="tel"
                              required={phoneField.required}
                              maxLength={10}
                              placeholder={phoneField.placeholder || '9876543210'}
                              value={formData.phone || ''}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                handleFieldChange('phone', digits);
                              }}
                              style={inputStyle}
                              className="w-full max-w-full box-border pl-12 pr-3.5 py-2.5 border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    );
                    continue;
                  }
                }

                if (field.id === 'phone' && skipPhone) {
                  continue; // Already rendered in paired block
                }

                // Render other field types
                if (field.type === 'select') {
                  const options = Array.isArray(field.options) ? field.options : [];
                  renderedElements.push(
                    <div key={field.id} className="min-w-0">
                      <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                        {field.id === 'preferredTime' && <Clock className="h-3.5 w-3.5 text-forest flex-shrink-0" />}
                        <span>{field.label}</span>
                        {field.required && <span className="text-rose-600">*</span>}
                      </label>
                      <div className="relative">
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          style={inputStyle}
                          className="w-full max-w-full box-border px-3.5 pr-9 py-2.5 border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest focus:bg-white transition-colors appearance-none cursor-pointer truncate"
                        >
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-subtle">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  );
                } else if (field.type === 'textarea') {
                  const maxL = field.maxLength || 300;
                  const currentVal = formData[field.id] || '';
                  renderedElements.push(
                    <div key={field.id} className="min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-charcoal">
                          {field.label} {!field.required && <span className="text-charcoal-subtle font-normal">(Optional)</span>}
                          {field.required && <span className="text-rose-600 ml-0.5">*</span>}
                        </label>
                        <span className="text-[10px] text-charcoal-subtle">
                          {currentVal.length}/{maxL}
                        </span>
                      </div>
                      <textarea
                        rows="3"
                        maxLength={maxL}
                        placeholder={field.placeholder || ''}
                        value={currentVal}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        style={inputStyle}
                        className="w-full max-w-full box-border px-3.5 py-2.5 border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors resize-none leading-relaxed min-h-[76px] sm:min-h-[82px] overflow-y-auto"
                      />
                    </div>
                  );
                } else {
                  // Standard text, tel, number, email
                  renderedElements.push(
                    <div key={field.id} className="min-w-0">
                      <label className="block text-xs font-bold text-charcoal mb-1">
                        {field.label} {field.required && <span className="text-rose-600">*</span>}
                      </label>
                      <input
                        type={field.type || 'text'}
                        required={field.required}
                        placeholder={field.placeholder || ''}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        style={inputStyle}
                        className="w-full max-w-full box-border px-3.5 py-2.5 border rounded-xl text-xs text-charcoal placeholder:text-charcoal-subtle/70 focus:outline-none focus:border-forest focus:bg-white transition-colors"
                      />
                    </div>
                  );
                }
              }
              return renderedElements;
            })()}

            {/* Submit Button & Privacy */}
            {config.submitButton?.enabled !== false && (
              <div className="pt-1.5 sm:pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  style={buttonStyle}
                  className={`w-full max-w-full box-border py-3 sm:py-3.5 px-4 sm:px-6 font-bold text-xs sm:text-sm shadow-orange-glow transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    submitting
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:brightness-105 transform active:scale-[0.99]'
                  }`}
                >
                  {renderFormIcon(config.submitButton?.icon || 'phone', "h-4 w-4 flex-shrink-0")}
                  <span className="truncate">
                    {submitting ? 'Submitting Request...' : (config.submitButton?.text || 'Request Call Back Now')}
                  </span>
                </button>

                {/* Privacy Message */}
                {config.privacy?.enabled !== false && config.privacy?.message && (
                  <p
                    style={{ color: config.privacy?.textColor || '#6b7280' }}
                    className="text-[10px] sm:text-[11px] text-center mt-2 flex items-center justify-center gap-1 leading-tight"
                  >
                    {renderFormIcon(config.privacy?.icon || 'shield', "h-3 w-3 flex-shrink-0 text-leaf-dark")}
                    <span>{config.privacy.message}</span>
                  </p>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );

  if (inPreviewContainer) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="callback-modal-title"
      onClick={onClose}
    >
      {content}
    </div>
  );
}
