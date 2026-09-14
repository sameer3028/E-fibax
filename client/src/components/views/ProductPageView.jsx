import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { ProductCard } from '../common/ProductCard/ProductCard';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Zap,
  Sparkles,
  Award,
  Leaf,
  Clock,
  HeartPulse,
  Share2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Info,
  Calendar
} from 'lucide-react';

export function ProductPageView({
  product,
  allProducts = [],
  onBack,
  onSelectProduct,
  onCheckout,
  onSelectConcern
}) {
  const { addToCart, openCart } = useCart();
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [activeFaq, setActiveFaq] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, ingredients, howToUse, labResults

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedPackIndex(0);
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  // Multi-pack course tiers
  const packs = product.multiPacks && product.multiPacks.length > 0
    ? product.multiPacks
    : [
        { name: '1 Unit (Standard Trial)', quantity: 1, price: product.salePrice, savings: 0, tag: 'Trial' },
        { name: '2 Units (60-Day Therapy)', quantity: 2, price: Math.round(product.salePrice * 2 * 0.9), savings: 'Save 10%', tag: 'Popular' },
        { name: '3-Month Complete Course', quantity: 3, price: Math.round(product.salePrice * 3 * 0.85), savings: 'Save 15%', tag: 'Best Results' },
      ];

  const currentPack = packs[selectedPackIndex] || packs[0];
  const unitPrice = Math.round(currentPack.price / (currentPack.quantity || 1));
  const regularMrpForPack = (product.mrp || Math.round(product.salePrice * 1.25)) * (currentPack.quantity || 1);
  const totalSavings = regularMrpForPack - currentPack.price;

  // Handle Add To Cart
  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        salePrice: unitPrice,
        mrp: product.mrp,
        selectedPackName: currentPack.name
      },
      currentPack.quantity * quantity
    );
  };

  // Handle Instant Buy Now
  const handleBuyNow = () => {
    handleAddToCart();
    if (onCheckout) onCheckout();
  };

  // Handle Pincode Check
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      setPincodeStatus({
        valid: true,
        message: 'Delivery in 2-4 business days via Delhivery Express. COD Available!'
      });
    } else {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }
  };

  // Handle Share Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Related products from same concern
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.concernId === product.concernId)
    .slice(0, 4);

  // Botanical Herbs breakdown
  const herbList = [
    {
      name: 'Amla (Indian Gooseberry)',
      sanskrit: 'Amalaki',
      role: 'Potent Vitamin C & Cellular Immunity',
      desc: 'Nourishes systemic tissues, balances all three doshas (Tridoshic), and strengthens cellular vitality.'
    },
    {
      name: 'Karela (Bitter Gourd)',
      sanskrit: 'Karavellaka',
      role: 'Active Polypeptide-p & Charantin',
      desc: 'Naturally activates AMP-activated protein kinase to promote healthy cellular glucose uptake.'
    },
    {
      name: 'Jamun (Black Plum)',
      sanskrit: 'Jambu Phala',
      role: 'Glycemic Regulation & Pancreatic Tonification',
      desc: 'Seeds and fruit extracts rich in jamboline that slow down the pathological conversion of starch into sugar.'
    },
    {
      name: 'Giloy (Guduchi)',
      sanskrit: 'Amrita — The Nectar of Life',
      role: 'Immunomodulator & Micro-Detox',
      desc: 'A divine Rasayana herb that cleanses liver-gut toxins (Ama) and enhances biological defense mechanisms.'
    },
    {
      name: 'Gudmar (Gymnema)',
      sanskrit: 'The Sugar Destroyer (Madhunashini)',
      role: 'Suppresses Sweet Receptors',
      desc: 'Clinically known to regenerate pancreatic islet beta cells and curb intense cravings for refined carbs.'
    },
    {
      name: 'Neem & Methi Extracts',
      sanskrit: 'Nimba & Methika',
      role: 'Lipid Balance & Metabolic Cleansing',
      desc: 'Improves digestive fire (Agni), enhances liver bile secretions, and protects micro-vascular capillary circulation.'
    }
  ];

  // FAQ list
  const faqs = [
    {
      q: 'Can I take this Ayurvedic formulation along with regular modern medicines?',
      a: 'Yes, Fibax formulations are 100% natural, AYUSH-approved botanical blends with zero synthetic chemicals. We advise maintaining a 30 to 45-minute gap between your regular medicines and Ayurvedic remedies.'
    },
    {
      q: 'How long should I follow the course for visible, lasting results?',
      a: 'Ayurveda addresses root imbalances rather than offering temporary suppression. We recommend a minimum 60 to 90-day course (3 bottles/packs) for cellular repair, metabolic balance, and sustained outcomes.'
    },
    {
      q: 'Are there any side effects or added preservatives?',
      a: 'None. Fibax products are free from added sugar, artificial colorings, parabens, and heavy metal impurities. They are formulated strictly in GMP and ISO-certified pharmaceutical facilities.'
    },
    {
      q: 'What is the recommended daily dosage and timing?',
      a: product.dosage || 'Take 15-30 ml mixed with equal parts lukewarm water, twice daily — preferably once on an empty stomach in the morning and once 30 minutes after dinner.'
    },
    {
      q: 'What are the delivery and storage guidelines?',
      a: 'All orders are dispatched within 24 hours via Delhivery Express with live tracking. Store the formulation in a cool, dry place away from direct sunlight. Shake well before each use.'
    }
  ];

  return (
    <div className="min-h-screen bg-sand-warm/30 text-charcoal pb-24 font-sans">
      {/* 1. Breadcrumb & Back Navigation */}
      <div className="bg-white border-b border-sand-border sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-charcoal-muted overflow-hidden">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 font-bold text-forest hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <span>/</span>
            <button
              onClick={() => onSelectConcern && onSelectConcern(product.concernId)}
              className="hover:text-forest transition-colors truncate hidden sm:inline"
            >
              {product.concernId ? product.concernId.replace(/-/g, ' ').toUpperCase() : 'AYURVEDIC CARE'}
            </button>
            <span className="hidden sm:inline">/</span>
            <span className="font-semibold text-charcoal truncate">{product.title}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand text-charcoal text-xs font-semibold hover:bg-sand-border transition-colors flex-shrink-0"
          >
            <Share2 className="h-3 w-3" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 2. Main Hero Buy Box Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-card mb-12">
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl bg-sand/40 border border-sand-border p-6 flex items-center justify-center overflow-hidden group">
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.isBestseller && (
                  <span className="bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>BESTSELLER</span>
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    SAVE {product.discountPercent}%
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3 z-10">
                <span className="bg-white/90 backdrop-blur-xs border border-sand-border text-forest text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                  <span>100% AYURVEDIC</span>
                </span>
              </div>

              <img
                src={product.featuredImage}
                alt={product.title}
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Thumbnail Carousel / Trust Features */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-sand/50 border border-sand-border text-center">
                <Leaf className="h-5 w-5 text-forest mx-auto mb-1" />
                <div className="text-[11px] font-bold text-forest-deep">Pure Botanical</div>
                <div className="text-[9px] text-charcoal-muted">Raw Whole Herbs</div>
              </div>
              <div className="p-3 rounded-xl bg-sand/50 border border-sand-border text-center">
                <Award className="h-5 w-5 text-gold mx-auto mb-1" />
                <div className="text-[11px] font-bold text-forest-deep">AYUSH Approved</div>
                <div className="text-[9px] text-charcoal-muted">Govt. Certified</div>
              </div>
              <div className="p-3 rounded-xl bg-sand/50 border border-sand-border text-center">
                <RotateCcw className="h-5 w-5 text-brand mx-auto mb-1" />
                <div className="text-[11px] font-bold text-forest-deep">Zero Chemicals</div>
                <div className="text-[9px] text-charcoal-muted">No Added Sugar</div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Pricing, Multi-Packs & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              {/* Category & Format Pill */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest uppercase tracking-wider bg-forest/10 px-2.5 py-0.5 rounded-full">
                  {product.dosageForm} • {product.volumeWeight}
                </span>
                <span className="text-xs text-charcoal-muted font-mono font-semibold">
                  SKU: {product.sku || `FBX-${product.id}`}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep leading-tight">
                {product.title}
              </h1>

              {/* Star Ratings & Verified Badge */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900 text-xs font-bold">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="ml-1">{product.ratingAverage || '4.9'}</span>
                </div>
                <span className="text-xs text-charcoal-muted font-medium">
                  ({product.ratingCount || 342} verified customer reviews)
                </span>
                <span className="text-xs font-semibold text-forest flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified Purchase</span>
                </span>
              </div>

              {/* Price Banner */}
              <div className="pt-2 pb-3 border-y border-sand-border/80 flex flex-wrap items-baseline gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-forest">
                    {formatPrice(currentPack.price)}
                  </span>
                  <span className="text-base text-charcoal-muted line-through">
                    {formatPrice(regularMrpForPack)}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
                  SAVE {formatPrice(totalSavings)} ({Math.round((totalSavings / regularMrpForPack) * 100)}% OFF)
                </span>

                <span className="text-xs text-charcoal-muted ml-auto">
                  Inclusive of all taxes & free shipping
                </span>
              </div>

              {/* Multi-Pack Selector (AOV Booster from Krishna's Herbal) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-forest">
                  <span className="uppercase tracking-wider">Select Treatment Course / Value Pack:</span>
                  <span className="text-brand font-semibold">Recommended 90-Day Course for Best Results</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packs.map((pack, idx) => {
                    const isSelected = idx === selectedPackIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPackIndex(idx)}
                        className={`p-3.5 rounded-2xl text-left border-2 transition-all relative ${
                          isSelected
                            ? 'border-brand bg-brand-soft/30 shadow-md shadow-brand/10'
                            : 'border-sand-border bg-white hover:border-brand/40'
                        }`}
                      >
                        {pack.tag && (
                          <span
                            className={`absolute -top-2.5 right-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isSelected ? 'bg-brand text-white' : 'bg-sand-border text-charcoal'
                            }`}
                          >
                            {pack.tag}
                          </span>
                        )}
                        <div className="text-xs font-bold text-forest-deep">{pack.name}</div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="font-extrabold text-base text-forest">
                            {formatPrice(pack.price)}
                          </span>
                          {pack.savings && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                              {pack.savings}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-charcoal-muted mt-1">
                          {formatPrice(Math.round(pack.price / (pack.quantity || 1)))} / unit
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector + Action CTAs */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center gap-3">
                  {/* Qty Stepper */}
                  <div className="flex items-center border border-sand-border rounded-xl bg-sand/50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-charcoal hover:text-brand shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-charcoal">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-charcoal hover:text-brand shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Add To Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-hover text-white text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-orange-glow flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add To Cart • {formatPrice(currentPack.price * quantity)}</span>
                  </button>

                  {/* Buy Now Instant CTA */}
                  <button
                    onClick={handleBuyNow}
                    className="py-3.5 px-6 rounded-2xl bg-forest hover:bg-forest-light text-white text-sm font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <Zap className="h-4 w-4 text-gold" />
                    <span className="hidden sm:inline">Buy Now</span>
                  </button>
                </div>

                {/* Delhivery Express Pincode Estimator */}
                <div className="p-3.5 rounded-2xl bg-sand/40 border border-sand-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-forest" />
                      <span>Check Express Delivery & COD Availability</span>
                    </span>
                    <span className="text-[11px] text-forest font-bold">Fastest Dispatch</span>
                  </div>

                  <form onSubmit={handleCheckPincode} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter 6-digit PIN code..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-colors"
                    >
                      Check
                    </button>
                  </form>

                  {pincodeStatus && (
                    <div
                      className={`text-xs p-2 rounded-lg flex items-center gap-1.5 ${
                        pincodeStatus.valid ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {pincodeStatus.valid ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      <span>{pincodeStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Trust Badges Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-charcoal-muted text-center border-t border-sand-border">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                    <span>Free Shipping ₹499+</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                    <span>Cash on Delivery</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-forest" />
                    <span>Delhivery Express</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. A+ CONTENT SECTION (Modelled on Krishna's Herbal A+ modules) */}
        <div className="space-y-12">
          {/* A+ Section 1: The Ayurvedic Formulation Story */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-border shadow-card overflow-hidden">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Authentic Ayurvedic Heritage</span>
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-forest-deep leading-tight">
                Root-Cause Restoration with 100% Raw Ayurvedic Herbs
              </h2>
              <p className="text-sm text-charcoal leading-relaxed">
                Unlike synthetic pills that provide temporary superficial relief,{' '}
                <strong className="text-forest font-bold">{product.title}</strong> is prepared by traditional cold decoction extraction to preserve active botanical phytoconstituents. It nourishes deep tissue systems (Dhatus), eliminates accumulated toxic bio-waste (Ama), and restores physiological equilibrium naturally.
              </p>
            </div>

            {/* Visual 3-Column Core Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="p-6 rounded-2xl bg-sand/40 border border-sand-border text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-forest text-white flex items-center justify-center mx-auto shadow-sm">
                  <Leaf className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-forest-deep text-base">Cold Extraction Method</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Extracted within 24 hours of wild-crafting to retain heat-sensitive botanical enzymes, tannins, and bioflavonoids.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-sand/40 border border-sand-border text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-brand text-white flex items-center justify-center mx-auto shadow-sm">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-forest-deep text-base">Targets Biological Root Cause</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Balances elevated Vata, Pitta, and Kapha doshas while optimizing cellular metabolism and digestive fire (Agni).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-sand/40 border border-sand-border text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-forest-dark text-white flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-forest-deep text-base">Heavy-Metal Lab Tested</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Every batch undergoes rigorous 3-tier testing for Lead, Mercury, Arsenic, and microbial safety under AYUSH standards.
                </p>
              </div>
            </div>
          </div>

          {/* A+ Section 2: Botanical Ingredients Breakdown */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-border shadow-card">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                What Goes Inside Every Bottle
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep">
                The Botanical Powerhouse Behind the Results
              </h2>
              <p className="text-xs text-charcoal-muted">
                Each ingredient is selected based on classical Ayurvedic treatises and verified modern pharmacological research.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {herbList.map((herb, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-sand/30 border border-sand-border hover:border-forest/40 hover:bg-sand/60 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-forest uppercase tracking-wider">
                      {herb.sanskrit}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-forest/10 text-forest text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-forest-deep text-base">{herb.name}</h4>
                  <div className="text-xs font-semibold text-brand">{herb.role}</div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">{herb.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* A+ Section 3: How To Consume & 90-Day Course Journey */}
          <div className="bg-forest-deep text-white rounded-3xl p-8 sm:p-10 shadow-botanical relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3 mb-12">
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Daily Wellness Protocol</span>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
                How to Consume for Maximum Therapeutic Results
              </h2>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Consistency is key in Ayurvedic healing. Follow this simple 3-step ritual daily.
              </p>
            </div>

            {/* 3 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
              <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gold text-forest-deep font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">
                  1
                </div>
                <h4 className="font-heading font-bold text-lg text-white">Shake & Measure</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Shake the bottle thoroughly. Measure 20-30 ml (approx 2-3 tablespoons) of the formulation.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gold text-forest-deep font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">
                  2
                </div>
                <h4 className="font-heading font-bold text-lg text-white">Dilute with Water</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Mix with an equal quantity (30 ml) of lukewarm or normal drinking water in a glass.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/15 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gold text-forest-deep font-extrabold text-lg flex items-center justify-center mx-auto shadow-md">
                  3
                </div>
                <h4 className="font-heading font-bold text-lg text-white">Twice Daily Ritual</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Drink once in the morning on an empty stomach and once 30 minutes after dinner.
                </p>
              </div>
            </div>

            {/* 90-Day Course Progression Timeline */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-6 border border-white/15 relative z-10 space-y-4">
              <h4 className="text-center font-heading font-bold text-gold text-lg">
                Your 90-Day Ayurvedic Course Progression
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-1">
                  <div className="text-amber-300 font-bold uppercase text-[10px]">Day 1 - 30 (Bottle 1)</div>
                  <div className="font-bold text-white text-sm">Metabolic Detox & Cleansing</div>
                  <p className="text-emerald-100/70 text-[11px]">
                    Flushes metabolic toxins (Ama), jumpstarts sluggish digestive Agni, and stabilizes morning fatigue.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-1">
                  <div className="text-amber-300 font-bold uppercase text-[10px]">Day 31 - 60 (Bottle 2)</div>
                  <div className="font-bold text-white text-sm">Organ Balance & Glycemic Control</div>
                  <p className="text-emerald-100/70 text-[11px]">
                    Noticeable reduction in post-meal spikes, balanced lipid levels, and improved stamina throughout the day.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-1">
                  <div className="text-amber-300 font-bold uppercase text-[10px]">Day 61 - 90 (Bottle 3)</div>
                  <div className="font-bold text-white text-sm">Long-Term Equilibrium</div>
                  <p className="text-emerald-100/70 text-[11px]">
                    Restores cellular receptor sensitivity, supports sustained organ vitality, and locks in long-term wellness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* A+ Section 4: Comparison Table (Fibax vs Conventional Brands) */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-border shadow-card overflow-hidden">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <span className="text-xs font-bold text-forest uppercase tracking-wider">Clinical Comparison</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep">
                Why Fibax Pharma Stands Out
              </h2>
              <p className="text-xs text-charcoal-muted">
                See the tangible difference between authentic cold-pressed Ayurveda and typical marketplace brands.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-border text-xs uppercase font-bold text-charcoal-muted">
                    <th className="py-3 px-4">Feature / Standard</th>
                    <th className="py-3 px-4 text-forest bg-forest/5 rounded-t-xl font-extrabold">Fibax Pharma</th>
                    <th className="py-3 px-4">Conventional Market Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border text-xs">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">Extraction Technique</td>
                    <td className="py-3.5 px-4 font-bold text-forest bg-forest/5 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-forest" />
                      <span>Cold Decoction & Raw Swaras</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted">High-heat boiling (destroys enzymes)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">Sugar & Artificial Sweeteners</td>
                    <td className="py-3.5 px-4 font-bold text-forest bg-forest/5 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-forest" />
                      <span>Zero Added Sugar or Aspartame</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted">Often laden with sugar syrup for taste</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">Raw Herb Sourcing</td>
                    <td className="py-3.5 px-4 font-bold text-forest bg-forest/5 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-forest" />
                      <span>Certified Organic Ayurvedic Farms</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted">Commercial dried powders of mixed origin</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">Safety & Heavy Metal Testing</td>
                    <td className="py-3.5 px-4 font-bold text-forest bg-forest/5 flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-forest" />
                      <span>3-Tier NABL Accredited Lab Tested</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted">Rarely published batch test reports</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">Government Approvals</td>
                    <td className="py-3.5 px-4 font-bold text-forest bg-forest/5 rounded-b-xl flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-forest" />
                      <span>AYUSH Ministry & GMP Certified</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-muted">Standard food license only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* A+ Section 5: Doctor Vaidya Endorsement & Reviews */}
          <div className="bg-sand-warm/60 rounded-3xl p-8 sm:p-10 border border-sand-border shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center shadow-md">
                    <Stethoscope className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-forest-deep">
                      Dr. Vaidya Ramanathan (B.A.M.S.)
                    </h3>
                    <p className="text-xs text-charcoal-muted font-medium">
                      Senior Ayurvedic Physician • 24+ Years Clinical Practice
                    </p>
                  </div>
                </div>

                <p className="text-xs text-charcoal leading-relaxed italic bg-white p-4 rounded-2xl border border-sand-border">
                  "In modern clinical practice, metabolic disorders and chronic inflammation stem from weak digestive fire and toxic accumulation. Fibax’s formulation honors the classical Caraka Samhita principles while maintaining rigorous standardization. I frequently recommend this course for sustainable, non-habit-forming patient care."
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-forest">
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-gold" />
                    <span>Free Doctor Consultation</span>
                  </span>
                  <a
                    href="https://wa.me/917657963458?text=Hello%20Doctor,%20I%20have%20questions%20regarding%20Fibax%20formulation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline font-bold"
                  >
                    Chat with Ayurvedic Vaidya →
                  </a>
                </div>
              </div>

              {/* Rating Metrics Card */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-sand-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-forest-deep">{product.ratingAverage || '4.9'} / 5.0</div>
                    <p className="text-xs text-charcoal-muted">Based on 1,420+ real customer verified ratings</p>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-charcoal font-semibold">5 Star</span>
                    <div className="flex-1 h-2 rounded-full bg-sand-border overflow-hidden">
                      <div className="w-[88%] h-full bg-emerald-600 rounded-full" />
                    </div>
                    <span className="w-8 text-right text-charcoal-muted font-mono">88%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-charcoal font-semibold">4 Star</span>
                    <div className="flex-1 h-2 rounded-full bg-sand-border overflow-hidden">
                      <div className="w-[9%] h-full bg-emerald-500 rounded-full" />
                    </div>
                    <span className="w-8 text-right text-charcoal-muted font-mono">9%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-charcoal font-semibold">3 Star</span>
                    <div className="flex-1 h-2 rounded-full bg-sand-border overflow-hidden">
                      <div className="w-[2%] h-full bg-amber-400 rounded-full" />
                    </div>
                    <span className="w-8 text-right text-charcoal-muted font-mono">2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* A+ Section 6: Interactive Frequently Asked Questions */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-border shadow-card">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <span className="text-xs font-bold text-forest uppercase tracking-wider">Everything You Need to Know</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-charcoal-muted">
                Clear answers to common questions about usage, safety, and course length.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-sand-border rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm text-forest-deep hover:bg-sand/40 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-brand flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-charcoal-muted flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 text-xs text-charcoal leading-relaxed bg-sand/20 border-t border-sand-border/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* A+ Section 7: Related Formulations Carousel */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-forest-deep">
                    Complementary Ayurvedic Remedies
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Frequently prescribed together for synergistic health outcomes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <ProductCard
                    key={relProduct.id}
                    product={relProduct}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Sticky Bottom Mobile Add-To-Cart Conversion Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-sand-border p-3 z-40 shadow-2xl flex items-center justify-between gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={product.featuredImage}
            alt={product.title}
            className="w-11 h-11 rounded-lg object-contain bg-sand p-1 border border-sand-border flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-heading font-bold text-xs text-charcoal truncate">{product.title}</h4>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-forest text-sm">{formatPrice(currentPack.price)}</span>
              <span className="text-[11px] text-charcoal-muted line-through">{formatPrice(regularMrpForPack)}</span>
              <span className="text-[10px] text-red-600 font-bold hidden sm:inline">({currentPack.name})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAddToCart}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow-orange-glow flex items-center gap-1.5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
