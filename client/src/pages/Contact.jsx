import React, { useState, useEffect } from 'react';
import {
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
  Lock,
  Headphones,
  Truck,
  HelpCircle,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { apiRequest } from '../utils/api';

// Strict anti-injection patterns
const INJECTION_DETECTOR = /<\s*script|<\s*\/\s*script|<\s*(iframe|object|embed|svg|img|style|link|body|input|button|form)\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|on\w+\s*=|eval\s*\(|(\${|{{|<%|%>|`)|(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from|update\s+\w+\s+set)|(;|\||&&|\$\()\s*(curl|wget|bash|sh|powershell|cmd)/i;

const NAME_REGEX = /^[a-zA-Z\s.\-']{2,60}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const LOCATION_REGEX = /^[a-zA-Z\s,\-']{2,50}$/;

export function Contact({ onOpenCallback }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    experience: 'Customer / Personal Health Concern',
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
      q: 'How do I know which Ayurvedic formulation is right for my condition?',
      a: 'You can speak directly with our certified Ayurvedic doctors and health consultants via phone, WhatsApp, or the inquiry form. We assess your constitution (Dosha/Prakriti) and current health concerns to recommend the ideal herbal remedy.'
    },
    {
      q: 'Are Fibax Ayurveda products 100% natural, vegetarian, and safe?',
      a: 'Yes, absolutely! Every formulation is 100% vegetarian, non-GMO, and free from heavy metals, harmful preservatives, steroids, and artificial chemicals. All remedies are produced in WHO-GMP and Ministry of AYUSH licensed cleanroom facilities.'
    },
    {
      q: 'How long does delivery take and can I track my order?',
      a: 'Orders are dispatched within 24 to 48 hours via Delhivery Express Cargo. You will receive real-time SMS/email tracking updates, and you can also track your shipment status anytime inside your Fibax Customer Account.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD) across India?',
      a: 'Yes! We offer Cash on Delivery (COD) as well as secure online prepaid payment options (UPI, GPay, PhonePe, Cards, Net Banking) across all serviceable pin codes in India with free shipping on orders above ₹499.'
    },
    {
      q: 'Can I take these herbal formulations alongside my allopathic medications?',
      a: 'Most Ayurvedic formulations can be safely consumed with a 1 to 2 hour interval from allopathic drugs. However, we always recommend consulting your physician or our Ayurvedic team for personalized guidance.'
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
      const data = await apiRequest('/api/enquiry', {
        method: 'POST',
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

      if (data.success) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({
          name: '',
          phone: '',
          email: '',
          city: '',
          state: '',
          experience: 'Customer / Personal Health Concern',
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
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Direct Customer Care &amp; Support</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Contact Us &amp; Ayurvedic Support
            </h1>
            <p className="mt-4 text-sm sm:text-base text-sand-warm/80 leading-relaxed">
              Have questions about our formulations, orders, or need dosage advice? Fill out the verified support form below or reach our team via official email. All inquiries receive direct attention from our care specialists.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Support Information Cards Strip */}
      <section className="py-10 bg-sand border-b border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-subtle flex items-start gap-4">
              <div className="p-3 rounded-xl bg-forest/10 text-forest">
                <Headphones className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-forest uppercase tracking-wider">Online Helpdesk</span>
                <p className="mt-1 text-sm font-bold text-charcoal">
                  Direct Inquiries &amp; Care
                </p>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Submit the inquiry form below for prompt assistance
                </p>
                <p className="text-[11px] text-charcoal-subtle mt-1.5 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-leaf-dark" />
                  <span>Mon - Sat: 9:30 AM – 7:00 PM IST</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-subtle flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand/10 text-brand">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Official Email Support</span>
                <div className="mt-1 space-y-0.5">
                  <a href="mailto:info@fibaxpharma.com" className="block text-sm font-bold text-charcoal hover:text-brand transition-colors">
                    info@fibaxpharma.com
                  </a>
                  <a href="mailto:fibaxpharma@gmail.com" className="block text-xs font-medium text-charcoal-muted hover:text-brand transition-colors">
                    fibaxpharma@gmail.com
                  </a>
                </div>
                <p className="text-[11px] text-charcoal-subtle mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Guaranteed response within 24 hours</span>
                </p>
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
                <p className="text-[11px] text-charcoal-subtle mt-1.5">
                  WHO-GMP &amp; AYUSH Licensed Manufacturing
                </p>
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
                  Send Us a Message / Consultation Request
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-muted mb-6">
                  Please fill out the verified form below. Our Ayurvedic consultants and customer care team will respond within 2-4 hours.
                </p>

                {/* Success Alert */}
                {status.success && (
                  <div className="p-5 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-fadeIn">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">Thank You! Your Request Has Been Logged.</h4>
                      <p className="text-xs mt-1 text-emerald-700">
                        Our Ayurvedic health advisors will connect with you via phone or WhatsApp shortly to assist you with your inquiry or consultation.
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

                    {/* Purpose of Inquiry */}
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">
                        Purpose of Inquiry / Background
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      >
                        <option value="Customer / Personal Health Concern">Customer / Personal Health Concern</option>
                        <option value="Product Inquiry & Dosage Advice">Product Inquiry &amp; Dosage Advice</option>
                        <option value="Order Tracking & Delivery Support">Order Tracking &amp; Delivery Support</option>
                        <option value="Ayurvedic Doctor / Clinic Consultation">Ayurvedic Doctor / Clinic Consultation</option>
                        <option value="Bulk / Family Wellness Pack">Bulk / Family Wellness Pack</option>
                        <option value="General Feedback / Other">General Feedback / Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Requirements / Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-charcoal">
                        Specific Health Concern, Order Query or Message
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
                      placeholder="e.g. Inquiring about Axe-Ortho oil dosage for joint pain, or asking about delivery timeline..."
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
                      <span>{status.submitting ? 'Verifying & Submitting...' : 'Send Message to Health Experts'}</span>
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
                  The Fibax Promise
                </span>
                <h3
                  style={{ color: '#ffffff' }}
                  className="text-lg font-black text-white !text-white mb-4"
                >
                  Why Choose Fibax Ayurveda?
                </h3>
                <ul className="space-y-3 text-xs text-white">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                    <span style={{ color: '#ffffff' }} className="text-white !text-white">
                      100% Certified WHO-GMP &amp; Ministry of AYUSH Formulations
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                    <span style={{ color: '#ffffff' }} className="text-white !text-white">
                      Pure Himalayan Botanicals &amp; Zero Harmful Chemicals
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                    <span style={{ color: '#ffffff' }} className="text-white !text-white">
                      Ayurvedic Doctor Consultations &amp; Dosage Guidance
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                    <span style={{ color: '#ffffff' }} className="text-white !text-white">
                      24-48 Hours Express Dispatch with Live Delhivery Tracking
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                    <span style={{ color: '#ffffff' }} className="text-white !text-white">
                      Pan-India Cash on Delivery (COD) &amp; Easy Returns
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <a
                    href="mailto:info@fibaxpharma.com"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors text-center block"
                  >
                    Email Support Desk (info@fibaxpharma.com)
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

      {/* 4. FAQs Section */}
      <section className="py-16 bg-sand border-t border-sand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              Common Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
              Frequently Asked Questions (FAQ)
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
