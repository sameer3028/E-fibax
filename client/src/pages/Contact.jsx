import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  RefreshCw,
  ChevronDown,
  Lock
} from 'lucide-react';

// Strict anti-injection patterns
const INJECTION_DETECTOR = /<\s*script|<\s*\/\s*script|<\s*(iframe|object|embed|svg|img|style|link|body|input|button|form)\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|on\w+\s*=|eval\s*\(|(\${|{{|<%|%>|`)|(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from|update\s+\w+\s+set)|(;|\||&&|\$\()\s*(curl|wget|bash|sh|powershell|cmd)/i;

const NAME_REGEX = /^[a-zA-Z\s.\-']{2,60}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const LOCATION_REGEX = /^[a-zA-Z\s,\-']{2,50}$/;

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    experience: 'Pharma Distributor / Wholesaler',
    message: '',
    captchaInput: '',
    hp_field: '' // Honeypot anti-bot trap
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeFaq, setActiveFaq] = useState(0);

  // Dynamic human verification challenge (e.g. 5 + 3 = 8)
  const [captcha, setCaptcha] = useState({ num1: 5, num2: 3, answer: 8 });

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
    setFormData(prev => ({ ...prev, captchaInput: '' }));
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const faqs = [
    {
      q: 'What are the basic requirements to start an Ayurvedic PCD Pharma Franchise?',
      a: 'To start an Ayurvedic PCD franchise with Fibax Pharma, you primarily need a GST Number and basic business registration. An Ayurvedic (AYUSH) retail or wholesale drug license is helpful. We offer full marketing support, visual aids, and sample kits to help you start immediately.'
    },
    {
      q: 'Do you provide 100% District Monopoly Rights?',
      a: 'Yes, absolutely! Fibax Pharma provides strict district-wise monopoly marketing agreements. No other distributor will be authorized to sell our formulations in your assigned district territory.'
    },
    {
      q: 'What is the minimum initial investment required?',
      a: 'Our investment requirement is very flexible, starting from as low as ₹15,000 to ₹50,000 depending on your territory size and chosen product range. We believe in empowering entrepreneurs with accessible entry points.'
    },
    {
      q: 'What promotional materials do franchise partners receive?',
      a: 'All franchise associates receive free visual aids, product glossary brochures, M.R. bags, catch covers, visiting cards, reminder cards, and prescription pads with zero hidden charges.'
    },
    {
      q: 'How fast are orders dispatched?',
      a: 'All confirmed orders are processed and dispatched within 24 to 48 hours from our central warehouse via reputed express cargo partners with live tracking provided.'
    }
  ];

  // Field validator helper
  const validateField = (name, value) => {
    const val = (value || '').trim();

    // 1. Anti-Injection check across all fields
    if (INJECTION_DETECTOR.test(value)) {
      return 'Security Alert: Unsafe code, tags, or script injection characters are not permitted.';
    }

    switch (name) {
      case 'name':
        if (!val) return 'Full Name is required.';
        if (val.length < 2) return 'Name must be at least 2 characters.';
        if (val.length > 60) return 'Name cannot exceed 60 characters.';
        if (!NAME_REGEX.test(val)) {
          return 'Name may only contain letters, spaces, dots, and hyphens.';
        }
        return '';

      case 'phone': {
        const cleanDigits = val.replace(/[^0-9]/g, '');
        if (!cleanDigits) return 'Phone number is required.';
        if (!PHONE_REGEX.test(cleanDigits)) {
          return 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
        }
        return '';
      }

      case 'email':
        if (val && !EMAIL_REGEX.test(val)) {
          return 'Please enter a valid email address (e.g. name@example.com).';
        }
        if (val && val.length > 80) return 'Email cannot exceed 80 characters.';
        return '';

      case 'city':
        if (!val) return 'City / District is required.';
        if (!LOCATION_REGEX.test(val)) {
          return 'City should only contain letters, spaces, and hyphens (2-50 characters).';
        }
        return '';

      case 'state':
        if (!val) return 'State is required.';
        if (!LOCATION_REGEX.test(val)) {
          return 'State should only contain letters, spaces, and hyphens (2-50 characters).';
        }
        return '';

      case 'message':
        if (val.length > 500) {
          return 'Message cannot exceed 500 characters.';
        }
        return '';

      case 'captchaInput':
        if (!val) return 'Please answer the security verification question.';
        if (parseInt(val, 10) !== captcha.answer) {
          return 'Incorrect calculation. Please try again.';
        }
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent immediate insertion of dangerous opening tags or script tokens
    const sanitizedVal = value.replace(/[<>]/g, '');

    setFormData(prev => ({ ...prev, [name]: sanitizedVal }));
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, sanitizedVal);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Full form validator before submission
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      if (field === 'hp_field') return;
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      city: true,
      state: true,
      experience: true,
      message: true,
      captchaInput: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot bot protection
    if (formData.hp_field && formData.hp_field.trim() !== '') {
      setStatus({ submitting: false, success: false, error: 'Submission rejected.' });
      return;
    }

    const isValid = validateAll();
    if (!isValid) {
      setStatus({ submitting: false, success: false, error: 'Please correct highlighted errors before submitting.' });
      return;
    }

    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          city: `${formData.city.trim()}, ${formData.state.trim()}`,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          experience: formData.experience,
          message: formData.message.trim(),
          hp_field: formData.hp_field
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({
          name: '',
          phone: '',
          email: '',
          city: '',
          state: '',
          experience: 'Pharma Distributor / Wholesaler',
          message: '',
          captchaInput: '',
          hp_field: ''
        });
        setTouched({});
        setErrors({});
        generateCaptcha();
      } else {
        setStatus({
          submitting: false,
          success: false,
          error: data.error || 'Failed to submit enquiry. Please try again.'
        });
      }
    } catch (err) {
      setStatus({
        submitting: false,
        success: false,
        error: 'Network error. Please check your connection or call us directly.'
      });
    }
  };

  const isFormValid =
    Object.keys(errors).every(key => !errors[key]) &&
    formData.name.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.state.trim() !== '' &&
    parseInt(formData.captchaInput, 10) === captcha.answer;

  return (
    <div className="w-full bg-white">
      {/* 1. Page Hero Banner */}
      <section className="relative py-16 sm:py-20 bg-forest-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf/20 text-leaf border border-leaf/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="h-3.5 w-3.5" />
              <span>Verified Direct Channel</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Contact & Monopoly Territory Inquiries
            </h1>
            <p className="mt-4 text-sm sm:text-base text-sand-warm/80 leading-relaxed">
              Inquire for exclusive PCD Pharma Franchise rights, verified 2026 price list, or customized third-party manufacturing solutions. All communications are safeguarded and strictly confidential.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Contact Cards Strip */}
      <section className="py-10 bg-sand border-b border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-subtle flex items-start gap-4">
              <div className="p-3 rounded-xl bg-forest/10 text-forest">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-forest uppercase tracking-wider">Direct Phone Support</span>
                <div className="mt-1 space-y-0.5">
                  <a href="tel:+918872544458" className="block text-sm font-bold text-charcoal hover:text-forest">
                    +91-8872544458
                  </a>
                  <a href="tel:+917657963458" className="block text-sm font-bold text-charcoal hover:text-forest">
                    +91-7657963458
                  </a>
                </div>
                <p className="text-[11px] text-charcoal-subtle mt-1">Mon - Sat: 9:30 AM to 7:00 PM</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-subtle flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand/10 text-brand">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Email Communication</span>
                <div className="mt-1 space-y-0.5">
                  <a href="mailto:fibaxpharma@gmail.com" className="block text-sm font-bold text-charcoal hover:text-brand">
                    fibaxpharma@gmail.com
                  </a>
                  <p className="text-xs text-charcoal-muted">info@fibaxpharma.com</p>
                </div>
                <p className="text-[11px] text-charcoal-subtle mt-1">24-hour response guarantee</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-subtle flex items-start gap-4">
              <div className="p-3 rounded-xl bg-leaf/20 text-leaf-dark">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-leaf-dark uppercase tracking-wider">Corporate Headquarters</span>
                <p className="mt-1 text-xs font-bold text-charcoal leading-relaxed">
                  SCO. 29, Metro Plaza, Zirakpur, Punjab - 140603, India
                </p>
                <p className="text-[11px] text-charcoal-subtle mt-1">Near Chandigarh Tricity Pharma Hub</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Form with Field-by-Field Validation & Anti-Injection Protection */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Validated Secure Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-sand rounded-3xl p-6 sm:p-10 border border-sand-border shadow-subtle relative">
                
                {/* Security Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                    <span>Protected & Encrypted Form</span>
                  </span>
                  <span className="text-[11px] text-charcoal-subtle flex items-center gap-1">
                    <Lock className="h-3 w-3 text-leaf-dark" /> SSL Secured
                  </span>
                </div>

                <h2 className="text-2xl font-black text-forest-deep mb-1">
                  Send Your Inquiry / Check District Monopoly
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-muted mb-6">
                  Please fill out the verified form below. All input fields are strictly sanitized against automated injection.
                </p>

                {/* Success Alert */}
                {status.success && (
                  <div className="p-5 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-fadeIn">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">Thank You! Your Request Has Been Logged.</h4>
                      <p className="text-xs mt-1 text-emerald-700">
                        Our regional business development team has received your verified inquiry and will connect with you via phone or WhatsApp shortly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {status.error && (
                  <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-shake">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Notice: </strong>
                      <span>{status.error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  
                  {/* Invisible Honeypot Anti-Bot Field */}
                  <div style={{ display: 'none', position: 'absolute', opacity: 0, zIndex: -1 }}>
                    <label htmlFor="hp_field">Do not fill this field</label>
                    <input
                      type="text"
                      id="hp_field"
                      name="hp_field"
                      value={formData.hp_field}
                      onChange={(e) => setFormData({ ...formData, hp_field: e.target.value })}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Name & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal">
                          Full Name <span className="text-rose-600">*</span>
                        </label>
                        {touched.name && !errors.name && formData.name && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          required
                          maxLength={60}
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Rajesh Sharma"
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none transition-colors ${
                            touched.name && errors.name
                              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600'
                              : touched.name && formData.name
                              ? 'border-emerald-500 focus:border-emerald-600'
                              : 'border-sand-border focus:border-brand'
                          }`}
                        />
                      </div>
                      {touched.name && errors.name && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal">
                          Mobile / WhatsApp (10 digits) <span className="text-rose-600">*</span>
                        </label>
                        {touched.phone && !errors.phone && formData.phone && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-charcoal-subtle">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => {
                            const onlyDigits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            handleChange({ target: { name: 'phone', value: onlyDigits } });
                          }}
                          onBlur={handleBlur}
                          placeholder="9876543210"
                          className={`w-full pl-12 pr-4 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none transition-colors ${
                            touched.phone && errors.phone
                              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600'
                              : touched.phone && formData.phone
                              ? 'border-emerald-500 focus:border-emerald-600'
                              : 'border-sand-border focus:border-brand'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email & City Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal">
                          Email Address <span className="text-charcoal-subtle font-normal">(Optional)</span>
                        </label>
                        {touched.email && !errors.email && formData.email && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        name="email"
                        maxLength={80}
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="rajesh@example.com"
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none transition-colors ${
                          touched.email && errors.email
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600'
                            : touched.email && formData.email
                            ? 'border-emerald-500 focus:border-emerald-600'
                            : 'border-sand-border focus:border-brand'
                        }`}
                      />
                      {touched.email && errors.email && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* City / District */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal">
                          Target City / District <span className="text-rose-600">*</span>
                        </label>
                        {touched.city && !errors.city && formData.city && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        name="city"
                        required
                        maxLength={50}
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Varanasi / Jaipur"
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none transition-colors ${
                          touched.city && errors.city
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600'
                            : touched.city && formData.city
                            ? 'border-emerald-500 focus:border-emerald-600'
                            : 'border-sand-border focus:border-brand'
                        }`}
                      />
                      {touched.city && errors.city && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{errors.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State & Professional Background */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* State */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal">
                          State <span className="text-rose-600">*</span>
                        </label>
                        {touched.state && !errors.state && formData.state && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        name="state"
                        required
                        maxLength={50}
                        value={formData.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Uttar Pradesh"
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none transition-colors ${
                          touched.state && errors.state
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600'
                            : touched.state && formData.state
                            ? 'border-emerald-500 focus:border-emerald-600'
                            : 'border-sand-border focus:border-brand'
                        }`}
                      />
                      {touched.state && errors.state && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{errors.state}</span>
                        </p>
                      )}
                    </div>

                    {/* Professional Background */}
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">
                        Your Professional Background
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      >
                        <option value="Pharma Distributor / Wholesaler">Pharma Distributor / Wholesaler</option>
                        <option value="Medical Representative (M.R.)">Medical Representative (M.R.)</option>
                        <option value="Chemist / Retail Pharmacist">Chemist / Retail Pharmacist</option>
                        <option value="Doctor / Ayurvedic Practitioner">Doctor / Ayurvedic Practitioner</option>
                        <option value="New Entrepreneur">New Entrepreneur</option>
                        <option value="Third-Party Brand Owner">Third-Party Brand Owner</option>
                      </select>
                    </div>
                  </div>

                  {/* Requirements / Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-charcoal">
                        Specific Requirements or Message
                      </label>
                      <span className={`text-[10px] ${
                        formData.message.length > 450 ? 'text-amber-600 font-bold' : 'text-charcoal-subtle'
                      }`}>
                        {formData.message.length} / 500
                      </span>
                    </div>
                    <textarea
                      name="message"
                      rows="3"
                      maxLength={500}
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Inquiring for monopoly rights in Kanpur district for syrups and diabetic care products..."
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none transition-colors ${
                        touched.message && errors.message
                          ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600'
                          : 'border-sand-border focus:border-brand'
                      }`}
                    />
                    {touched.message && errors.message && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Anti-Bot Human Verification Challenge */}
                  <div className="p-3.5 bg-white border border-sand-border rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-forest">
                        <ShieldCheck className="h-4 w-4 text-leaf-dark" />
                        <span>
                          Security Verification: What is {captcha.num1} + {captcha.num2}? <span className="text-rose-600">*</span>
                        </span>
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          title="Generate new question"
                          className="p-1 text-charcoal-subtle hover:text-forest transition-colors rounded"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="w-full sm:w-28">
                        <input
                          type="text"
                          name="captchaInput"
                          required
                          maxLength={3}
                          value={formData.captchaInput}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Your answer"
                          className={`w-full px-3 py-1.5 bg-sand border rounded-xl text-xs text-center font-bold focus:outline-none ${
                            touched.captchaInput && errors.captchaInput
                              ? 'border-rose-500 bg-rose-50/20'
                              : formData.captchaInput && parseInt(formData.captchaInput, 10) === captcha.answer
                              ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                              : 'border-sand-border focus:border-brand'
                          }`}
                        />
                      </div>
                    </div>
                    {touched.captchaInput && errors.captchaInput && (
                      <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-fadeIn">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        <span>{errors.captchaInput}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status.submitting}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-orange-glow transition-all flex items-center justify-center gap-2 ${
                        status.submitting
                          ? 'bg-charcoal-subtle text-white cursor-not-allowed'
                          : 'bg-brand hover:bg-brand-hover text-white transform active:scale-[0.99]'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      <span>{status.submitting ? 'Verifying & Submitting...' : 'Submit Verified Franchise Request'}</span>
                    </button>
                    <p className="text-[10px] text-charcoal-subtle text-center mt-2">
                      🔒 All inquiries are checked against code injection and protected by strict enterprise privacy.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Quick Highlights & Map Box (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-forest text-white border border-forest-dark shadow-botanical">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
                  Franchise Benefits
                </span>
                <h3 className="text-lg font-black mb-4">Why Associate with Fibax Pharma?</h3>
                <ul className="space-y-3 text-xs text-sand-warm/90">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-leaf flex-shrink-0" />
                    <span>100% Guaranteed District Exclusivity</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-leaf flex-shrink-0" />
                    <span>250+ DCGI & AYUSH Approved Formulations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-leaf flex-shrink-0" />
                    <span>Complimentary Visual Aids, MR Bags & Catch Covers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-leaf flex-shrink-0" />
                    <span>24-48 Hours Fast Logistics Dispatch</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-leaf flex-shrink-0" />
                    <span>High Profit Margins with Lucrative Schemes</span>
                  </li>
                </ul>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <a
                    href="https://wa.me/917657963458?text=Hello%20Fibax%20Pharma,%20I%20want%20to%20apply%20for%20a%20PCD%20Franchise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-leaf text-forest-deep font-bold text-xs hover:bg-leaf-light transition-colors text-center block"
                  >
                    Quick WhatsApp Chat (+91-7657963458)
                  </a>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-6 rounded-3xl bg-sand border border-sand-border">
                <h4 className="text-sm font-bold text-forest-deep mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  <span>Strategic Hub Location</span>
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Our headquarters at Zirakpur, Punjab connects directly to the Chandigarh Tricity pharmaceutical corridor, ensuring seamless national courier connectivity, raw botanical sourcing, and express dispatch across North, Central, and South India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Franchise FAQs Section */}
      <section className="py-16 bg-sand border-t border-sand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              Common Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
              Frequently Asked Questions About Franchises
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-sand-border overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-xs sm:text-sm font-bold text-forest-deep">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-forest flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-charcoal-muted leading-relaxed border-t border-sand-border/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
