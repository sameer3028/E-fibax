import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Scale,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Search,
  Sparkles,
  ArrowUp,
  Loader2
} from 'lucide-react';

export function Terms({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('section-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Dynamic CMS Legal Page Data
  const [legalData, setLegalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnpublished, setIsUnpublished] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTerms = async () => {
      try {
        const res = await apiRequest('/api/legal/terms');
        if (!isMounted) return;
        if (res.success && res.data) {
          setLegalData(res.data);
          setIsUnpublished(false);
        } else if (res.status === 'unpublished' || res.status === 404) {
          setIsUnpublished(true);
        }
      } catch (err) {
        console.warn('Failed to load dynamic terms from CMS:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTerms();
    return () => { isMounted = false; };
  }, []);

  // Monitor scroll for back to top button and active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsMobileTocOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'section-1', number: '1', title: 'Introduction and Acceptance of Terms' },
    { id: 'section-2', number: '2', title: 'About Fibax Ayurveda and Business Identity' },
    { id: 'section-3', number: '3', title: 'Eligibility to Use the Website' },
    { id: 'section-4', number: '4', title: 'Customer Account Registration and Security' },
    { id: 'section-5', number: '5', title: 'Website Use and Acceptable Conduct' },
    { id: 'section-6', number: '6', title: 'Product Information, Descriptions and Availability' },
    { id: 'section-7', number: '7', title: 'Ayurvedic, Herbal, Nutraceutical and Cosmetic Product Disclaimer' },
    { id: 'section-8', number: '8', title: 'Product Labelling, Usage and Safety Information' },
    { id: 'section-9', number: '9', title: 'Orders, Order Confirmation and Acceptance' },
    { id: 'section-10', number: '10', title: 'Product Prices, Taxes, Discounts and Offers' },
    { id: 'section-11', number: '11', title: 'Payments, UPI, Cards and Cash on Delivery' },
    { id: 'section-12', number: '12', title: 'Shipping, Delivery and Delhivery Courier Services' },
    { id: 'section-13', number: '13', title: 'Order Cancellation' },
    { id: 'section-14', number: '14', title: 'Returns, Replacements and Refunds' },
    { id: 'section-15', number: '15', title: 'Damaged, Defective, Wrong, Missing or Expired Products' },
    { id: 'section-16', number: '16', title: 'Coupons, Promotional Offers and Combo Deals' },
    { id: 'section-17', number: '17', title: 'Customer Reviews, Feedback and Product Suggestions' },
    { id: 'section-18', number: '18', title: 'Privacy and Personal Information' },
    { id: 'section-19', number: '19', title: 'Electronic Communications and OTP Verification' },
    { id: 'section-20', number: '20', title: 'Intellectual Property and Brand Protection' },
    { id: 'section-21', number: '21', title: 'Third-Party Services and Payment Gateways' },
    { id: 'section-22', number: '22', title: 'Website Availability and Technical Errors' },
    { id: 'section-23', number: '23', title: 'Limitation of Liability, Subject to Applicable Law' },
    { id: 'section-24', number: '24', title: 'Indemnification, Subject to Applicable Law' },
    { id: 'section-25', number: '25', title: 'Force Majeure' },
    { id: 'section-26', number: '26', title: 'Suspension and Termination of Accounts' },
    { id: 'section-27', number: '27', title: 'Governing Law and Jurisdiction in India' },
    { id: 'section-28', number: '28', title: 'Grievance Redressal Mechanism' },
    { id: 'section-29', number: '29', title: 'Amendments to These Terms' },
    { id: 'section-30', number: '30', title: 'Contact Information' }
  ];

  const filteredSections = searchTerm
    ? sections.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : sections;

  return (
    <div className="w-full bg-[#FAF9F5] text-charcoal min-h-screen">
      {/* 1. Header Banner */}
      <section className="bg-forest-deep text-white pt-12 pb-14 sm:pt-16 sm:pb-20 relative overflow-hidden print:bg-white print:text-black print:py-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px] print:hidden" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-black/20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest text-sand-warm text-xs font-bold uppercase tracking-wider mb-3 print:hidden">
                <Scale className="h-3.5 w-3.5" /> Legal & Compliance
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight print:text-black">
                {legalData?.pageTitle || 'Terms & Conditions'}
              </h1>
              <p className="text-sand-warm/80 text-xs sm:text-sm mt-1 print:text-gray-700">
                {legalData?.shortDescription || 'Official Consumer Terms of Use for Fibax Ayurveda (Fibax Pharma)'}
              </p>
            </div>

            {/* Actions: Print and Metadata */}
            <div className="flex items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all shadow-xs backdrop-blur-xs"
                title="Print this document"
              >
                <Printer className="h-4 w-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* Quick Legal Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-sand-warm/70 print:text-black">
            <div>
              <span className="block text-[10px] uppercase font-bold text-sand-warm/50">Effective Date</span>
              <span className="font-semibold text-white print:text-black">{legalData?.effectiveDate || '1 January 2026'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-sand-warm/50">Last Updated</span>
              <span className="font-semibold text-white print:text-black">{legalData?.lastUpdated || '13 November 2026'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-sand-warm/50">Document Version</span>
              <span className="font-semibold text-white print:text-black">{legalData?.documentVersion || 'v2.4 (B2C Direct)'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-sand-warm/50">Jurisdiction</span>
              <span className="font-semibold text-white print:text-black">Punjab & Chandigarh, India</span>
            </div>
          </div>
        </div>
      </section>

      {/* Unpublished Review Notice */}
      {isUnpublished ? (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Scale className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-forest-deep">Terms &amp; Conditions Under Scheduled Administrative Review</h2>
          <p className="text-sm text-charcoal-muted max-w-lg mx-auto leading-relaxed">
            Our official Terms &amp; Conditions document is currently undergoing routine compliance and administrative review by Fibax Pharma. For immediate consumer enquiries, order support, or grievance escalation, please reach our helpdesk:
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:care@fibaxpharma.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors shadow-xs">
              <Mail className="h-4 w-4" /> care@fibaxpharma.com
            </a>
            <a href="tel:+918872544458" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-sand-border text-forest text-xs font-bold hover:bg-sand transition-colors">
              <Phone className="h-4 w-4" /> +91 8872544458
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Owner Input Notice Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 print:hidden">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>Transparency & Compliance Disclosure</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This document is the official business-specific Terms & Conditions governing all orders, transactions, and interactions on <strong>fibaxpharma.com</strong>. Prominently indicated owner-input placeholders mark specific operational identifiers (such as GSTIN, Drug Licence, and designated Grievance Redressal personnel) pending final administrative confirmation by the business proprietor.
          </p>
        </div>
      </div>

      {/* Main Container: 2-Column Desktop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ======================================================== */}
          {/* LEFT COLUMN: TABLE OF CONTENTS (STICKY ON DESKTOP)       */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 print:hidden">
            <div className="bg-white rounded-3xl p-5 border border-sand-border shadow-xs sticky top-24 space-y-4">
              <div className="flex items-center justify-between border-b border-sand-border pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-forest" />
                  <h3 className="font-heading font-extrabold text-sm text-forest-deep uppercase tracking-wider">
                    Contents
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-charcoal-muted">
                  30 Sections
                </span>
              </div>

              {/* Search Within Sections */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter sections..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              {/* Navigation Links */}
              <nav className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-1 pr-1 text-xs">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start gap-2.5 ${
                      activeSection === sec.id
                        ? 'bg-forest text-white font-bold shadow-xs'
                        : 'text-charcoal-muted hover:bg-sand/40 hover:text-forest'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center flex-shrink-0 ${
                      activeSection === sec.id ? 'bg-white/20 text-white' : 'bg-sand text-charcoal-muted'
                    }`}>
                      {sec.number}
                    </span>
                    <span className="leading-snug flex-1 truncate">{sec.title}</span>
                  </button>
                ))}
              </nav>

              {/* Fast Support Contact Box */}
              <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-sand-border/80 text-xs space-y-2">
                <p className="font-bold text-forest-deep flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-forest" />
                  <span>Consumer Helpdesk</span>
                </p>
                <p className="text-[11px] text-charcoal-muted">
                  Questions regarding these Terms or your consumer rights? Reach our customer care team:
                </p>
                <div className="space-y-1 text-[11px]">
                  <a href="mailto:care@fibaxpharma.com" className="text-brand hover:underline font-semibold block truncate">
                    care@fibaxpharma.com
                  </a>
                  <a href="tel:+918872544458" className="text-forest hover:underline font-bold block">
                    +91 8872544458
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: COMPLETE LEGAL TERMS TEXT                 */}
          {/* ======================================================== */}
          <main className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-sand-border shadow-xs space-y-12 text-sm text-charcoal leading-relaxed print:p-0 print:border-0 print:shadow-none">
            {legalData && legalData.content ? (
              <div
                className="legal-html-prose space-y-8"
                dangerouslySetInnerHTML={{ __html: legalData.content }}
              />
            ) : (
              <>
            {/* SECTION 1 */}
            <section id="section-1" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Introduction and Acceptance of Terms
                </h2>
              </div>
              <p>
                Welcome to <strong>Fibax Ayurveda</strong>, an authentic Ayurvedic and herbal healthcare platform operated by <strong>Fibax Pharma</strong> ("we", "us", "our", or "the Business"). These Terms and Conditions ("Terms", "Agreement") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("Customer", "User", "you", "your"), and Fibax Pharma concerning your access to and use of the website located at <strong>https://fibaxpharma.com</strong> as well as any related web applications, subdomains, and electronic communication channels (collectively, the "Website").
              </p>
              <p>
                By accessing, browsing, registering an account on, or purchasing products through this Website, you acknowledge that you have read, understood, and unconditionally agree to be bound by all of these Terms and Conditions, together with our <strong>Privacy Policy</strong> and <strong>Return and Refund Policy</strong>.
              </p>
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-xs text-rose-950">
                <strong>Important Notice:</strong> If you do not agree with all of these Terms and Conditions, you are expressly prohibited from using the Website and you must discontinue your use immediately.
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="section-2" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  About Fibax Ayurveda and Business Identity
                </h2>
              </div>
              <p>
                Fibax Ayurveda is a direct-to-consumer (B2C) commercial brand dedicated to formulating, marketing, and supplying classical and proprietary Ayurvedic medicines, botanical juices, therapeutic oils, churnas, nutraceutical dietary supplements, and herbal personal-care formulations.
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p><strong>Trading & Business Identity:</strong> Fibax Pharma</p>
                <p><strong>Commercial Brand:</strong> Fibax Ayurveda</p>
                <p><strong>Constitution of Business:</strong> Sole Proprietorship registered under Indian law</p>
                <p><strong>Proprietor Legal Name:</strong> [OWNER INPUT REQUIRED: Legal Name of Sole Proprietor]</p>
                <p><strong>Registered Business Address:</strong> Office No. 316, 3rd Floor, Block B, CCC (Chandigarh City Center), VIP Road, Zirakpur 140603 (PB), INDIA</p>
                <p><strong>Official Website:</strong> https://fibaxpharma.com</p>
                <p><strong>GSTIN / Tax ID:</strong> [OWNER INPUT REQUIRED: GSTIN / State Tax Identification Number]</p>
                <p><strong>Drug & AYUSH Retail/Wholesale Licence:</strong> [OWNER INPUT REQUIRED: Relevant State AYUSH/Drug Licence Number]</p>
              </div>
              <p>
                <strong>Operating & Manufacturing Model:</strong> Fibax Ayurveda functions as a brand owner and marketer. Products sold on this Website are either manufactured directly or produced by licensed, independent third-party manufacturing partners under loan licence or third-party contract manufacturing agreements in strict compliance with Good Manufacturing Practices (GMP) and relevant licensing authorities. The specific name, licensed premises, batch number, manufacturing licence number, and statutory declarations for each product appear directly on the physical product container and outer carton in compliance with the Drugs and Cosmetics Act, 1940, and the Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
            </section>

            {/* SECTION 3 */}
            <section id="section-3" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Eligibility to Use the Website
                </h2>
              </div>
              <p>
                The Website is intended solely for individuals who are competent to contract under the <strong>Indian Contract Act, 1872</strong>. By using this Website or placing an order, you represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>You are at least 18 (eighteen) years of age, or possess legal parental or guardian consent if aged 16 to 18;</li>
                <li>You possess the legal authority and mental capacity to enter into these binding Terms;</li>
                <li>All registration and contact information submitted by you is true, accurate, current, and complete;</li>
                <li>You will maintain the accuracy of such information and promptly update it when necessary;</li>
                <li>Your use of the Website does not violate any applicable Indian federal, state, or municipal law or regulation.</li>
              </ul>
              <p className="text-xs text-charcoal-muted">
                If you provide any information that is untrue, inaccurate, not current, or incomplete, Fibax Pharma reserves the right to suspend or terminate your account and refuse any current or future use of the Website.
              </p>
            </section>

            {/* SECTION 4 */}
            <section id="section-4" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Customer Account Registration and Security
                </h2>
              </div>
              <p>
                You may browse product listings as a visitor. However, placing an order, accessing order tracking, participating in promotional offers, or managing delivery addresses requires customer authentication via a registered 10-digit Indian mobile number and One-Time Password (OTP) verification.
              </p>
              <p>
                <strong>Security Responsibilities:</strong> You are solely responsible for maintaining the confidentiality of your account credentials, SMS OTPs, and the devices through which you access the Website. You agree to notify Fibax Pharma immediately at <strong>care@fibaxpharma.com</strong> upon becoming aware of any unauthorized use of your phone number or any other breach of security. You agree that Fibax Pharma shall not be liable for any losses caused by any unauthorized use of your account resulting from your failure to safeguard your device or OTP.
              </p>
            </section>

            {/* SECTION 5 */}
            <section id="section-5" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  5
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Website Use and Acceptable Conduct
                </h2>
              </div>
              <p>
                You are granted a limited, non-exclusive, non-transferable, and revocable licence to access and make personal, non-commercial use of the Website. When interacting with the Website, you strictly agree NOT to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>Use the Website for any unlawful, fraudulent, or malicious purpose;</li>
                <li>Introduce viruses, Trojan horses, worms, logic bombs, or other technologically harmful software into the server architecture;</li>
                <li>Attempt to gain unauthorized access to our backend servers, user databases, order files, or payment processing endpoints;</li>
                <li>Use automated bots, scrapers, crawlers, or data mining tools to extract product data, pricing, images, or customer reviews without our prior written consent;</li>
                <li>Post defamatory, obscene, misleading, offensive, or racially discriminatory remarks in customer reviews or feedback forms;</li>
                <li>Place fraudulent, speculative, or fictitious orders, including deliberate abuse of Cash on Delivery (COD) services;</li>
                <li>Bypass or attempt to bypass security tokens, authentication headers, rate limiters, or firewall protocols.</li>
              </ul>
              <p className="text-xs text-charcoal-muted">
                Violations of this section may constitute criminal offences under the <strong>Information Technology Act, 2000</strong> and Indian Penal Code / Bharatiya Nyaya Sanhita, 2023, and will be reported to appropriate law enforcement authorities.
              </p>
            </section>

            {/* SECTION 6 */}
            <section id="section-6" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  6
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Product Information, Descriptions and Availability
                </h2>
              </div>
              <p>
                Fibax Ayurveda makes diligent efforts to describe products, ingredients, net volume/weight, dosage instructions, and visual representations as accurately as possible. However:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>Packaging visuals, bottle shapes, cap styles, and label artwork shown on the Website are for illustrative purposes and may vary slightly from the actual physical batch;</li>
                <li>Herbal preparations and natural juices are subject to natural variations in colour, viscosity, aroma, and taste due to seasonal harvest conditions of botanical raw materials;</li>
                <li>All products are subject to stock availability. We reserve the right to discontinue any product or adjust inventory allocations at any time without prior liability;</li>
                <li>If a product ordered by you becomes unavailable after order placement, we will promptly notify you, cancel the unfulfillable line item, and issue an immediate refund for any prepaid amount.</li>
              </ul>
            </section>

            {/* SECTION 7 */}
            <section id="section-7" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  7
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Ayurvedic, Herbal, Nutraceutical and Cosmetic Product Disclaimer
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Important Healthcare & Medical Disclaimer</span>
                </div>
                <p>
                  The products and educational health articles featured on this Website are Ayurvedic proprietary medicines, classical preparations, herbal health tonics, or nutritional supplements designed to assist general wellness and natural balance.
                </p>
                <p>
                  <strong>No Substitute for Professional Medical Advice:</strong> Website descriptions, ingredient spotlights, customer testimonials, and wellness blogs are provided strictly for educational and informational purposes. They must NEVER be treated as, or used in substitution for, professional medical diagnosis, clinical evaluation, or doctor's treatment.
                </p>
                <p>
                  <strong>No Therapeutic Disease Guarantee:</strong> Fibax Ayurveda does not represent or guarantee that any herbal product will cure, prevent, or treat any acute or chronic disease, condition, or pathology unless explicitly substantiated and authorized under Indian AYUSH licensing rules. Individual physiological responses vary naturally according to personal constitutional balance (Prakriti), age, diet, physical activity, and existing health status.
                </p>
                <p>
                  <strong>Medical Consultation Recommended:</strong> You should always consult an Ayurvedic practitioner, registered medical doctor, or qualified physician before beginning any new herbal regimen, particularly if you are pregnant, nursing, have an existing medical condition (such as diabetes, hypertension, cardiac disorders, or renal ailments), or are taking concurrent allopathic medications.
                </p>
                <p>
                  <strong>Adverse Reactions:</strong> While Ayurvedic formulations utilize natural botanicals, individual biological sensitivities or allergies may occasionally occur. Discontinue consumption or application immediately and seek professional medical attention if you experience unexpected nausea, rash, irritation, or other adverse symptoms.
                </p>
              </div>
            </section>

            {/* SECTION 8 */}
            <section id="section-8" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  8
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Product Labelling, Usage and Safety Information
                </h2>
              </div>
              <p>
                Customers are strictly advised to inspect the physical packaging, bottle seals, expiry date, batch number, and product label immediately upon receipt and prior to use.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Dosage & Directions:</strong> Always follow the dosage guidelines, directions for use, and consumption protocols printed on the product label or prescribed by your healthcare consultant;</li>
                <li><strong>Ingredient Check:</strong> Thoroughly review the list of botanical ingredients (Sanskrit/Latin botanical names) on the carton if you have known sensitivities to specific plants, nuts, seeds, or natural extracts;</li>
                <li><strong>Storage Instructions:</strong> Store formulations in accordance with label instructions (typically in a cool, dry place away from direct sunlight and moisture). Keep bottles tightly capped and out of reach of young children;</li>
                <li><strong>Statutory Declarations:</strong> The physical product packaging constitutes the final, authoritative statement regarding product composition, net quantity, manufacturing licence, expiry, and batch identity under the <strong>Legal Metrology Act, 2009</strong> and <strong>Drugs and Cosmetics Rules, 1945</strong>.</li>
              </ul>
            </section>

            {/* SECTION 9 */}
            <section id="section-9" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  9
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Orders, Order Confirmation and Acceptance
                </h2>
              </div>
              <p>
                Placing an order through the Website represents an offer by you to purchase the selected products under these Terms. The order process operates as follows:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Order Placement:</strong> When you select products, provide delivery information, and click "PLACE ORDER", your order details are logged in our system;</li>
                <li><strong>Order Acknowledgement:</strong> We transmit an automated SMS and/or email acknowledgement displaying your Order ID (e.g. <code>#FBX-100234</code>) and summary of items;</li>
                <li><strong>Order Acceptance:</strong> A legally binding contract of sale is formed only when we confirm dispatch and assign a carrier tracking number (AWB) from our fulfilment facility;</li>
                <li><strong>Right to Reject Orders:</strong> We reserve the right to decline or cancel any order prior to dispatch for legitimate reasons, including stock exhaustion, pricing discrepancies, unserviceable delivery PIN codes, incomplete address details, or suspected fraudulent activity.</li>
              </ol>
            </section>

            {/* SECTION 10 */}
            <section id="section-10" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  10
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Product Prices, Taxes, Discounts and Offers
                </h2>
              </div>
              <p>
                All product prices displayed on the Website are denominated in Indian Rupees (INR, ₹).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Goods & Services Tax (GST):</strong> Selling prices are inclusive of applicable GST (under prevailing AYUSH and pharmaceutical rate schedules) unless explicitly stated otherwise;</li>
                <li><strong>Maximum Retail Price (MRP):</strong> We display the MRP alongside our discounted selling price for complete consumer transparency;</li>
                <li><strong>Price Adjustments:</strong> Prices are subject to revision without prior notice. However, once an order is placed and acknowledged, the price charged to you will not be altered for that transaction;</li>
                <li><strong>Pricing Errors:</strong> Despite our best efforts, typographical errors may occasionally occur. If a product's actual price is higher than the listed price due to a system glitch, we will either contact you for instructions before shipping or cancel the order and provide a full refund.</li>
              </ul>
            </section>

            {/* SECTION 11 */}
            <section id="section-11" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  11
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Payments, UPI, Cards and Cash on Delivery
                </h2>
              </div>
              <p>
                Fibax Pharma supports secure, encrypted digital payment options as well as Cash on Delivery across serviceable locations:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1.5">
                  <p className="font-bold text-forest-deep">Prepaid Digital Payments</p>
                  <p className="text-charcoal-muted">
                    Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), and Net Banking across 50+ Indian banks. Processed securely via PCI-DSS Level 1 compliant gateway (Razorpay). Fibax Pharma never stores your raw card numbers or CVV.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1.5">
                  <p className="font-bold text-forest-deep">Cash on Delivery (COD)</p>
                  <p className="text-charcoal-muted">
                    Pay in cash or scan the courier's dynamic UPI QR code upon doorstep arrival. Available across 19,000+ Indian PIN codes. Customers must ensure an authorized person with exact funds is present at the delivery address.
                  </p>
                </div>
              </div>
              <p className="text-xs text-charcoal-muted">
                <strong>Anti-Fraud Measures:</strong> In case of repeated COD order refusals without valid cause, Fibax Pharma reserves the right to disable COD facility for that customer account or phone number.
              </p>
            </section>

            {/* SECTION 12 */}
            <section id="section-12" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  12
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Shipping, Delivery and Delhivery Courier Services
                </h2>
              </div>
              <p>
                We dispatch packages directly from our central warehouse facility in Zirakpur, Punjab. Courier logistics are managed through leading third-party logistics partners, primarily <strong>Delhivery Express</strong> (Air & Surface logistics).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Dispatch Timelines:</strong> Verified orders are typically processed, packed, and handed over to the courier within 24–48 working hours;</li>
                <li><strong>Delivery Estimates:</strong> Standard delivery timelines range from 2 to 5 business days for major metro cities and 4 to 7 business days for regional and remote locations. All delivery dates are good-faith estimates and cannot be guaranteed due to carrier routing, weather events, or transit disruptions;</li>
                <li><strong>Shipping Fees:</strong> Applicable shipping charges or Free Delivery thresholds are computed dynamically based on order value, package weight, and delivery destination, and are displayed transparently before payment;</li>
                <li><strong>Live Tracking:</strong> Upon courier handover, a valid Air Waybill (AWB) number is assigned. You can track your consignment in real-time via the <strong>Track Order</strong> portal on our Website;</li>
                <li><strong>Customer Address Accuracy:</strong> You are responsible for providing an accurate street address, correct 6-digit PIN code, and an active mobile number. Fibax Pharma cannot be held liable for delayed or returned shipments resulting from inaccurate recipient details.</li>
              </ul>
            </section>

            {/* SECTION 13 */}
            <section id="section-13" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  13
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Order Cancellation
                </h2>
              </div>
              <p>
                We understand that circumstances may change. Our cancellation protocol is designed to be fair, efficient, and transparent:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                  <p className="font-bold text-emerald-950">1. Cancellation Before Dispatch (Available)</p>
                  <p className="text-emerald-900 mt-0.5">
                    You can cancel your order at zero cancellation penalty directly through the "Your Orders" section of your customer account dashboard, or by contacting our helpdesk, provided the order is still in "Pending" or "Processing" status and has not yet been manifested/dispatched with the courier.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                  <p className="font-bold text-amber-950">2. Cancellation After Dispatch (In Transit)</p>
                  <p className="text-amber-900 mt-0.5">
                    Once Delhivery manifests the consignment and the package is in transit, online cancellation is no longer possible through the portal. In such cases, you may decline acceptance of the package upon doorstep delivery, or coordinate with our support team.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 14 */}
            <section id="section-14" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  14
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Returns, Replacements and Refunds
                </h2>
              </div>
              <p>
                Due to strict hygiene, quality control, and safety considerations governing Ayurvedic medicines, consumable wellness juices, and topical skincare formulations, opened or consumed products are generally not eligible for return once the inner protective seal has been broken, unless defective or damaged.
              </p>
              <p>
                <strong>Statutory Return Rights Preserved:</strong> In strict compliance with the <strong>Consumer Protection Act, 2019</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, Fibax Pharma guarantees that returns, free replacements, or full refunds are fully available whenever:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal">
                <li>The product received is physically damaged during transit;</li>
                <li>The package is defective, leaking, or has a broken tamper-evident seal;</li>
                <li>The delivered item is incorrect or does not match the product ordered;</li>
                <li>The product is expired or has less than reasonable remaining shelf-life;</li>
                <li>Items or quantity ordered are missing from the parcel.</li>
              </ul>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p className="font-bold text-forest-deep">Refund Disbursement Policy:</p>
                <p>
                  <strong>Prepaid Orders:</strong> Refunds for verified cancellations or eligible returns are initiated within 24 to 48 hours of claim approval. The credit is automatically returned to the original payment source (bank account, debit/credit card, or UPI VPA) and typically reflects within 5 to 7 business days, depending on your issuing bank.
                </p>
                <p>
                  <strong>COD Orders:</strong> For Cash on Delivery returns, refund amounts are remitted directly to the customer's verified UPI ID or bank account via NEFT/IMPS upon receipt and physical verification of the returned parcel.
                </p>
              </div>
            </section>

            {/* SECTION 15 */}
            <section id="section-15" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  15
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Damaged, Defective, Wrong, Missing or Expired Products
                </h2>
              </div>
              <p>
                If you encounter any genuine issue with your delivered shipment, please follow our streamlined reporting procedure:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-charcoal">
                <li>
                  <strong>Reporting Window:</strong> Notify our customer support team within <strong>5 (five) days</strong> of delivery as recorded by the carrier;
                </li>
                <li>
                  <strong>Required Evidence:</strong> Provide your Order ID, contact number, a brief explanation of the defect, and clear photographic or unboxing video evidence clearly showing:
                  <ul className="list-disc pl-5 pt-1 space-y-0.5 text-charcoal-muted">
                    <li>The outer shipping label and courier barcode;</li>
                    <li>The damaged, leaking, or incorrect product;</li>
                    <li>The batch number and expiry date printed on the bottle or carton.</li>
                  </ul>
                </li>
                <li>
                  <strong>Submission Channels:</strong> Send your report via email to <strong>care@fibaxpharma.com</strong> or via WhatsApp to <strong>+91 8872544458</strong>;
                </li>
                <li>
                  <strong>Resolution:</strong> Upon verification, our team will immediately arrange a free replacement dispatch via Delhivery Express or initiate a 100% full refund with zero deductions.
                </li>
              </ol>
            </section>

            {/* SECTION 16 */}
            <section id="section-16" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  16
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Coupons, Promotional Offers and Combo Deals
                </h2>
              </div>
              <p>
                From time to time, Fibax Pharma may issue promotional coupon codes, festive discounts, bundle/combo savings, or introductory incentives.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>Each coupon code is subject to specific criteria, including validity periods, minimum order values, and category restrictions as published;</li>
                <li>Only one promotional coupon can be redeemed per transaction. Coupons cannot be stacked or combined with other conflicting voucher promotions;</li>
                <li>Coupons have no cash redemption value and cannot be transferred or exchanged for cash;</li>
                <li>Fibax Pharma reserves the right to modify, deactivate, or discontinue promotional codes in the event of suspected coupon fraud or system misuse.</li>
              </ul>
            </section>

            {/* SECTION 17 */}
            <section id="section-17" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  17
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Customer Reviews, Feedback and Product Suggestions
                </h2>
              </div>
              <p>
                Customers are encouraged to post genuine reviews, star ratings, and formulation feedback on products they have purchased.
              </p>
              <p>
                By submitting reviews, photos, or formulation suggestions to our Website, you grant Fibax Pharma a non-exclusive, royalty-free, perpetual, and irrevocable right to publish, display, and reproduce your feedback across our marketing materials and product development pipelines. You warrant that your submitted review reflects your genuine personal experience and does not contain abusive, defamatory, or infringing material. We reserve the right to moderate or remove reviews that violate acceptable conduct standards.
              </p>
            </section>

            {/* SECTION 18 */}
            <section id="section-18" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  18
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Privacy and Personal Information
                </h2>
              </div>
              <p>
                We consider the privacy and security of your personal data paramount. Our collection, storage, processing, and protection of customer information is governed by our comprehensive <strong>Privacy Policy</strong>, available at <strong>https://fibaxpharma.com/privacy</strong>, which is incorporated by reference into these Terms.
              </p>
              <p className="text-xs text-charcoal">
                Fibax Pharma complies with the <strong>Information Technology Act, 2000</strong>, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the phased implementation of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the <strong>DPDP Rules, 2025</strong>. We do not sell your personal data to third-party brokers.
              </p>
            </section>

            {/* SECTION 19 */}
            <section id="section-19" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  19
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Electronic Communications and OTP Verification
                </h2>
              </div>
              <p>
                When you visit our Website, send us emails, submit order forms, or verify your mobile number via OTP, you are communicating with us electronically.
              </p>
              <p>
                You consent to receive communications from us electronically, including transactional SMS alerts, WhatsApp order notifications, OTP codes, dispatch status updates, and administrative emails. You agree that all agreements, notices, disclosures, and other communications provided to you electronically satisfy any legal requirement that such communications be in writing. You may opt out of promotional newsletters at any time, but critical transactional notifications will continue to be delivered for active orders.
              </p>
            </section>

            {/* SECTION 20 */}
            <section id="section-20" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  20
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Intellectual Property and Brand Protection
                </h2>
              </div>
              <p>
                All content published on this Website—including but not limited to text, product formulations, brand graphics, logos, icons, product photography, editorial health articles, software code, UI designs, and audio-visual assets—is the exclusive intellectual property of <strong>Fibax Pharma</strong> or its licensed content providers and is protected under the <strong>Copyright Act, 1957</strong>, the <strong>Trade Marks Act, 1999</strong>, and Indian intellectual property laws.
              </p>
              <p className="text-xs text-charcoal-muted">
                The trademarks "Fibax Ayurveda", "Fibax Pharma", and associated logos are proprietary brand marks. Any unauthorized reproduction, modification, distribution, scraping, or commercial exploitation of our intellectual property without prior written permission is strictly prohibited.
              </p>
            </section>

            {/* SECTION 21 */}
            <section id="section-21" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  21
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Third-Party Services and Payment Gateways
                </h2>
              </div>
              <p>
                To provide seamless e-commerce services, our Website integrates with trusted third-party service providers, including payment gateways (such as Razorpay), logistics carriers (such as Delhivery), SMS service providers, and mapping APIs.
              </p>
              <p>
                These third-party platforms operate under their own independent terms of service and security standards. While Fibax Pharma exercises due diligence in selecting reputable partners, we are not responsible for independent outages, banking gateway server failures, or third-party carrier delays beyond our reasonable control.
              </p>
            </section>

            {/* SECTION 22 */}
            <section id="section-22" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  22
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Website Availability and Technical Errors
                </h2>
              </div>
              <p>
                We strive to maintain continuous, uninterrupted availability of the Website. However, uninterrupted access cannot be guaranteed. Website operations may be temporarily suspended, restricted, or curtailed for routine server maintenance, software upgrades, emergency patches, or telecommunications outages.
              </p>
              <p className="text-xs text-charcoal-muted">
                We shall not be liable if, for any reason, the Website is unavailable at any time or for any period. If a technical error affects an order or payment processing, our customer care team will actively assist in reconciling the transaction.
              </p>
            </section>

            {/* SECTION 23 */}
            <section id="section-23" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  23
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Limitation of Liability, Subject to Applicable Law
                </h2>
              </div>
              <p>
                To the maximum extent permitted by applicable Indian law, Fibax Pharma, its proprietor, employees, and authorized agents shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use the Website, third-party carrier delays, or misuse of products contrary to label directions.
              </p>
              <p>
                <strong>Statutory Limits:</strong> Nothing in these Terms shall limit or exclude any liability that cannot legally be limited or excluded under the <strong>Consumer Protection Act, 2019</strong>, including statutory liability for proven manufacturing defects, gross negligence, or fraudulent misrepresentation. Subject to the foregoing, our total aggregate liability for any proven claim arising out of a specific order shall not exceed the actual price paid by you for the product giving rise to the claim.
              </p>
            </section>

            {/* SECTION 24 */}
            <section id="section-24" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  24
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Indemnification, Subject to Applicable Law
                </h2>
              </div>
              <p>
                You agree to defend, indemnify, and hold harmless Fibax Pharma, its proprietor, affiliates, and representatives from and against any third-party claims, liabilities, damages, losses, and reasonable legal costs arising out of: (a) your willful breach of these Terms; (b) your violation of any applicable law or third-party rights; or (c) fraudulent, speculative, or malicious activities conducted through your account.
              </p>
            </section>

            {/* SECTION 25 */}
            <section id="section-25" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  25
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Force Majeure
                </h2>
              </div>
              <p>
                Neither Fibax Pharma nor its logistics partners shall be held responsible or in breach of these Terms for any delay, failure in performance, or non-delivery resulting from events beyond our reasonable control, including natural disasters, floods, earthquakes, epidemics, government-mandated lockdowns, curfews, civil unrest, strikes, internet gateway breakdowns, or national transportation disruptions. During such occurrences, our performance obligations shall be suspended for the duration of the event.
              </p>
            </section>

            {/* SECTION 26 */}
            <section id="section-26" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  26
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Suspension and Termination of Accounts
                </h2>
              </div>
              <p>
                You may request deactivation of your account at any time by contacting our support desk.
              </p>
              <p>
                Fibax Pharma reserves the right to immediately suspend, restrict, or terminate your access to the Website or cancel pending orders without prior notice if: (a) you breach any material provision of these Terms; (b) we suspect fraudulent, abusive, or fictitious order activity; or (c) required by legal or regulatory mandate. Termination shall not affect any accrued payment rights or outstanding deliveries contracted prior to termination.
              </p>
            </section>

            {/* SECTION 27 */}
            <section id="section-27" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  27
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Governing Law and Jurisdiction in India
                </h2>
              </div>
              <p>
                These Terms and Conditions, your relationship with Fibax Pharma, and all transactions executed through this Website shall be governed by, interpreted, and construed in accordance with the laws of the <strong>Republic of India</strong>, without regard to conflict of law principles.
              </p>
              <p>
                Subject to the Grievance Redressal Mechanism set forth below, any dispute, controversy, or claim arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of law located in <strong>SAS Nagar (Mohali) / Chandigarh / Punjab, India</strong>.
              </p>
            </section>

            {/* SECTION 28 */}
            <section id="section-28" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  28
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Grievance Redressal Mechanism
                </h2>
              </div>
              <p>
                In compliance with Rule 5(3) of the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> and the <strong>Consumer Protection (E-Commerce) (Amendment) Rules, 2026</strong>, Fibax Pharma has established a dedicated consumer grievance redressal mechanism to ensure prompt, transparent, and fair resolution of consumer complaints.
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p className="font-bold text-forest-deep">Grievance Officer Information:</p>
                <p><strong>Name of Grievance Officer:</strong> [OWNER INPUT REQUIRED: Name of Grievance Redressal Officer]</p>
                <p><strong>Official Designation:</strong> [OWNER INPUT REQUIRED: Grievance Officer / Operations Head]</p>
                <p><strong>Postal Address:</strong> Fibax Pharma, Office No. 316, 3rd Floor, Block B, CCC (Chandigarh City Center), VIP Road, Zirakpur 140603 (PB), INDIA</p>
                <p><strong>Dedicated Grievance Email:</strong> [OWNER INPUT REQUIRED: Dedicated Grievance Email, e.g. grievance@fibaxpharma.com or care@fibaxpharma.com]</p>
                <p><strong>Grievance Helpline:</strong> [OWNER INPUT REQUIRED: Grievance Contact Number, or +91 8872544458]</p>
              </div>
              <p>
                <strong>Complaint Timelines:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal">
                <li><strong>Acknowledgement:</strong> Every consumer grievance received will be acknowledged within <strong>48 (forty-eight) hours</strong> of receipt with a unique grievance ticket reference number;</li>
                <li><strong>Resolution:</strong> The grievance will be examined and redressed within <strong>30 (thirty) days</strong> from the date of receipt, and the outcome communicated to the customer in writing.</li>
              </ul>
            </section>

            {/* SECTION 29 */}
            <section id="section-29" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  29
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Amendments to These Terms
                </h2>
              </div>
              <p>
                Fibax Pharma reserves the right to amend, update, or revise these Terms and Conditions at our sole discretion from time to time to reflect operational modifications, regulatory changes, or statutory enactments.
              </p>
              <p className="text-xs text-charcoal-muted">
                Whenever revisions are implemented, we will update the "Last Updated" date at the beginning of this document. Continued use of the Website after publication of revised Terms constitutes your full acceptance of the revised provisions. We recommend reviewing this page periodically.
              </p>
            </section>

            {/* SECTION 30 */}
            <section id="section-30" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  30
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Contact Information
                </h2>
              </div>
              <p>
                For questions regarding these Terms & Conditions, order support, product inquiries, or customer assistance, please contact us:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest">
                    <Mail className="h-4 w-4 text-brand" /> Email Support
                  </div>
                  <a href="mailto:care@fibaxpharma.com" className="text-charcoal hover:underline block truncate font-medium">
                    care@fibaxpharma.com
                  </a>
                  <p className="text-[10px] text-charcoal-muted">Mon–Sat, 9 AM – 7 PM IST</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest">
                    <Phone className="h-4 w-4 text-brand" /> Helpline & WhatsApp
                  </div>
                  <a href="tel:+918872544458" className="text-charcoal hover:underline block font-medium">
                    +91 8872544458
                  </a>
                  <p className="text-[10px] text-charcoal-muted">Direct Doctor & Support Line</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest">
                    <MapPin className="h-4 w-4 text-brand" /> Registered Office
                  </div>
                  <p className="text-charcoal leading-tight">
                    Office No. 316, 3rd Floor, Block B, CCC (Chandigarh City Center), VIP Road, Zirakpur 140603 (PB), INDIA
                  </p>
                </div>
              </div>
            </section>
              </>
            )}

          </main>
        </div>
      </div>
      </>
      )}

      {/* Back to top floating button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-forest hover:bg-forest-deep text-white shadow-lg transition-all flex items-center justify-center print:hidden active:scale-95"
          aria-label="Back to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
export default Terms;
