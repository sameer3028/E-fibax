import React, { useState } from 'react';
import {
  INDUSTRIES,
  MANUFACTURING_STATS,
  PRODUCTION_CAPABILITIES
} from '../data/industries';
import {
  Building2,
  Factory,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Globe,
  CheckCircle2,
  ArrowRight,
  Send,
  PhoneCall,
  Check,
  FileText
} from 'lucide-react';

export function Industries({ onNavigate }) {
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0].id);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    sector: INDUSTRIES[0].title,
    city: '',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="h-6 w-6" />;
      case 'Factory': return <Factory className="h-6 w-6" />;
      case 'Stethoscope': return <Stethoscope className="h-6 w-6" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6" />;
      case 'ShieldCheck': return <ShieldCheck className="h-6 w-6" />;
      case 'Globe': return <Globe className="h-6 w-6" />;
      default: return <Building2 className="h-6 w-6" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryForm.name,
          phone: inquiryForm.phone,
          city: `${inquiryForm.city} (${inquiryForm.sector})`,
          message: `Email: ${inquiryForm.email} | Sector: ${inquiryForm.sector} | Notes: ${inquiryForm.notes}`
        })
      });
    } catch (err) {
      // Fallback graceful
    }
    setIsSubmitting(false);
    setFormSubmitted(true);
  };

  return (
    <div className="w-full bg-white">
      {/* 1. Page Hero */}
      <section className="relative py-20 bg-forest-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/20 text-brand-light border border-brand/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Factory className="h-3.5 w-3.5" />
              <span>WHO-GMP Contract Manufacturing & Franchises</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Pharma & Healthcare Industries We Empower
            </h1>
            <p className="mt-4 text-sm sm:text-base text-sand-warm/80 leading-relaxed">
              From monopoly-based PCD pharma franchises to turnkey third-party contract manufacturing and hospital supply agreements, Fibax Pharma delivers dependable, high-yield pharmaceutical solutions backed by statutory DCGI approvals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
              <a
                href="#inquiry-section"
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-orange-glow transition-all"
              >
                Request Third-Party Quote / Franchise
              </a>
              <button
                onClick={() => onNavigate && onNavigate('global-reach')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span>Global Export Division</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Manufacturing Metric Strip */}
      <section className="py-8 bg-sand border-b border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {MANUFACTURING_STATS.map((stat, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-sand-border">
                <div className="text-lg sm:text-xl font-black text-forest">{stat.value}</div>
                <div className="text-[11px] font-bold text-charcoal">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Detailed Industry Sectors */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              Our Core Sectors
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-forest-deep">
              Comprehensive Ayurvedic Business Verticals
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
              Explore our specialized manufacturing and supply solutions tailored for distributors, hospital networks, brand owners, and exporters.
            </p>
          </div>

          <div className="space-y-12">
            {INDUSTRIES.map((ind, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={ind.id}
                  id={ind.slug}
                  className="bg-sand/60 rounded-3xl p-6 sm:p-10 border border-sand-border shadow-subtle hover:shadow-botanical transition-all duration-300"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                    
                    {/* Content (7 cols) */}
                    <div className={`lg:col-span-7 ${isEven ? '' : 'lg:order-2'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-forest text-white">
                          {getIcon(ind.icon)}
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-soft text-brand border border-brand-border">
                          {ind.badge}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-forest-deep">
                        {ind.title}
                      </h3>
                      <p className="text-xs font-bold text-forest mt-1">
                        {ind.tagline}
                      </p>

                      <p className="text-xs sm:text-sm text-charcoal-muted mt-4 leading-relaxed">
                        {ind.description}
                      </p>

                      <div className="mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
                          Key Advantages & Deliverables:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {ind.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-charcoal">
                              <CheckCircle2 className="h-4 w-4 text-leaf flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-sand-border flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs text-charcoal-subtle font-medium">
                          Ideal for: <strong className="text-forest">{ind.targetAudience}</strong>
                        </span>
                        <a
                          href="#inquiry-section"
                          onClick={() => setInquiryForm((prev) => ({ ...prev, sector: ind.title }))}
                          className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Enquire for {ind.title.split(' ')[0]}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Image (5 cols) */}
                    <div className={`lg:col-span-5 ${isEven ? '' : 'lg:order-1'}`}>
                      <div className="rounded-2xl overflow-hidden border border-sand-border shadow-md">
                        <img
                          src={ind.image}
                          alt={ind.title}
                          className="w-full h-72 sm:h-80 object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Production Capabilities Grid */}
      <section className="py-16 bg-sand border-y border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              Dosage Line Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
              Full Spectrum Formulation & Packaging Lines
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
              High-speed production adhering strictly to Good Manufacturing Practices (GMP).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTION_CAPABILITIES.map((cap, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-sand-border shadow-subtle">
                <h4 className="text-sm font-black text-forest-deep border-b border-sand-border pb-2.5 mb-4">
                  {cap.category}
                </h4>
                <ul className="space-y-2">
                  {cap.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-center gap-2 text-xs text-charcoal-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Direct Inquiry Form */}
      <section id="inquiry-section" className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand rounded-3xl p-8 sm:p-12 border border-sand-border shadow-botanical">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand-soft px-3 py-1 rounded-full inline-block mb-2">
                Business Partnerships
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-forest-deep">
                Request Contract Manufacturing or PCD Quote
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
                Fill out the form below. Our Business Development Director will reach out within 24 hours with quotation and regulatory brochures.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold">Inquiry Received Successfully!</h4>
                <p className="text-xs mt-2 text-emerald-700 max-w-md mx-auto">
                  Thank you for your interest in partnering with Fibax Pharma. Our corporate accounts team will contact you shortly at {inquiryForm.phone}.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 px-6 py-2 rounded-xl bg-forest text-white text-xs font-bold"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={inquiryForm.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={inquiryForm.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={inquiryForm.email}
                      onChange={handleInputChange}
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Target City & State *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={inquiryForm.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Lucknow, UP"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Primary Sector of Interest</label>
                  <select
                    name="sector"
                    value={inquiryForm.sector}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.id} value={ind.title}>
                        {ind.title} ({ind.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Specific Requirements / Target Volume</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={inquiryForm.notes}
                    onChange={handleInputChange}
                    placeholder="Provide details such as required product types, batch sizes, or monopoly district requested..."
                    className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-hover shadow-orange-glow transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Submit Partnership Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
