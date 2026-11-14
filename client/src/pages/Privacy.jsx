import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  ShieldCheck,
  Lock,
  Printer,
  ChevronRight,
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
  Database,
  Eye,
  Key,
  Truck,
  CreditCard,
  UserCheck,
  FileText,
  Loader2
} from 'lucide-react';

export function Privacy({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('section-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Dynamic CMS Legal Page Data
  const [legalData, setLegalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnpublished, setIsUnpublished] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPrivacy = async () => {
      try {
        const res = await apiRequest('/api/legal/privacy');
        if (!isMounted) return;
        if (res.success && res.data) {
          setLegalData(res.data);
          setIsUnpublished(false);
        } else if (res.status === 'unpublished' || res.status === 404) {
          setIsUnpublished(true);
        }
      } catch (err) {
        console.warn('Failed to load dynamic privacy policy from CMS:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPrivacy();
    return () => { isMounted = false; };
  }, []);

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
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'section-1', number: '1', title: 'Introduction and Scope' },
    { id: 'section-2', number: '2', title: 'Identity of Fibax Ayurveda and Data Fiduciary' },
    { id: 'section-3', number: '3', title: 'Information We Collect' },
    { id: 'section-4', number: '4', title: 'Account Registration and OTP Verification Data' },
    { id: 'section-5', number: '5', title: 'Profile and Delivery Address Information' },
    { id: 'section-6', number: '6', title: 'Order, Cart and Transaction Records' },
    { id: 'section-7', number: '7', title: 'Payment Processing and Razorpay Security' },
    { id: 'section-8', number: '8', title: 'Shipping Logistics and Delhivery Data Sharing' },
    { id: 'section-9', number: '9', title: 'Customer Support and Communication Records' },
    { id: 'section-10', number: '10', title: 'Product Inquiries, Reviews and Formulation Feedback' },
    { id: 'section-11', number: '11', title: 'Cookies, Local Storage and Technical Telemetry' },
    { id: 'section-12', number: '12', title: 'Web Analytics (Google Analytics & Microsoft Clarity)' },
    { id: 'section-13', number: '13', title: 'How We Use Your Personal Information' },
    { id: 'section-14', number: '14', title: 'Legal Basis and Consent for Data Processing' },
    { id: 'section-15', number: '15', title: 'Data Sharing with Authorized Third-Party Partners' },
    { id: 'section-16', number: '16', title: 'Data Storage, Hosting Infrastructure and Backups' },
    { id: 'section-17', number: '17', title: 'Data Retention and Purpose Limitation Periods' },
    { id: 'section-18', number: '18', title: 'Technical and Organizational Security Safeguards' },
    { id: 'section-19', number: '19', title: 'Cross-Border and International Data Transfers' },
    { id: 'section-20', number: '20', title: 'Customer Privacy Rights Under Indian Law' },
    { id: 'section-21', number: '21', title: 'Marketing Communications and Consent Withdrawal' },
    { id: 'section-22', number: '22', title: 'Account Deletion and Personal Data Erasure' },
    { id: 'section-23', number: '23', title: 'Protection of Children’s Privacy' },
    { id: 'section-24', number: '24', title: 'Third-Party Links and External Platforms' },
    { id: 'section-25', number: '25', title: 'Data Breach Notification and Incident Response' },
    { id: 'section-26', number: '26', title: 'DPDP Act Compliance and Statutory Timeline' },
    { id: 'section-27', number: '27', title: 'Amendments to This Privacy Policy' },
    { id: 'section-28', number: '28', title: 'Grievance Redressal Mechanism' },
    { id: 'section-29', number: '29', title: 'Contact Us for Data Privacy Inquiries' }
  ];

  const filteredSections = searchTerm
    ? sections.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : sections;

  return (
    <div className="w-full bg-[#FAF9F5] text-charcoal min-h-screen">
      {/* 1. Top Legal Header */}
      <section className="bg-forest-deep text-white pt-12 pb-14 sm:pt-16 sm:pb-20 relative overflow-hidden print:bg-white print:text-black print:py-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px] print:hidden" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-black/20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest text-sand-warm text-xs font-bold uppercase tracking-wider mb-3 print:hidden">
                <ShieldCheck className="h-3.5 w-3.5" /> Data Protection & Privacy
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight print:text-black">
                {legalData?.pageTitle || 'Privacy Policy'}
              </h1>
              <p className="text-sand-warm/80 text-xs sm:text-sm mt-1 print:text-gray-700">
                {legalData?.shortDescription || 'Official Consumer Privacy Notice & Personal Data Protection Framework for Fibax Ayurveda'}
              </p>
            </div>

            {/* Print Button */}
            <div className="flex items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all shadow-xs backdrop-blur-xs"
                title="Print this policy"
              >
                <Printer className="h-4 w-4" />
                <span>Print Policy</span>
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
              <span className="block text-[10px] uppercase font-bold text-sand-warm/50">Policy Version</span>
              <span className="font-semibold text-white print:text-black">{legalData?.documentVersion || 'v2.1 (DPDP Compliant)'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-sand-warm/50">Governing Law</span>
              <span className="font-semibold text-white print:text-black">DPDP Act, 2023 & IT Act, 2000 (India)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Unpublished Review Notice */}
      {isUnpublished ? (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-forest-deep">Privacy Policy Under Scheduled Administrative Review</h2>
          <p className="text-sm text-charcoal-muted max-w-lg mx-auto leading-relaxed">
            Our official Privacy Policy document is currently undergoing routine compliance and administrative review by Fibax Pharma. For immediate data principal enquiries or privacy questions, please contact our privacy desk:
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
          {/* Owner Confirmation Notice Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 print:hidden">
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Lock className="h-4 w-4 text-emerald-700 flex-shrink-0" />
            <span>Privacy Notice & Technical Transparency Guarantee</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            This document outlines the genuine data handling, processing, and protection practices of <strong>https://fibaxpharma.com</strong>. It reflects verified technical implementations across customer OTP login, Razorpay encrypted payment tokens, Delhivery shipping handoffs, and Google Analytics. Explicit owner-confirmation fields identify specific organizational appointments pending formal corporate certification.
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
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
                    Policy Index
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-charcoal-muted">
                  29 Sections
                </span>
              </div>

              {/* Section Search */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter privacy topics..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              {/* Navigation List */}
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

              {/* Privacy Help Box */}
              <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-sand-border/80 text-xs space-y-2">
                <p className="font-bold text-forest-deep flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-forest" />
                  <span>Privacy Officer</span>
                </p>
                <p className="text-[11px] text-charcoal-muted">
                  To exercise your data rights, request erasure, or withdraw consent, reach our dedicated desk:
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
          {/* RIGHT COLUMN: COMPLETE ORIGINAL PRIVACY POLICY TEXT     */}
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
                  Introduction and Scope
                </h2>
              </div>
              <p>
                At <strong>Fibax Ayurveda</strong>, we value the trust you place in us when sharing your personal information. This Privacy Policy outlines how <strong>Fibax Pharma</strong> ("we", "our", "us", or "the Business") collects, uses, processes, stores, and safeguards personal data obtained from customers, visitors, and registered users ("you", "your", or "Data Principal") who access our e-commerce portal at <strong>https://fibaxpharma.com</strong> and associated digital touchpoints (the "Website").
              </p>
              <p>
                This Policy applies to all interactions with our Website, including product exploration, customer account creation, mobile OTP verification, online ordering, courier delivery tracking, customer support inquiries, and wellness consultation requests.
              </p>
              <p className="text-xs text-charcoal-muted">
                Please read this Policy carefully. By accessing or using our Website, you acknowledge that your personal information will be handled strictly in accordance with this Privacy Policy, our Terms & Conditions, and applicable Indian data-protection statutes.
              </p>
            </section>

            {/* SECTION 2 */}
            <section id="section-2" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Identity of Fibax Ayurveda and Data Fiduciary
                </h2>
              </div>
              <p>
                For the purposes of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the <strong>Information Technology Act, 2000</strong>, the Data Fiduciary determining the purpose and means of personal data processing on this platform is:
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p><strong>Business Trading Name:</strong> Fibax Pharma</p>
                <p><strong>Brand Identity:</strong> Fibax Ayurveda</p>
                <p><strong>Constitution of Business:</strong> Sole Proprietorship</p>
                <p><strong>Legal Proprietor Name:</strong> [OWNER CONFIRMATION REQUIRED: Legal Name of Sole Proprietor]</p>
                <p><strong>Registered Operating Address:</strong> Office No. 316, 3rd Floor, Block B, CCC (Chandigarh City Center), VIP Road, Zirakpur 140603 (PB), INDIA</p>
                <p><strong>Customer Privacy Desk:</strong> care@fibaxpharma.com</p>
                <p><strong>Helpline Telephone:</strong> +91 8872544458</p>
                <p><strong>Primary Website URL:</strong> https://fibaxpharma.com</p>
              </div>
              <p className="text-xs text-charcoal">
                <strong>Business Model Clarification:</strong> Fibax Ayurveda operates as a direct-to-consumer (B2C) brand and retailer of Ayurvedic medicines, herbal juices, oils, and nutritional wellness formulations. We are NOT a multi-vendor marketplace; transactions on this Website are executed directly with Fibax Pharma.
              </p>
            </section>

            {/* SECTION 3 */}
            <section id="section-3" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Information We Collect
                </h2>
              </div>
              <p>
                In strict adherence to the statutory principle of <strong>Data Minimisation</strong>, Fibax Ayurveda collects only the personal information reasonably necessary to provide authentic Ayurvedic formulations, fulfill online purchases, deliver consignments to your doorstep, communicate order statuses, and comply with Indian taxation and consumer protection laws.
              </p>
              <p>
                We do not collect excessive, irrelevant, or intrusive personal information, and we do not monitor your offline activities.
              </p>
            </section>

            {/* SECTION 4 */}
            <section id="section-4" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Account Registration and OTP Verification Data
                </h2>
              </div>
              <p>
                When you create a customer account or verify your identity during checkout, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Full Name:</strong> To personalize your account and label delivery consignments accurately;</li>
                <li><strong>Indian Mobile Number (10 digits):</strong> Serving as your primary account identifier and authentication credential;</li>
                <li><strong>Email Address:</strong> Optional or provided during checkout for transmitting digital tax invoices, order confirmations, and dispatch notifications;</li>
                <li><strong>One-Time Password (OTP):</strong> A temporary 4-digit code generated during authentication. OTPs are stored ephemerally in server memory with a 10-minute expiry and are automatically purged upon verification;</li>
                <li><strong>Password Hash (if password registered):</strong> If you set an account password, it is cryptographically salted and hashed using Node.js <code>scrypt</code> (64-byte key). Plain-text passwords are never stored or visible to our administrators;</li>
                <li><strong>Session Token:</strong> An encrypted 32-byte cryptographic token (<code>cust_...</code>) stored in your browser's local storage for a 30-day session lifetime.</li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="section-5" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  5
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Profile and Delivery Address Information
                </h2>
              </div>
              <p>
                To deliver physical packages to your doorstep, we collect and store:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>House / Flat / Street address and locality;</li>
                <li>City, District, and State;</li>
                <li>6-digit Indian Postal PIN Code (used for courier serviceability validation);</li>
                <li>Optional landmark details to facilitate delivery couriers;</li>
                <li>Recipients' secondary contact phone numbers if specified for doorstep delivery.</li>
              </ul>
              <p className="text-xs text-charcoal-muted">
                You can review, update, or edit your saved delivery addresses at any time directly from the <strong>Profile → Saved Addresses</strong> dashboard in your customer account.
              </p>
            </section>

            {/* SECTION 6 */}
            <section id="section-6" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  6
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Order, Cart and Transaction Records
                </h2>
              </div>
              <p>
                When you initiate a purchase on our Website, we record:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>Unique Order Identification number (e.g., <code>#FBX-100234</code>);</li>
                <li>Selected Ayurvedic formulations, pack sizes, and quantities ordered;</li>
                <li>Transaction timestamps (order placement, dispatch, delivery, or cancellation date);</li>
                <li>Total order pricing, itemized item subtotals, applied discount amounts, and shipping fees;</li>
                <li>Promotional coupon codes applied during checkout;</li>
                <li>Payment method selected (Prepaid Online or Cash on Delivery);</li>
                <li>Active cart line items and wishlist items (stored locally on your device in browser <code>localStorage</code>).</li>
              </ul>
            </section>

            {/* SECTION 7 */}
            <section id="section-7" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  7
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Payment Processing and Razorpay Security
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CreditCard className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Zero Storage of Sensitive Card or Banking Credentials</span>
                </div>
                <p>
                  Fibax Ayurveda does <strong>NOT</strong> collect, view, process, or store your debit/credit card numbers, CVV codes, card expiration dates, net banking passwords, or UPI PINs.
                </p>
                <p>
                  All digital transactions are processed through <strong>Razorpay</strong> (Razorpay Software Private Limited), an RBI-authorized Payment Aggregator certified under the highest global security standard: <strong>PCI-DSS Level 1</strong>.
                </p>
                <p>
                  When you initiate a prepaid transaction, you enter your financial details exclusively inside Razorpay’s encrypted, secure modal. Fibax Ayurveda only receives and stores cryptographic audit tokens: <code>razorpay_order_id</code>, <code>razorpay_payment_id</code>, and a cryptographic HMAC signature confirming successful settlement.
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
                  Shipping Logistics and Delhivery Data Sharing
                </h2>
              </div>
              <p>
                To transport and deliver your physical parcels across India, we partner with <strong>Delhivery Express</strong> (Delhivery Limited).
              </p>
              <p>
                When an order is manifested for dispatch, we securely transmit only the necessary recipient delivery attributes to Delhivery via encrypted API:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal">
                <li>Recipient Full Name;</li>
                <li>Delivery Street Address, City, State, and 6-digit PIN Code;</li>
                <li>Recipient Mobile Number (required for courier doorstep contact and delivery OTP);</li>
                <li>Order Reference Number (e.g. <code>FBX-100234</code>);</li>
                <li>Consignment parcel weight and broad commodity description ("Ayurvedic Formulations");</li>
                <li>Payment Mode (Prepaid or COD) and the exact Cash on Delivery collectible amount, if applicable.</li>
              </ul>
              <p className="text-xs text-charcoal-muted">
                Delhivery processes this data strictly as a logistical data processor for the sole purpose of fulfillment and real-time tracking. We do NOT share customer email addresses, passwords, or transaction history with delivery couriers.
              </p>
            </section>

            {/* SECTION 9 */}
            <section id="section-9" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  9
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Customer Support and Communication Records
                </h2>
              </div>
              <p>
                When you contact our customer support team via email (<code>care@fibaxpharma.com</code>), helpline (+91 8872544458), WhatsApp, or our online Contact Form, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>Your name, phone number, and email address;</li>
                <li>Your order reference number or product inquiry topic;</li>
                <li>The contents of your inquiry, consultation query, or complaint;</li>
                <li>Technical logs of the communication to verify resolution quality and customer satisfaction.</li>
              </ul>
            </section>

            {/* SECTION 10 */}
            <section id="section-10" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  10
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Product Inquiries, Reviews and Formulation Feedback
                </h2>
              </div>
              <p>
                Our Website provides interactive features where you may volunteer information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Product Reviews:</strong> Star ratings, review text, customer display name, and optional uploaded photos of received products;</li>
                <li><strong>Doctor Callback Requests:</strong> Name, phone number, and primary Ayurvedic health concern (e.g. Immunity, Joint Care, Digestion) submitted to schedule a personalized guidance call;</li>
                <li><strong>Formulation Suggestions:</strong> Classical herbs, blends, or health categories recommended by customers in the account dashboard.</li>
              </ul>
            </section>

            {/* SECTION 11 */}
            <section id="section-11" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  11
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Cookies, Local Storage and Technical Telemetry
                </h2>
              </div>
              <p>
                Unlike many commercial portals, the Fibax Pharma backend does <strong>NOT</strong> plant intrusive third-party cross-site tracking cookies.
              </p>
              <p>
                We use browser <strong>Local Storage</strong> and essential session technologies solely for functional website performance:
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p><code>fibax_cart</code>: Retains your active shopping bag items so you do not lose your selections when reloading pages.</p>
                <p><code>fibax_wishlist</code>: Stores your saved favorite Ayurvedic products locally on your device.</p>
                <p><code>fibax_auth_token</code>: Stores your encrypted session authorization token when you log in.</p>
                <p><code>fibax_user</code>: Caches your basic customer name and phone locally for fast UI rendering.</p>
              </div>
              <p className="text-xs text-charcoal-muted">
                You can clear your local storage at any time through your browser settings. Doing so will simply empty your local cart and require you to sign in again via mobile OTP.
              </p>
            </section>

            {/* SECTION 12 */}
            <section id="section-12" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  12
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Web Analytics (Google Analytics & Microsoft Clarity)
                </h2>
              </div>
              <p>
                To understand website performance, detect technical errors, and optimize page load speeds, our Website integrates two verified analytics services:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li>
                  <strong>Google Analytics 4 (Google LLC):</strong> Embedded via Google Tag (Measurement ID: <code>G-4DPG0SDPVQ</code>). Measures aggregated page views, general geographic region, browser version, and traffic channels using standard analytical cookies (<code>_ga</code>). Google Analytics does not receive your name, address, or payment credentials.
                </li>
                <li>
                  <strong>Microsoft Clarity (Microsoft Corporation):</strong> Embedded via tracking ID <code>otex02p22j</code>. Measures aggregated UX interactions, click heatmaps, and scroll depth to identify broken links or sluggish UI components. Microsoft Clarity automatically masks sensitive personal inputs and passwords.
                </li>
              </ul>
              <div className="p-3.5 rounded-2xl bg-sand/30 border border-sand-border text-xs text-charcoal-muted">
                <strong>Verified Absence of Tracking Pixels:</strong> We do NOT run Meta (Facebook) advertising pixels, TikTok pixels, Google Ads remarketing pixels, or third-party ad network tracking scripts on this Website.
              </div>
            </section>

            {/* SECTION 13 */}
            <section id="section-13" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  13
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  How We Use Your Personal Information
                </h2>
              </div>
              <p>
                We process your personal information strictly for legitimate commercial and regulatory purposes:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Order Processing & Fulfillment:</strong> Verifying order line items, packaging shipments, calculating accurate courier rates, and arranging delivery;</li>
                <li><strong>Authentication & Security:</strong> Generating and validating SMS OTPs to prevent fraudulent or automated bot orders;</li>
                <li><strong>Logistics Coordination:</strong> Transmitting dispatch details to Delhivery Express and updating live tracking statuses;</li>
                <li><strong>Customer Support:</strong> Responding to inquiries, resolving delivery exceptions, processing return/refund requests, and conducting requested doctor callbacks;</li>
                <li><strong>Statutory Tax Compliance:</strong> Maintaining financial accounts, generating GST-compliant tax invoices, and complying with Indian commercial audits;</li>
                <li><strong>Platform Integrity:</strong> Protecting our web server against Distributed Denial of Service (DDoS) attacks, brute-force intrusions, and payment fraud.</li>
              </ol>
            </section>

            {/* SECTION 14 */}
            <section id="section-14" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  14
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Legal Basis and Consent for Data Processing
                </h2>
              </div>
              <p>
                Under Section 4 and Section 6 of the DPDP Act, 2023 and the Indian Contract Act, 1872, our legal grounds for processing your personal information are:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Contractual Necessity:</strong> Processing required to accept your order, process payment, and deliver physical products you contracted to purchase;</li>
                <li><strong>Specific, Informed Consent:</strong> Provided when you enter your mobile number for OTP login, submit a contact message, or request an Ayurvedic doctor consultation;</li>
                <li><strong>Compliance with Legal Obligations:</strong> Mandatory retention of billing, tax invoice, and sales data under the Central Goods and Services Tax Act, 2017 and Consumer Protection (E-Commerce) Rules, 2020;</li>
                <li><strong>Legitimate Uses:</strong> Prevention of fraud, security monitoring, and enforcement of our legal Terms.</li>
              </ul>
            </section>

            {/* SECTION 15 */}
            <section id="section-15" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  15
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Data Sharing with Authorized Third-Party Partners
                </h2>
              </div>
              <p>
                Fibax Pharma does <strong>NOT</strong> sell, rent, trade, or monetize your personal data to data brokers, telemarketers, or unauthorized third parties.
              </p>
              <p>
                We share data solely with verified operational processors bound by strict confidentiality and data protection obligations:
              </p>
              <div className="divide-y divide-sand-border/60 text-xs">
                <div className="py-2.5">
                  <p className="font-bold text-forest-deep">1. Courier & Logistics Partners (Delhivery Limited)</p>
                  <p className="text-charcoal-muted">Receives name, shipping address, phone, and package details solely to execute physical delivery and live tracking.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-bold text-forest-deep">2. Payment Gateway (Razorpay Software Private Limited)</p>
                  <p className="text-charcoal-muted">Processes online UPI, card, and net banking payments via encrypted PCI-DSS channels.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-bold text-forest-deep">3. Transactional Communication Services</p>
                  <p className="text-charcoal-muted">Standard SMS gateways and SMTP email services used strictly to transmit order confirmations, dispatch receipts, and OTP verification codes.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-bold text-forest-deep">4. Legal and Law Enforcement Authorities</p>
                  <p className="text-charcoal-muted">Disclosed only when strictly required by a valid legal subpoena, court order, or regulatory directive under Indian law.</p>
                </div>
              </div>
            </section>

            {/* SECTION 16 */}
            <section id="section-16" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  16
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Data Storage, Hosting Infrastructure and Backups
                </h2>
              </div>
              <p>
                Customer account records, orders, and customer inquiries are stored in secure server environments located in India.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Backend Architecture:</strong> Modern Node.js Express architecture with unified database persistence layers;</li>
                <li><strong>Hosting Provider:</strong> [OWNER CONFIRMATION REQUIRED: Primary Cloud Hosting Provider / Server Infrastructure Location];</li>
                <li><strong>Storage Redundancy:</strong> Server files maintain automated atomic backup copies (<code>.bak</code> files) to prevent data corruption during server updates;</li>
                <li><strong>Access Control:</strong> Administrative databases are protected by hashed credentials, session timeouts, and restricted administrative routes accessible only to authorized personnel.</li>
              </ul>
            </section>

            {/* SECTION 17 */}
            <section id="section-17" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  17
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Data Retention and Purpose Limitation Periods
                </h2>
              </div>
              <p>
                We retain personal information only for as long as necessary to fulfill the purposes for which it was gathered, or as mandated by statutory Indian laws:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Active Customer Accounts:</strong> Retained for the duration of your active account so you can access your order history, tracking records, and saved addresses;</li>
                <li><strong>Financial & Tax Invoices:</strong> Retained for a minimum of <strong>8 (eight) financial years</strong> in compliance with the Central Goods and Services Tax Act, 2017 and Income Tax Act, 1961;</li>
                <li><strong>Order Fulfillment & Courier Logs:</strong> Retained for <strong>180 days</strong> post-delivery to resolve courier claims, warranty inquiries, or customer support disputes;</li>
                <li><strong>OTP Verification Codes:</strong> Held in memory for a maximum of <strong>10 minutes</strong> and purged immediately upon verification or expiry;</li>
                <li><strong>Customer Support Messages:</strong> Retained for up to <strong>12 months</strong> to monitor service quality and resolve repeat inquiries.</li>
              </ul>
            </section>

            {/* SECTION 18 */}
            <section id="section-18" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  18
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Technical and Organizational Security Safeguards
                </h2>
              </div>
              <p>
                We have implemented robust commercial security safeguards designed to protect personal data from accidental loss, unauthorized access, destruction, or disclosure:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <p className="font-bold text-forest-deep flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-forest" /> 256-Bit SSL Transport Encryption
                  </p>
                  <p className="text-charcoal-muted">All web traffic between your browser and our servers is encrypted using modern TLS/HTTPS protocols.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <p className="font-bold text-forest-deep flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-forest" /> Scrypt Password & Token Hashing
                  </p>
                  <p className="text-charcoal-muted">Cryptographic hashing ensures passwords cannot be reverse-engineered even in the event of an infrastructure breach.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <p className="font-bold text-forest-deep flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-forest" /> Rate-Limiting & Anti-Brute Force
                  </p>
                  <p className="text-charcoal-muted">API rate limiters automatically block excessive login attempts and bot attacks.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <p className="font-bold text-forest-deep flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-forest" /> Sanitized Input Validation
                  </p>
                  <p className="text-charcoal-muted">All user inputs are stripped of malicious code, SQL injection, and Cross-Site Scripting (XSS) vectors.</p>
                </div>
              </div>
              <p className="text-xs text-charcoal-muted">
                While we enforce strict commercial safeguards, please remember that no method of electronic internet transmission is 100% invulnerable. We encourage you to safeguard your mobile device and never share your OTPs with anyone.
              </p>
            </section>

            {/* SECTION 19 */}
            <section id="section-19" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  19
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Cross-Border and International Data Transfers
                </h2>
              </div>
              <p>
                Fibax Ayurveda conducts its business within India, serving consumers across Indian states and union territories.
              </p>
              <p className="text-xs text-charcoal">
                Customer databases, order records, and shipping addresses are stored within Indian jurisdictions. Certain global service providers (such as Google Analytics or Microsoft Clarity) may process aggregated, anonymized analytical telemetry through their globally distributed cloud networks in compliance with applicable cross-border data transfer regulations and standard contractual privacy clauses under the DPDP Act.
              </p>
            </section>

            {/* SECTION 20 */}
            <section id="section-20" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  20
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Customer Privacy Rights Under Indian Law
                </h2>
              </div>
              <p>
                As a valued Data Principal under the <strong>Digital Personal Data Protection Act, 2023</strong>, you are entitled to the following statutory rights regarding your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Right to Access Information:</strong> You have the right to obtain a summary of personal data being processed by us and the identities of data processors with whom such data has been shared;</li>
                <li><strong>Right to Correction & Updating:</strong> You have the right to request correction of inaccurate or incomplete personal data;</li>
                <li><strong>Right to Erasure:</strong> You have the right to request deletion of your personal data when the purpose of collection has been served, subject to statutory tax and accounting retention requirements;</li>
                <li><strong>Right to Grievance Redressal:</strong> You have the right to readily available means of grievance redressal regarding any act or omission of the Data Fiduciary;</li>
                <li><strong>Right to Nominate:</strong> You have the right to nominate another individual who shall, in the event of death or incapacity, exercise your privacy rights.</li>
              </ul>
            </section>

            {/* SECTION 21 */}
            <section id="section-21" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  21
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Marketing Communications and Consent Withdrawal
                </h2>
              </div>
              <p>
                We believe in permission-based communication:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal">
                <li><strong>Transactional vs. Promotional:</strong> We distinguish strictly between essential transactional communications (order receipts, Delhivery tracking links, OTPs) and promotional wellness newsletters;</li>
                <li><strong>Opt-In Clarity:</strong> We do not make consent for promotional advertising a compulsory precondition for placing a standard product order;</li>
                <li><strong>Opt-Out Mechanism:</strong> You may opt out of promotional emails by clicking the "Unsubscribe" link in any promotional message, or by sending an email with "UNSUBSCRIBE" to <code>care@fibaxpharma.com</code>. We will process your opt-out within 48 business hours.</li>
              </ul>
            </section>

            {/* SECTION 22 */}
            <section id="section-22" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  22
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Account Deletion and Personal Data Erasure
                </h2>
              </div>
              <p>
                If you wish to delete your Fibax Ayurveda account and request erasure of your personal records:
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p className="font-bold text-forest-deep">How to Submit an Erasure Request:</p>
                <p>
                  Send an email from your registered email address to <strong>care@fibaxpharma.com</strong> with the subject line <code>"Data Erasure Request - [Your 10-Digit Phone Number]"</code>.
                </p>
                <p>
                  Our team will verify your identity, de-identify your customer profile, and delete marketing records within <strong>30 (thirty) days</strong>.
                </p>
                <p className="text-charcoal-muted">
                  <strong>Statutory Retention Notice:</strong> In compliance with the Central Goods and Services Tax Act, 2017 and Indian accounting standards, historical sales invoices and order tax entries must be retained for legal and tax audit periods and cannot be wiped immediately upon request.
                </p>
              </div>
            </section>

            {/* SECTION 23 */}
            <section id="section-23" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  23
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Protection of Children’s Privacy
                </h2>
              </div>
              <p>
                Our Website is directed exclusively to adults aged 18 years and above. We do not knowingly solicit, collect, or process personal data from children under the age of 18 without verifiable parental or lawful guardian consent in accordance with Section 9 of the DPDP Act, 2023.
              </p>
              <p className="text-xs text-charcoal-muted">
                If we discover that personal information of a minor has been collected on our Website without verified parental consent, we will take immediate steps to delete such data from our servers. Parents or guardians who believe their child has provided personal information may contact us at <strong>care@fibaxpharma.com</strong>.
              </p>
            </section>

            {/* SECTION 24 */}
            <section id="section-24" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  24
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Third-Party Websites and External Links
                </h2>
              </div>
              <p>
                Our Website may occasionally contain links to external sites (such as scientific botanical studies, courier tracking portals, or social media pages).
              </p>
              <p className="text-xs text-charcoal">
                Fibax Pharma has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party websites or services. We encourage you to read the privacy notices of any external site you visit.
              </p>
            </section>

            {/* SECTION 25 */}
            <section id="section-25" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  25
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Data Breach Notification and Incident Response
                </h2>
              </div>
              <p>
                In the unlikely event of a security incident or personal data breach affecting our systems:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal">
                <li>We maintain an internal incident response protocol to isolate affected infrastructure and remediate vulnerabilities;</li>
                <li>In compliance with Section 8(6) of the DPDP Act, 2023, we will notify the <strong>Data Protection Board of India</strong> and affected Data Principals in the form and manner prescribed by statutory rules;</li>
                <li>Notifications will describe the nature of the breach, affected data categories, and recommended protective steps for customers.</li>
              </ul>
            </section>

            {/* SECTION 26 */}
            <section id="section-26" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  26
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  DPDP Act Compliance and Statutory Timeline
                </h2>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p className="font-bold text-forest-deep">Statutory Phased Implementation Notice:</p>
                <p>
                  The Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 operate under a phased commencement framework established by the Ministry of Electronics and Information Technology (MeitY), Government of India:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-charcoal-muted">
                  <li><strong>November 2025:</strong> Preliminary statutory notifications, establishment of Data Protection Board frameworks, and fundamental consent guidelines;</li>
                  <li><strong>November 2026:</strong> Mandatory operationalization of core Data Fiduciary duties, notice obligations, purpose limitations, and Data Principal rights;</li>
                  <li><strong>May 2027:</strong> Final statutory interoperability, technical audits, and institutional compliance enforcement.</li>
                </ul>
                <p>
                  Fibax Pharma is actively committed to maintaining continuous alignment as each phase of the DPDP framework comes into statutory effect.
                </p>
              </div>
            </section>

            {/* SECTION 27 */}
            <section id="section-27" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  27
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Amendments to This Privacy Policy
                </h2>
              </div>
              <p>
                Fibax Pharma reserves the right to amend, revise, or update this Privacy Policy from time to time to reflect operational modifications, technical advancements, or regulatory amendments under Indian law.
              </p>
              <p className="text-xs text-charcoal-muted">
                Whenever changes are published, we will update the "Last Updated" date at the top of this document. We encourage customers to review this Privacy Policy periodically to stay informed about how we safeguard personal data.
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
                In compliance with the <strong>Digital Personal Data Protection Act, 2023</strong> and Rule 5(3) of the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, Fibax Pharma has appointed a designated Grievance Officer:
              </p>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-2 text-xs">
                <p className="font-bold text-forest-deep">Designated Grievance Officer:</p>
                <p><strong>Name:</strong> [OWNER CONFIRMATION REQUIRED: Full Name of Designated Grievance Officer]</p>
                <p><strong>Official Designation:</strong> [OWNER CONFIRMATION REQUIRED: Grievance Officer / Operations Lead]</p>
                <p><strong>Postal Address:</strong> Fibax Pharma, Office No. 316, 3rd Floor, Block B, CCC (Chandigarh City Center), VIP Road, Zirakpur 140603 (PB), INDIA</p>
                <p><strong>Dedicated Grievance Email:</strong> [OWNER CONFIRMATION REQUIRED: Dedicated Grievance Email, e.g. grievance@fibaxpharma.com or care@fibaxpharma.com]</p>
                <p><strong>Helpline Number:</strong> [OWNER CONFIRMATION REQUIRED: Direct Phone Number or +91 8872544458]</p>
              </div>
              <p>
                <strong>Complaint Redressal Timelines:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-charcoal">
                <li>Every privacy grievance will be acknowledged within <strong>48 (forty-eight) hours</strong> with a unique tracking reference number;</li>
                <li>The grievance will be investigated and resolved within <strong>30 (thirty) days</strong> of receipt, and written communication of the resolution will be provided to the complainant.</li>
              </ul>
            </section>

            {/* SECTION 29 */}
            <section id="section-29" className="space-y-3.5 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  29
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep">
                  Contact Us for Data Privacy Inquiries
                </h2>
              </div>
              <p>
                If you have questions regarding this Privacy Policy, your personal data, or wish to exercise any of your statutory rights, please contact our privacy desk:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest">
                    <Mail className="h-4 w-4 text-brand" /> Privacy Email
                  </div>
                  <a href="mailto:care@fibaxpharma.com" className="text-charcoal hover:underline block truncate font-medium">
                    care@fibaxpharma.com
                  </a>
                  <p className="text-[10px] text-charcoal-muted">Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest">
                    <Phone className="h-4 w-4 text-brand" /> Helpline & WhatsApp
                  </div>
                  <a href="tel:+918872544458" className="text-charcoal hover:underline block font-medium">
                    +91 8872544458
                  </a>
                  <p className="text-[10px] text-charcoal-muted">Direct Customer Desk</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-sand-border space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-forest">
                    <MapPin className="h-4 w-4 text-brand" /> Corporate Office
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

      {/* Floating Back to Top */}
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
export default Privacy;
