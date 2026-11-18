import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { apiRequest } from '../utils/api';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Package,
  Layers,
  MapPin,
  Headphones,
  Truck,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  Building2,
  Users,
  Briefcase,
  HelpCircle,
  FileCheck,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  DollarSign,
  TrendingUp,
  FlaskConical,
  Droplet,
  Pill,
  Heart
} from 'lucide-react';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function FranchisePage({ onNavigate }) {
  const { products } = useProducts();
  const formRef = useRef(null);

  // CMS Content State
  const [cms, setCms] = useState(null);
  const [loadingCms, setLoadingCms] = useState(true);

  // Category Filter for Products Section
  const [selectedCategory, setSelectedCategory] = useState('all');

  // FAQ Accordion State (open question indices)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    sameAsMobile: true,
    email: '',
    state: '',
    city: '',
    businessType: 'Pharma Distributor',
    experience: '2 to 5 years',
    investmentRange: '₹1,00,000 - ₹2,50,000',
    message: '',
    consent: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedLead, setSubmittedLead] = useState(null);

  // Load Franchise CMS Content from API
  useEffect(() => {
    let isMounted = true;
    apiRequest('/api/franchise/content')
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setCms(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load franchise CMS:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCms(false);
      });
    return () => { isMounted = false; };
  }, []);

  // SEO Meta and Schema Injection
  useEffect(() => {
    document.title = 'Ayurvedic PCD Pharma Franchise | Fibax Ayurveda';

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Explore Ayurvedic PCD Pharma Franchise opportunities with Fibax Ayurveda. Enquire about our herbal product portfolio and franchise business opportunities across India.';

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://fibaxpharma.com/pcd-pharma-franchise';

    // JSON-LD Structured Data
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'pcd-franchise-schema';
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Ayurvedic PCD Pharma Franchise',
      'provider': {
        '@type': 'Organization',
        'name': 'Fibax Ayurveda',
        'url': 'https://fibaxpharma.com',
        'logo': 'https://fibaxpharma.com/fibax-logo.png',
        'telephone': '+918872544458',
        'email': 'info@fibaxpharma.com'
      },
      'areaServed': 'India',
      'serviceType': 'Pharma Franchise & Monopoly Distribution Rights',
      'description': 'Propaganda Cum Distribution (PCD) Pharma Franchise opportunities for classical and proprietary Ayurvedic formulations with marketing collateral and pan-India dispatch.'
    });

    const oldSchema = document.getElementById('pcd-franchise-schema');
    if (oldSchema) oldSchema.remove();
    document.head.appendChild(schemaScript);

    return () => {
      const el = document.getElementById('pcd-franchise-schema');
      if (el) el.remove();
    };
  }, []);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'phone' && prev.sameAsMobile) {
        updated.whatsapp = value;
      }
      return updated;
    });
    setFormError('');
  };

  const handleSameAsMobileToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      sameAsMobile: checked,
      whatsapp: checked ? prev.phone : ''
    }));
  };

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();
    setFormError('');

    // Frontend validation
    if (!formData.name || formData.name.trim().length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    const standardPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91')
      ? cleanPhone.slice(2)
      : cleanPhone.length === 11 && cleanPhone.startsWith('0')
      ? cleanPhone.slice(1)
      : cleanPhone.slice(-10);

    if (standardPhone.length !== 10 || !/^[6-9]\d{9}$/.test(standardPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!formData.state) {
      setFormError('Please select your state.');
      return;
    }

    if (!formData.city || formData.city.trim().length < 2) {
      setFormError('Please enter your target district or city.');
      return;
    }

    if (!formData.consent) {
      setFormError('Please accept the consent terms to submit your franchise enquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        phone: standardPhone,
        whatsapp: formData.sameAsMobile ? standardPhone : formData.whatsapp
      };

      const res = await apiRequest('/api/franchise/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        setSubmittedLead({
          id: res.leadId,
          name: formData.name,
          city: formData.city,
          state: formData.state,
          phone: standardPhone
        });
      } else {
        setFormError(res.error || 'Failed to submit enquiry. Please try again or reach us on WhatsApp.');
      }
    } catch (err) {
      setFormError(err.message || 'Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Content defaults
  const heroData = cms?.hero || {
    badge: 'WHO-GMP & AYUSH PREMIUM QUALITY ASSURED',
    heading: 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
    subtitle: 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.',
    bannerImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80',
    primaryCta: 'Apply for Franchise',
    secondaryCta: 'WhatsApp Enquiry',
    whatsappNumber: '918872544458',
    helplineNumber: '+91 88725 44458'
  };

  const benefitsList = cms?.benefits || [
    {
      id: 'ben_1',
      title: 'Wide Ayurvedic Product Portfolio',
      description: 'Access 250+ clinically standardized Ayurvedic formulations across classical syrups, oils, capsules, churnas, and vati.',
      icon: 'Package'
    },
    {
      id: 'ben_2',
      title: 'Marketing and Promotional Support',
      description: 'Receive comprehensive marketing literature, visual aids, MR bags, visiting cards, catch covers, and product glossaries.',
      icon: 'Sparkles'
    },
    {
      id: 'ben_3',
      title: 'Product and Packaging Information',
      description: 'Premium alu-alu and blister packaging with tamper-proof seals, transparent herbal compositions, and batch lab test certificates.',
      icon: 'ShieldCheck'
    },
    {
      id: 'ben_4',
      title: 'Business Enquiry Assistance',
      description: 'Prompt quotations, dedicated relationship executives, transparent billing, and dedicated assistance for all commercial queries.',
      icon: 'Headphones'
    },
    {
      id: 'ben_5',
      title: 'Territory-Based Franchise Opportunities',
      description: 'Mutually agreed district and territory distribution partnerships ensuring focused local market growth without channel conflict.',
      icon: 'MapPin'
    },
    {
      id: 'ben_6',
      title: 'Dedicated Business Communication',
      description: 'Reliable dispatch tracking via Delhivery, structured dispatch timelines, and regular pipeline updates directly from headquarters.',
      icon: 'Truck'
    }
  ];

  const processSteps = cms?.processSteps || [
    { step: 1, title: 'Submit Franchise Enquiry', description: 'Fill the quick franchise enquiry form with your contact details, target territory, and background.' },
    { step: 2, title: 'Our Team Contacts You', description: 'Our senior business development manager reviews your application and reaches out within 24-48 business hours.' },
    { step: 3, title: 'Territory & Business Discussion', description: 'We discuss available territory rights, product margins, quotation terms, and order minimums tailored to your district.' },
    { step: 4, title: 'Documentation & Verification', description: 'Submit basic KYC, GSTIN, and relevant business registrations to establish authorized distribution credentials.' },
    { step: 5, title: 'Franchise Approval & Onboarding', description: 'Receive official franchise approval, promotional starter kit, marketing collateral, and first stock dispatch.' }
  ];

  const targetAudience = cms?.targetAudience || [
    { title: 'Pharma Distributors', description: 'Established distribution firms aiming to expand their portfolio with proven, high-demand Ayurvedic lines.' },
    { title: 'Medical Representatives', description: 'Experienced pharma professionals seeking to transition into independent entrepreneurship with company backing.' },
    { title: 'Pharma Wholesalers', description: 'Stockists and wholesale medicine traders looking for competitive trade discounts and reliable supply chains.' },
    { title: 'Ayurvedic Product Retailers', description: 'Retail pharmacies, chemists, and Ayurvedic clinics wishing to stock authentic classical remedies.' },
    { title: 'New Business Entrepreneurs', description: 'Aspiring entrepreneurs entering India\'s high-growth herbal healthcare and botanical wellness ecosystem.' }
  ];

  const faqsList = cms?.faqs || [];

  // Filter products for Section C
  const allProductsList = Array.isArray(products) && products.length > 0 ? products : [];
  const displayProducts = selectedCategory === 'all'
    ? allProductsList.slice(0, 8)
    : allProductsList.filter((p) => {
        const cat = String(p.category || '').toLowerCase();
        const dosage = String(p.dosageForm || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        return cat.includes(sel) || dosage.includes(sel);
      }).slice(0, 8);

  // If page is explicitly paused by Admin
  if (cms && cms.isActive === false) {
    return (
      <div className="min-h-[70vh] bg-[#F4F6F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-sand-border text-center shadow-subtle space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-forest">Franchise Program Temporarily Paused</h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Our PCD Pharma Franchise territory allocations are currently undergoing scheduled review. For immediate enterprise queries, please contact our helpline directly.
          </p>
          <div className="pt-2">
            <a
              href="tel:+918872544458"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-deep transition-colors"
            >
              <PhoneCall className="h-4 w-4" /> Call +91 88725 44458
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFE] text-charcoal font-sans">
      
      {/* ======================================================== */}
      {/* SECTION A: HERO BANNER                                    */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#13382D] via-[#1B4D3E] to-[#164336] text-white py-16 sm:py-24 lg:py-28">
        {/* Subtle Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-xs">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>{heroData.badge}</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-[1.15]">
                {heroData.heading}
              </h1>

              {/* Subtitle */}
              <p className="text-sand/90 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed font-normal">
                {heroData.subtitle}
              </p>

              {/* Key Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-sand/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Pan-India Rights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>250+ AYUSH Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Promotional Support</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{heroData.primaryCta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href={`https://wa.me/${heroData.whatsappNumber || '918872544458'}?text=Hello%20Fibax%20Ayurveda%2C%20I%20am%20interested%20in%20an%20Ayurvedic%20PCD%20Pharma%20Franchise%20for%20my%20district`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>{heroData.secondaryCta}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-forest-deep/60 backdrop-blur-md">
                <img
                  src={heroData.bannerImage}
                  alt="Ayurvedic PCD Pharma Manufacturing & Lab"
                  className="w-full h-80 sm:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Overlay Badge Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-charcoal shadow-lg border border-sand-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest text-gold flex items-center justify-center flex-shrink-0 font-black text-sm">
                      GMP
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-xs text-forest uppercase tracking-wider">
                        Authorized Distribution
                      </h4>
                      <p className="text-[11px] text-charcoal-muted leading-tight mt-0.5">
                        Direct company dispatch with genuine batch test certificates & billing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION B: WHY CHOOSE FIBAX AYURVEDA?                     */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-20 bg-white border-b border-sand-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full">
              Commercial Advantages
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-forest tracking-tight">
              Why Partner with Fibax Ayurveda?
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              We provide transparent franchise policies, premium classical formulations, and dedicated ground support to help pharma professionals scale sustainable businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {benefitsList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#FAFBF9] border border-sand-border hover:border-forest/40 hover:shadow-subtle transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-gold transition-colors">
                    {idx === 0 && <Package className="h-6 w-6" />}
                    {idx === 1 && <Sparkles className="h-6 w-6" />}
                    {idx === 2 && <ShieldCheck className="h-6 w-6" />}
                    {idx === 3 && <Headphones className="h-6 w-6" />}
                    {idx === 4 && <MapPin className="h-6 w-6" />}
                    {idx === 5 && <Truck className="h-6 w-6" />}
                    {idx > 5 && <Award className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-charcoal group-hover:text-forest transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed mt-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-sand-border/60 mt-4 flex items-center gap-1.5 text-[11px] font-bold text-forest">
                  <span>Verified Standard</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION C: PRODUCT PORTFOLIO                              */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#F4F6F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-brand uppercase tracking-wider">
                Certified Classical Formulations
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-forest tracking-tight">
                Our Commercial Product Portfolio
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-xl">
                Manufactured with standardized herbal actives in our certified production facilities. Every batch undergoes rigorous microbiological testing.
              </p>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors cursor-pointer self-start md:self-auto"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
              }`}
            >
              All Formulations
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('capsules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'capsules'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
              }`}
            >
              <Pill className="h-3.5 w-3.5" /> Ayurvedic Capsules
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('syrups')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'syrups'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" /> Herbal Syrups
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('tablets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'tablets'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Tablets &amp; Vati
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('powders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'powders'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Herbal Powders
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('oils')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'oils'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
              }`}
            >
              <Droplet className="h-3.5 w-3.5" /> Ayurvedic Oils
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {displayProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-sand-border/80 overflow-hidden shadow-subtle hover:shadow-modal transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square bg-[#FAFBF9] overflow-hidden p-3 flex items-center justify-center">
                    <img
                      src={prod.image || prod.images?.[0] || '/uploads/fibax-product-placeholder.png'}
                      alt={prod.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-forest/90 text-white text-[10px] font-bold">
                      {prod.dosageForm || 'AYUSH'}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                      {prod.category || 'Ayurvedic Proprietary'}
                    </span>
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-charcoal line-clamp-1">
                      {prod.title}
                    </h4>
                    <p className="text-[11px] text-charcoal-muted line-clamp-2">
                      {prod.subtitle || prod.description || 'Formulated with classical herbs'}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-2 border-t border-sand-border/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-forest">
                      {prod.packSize || 'Standard Pack'}
                    </span>
                    <button
                      type="button"
                      onClick={scrollToForm}
                      className="text-[11px] font-bold text-brand hover:underline"
                    >
                      Enquire Rate &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products CTA Box */}
          <div className="mt-12 text-center">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-light text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>View All Products in Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION D: FRANCHISE PROCESS (5 Steps)                    */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-20 bg-white border-b border-sand-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full">
              Structured Journey
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-forest tracking-tight">
              5-Step Franchise Onboarding Process
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              From your initial enquiry to territory allocation and your first inventory dispatch, our team assists you at every milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
            {processSteps.map((stepItem, idx) => (
              <div
                key={stepItem.step || idx}
                className="relative bg-[#FAFBF9] rounded-3xl p-6 border border-sand-border flex flex-col justify-between space-y-4 hover:border-forest/50 transition-all shadow-xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-forest text-gold font-extrabold text-base flex items-center justify-center mb-4 shadow-xs">
                    {stepItem.step || idx + 1}
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-charcoal">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed mt-2">
                    {stepItem.description}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-forest/70 uppercase tracking-wider">
                  Step {stepItem.step || idx + 1} of 5
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION E: WHO CAN APPLY?                                 */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#F4F6F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
              Eligibility &amp; Partners
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-forest tracking-tight">
              Who Can Apply for a Franchise?
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              We collaborate with experienced pharmaceutical professionals and healthcare distributors seeking mutually beneficial growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {targetAudience.map((aud, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-sand-border shadow-xs hover:border-forest transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-charcoal">
                  {aud.title}
                </h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {aud.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION F: FRANCHISE ENQUIRY FORM                         */}
      {/* ======================================================== */}
      <section ref={formRef} id="enquiry-form" className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full">
              Official Application
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-forest tracking-tight">
              Apply for PCD Pharma Franchise
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted max-w-xl mx-auto">
              Please provide complete details regarding your target district and business profile. Our business development desk will evaluate territory availability and respond promptly.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-[#FAFBF9] rounded-3xl p-6 sm:p-10 border border-sand-border shadow-modal">
            
            {/* If lead has been submitted successfully, render confirmation screen */}
            {submittedLead ? (
              <div className="text-center py-8 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    APPLICATION RECEIVED
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-charcoal">
                    Thank You, {submittedLead.name}!
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
                    Your PCD Pharma Franchise application for <strong>{submittedLead.city}, {submittedLead.state}</strong> has been registered with our institutional sales team.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sand-border max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-sand-border/60">
                    <span className="text-charcoal-muted">Reference ID:</span>
                    <strong className="text-forest font-mono">{submittedLead.id}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-sand-border/60">
                    <span className="text-charcoal-muted">Contact Phone:</span>
                    <strong>+91 {submittedLead.phone}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-charcoal-muted">Target Location:</span>
                    <strong>{submittedLead.city}, {submittedLead.state}</strong>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/918872544458?text=Hello%20Fibax%20Ayurveda%2C%20following%20up%20on%20my%20Franchise%20Enquiry%20Ref%3A%20${submittedLead.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Verification Desk</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedLead(null);
                      setFormData({
                        name: '',
                        phone: '',
                        whatsapp: '',
                        sameAsMobile: true,
                        email: '',
                        state: '',
                        city: '',
                        businessType: 'Pharma Distributor',
                        experience: '2 to 5 years',
                        investmentRange: '₹1,00,000 - ₹2,50,000',
                        message: '',
                        consent: true
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-sand-border text-charcoal hover:bg-sand font-bold text-xs transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-6">
                
                {/* Form Error Banner */}
                {formError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-semibold">{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-name" className="block text-xs font-bold text-charcoal">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="franchise-name"
                      name="name"
                      data-testid="franchise-name-input"
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-email" className="block text-xs font-bold text-charcoal">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="franchise-email"
                      name="email"
                      data-testid="franchise-email-input"
                      type="email"
                      required
                      placeholder="e.g. ramesh@pharmadistributors.in"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-phone" className="block text-xs font-bold text-charcoal">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-charcoal-muted">+91</span>
                      <input
                        id="franchise-phone"
                        name="phone"
                        data-testid="franchise-phone-input"
                        type="tel"
                        required
                        maxLength={15}
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number with Sync */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="franchise-whatsapp" className="block text-xs font-bold text-charcoal">
                        WhatsApp Number
                      </label>
                      <label htmlFor="franchise-same-whatsapp" className="flex items-center gap-1.5 text-[11px] text-forest font-semibold cursor-pointer">
                        <input
                          id="franchise-same-whatsapp"
                          name="sameAsMobile"
                          data-testid="franchise-same-whatsapp"
                          type="checkbox"
                          checked={formData.sameAsMobile}
                          onChange={(e) => handleSameAsMobileToggle(e.target.checked)}
                          className="rounded text-forest focus:ring-forest"
                        />
                        <span>Same as Mobile</span>
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-charcoal-muted">+91</span>
                      <input
                        id="franchise-whatsapp"
                        name="whatsapp"
                        data-testid="franchise-whatsapp-input"
                        type="tel"
                        maxLength={15}
                        disabled={formData.sameAsMobile}
                        placeholder={formData.sameAsMobile ? formData.phone || '9876543210' : '9876543210'}
                        value={formData.sameAsMobile ? formData.phone : formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                        className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs ${
                          formData.sameAsMobile ? 'bg-sand/30 cursor-not-allowed text-charcoal-muted' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* State Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-state" className="block text-xs font-bold text-charcoal">
                      Target State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="franchise-state"
                      name="state"
                      data-testid="franchise-state-select"
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs cursor-pointer"
                    >
                      <option value="">Select State / UT</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District / City */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-city" className="block text-xs font-bold text-charcoal">
                      District / City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="franchise-city"
                      name="city"
                      data-testid="franchise-city-input"
                      type="text"
                      required
                      placeholder="e.g. Ludhiana, Patiala, Surat, Indore"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs"
                    />
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-business-type" className="block text-xs font-bold text-charcoal">
                      Current Business Profile
                    </label>
                    <select
                      id="franchise-business-type"
                      name="businessType"
                      data-testid="franchise-business-type-select"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs cursor-pointer"
                    >
                      {(cms?.formConfig?.businessTypes || [
                        'Pharma Distributor',
                        'Medical Representative',
                        'Pharma Wholesaler / Stockist',
                        'Retail Chemist / Pharmacy Owner',
                        'New Business Entrepreneur',
                        'Other Healthcare Professional'
                      ]).map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1.5">
                    <label htmlFor="franchise-experience" className="block text-xs font-bold text-charcoal">
                      Pharma Market Experience
                    </label>
                    <select
                      id="franchise-experience"
                      name="experience"
                      data-testid="franchise-experience-select"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs cursor-pointer"
                    >
                      {(cms?.formConfig?.experienceOptions || [
                        'None / Fresher',
                        'Less than 2 years',
                        '2 to 5 years',
                        '5 to 10 years',
                        '10+ years'
                      ]).map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Expected Investment Range */}
                <div className="space-y-1.5">
                  <label htmlFor="franchise-investment-range" className="block text-xs font-bold text-charcoal">
                    Planned Initial Investment Range
                  </label>
                  <select
                    id="franchise-investment-range"
                    name="investmentRange"
                    data-testid="franchise-investment-select"
                    value={formData.investmentRange}
                    onChange={(e) => handleInputChange('investmentRange', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs cursor-pointer"
                  >
                    {(cms?.formConfig?.investmentRanges || [
                      '₹25,000 - ₹50,000',
                      '₹50,000 - ₹1,00,000',
                      '₹1,00,000 - ₹2,50,000',
                      '₹2,50,000 - ₹5,00,000',
                      '₹5,00,000+'
                    ]).map((inv) => (
                      <option key={inv} value={inv}>
                        {inv}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Message */}
                <div className="space-y-1.5">
                  <label htmlFor="franchise-message" className="block text-xs font-bold text-charcoal">
                    Specific Requirements or Product Interests (Optional)
                  </label>
                  <textarea
                    id="franchise-message"
                    name="message"
                    data-testid="franchise-message-input"
                    rows={3}
                    placeholder="Specify target products, doctors/chemists network, or specific district monopoly expectations..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest shadow-xs resize-none"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label htmlFor="franchise-consent" className="flex items-start gap-2.5 text-xs text-charcoal-muted leading-relaxed cursor-pointer select-none">
                    <input
                      id="franchise-consent"
                      name="consent"
                      data-testid="franchise-consent-checkbox"
                      type="checkbox"
                      required
                      checked={formData.consent}
                      onChange={(e) => handleInputChange('consent', e.target.checked)}
                      className="mt-0.5 rounded text-forest focus:ring-forest h-4 w-4 cursor-pointer"
                    />
                    <span>
                      I agree to be contacted by Fibax Ayurveda regarding my franchise enquiry and accept the{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-forest underline font-bold">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    data-testid="franchise-submit-button"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-2xl bg-forest hover:bg-forest-deep text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 text-gold" />
                        <span>Submit Franchise Enquiry &rarr;</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-charcoal-muted mt-2">
                    🔒 Direct transmission to Fibax Ayurveda institutional sales desk. No spam guaranteed.
                  </p>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION G: FREQUENTLY ASKED QUESTIONS                     */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#F4F6F5] border-t border-sand-border/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-extrabold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full">
              Common Inquiries
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-forest tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Key operational, legal, and territory allocation details for prospective partners.
            </p>
          </div>

          <div className="space-y-3">
            {faqsList.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-sand-border/80 shadow-xs overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors"
                  >
                    <span className="font-heading font-bold text-xs sm:text-sm text-charcoal pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-forest transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-charcoal-muted leading-relaxed border-t border-sand-border/40 bg-[#FAFBF9]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Assistance Help Box */}
          <div className="mt-12 p-6 rounded-3xl bg-forest text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading font-bold text-sm text-white">Have a specific question about your district?</h4>
              <p className="text-xs text-sand/80">Speak directly with our franchise operations coordinator.</p>
            </div>
            <a
              href="tel:+918872544458"
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-forest-deep text-xs font-extrabold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <PhoneCall className="h-4 w-4" /> Call +91 88725 44458
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
