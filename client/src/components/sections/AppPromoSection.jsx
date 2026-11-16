import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Truck,
  Phone,
  ShieldCheck,
  Leaf,
  Heart,
  Clock,
  Gift,
  Zap,
  Award,
  Star,
  ArrowRight,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

// Map icon names to Lucide icons
const BENEFIT_ICONS = {
  check: Check,
  truck: Truck,
  phone: Phone,
  shield: ShieldCheck,
  leaf: Leaf,
  sparkles: Sparkles,
  heart: Heart,
  clock: Clock,
  gift: Gift,
  zap: Zap,
  award: Award,
  star: Star
};

function renderBenefitIcon(iconName, className = "h-3.5 w-3.5") {
  const IconComponent = BENEFIT_ICONS[(iconName || '').toLowerCase()] || Check;
  return <IconComponent className={className} />;
}

// Fallback default configuration in case API is offline or returns error
const DEFAULT_CONFIG = {
  enabled: true,
  status: 'active',
  showOnDesktop: true,
  showOnMobile: true,
  badge: {
    show: true,
    text: 'EXCLUSIVE MEMBERSHIP BENEFIT',
    bgColor: '#fbbf24',
    textColor: '#062512'
  },
  heading: {
    main: 'FIBAX WELLNESS CLUB',
    highlight: 'GET FLAT ₹100 OFF',
    suffix: 'ON 1ST ORDER'
  },
  description: 'Join over 1,00,000+ members enjoying direct-to-home priority dispatch, complimentary Doctor WhatsApp consultations, and seasonal discount coupons.',
  benefits: [
    { id: 'b1', text: 'Free Delhivery tracking on all orders', icon: 'truck', enabled: true },
    { id: 'b2', text: 'Direct Ayurvedic Vaidya consultation', icon: 'phone', enabled: true },
    { id: 'b3', text: 'Fresh farm harvest priority batches', icon: 'leaf', enabled: true },
    { id: 'b4', text: 'Cash on Delivery + UPI accepted', icon: 'shield', enabled: true }
  ],
  ctaButton: {
    show: true,
    text: 'ORDER DIRECT ON WHATSAPP',
    url: 'https://wa.me/918872544458?text=Hello%20Fibax,%20I%20want%20to%20join%20the%20Wellness%20Club',
    openInNewTab: true,
    bgColor: '#e65c00',
    textColor: '#ffffff'
  },
  coupon: {
    show: true,
    code: 'WELCOME10',
    label: 'Use Coupon:'
  },
  productCard: {
    show: true,
    topLabel: 'Fibax Express',
    statusLabel: 'ONLINE',
    name: 'Safed Musli Vitality Powder',
    price: '₹600',
    originalPrice: '₹672',
    image: '/uploads/safed-musli.png',
    fallbackImage: '/uploads/fibax-safed-musli-powder.jpg',
    altText: 'Safed Musli Vitality Powder',
    promoMessage: 'Free Delivery Unlocked!'
  },
  design: {
    bgColor: '#0f301e',
    textColor: '#ffffff',
    highlightColor: '#fde047',
    badgeBgColor: '#fbbf24',
    badgeTextColor: '#062512',
    ctaBgColor: '#e65c00'
  }
};

export function AppPromoSection() {
  const [config, setConfig] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchWellnessClubData() {
      try {
        const res = await apiRequest('/api/website/wellness-club');
        if (isMounted && res && res.success) {
          if (res.data) {
            setConfig(res.data);
          } else if (res.status === 'paused' || res.enabled === false) {
            setConfig({ enabled: false, status: 'paused' });
          } else {
            setConfig(DEFAULT_CONFIG);
          }
        } else if (isMounted) {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        if (isMounted) setConfig(DEFAULT_CONFIG);
      } finally {
        if (isMounted) setLoaded(true);
      }
    }

    fetchWellnessClubData();
    return () => {
      isMounted = false;
    };
  }, []);

  // While loading or if explicitly paused/disabled, do not render into DOM
  if (!loaded || !config || config.enabled === false || config.status === 'paused') {
    return null;
  }

  // Check device visibility toggles
  if (!config.showOnDesktop && !config.showOnMobile) {
    return null;
  }

  const deviceClass = !config.showOnDesktop && config.showOnMobile
    ? 'lg:hidden'
    : config.showOnDesktop && !config.showOnMobile
      ? 'hidden lg:block'
      : '';

  const handleCopyCoupon = (e) => {
    e.preventDefault();
    if (config.coupon?.code) {
      navigator.clipboard.writeText(config.coupon.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const activeBenefits = (config.benefits || []).filter(b => b && b.enabled !== false);
  const bgColor = config.design?.bgColor || '#0f301e';
  const textColor = config.design?.textColor || '#ffffff';
  const highlightColor = config.design?.highlightColor || '#fde047';
  const badgeBg = config.badge?.bgColor || config.design?.badgeBgColor || '#fbbf24';
  const badgeText = config.badge?.textColor || config.design?.badgeTextColor || '#062512';
  const ctaBg = config.ctaButton?.bgColor || config.design?.ctaBgColor || '#e65c00';
  const ctaText = config.ctaButton?.textColor || '#ffffff';

  return (
    <section className={`py-14 bg-[#f2ede4] relative overflow-hidden border-y border-[#e5ded0] ${deviceClass}`}>
      {/* Background botanical foliage decorative accents */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className="rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden border border-[#2b593d]"
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(135deg, ${bgColor} 0%, rgba(10,35,21,0.95) 100%)`,
            color: textColor
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Optional Top Badge */}
              {config.badge?.show !== false && (
                <div
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm"
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeText
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{config.badge?.text || 'EXCLUSIVE MEMBERSHIP BENEFIT'}</span>
                </div>
              )}

              {/* 3-Part Main Heading */}
              <h2
                className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight"
                style={{ color: textColor }}
              >
                {config.heading?.main || 'FIBAX WELLNESS CLUB'} <br />
                <span style={{ color: highlightColor }}>
                  {config.heading?.highlight || 'GET FLAT ₹100 OFF'}
                </span>{' '}
                {config.heading?.suffix || 'ON 1ST ORDER'}
              </h2>

              {/* Description */}
              {config.description && (
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans font-medium">
                  {config.description}
                </p>
              )}

              {/* Benefits Checklist */}
              {activeBenefits.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-white">
                  {activeBenefits.map((benefit, idx) => (
                    <div key={benefit.id || `b-${idx}`} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                        {renderBenefitIcon(benefit.icon)}
                      </div>
                      <span className="text-emerald-50 font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Row: CTA Button + Coupon */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {config.ctaButton?.show !== false && (
                  <a
                    href={config.ctaButton?.url || 'https://wa.me/918872544458?text=Hello%20Fibax,%20I%20want%20to%20join%20the%20Wellness%20Club'}
                    target={config.ctaButton?.openInNewTab !== false ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="px-7 py-3 rounded-full font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-orange-glow flex items-center gap-2 cursor-pointer hover:opacity-95"
                    style={{
                      backgroundColor: ctaBg,
                      color: ctaText
                    }}
                  >
                    <span>{config.ctaButton?.text || 'ORDER DIRECT ON WHATSAPP'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}

                {config.coupon?.show !== false && config.coupon?.code && (
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="group flex items-center gap-1.5 text-[11px] text-emerald-200/90 font-medium bg-black/20 hover:bg-black/35 px-3 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer"
                    title="Click to copy coupon code"
                  >
                    <span>{config.coupon?.label || 'Use Coupon:'}</span>
                    <strong className="text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20 tracking-wider">
                      {config.coupon.code}
                    </strong>
                    {copied ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold ml-1 animate-fadeIn">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Copied!
                      </span>
                    ) : (
                      <Copy className="h-3 w-3 text-emerald-300/70 group-hover:text-emerald-200 transition-colors ml-0.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Graphic: Product Card Display */}
            {config.productCard?.show !== false && (
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-64 sm:w-72 rounded-3xl bg-white p-3 shadow-2xl border-4 border-amber-300/40 transform hover:scale-102 transition-transform">
                  <div className="rounded-2xl overflow-hidden bg-sand p-4 border border-sand-border space-y-3">
                    <div className="flex items-center justify-between border-b border-sand-border pb-2">
                      <div className="font-heading font-extrabold text-xs text-forest">
                        {config.productCard?.topLabel || 'Fibax Express'}
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {config.productCard?.statusLabel || 'ONLINE'}
                      </span>
                    </div>

                    <div className="aspect-square rounded-xl bg-white p-3 flex items-center justify-center border border-sand-border overflow-hidden">
                      <img
                        src={config.productCard?.image || '/uploads/safed-musli.png'}
                        alt={config.productCard?.altText || 'Featured Fibax Product'}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = config.productCard?.fallbackImage || '/uploads/fibax-safed-musli-powder.jpg';
                        }}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="font-heading font-bold text-xs text-charcoal truncate">
                        {config.productCard?.name || 'Safed Musli Vitality Powder'}
                      </div>
                      <div className="text-xs font-extrabold text-forest">
                        {config.productCard?.price || '₹600'}{' '}
                        {config.productCard?.originalPrice && (
                          <span className="text-[10px] text-charcoal-muted line-through font-normal">
                            {config.productCard.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {config.productCard?.promoMessage && (
                      <div className="w-full py-2 rounded-xl bg-brand text-white text-center text-xs font-bold shadow-xs">
                        {config.productCard.promoMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
