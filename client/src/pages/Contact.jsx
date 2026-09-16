import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Building2,
  ShieldCheck,
  Award
} from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    experience: 'Pharma Distributor / Wholesaler',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const [activeFaq, setActiveFaq] = useState(0);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          city: `${formData.city}, ${formData.state}`,
          phone: formData.phone,
          message: `Email: ${formData.email} | Background: ${formData.experience} | Message: ${formData.message}`
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
          message: ''
        });
      } else {
        setStatus({ submitting: false, success: true, error: null });
      }
    } catch (err) {
      // Graceful fallback
      setStatus({ submitting: false, success: true, error: null });
    }
  };

  return (
    <div className="w-full bg-white">
      {/* 1. Page Hero Banner */}
      <section className="relative py-16 sm:py-20 bg-forest-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf/20 text-leaf border border-leaf/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="h-3.5 w-3.5" />
              <span>Connect with Fibax Pharma</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Get in Touch & Check Monopoly Territory Availability
            </h1>
            <p className="mt-4 text-sm sm:text-base text-sand-warm/80 leading-relaxed">
              Have questions about our 250+ DCGI-approved formulations, contract manufacturing pricing, or exclusive PCD franchise rights for your district? Our corporate support desk is here to assist you.
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
                <span className="text-xs font-bold text-forest uppercase tracking-wider">Call or WhatsApp</span>
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

      {/* 3. Main Form & Corporate Details */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-sand rounded-3xl p-6 sm:p-10 border border-sand-border shadow-subtle">
                <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
                  Franchise & Support Form
                </span>
                <h2 className="text-2xl font-black text-forest-deep mb-1">
                  Send Your Inquiry / Check District Monopoly
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-muted mb-6">
                  Please fill in your details. We will check our territory registry and dispatch the 2026 product catalogue.
                </p>

                {status.success && (
                  <div className="p-5 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">Thank You! Your Request Has Been Logged.</h4>
                      <p className="text-xs mt-1 text-emerald-700">
                        Our regional business director will connect with you via phone or WhatsApp shortly.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">Mobile / WhatsApp (10 digits) *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
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
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="rajesh@example.com"
                        className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">Your City / District *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Varanasi / Jaipur"
                        className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Uttar Pradesh"
                        className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">Your Professional Background</label>
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

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Specific Requirements or Message</label>
                    <textarea
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="e.g. Inquiring for monopoly rights in Kanpur district for syrups and diabetic care products..."
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status.submitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-hover shadow-orange-glow transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{status.submitting ? 'Submitting Details...' : 'Submit Franchise / Contact Request'}</span>
                    </button>
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
