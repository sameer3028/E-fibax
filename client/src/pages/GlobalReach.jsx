import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  ShieldCheck,
  Plane,
  FileCheck2,
  CheckCircle2,
  Building,
  Award,
  Truck,
  Send,
  ArrowRight,
  Package
} from 'lucide-react';
import { apiRequest } from '../utils/api';

export function GlobalReach({ onNavigate }) {
  const [inquiry, setInquiry] = useState({
    name: '',
    country: '',
    email: '',
    phone: '',
    requirement: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const exportDestinations = [
    {
      region: 'Southeast Asia',
      countries: ['Vietnam', 'Philippines', 'Malaysia', 'Singapore', 'Cambodia'],
      highlight: 'Fast-growing demand for herbal immunity & digestive tonics'
    },
    {
      region: 'Middle East & GCC',
      countries: ['United Arab Emirates', 'Saudi Arabia', 'Oman', 'Kuwait', 'Bahrain'],
      highlight: 'High preference for Halal-compliant wellness juices and oils'
    },
    {
      region: 'CIS & Central Asia',
      countries: ['Uzbekistan', 'Kazakhstan', 'Georgia', 'Armenia', 'Tajikistan'],
      highlight: 'Established registration for botanical cough & liver preparations'
    },
    {
      region: 'African Continent',
      countries: ['Kenya', 'Nigeria', 'Ghana', 'Tanzania', 'South Africa'],
      highlight: 'Broad range of general health and vitality supplements'
    }
  ];

  const complianceStandards = [
    {
      title: 'WHO-GMP Certified Plant',
      desc: 'Formulated in automated clean rooms under rigorous World Health Organization benchmarks.'
    },
    {
      title: 'CTD / ACTD Dossiers',
      desc: 'Complete Common Technical Document dossiers for rapid product registration overseas.'
    },
    {
      title: 'COPP & Free Sale Certificate',
      desc: 'Statutory Certificate of Pharmaceutical Products granted by licensing authorities.'
    },
    {
      title: 'Zone IV Stability Tested',
      desc: 'Validated for 36-month shelf life under accelerated tropical temperature and humidity.'
    },
    {
      title: 'Batch-Wise HPLC COA',
      desc: 'Certificate of Analysis accompanying every export shipment with botanical marker assay.'
    },
    {
      title: 'Multilingual Packaging',
      desc: 'Export cartons customized in English, Arabic, Russian, and French regulatory layouts.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanName = inquiry.name.replace(/[<>]/g, '').trim();
      const cleanCountry = inquiry.country.replace(/[<>]/g, '').trim();
      const cleanPhone = inquiry.phone.replace(/[^0-9+]/g, '').trim();
      const cleanEmail = inquiry.email.replace(/[<>]/g, '').trim();
      const cleanReq = inquiry.requirement.replace(/[<>]/g, '').trim();

      const data = await apiRequest('/api/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          city: `${cleanCountry} (Export Inquiry)`,
          experience: 'Global Export Partner',
          message: `Country: ${cleanCountry} | Requirement: ${cleanReq}`
        })
      });
      if (data.success) {
        setSubmitted(true);
      }
    } catch (e) {
      // Graceful
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* 1. Global Reach Hero */}
      <section className="relative py-20 bg-forest-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Globe className="h-3.5 w-3.5" />
              <span>International Trade & Export Division</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Spreading Authentic Indian Ayurveda Across the Globe
            </h1>
            <p className="mt-4 text-sm sm:text-base text-sand-warm/80 leading-relaxed">
              Fibax Pharma bridges ancient holistic therapeutics with modern international pharmaceutical compliance. From our WHO-GMP facilities in India to distribution networks in Asia, Middle East, and Africa, we deliver verified Ayurvedic solutions worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
              <a
                href="#export-inquiry"
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-orange-glow transition-all"
              >
                Inquire for International Distributorship
              </a>
              <button
                onClick={() => onNavigate && onNavigate('products')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span>Browse Exportable Formulary</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Domestic + International Network Stats */}
      <section className="py-12 bg-sand border-b border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="text-3xl font-black text-forest">28</div>
              <div className="text-xs font-bold text-charcoal mt-1">Indian States Covered</div>
              <p className="text-[11px] text-charcoal-subtle mt-0.5">500+ Cities & Districts</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="text-3xl font-black text-brand">15+</div>
              <div className="text-xs font-bold text-charcoal mt-1">Countries Export Target</div>
              <p className="text-[11px] text-charcoal-subtle mt-0.5">Asia, GCC, CIS, Africa</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="text-3xl font-black text-forest">250+</div>
              <div className="text-xs font-bold text-charcoal mt-1">Approved Formulations</div>
              <p className="text-[11px] text-charcoal-subtle mt-0.5">Ready for Dossier Filing</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs font-bold text-charcoal mt-1">WHO-GMP & AYUSH</div>
              <p className="text-[11px] text-charcoal-subtle mt-0.5">Complete Dossier Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Global Export Regions */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              International Footprint
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-forest-deep">
              Key International Target Markets
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
              Fibax Pharma partners with overseas importers, pharmacy chains, and brand distributors with dedicated regulatory assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {exportDestinations.map((dest, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-sand/60 border border-sand-border shadow-subtle hover:shadow-botanical transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-forest-deep flex items-center gap-2">
                    <Globe className="h-5 w-5 text-forest" />
                    <span>{dest.region}</span>
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-forest/10 text-forest">
                    Active Channel
                  </span>
                </div>

                <p className="text-xs text-brand font-semibold mb-4">
                  {dest.highlight}
                </p>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-2">
                    Partnering Countries:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dest.countries.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1 bg-white border border-sand-border rounded-xl text-xs font-semibold text-charcoal shadow-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Regulatory & Export Quality Compliance */}
      <section className="py-16 bg-sand border-y border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              Export Readiness
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
              International Pharmaceutical Compliance
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
              Every export consignment is manufactured under strict international pharmacopoeial and regulatory parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStandards.map((std, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-sand-border shadow-subtle">
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5 text-leaf-dark" />
                </div>
                <h4 className="text-sm font-bold text-forest-deep mb-2">{std.title}</h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">{std.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Export Inquiry Form */}
      <section id="export-inquiry" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand rounded-3xl p-8 sm:p-12 border border-sand-border shadow-botanical">
            <div className="text-center max-w-lg mx-auto mb-8">
              <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand-soft px-3 py-1 rounded-full inline-block mb-2">
                International Partners
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-forest-deep">
                Inquire for Global Import / Distributorship
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
                Connect directly with our Export Operations cell for dossiers, free sale certificates, and freight quotes.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold">Export Inquiry Submitted!</h4>
                <p className="text-xs mt-2 text-emerald-700 max-w-md mx-auto">
                  Our International Trade desk will review your country requirements and send our CTD product dossiers.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 rounded-xl bg-forest text-white text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Your Name / Title *</label>
                    <input
                      type="text"
                      required
                      value={inquiry.name}
                      onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                      placeholder="e.g. Dr. Ahmed / Mr. Tan"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Destination Country *</label>
                    <input
                      type="text"
                      required
                      value={inquiry.country}
                      onChange={(e) => setInquiry({ ...inquiry, country: e.target.value })}
                      placeholder="e.g. UAE, Malaysia, Kenya"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      required
                      value={inquiry.email}
                      onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                      placeholder="import@pharma-firm.com"
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Phone / WhatsApp with Country Code *</label>
                    <input
                      type="tel"
                      required
                      value={inquiry.phone}
                      onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
                      placeholder="+971 50 ... or +60 12 ..."
                      className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Target Products / Formulations & Quantities</label>
                  <textarea
                    rows="3"
                    value={inquiry.requirement}
                    onChange={(e) => setInquiry({ ...inquiry, requirement: e.target.value })}
                    placeholder="Specify target products (e.g. Syrups, Juices, Capsules), expected consignment size, and dossier requirements..."
                    className="w-full px-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand text-white font-bold text-xs sm:text-sm hover:bg-brand-hover shadow-orange-glow transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Transmit Export Inquiry</span>
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
