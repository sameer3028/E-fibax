import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Save,
  AlertCircle,
  CheckCircle2,
  Copy,
  Monitor,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Tag,
  Palette,
  Sliders,
  ArrowRight,
  Globe,
  Layers,
  ShoppingBag
} from 'lucide-react';

export const ICON_OPTIONS = [
  { id: 'check', label: 'Checkmark', icon: Check },
  { id: 'truck', label: 'Delivery Truck', icon: Truck },
  { id: 'phone', label: 'Doctor Phone', icon: Phone },
  { id: 'shield', label: 'Safety Shield', icon: ShieldCheck },
  { id: 'leaf', label: 'Natural Leaf', icon: Leaf },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'heart', label: 'Health Heart', icon: Heart },
  { id: 'clock', label: 'Clock / Time', icon: Clock },
  { id: 'gift', label: 'Gift Box', icon: Gift },
  { id: 'zap', label: 'Fast / Energy', icon: Zap },
  { id: 'award', label: 'AYUSH Quality', icon: Award },
  { id: 'star', label: 'Star Rating', icon: Star }
];

export function BenefitIcon({ iconName, className = "h-3.5 w-3.5" }) {
  const item = ICON_OPTIONS.find(i => i.id === (iconName || '').toLowerCase());
  const IconComponent = item ? item.icon : Check;
  return <IconComponent className={className} />;
}

const DEFAULT_BANNER_CONFIG = {
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
    { id: 'benefit-1', text: 'Free Delhivery tracking on all orders', icon: 'truck', enabled: true },
    { id: 'benefit-2', text: 'Direct Ayurvedic Vaidya consultation', icon: 'phone', enabled: true },
    { id: 'benefit-3', text: 'Fresh farm harvest priority batches', icon: 'leaf', enabled: true },
    { id: 'benefit-4', text: 'Cash on Delivery + UPI accepted', icon: 'check', enabled: true }
  ],
  cta: {
    show: true,
    text: 'ORDER DIRECT ON WHATSAPP',
    url: 'https://wa.me/918872544458?text=Hello%20Fibax,%20I%20want%20to%20join%20the%20Wellness%20Club',
    whatsappNumber: '918872544458',
    whatsappMessage: 'Hello Fibax, I want to join the Wellness Club',
    openInNewTab: true
  },
  coupon: {
    show: true,
    code: 'WELCOME10',
    label: 'Use Coupon'
  },
  productCard: {
    show: true,
    topLabel: 'Fibax Express',
    statusLabel: 'ONLINE',
    image: '/uploads/safed-musli.png',
    altText: 'Safed Musli Vitality Powder',
    name: 'Safed Musli Vitality Powder',
    price: '600',
    originalPrice: '672',
    bottomPromoMessage: 'Free Delivery Unlocked!'
  },
  design: {
    bgColor: '#173e27',
    textColor: '#ffffff',
    highlightColor: '#fcd34d',
    badgeBgColor: '#fbbf24',
    btnColor: '#ea580c'
  }
};

export function WellnessClubManager() {
  const [config, setConfig] = useState(DEFAULT_BANNER_CONFIG);
  const [initialConfig, setInitialConfig] = useState(DEFAULT_BANNER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }
  const [previewViewport, setPreviewViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);

  // Load config from backend on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/website/wellness-club', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.success && res.data) {
        setConfig(res.data);
        setInitialConfig(res.data);
      }
    } catch (err) {
      console.error('Failed to load Wellness Club config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update deeply nested fields cleanly
  const updateField = (path, value) => {
    setConfig(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  // WhatsApp Link Generator
  const generateWhatsAppUrl = (phone, msg) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(msg || 'Hello Fibax, I want to join the Wellness Club');
    return `https://wa.me/${cleanPhone || '918872544458'}?text=${encodedMsg}`;
  };

  // Handle Image Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a valid image (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5 MB limit. Please select a smaller photo.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
        const res = await apiRequest('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: JSON.stringify({ image: reader.result, filename: file.name })
        });
        if (res.success && res.url) {
          updateField('productCard.image', res.url);
          setStatusMsg({ type: 'success', text: 'Product image uploaded successfully!' });
        } else {
          updateField('productCard.image', reader.result);
        }
      } catch (err) {
        updateField('productCard.image', reader.result);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      setUploadingImage(false);
      alert('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Benefit handlers
  const handleAddBenefit = () => {
    if (config.benefits.length >= 6) {
      alert('Maximum of 6 membership benefits supported.');
      return;
    }
    const newBenefit = {
      id: `benefit-${Date.now()}`,
      text: 'New Membership Privilege',
      icon: 'check',
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit]
    }));
  };

  const handleUpdateBenefit = (index, field, value) => {
    setConfig(prev => {
      const updated = [...prev.benefits];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, benefits: updated };
    });
  };

  const handleRemoveBenefit = (index) => {
    setConfig(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  // Reset to signature theme
  const handleResetTheme = () => {
    setConfig(prev => ({
      ...prev,
      design: { ...DEFAULT_BANNER_CONFIG.design },
      badge: {
        ...prev.badge,
        bgColor: DEFAULT_BANNER_CONFIG.badge.bgColor,
        textColor: DEFAULT_BANNER_CONFIG.badge.textColor
      }
    }));
  };

  // Reset all unsaved changes
  const handleDiscardChanges = () => {
    if (window.confirm('Discard all unsaved edits and restore last saved version?')) {
      setConfig(JSON.parse(JSON.stringify(initialConfig)));
      setStatusMsg({ type: 'info', text: 'Changes discarded.' });
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/website/wellness-club', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(config)
      });

      if (res.success && res.data) {
        setConfig(res.data);
        setInitialConfig(res.data);
        setStatusMsg({
          type: 'success',
          text: `Fibax Wellness Club banner successfully saved! (Status: ${res.data.status.toUpperCase()})`
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: res.error || 'Failed to save banner configuration.'
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: 'Network error occurred while saving.'
      });
    } finally {
      setSaving(false);
    }
  };

  const isPaused = config.status === 'paused' || config.enabled === false;

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumb, Status & Main Save Action */}
      <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Admin Navigation Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1 flex-wrap">
            <Globe className="h-4 w-4 text-brand" />
            <span>Website Content</span>
            <span>&rsaquo;</span>
            <span>Home Page Sections</span>
            <span>&rsaquo;</span>
            <span className="text-brand">Fibax Wellness Club</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-forest-deep flex items-center gap-2.5">
            <span>Fibax Wellness Club Banner CMS</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
              isPaused
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              {isPaused ? 'Paused / Hidden' : 'Active on Live Site'}
            </span>
          </h2>
          <p className="text-xs text-charcoal-muted mt-1 max-w-2xl">
            Manage the promotional banner, membership perks, WhatsApp direct order CTA, discount coupon, and featured product preview displayed on the live Home Page.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleDiscardChanges}
            disabled={saving || loading}
            className="px-4 py-2.5 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin text-gold" /> : <Save className="h-4 w-4 text-gold" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn border ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : statusMsg.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-sand text-charcoal border-sand-border'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-xs font-bold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Prominent Active / Pause Control Banner */}
      <div className={`p-5 rounded-3xl border-2 transition-all shadow-xs ${
        isPaused
          ? 'bg-amber-50/60 border-amber-300 text-amber-900'
          : 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <h3 className="font-bold text-sm">
                Section Visibility Status: <span className="uppercase tracking-wider">{isPaused ? 'Paused (Hidden)' : 'Active (Visible)'}</span>
              </h3>
            </div>
            <p className="text-xs text-charcoal-muted max-w-xl">
              {isPaused
                ? 'The Fibax Wellness Club banner is currently PAUSED and will NOT be shown on the live website. All your configured text, benefits, and images are preserved and safe.'
                : 'The Fibax Wellness Club banner is currently ACTIVE and rendering live on the Home Page for your customers.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-sand-border shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setConfig(prev => ({ ...prev, status: 'active', enabled: true }));
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isPaused
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-sand'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Active (Live)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setConfig(prev => ({ ...prev, status: 'paused', enabled: false }));
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isPaused
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-sand'
              }`}
            >
              <span>⏸ Paused (Hide)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Form Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Editor Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section A: Headings & Descriptions */}
          <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-bold text-sm text-forest-deep flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand" />
                <span>Banner Headings &amp; Promotional Copy</span>
              </h3>
            </div>

            {/* Top Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal">Top Badge Text</label>
                <label className="inline-flex items-center gap-1.5 text-xs text-charcoal-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.badge.show}
                    onChange={(e) => updateField('badge.show', e.target.checked)}
                    className="rounded text-forest focus:ring-forest"
                  />
                  <span>Show Top Badge</span>
                </label>
              </div>
              <input
                type="text"
                value={config.badge.text}
                onChange={(e) => updateField('badge.text', e.target.value)}
                placeholder="e.g. EXCLUSIVE MEMBERSHIP BENEFIT"
                className="w-full px-3.5 py-2.5 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            {/* Three-Part Heading */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Main Heading</label>
                <input
                  type="text"
                  value={config.heading.main}
                  onChange={(e) => updateField('heading.main', e.target.value)}
                  placeholder="e.g. FIBAX WELLNESS CLUB"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Highlighted Text <span className="text-amber-600 font-normal">(Gold)</span>
                </label>
                <input
                  type="text"
                  value={config.heading.highlight}
                  onChange={(e) => updateField('heading.highlight', e.target.value)}
                  placeholder="e.g. GET FLAT ₹100 OFF"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Heading Suffix</label>
                <input
                  type="text"
                  value={config.heading.suffix}
                  onChange={(e) => updateField('heading.suffix', e.target.value)}
                  placeholder="e.g. ON 1ST ORDER"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            {/* Main Promotional Description */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Promotional Description</label>
              <textarea
                rows="3"
                value={config.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Join over 1,00,000+ members enjoying direct-to-home priority dispatch..."
                className="w-full px-3.5 py-2.5 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section B: Membership Benefits (Perks Checklist) */}
          <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-forest-deep flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Membership Benefits Checklist ({config.benefits.length}/6)</span>
                </h3>
                <p className="text-[11px] text-charcoal-muted">Configure bullet points shown on the banner (up to 6 items).</p>
              </div>
              {config.benefits.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Benefit</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {config.benefits.map((benefit, idx) => (
                <div key={benefit.id || idx} className="p-3 bg-sand/40 border border-sand-border rounded-2xl flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* Icon Selector */}
                  <div className="relative w-36 flex-shrink-0">
                    <select
                      value={benefit.icon || 'check'}
                      onChange={(e) => handleUpdateBenefit(idx, 'icon', e.target.value)}
                      className="w-full pl-2 pr-6 py-1.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={benefit.text}
                    onChange={(e) => handleUpdateBenefit(idx, 'text', e.target.value)}
                    placeholder="e.g. Free Delhivery tracking on all orders"
                    className="flex-1 px-3 py-1.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                  />

                  {/* Enabled Toggle */}
                  <label className="flex items-center gap-1 text-[11px] text-charcoal cursor-pointer flex-shrink-0" title="Toggle visibility">
                    <input
                      type="checkbox"
                      checked={benefit.enabled !== false}
                      onChange={(e) => handleUpdateBenefit(idx, 'enabled', e.target.checked)}
                      className="rounded text-forest focus:ring-forest"
                    />
                    <span className="hidden sm:inline">Active</span>
                  </label>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Benefit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Call To Action (WhatsApp / Button) & Coupon */}
          <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-forest-deep flex items-center gap-2 border-b border-sand-border pb-3">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>CTA Button &amp; Coupon Code</span>
            </h3>

            {/* CTA Button Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-charcoal">CTA Button Text</label>
                  <label className="inline-flex items-center gap-1 text-[11px] text-charcoal-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.cta.show}
                      onChange={(e) => updateField('cta.show', e.target.checked)}
                      className="rounded text-forest focus:ring-forest"
                    />
                    <span>Show Button</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={config.cta.text}
                  onChange={(e) => updateField('cta.text', e.target.value)}
                  placeholder="e.g. ORDER DIRECT ON WHATSAPP"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">CTA Destination Link / URL</label>
                <input
                  type="text"
                  value={config.cta.url}
                  onChange={(e) => updateField('cta.url', e.target.value)}
                  placeholder="https://wa.me/918872544458?text=..."
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>
            </div>

            {/* WhatsApp Link Generator Helper */}
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-600" />
                  <span>WhatsApp Direct Link Helper</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateWhatsAppUrl(config.cta.whatsappNumber, config.cta.whatsappMessage);
                    updateField('cta.url', generated);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Generate &amp; Set URL
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-charcoal-muted block">WhatsApp Phone (with Country Code)</span>
                  <input
                    type="text"
                    value={config.cta.whatsappNumber || ''}
                    onChange={(e) => updateField('cta.whatsappNumber', e.target.value)}
                    placeholder="918872544458"
                    className="w-full px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-muted block">Pre-filled Chat Message</span>
                  <input
                    type="text"
                    value={config.cta.whatsappMessage || ''}
                    onChange={(e) => updateField('cta.whatsappMessage', e.target.value)}
                    placeholder="Hello Fibax, I want to join..."
                    className="w-full px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Coupon Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-charcoal">Coupon Code</label>
                  <label className="inline-flex items-center gap-1 text-[11px] text-charcoal-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.coupon.show}
                      onChange={(e) => updateField('coupon.show', e.target.checked)}
                      className="rounded text-forest focus:ring-forest"
                    />
                    <span>Show Coupon</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={config.coupon.code}
                  onChange={(e) => updateField('coupon.code', e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs font-bold text-brand uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Coupon Label</label>
                <input
                  type="text"
                  value={config.coupon.label}
                  onChange={(e) => updateField('coupon.label', e.target.value)}
                  placeholder="e.g. Use Coupon"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section D: Right-Side Product Card Settings */}
          <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-bold text-sm text-forest-deep flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-brand" />
                <span>Featured Product Preview Card</span>
              </h3>
              <label className="inline-flex items-center gap-1.5 text-xs text-charcoal-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.productCard.show}
                  onChange={(e) => updateField('productCard.show', e.target.checked)}
                  className="rounded text-forest focus:ring-forest"
                />
                <span>Enable Product Card</span>
              </label>
            </div>

            {/* Direct Image Upload from Computer */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal">Product Photo / Visual</label>
              <div className="flex items-center gap-4 p-4 bg-sand/40 border border-sand-border rounded-2xl">
                <div className="w-20 h-20 bg-white rounded-xl border border-sand-border flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                  {config.productCard.image ? (
                    <img
                      src={config.productCard.image}
                      alt={config.productCard.altText || 'Product preview'}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-charcoal-subtle" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold flex items-center gap-1.5 hover:bg-forest-light transition-colors cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image from Computer'}</span>
                    </button>

                    {config.productCard.image && (
                      <button
                        type="button"
                        onClick={() => updateField('productCard.image', '')}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    Supports JPG, PNG, WebP (max 5 MB). Uploads are safely stored in your persistent storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Product Title</label>
                <input
                  type="text"
                  value={config.productCard.name}
                  onChange={(e) => updateField('productCard.name', e.target.value)}
                  placeholder="e.g. Safed Musli Vitality Powder"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Image Alt Text (SEO)</label>
                <input
                  type="text"
                  value={config.productCard.altText || ''}
                  onChange={(e) => updateField('productCard.altText', e.target.value)}
                  placeholder="e.g. Safed Musli Vitality Powder"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Selling Price (₹)</label>
                <input
                  type="text"
                  value={config.productCard.price}
                  onChange={(e) => updateField('productCard.price', e.target.value)}
                  placeholder="600"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Original MRP (₹)</label>
                <input
                  type="text"
                  value={config.productCard.originalPrice}
                  onChange={(e) => updateField('productCard.originalPrice', e.target.value)}
                  placeholder="672"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Top Card Label</label>
                <input
                  type="text"
                  value={config.productCard.topLabel || ''}
                  onChange={(e) => updateField('productCard.topLabel', e.target.value)}
                  placeholder="e.g. Fibax Express"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Online Status Label</label>
                <input
                  type="text"
                  value={config.productCard.statusLabel || ''}
                  onChange={(e) => updateField('productCard.statusLabel', e.target.value)}
                  placeholder="e.g. ONLINE"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal mb-1">Bottom Promotional Tag</label>
                <input
                  type="text"
                  value={config.productCard.bottomPromoMessage || ''}
                  onChange={(e) => updateField('productCard.bottomPromoMessage', e.target.value)}
                  placeholder="e.g. Free Delivery Unlocked!"
                  className="w-full px-3 py-2 bg-sand/40 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section E: Design & Device Visibility */}
          <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-bold text-sm text-forest-deep flex items-center gap-2">
                <Palette className="h-4 w-4 text-brand" />
                <span>Design Colors &amp; Responsive Visibility</span>
              </h3>
              <button
                type="button"
                onClick={handleResetTheme}
                className="text-xs font-bold text-brand hover:underline cursor-pointer"
              >
                Reset to Default Theme
              </button>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">Background Base</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.design?.bgColor || '#173e27'}
                    onChange={(e) => updateField('design.bgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.design?.bgColor || '#173e27'}
                    onChange={(e) => updateField('design.bgColor', e.target.value)}
                    className="w-full px-2 py-1 bg-sand/40 border border-sand-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.design?.textColor || '#ffffff'}
                    onChange={(e) => updateField('design.textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.design?.textColor || '#ffffff'}
                    onChange={(e) => updateField('design.textColor', e.target.value)}
                    className="w-full px-2 py-1 bg-sand/40 border border-sand-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">Highlight Gold</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.design?.highlightColor || '#fcd34d'}
                    onChange={(e) => updateField('design.highlightColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.design?.highlightColor || '#fcd34d'}
                    onChange={(e) => updateField('design.highlightColor', e.target.value)}
                    className="w-full px-2 py-1 bg-sand/40 border border-sand-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">Badge Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.design?.badgeBgColor || '#fbbf24'}
                    onChange={(e) => updateField('design.badgeBgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.design?.badgeBgColor || '#fbbf24'}
                    onChange={(e) => updateField('design.badgeBgColor', e.target.value)}
                    className="w-full px-2 py-1 bg-sand/40 border border-sand-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">CTA Button Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.design?.btnColor || '#ea580c'}
                    onChange={(e) => updateField('design.btnColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.design?.btnColor || '#ea580c'}
                    onChange={(e) => updateField('design.btnColor', e.target.value)}
                    className="w-full px-2 py-1 bg-sand/40 border border-sand-border rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Device Visibility */}
            <div className="pt-2 border-t border-sand-border flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showOnDesktop !== false}
                  onChange={(e) => updateField('showOnDesktop', e.target.checked)}
                  className="rounded text-forest focus:ring-forest"
                />
                <Monitor className="h-4 w-4 text-forest" />
                <span>Display on Desktop Devices</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showOnMobile !== false}
                  onChange={(e) => updateField('showOnMobile', e.target.checked)}
                  className="rounded text-forest focus:ring-forest"
                />
                <Smartphone className="h-4 w-4 text-forest" />
                <span>Display on Mobile Devices</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-sand-border shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand" />
                <h3 className="font-bold text-sm text-forest-deep">Live Banner Preview</h3>
              </div>
              <div className="flex items-center gap-1 bg-sand p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewViewport === 'desktop' ? 'bg-white shadow-xs text-forest' : 'text-charcoal-muted'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewViewport === 'mobile' ? 'bg-white shadow-xs text-forest' : 'text-charcoal-muted'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div className={`mx-auto transition-all ${
              previewViewport === 'mobile' ? 'max-w-[340px]' : 'w-full'
            }`}>
              <div
                style={{
                  backgroundColor: config.design?.bgColor || '#173e27',
                  color: config.design?.textColor || '#ffffff'
                }}
                className="rounded-2xl p-5 text-white shadow-lg overflow-hidden border border-[#2b593d] space-y-4 text-left relative"
              >
                {/* Paused Overlay Indicator */}
                {isPaused && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-20 text-center rounded-2xl">
                    <div className="bg-white/95 text-charcoal p-4 rounded-xl shadow-lg space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
                        ⏸ Banner Currently Paused
                      </span>
                      <p className="text-[11px] text-charcoal-muted">
                        This section is completely hidden on the live website. Click "Active" and "Save Changes" to publish.
                      </p>
                    </div>
                  </div>
                )}

                {/* Badge */}
                {config.badge?.show && (
                  <div
                    style={{
                      backgroundColor: config.design?.badgeBgColor || config.badge.bgColor || '#fbbf24',
                      color: config.badge.textColor || '#062512'
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{config.badge.text}</span>
                  </div>
                )}

                {/* Heading */}
                <h3 className="font-heading text-lg font-black leading-snug tracking-tight">
                  {config.heading?.main} <br />
                  <span style={{ color: config.design?.highlightColor || '#fcd34d' }}>
                    {config.heading?.highlight}
                  </span>{' '}
                  {config.heading?.suffix}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                  {config.description}
                </p>

                {/* Perks Checklist */}
                <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                  {config.benefits.filter(b => b.enabled !== false).map((benefit, i) => (
                    <div key={benefit.id || i} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                        <BenefitIcon iconName={benefit.icon} className="h-2.5 w-2.5" />
                      </div>
                      <span className="text-[11px] leading-tight">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button & Coupon */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  {config.cta?.show && (
                    <div
                      style={{ backgroundColor: config.design?.btnColor || '#ea580c' }}
                      className="px-4 py-2 rounded-full text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{config.cta.text}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}

                  {config.coupon?.show && (
                    <div className="text-[10px] text-emerald-200/90 font-medium">
                      {config.coupon.label}: <strong className="text-amber-300 font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/20">{config.coupon.code}</strong>
                    </div>
                  )}
                </div>

                {/* Product Card Preview inside Banner */}
                {config.productCard?.show && (
                  <div className="pt-2">
                    <div className="rounded-xl bg-white p-2.5 text-charcoal border border-sand-border space-y-2 max-w-[220px] mx-auto shadow-sm">
                      <div className="flex items-center justify-between border-b border-sand-border pb-1">
                        <span className="font-extrabold text-[10px] text-forest">{config.productCard.topLabel || 'Fibax Express'}</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 py-0.2 rounded">{config.productCard.statusLabel || 'ONLINE'}</span>
                      </div>

                      <div className="aspect-square rounded-lg bg-sand/30 flex items-center justify-center p-1.5 overflow-hidden">
                        {config.productCard.image ? (
                          <img
                            src={config.productCard.image}
                            alt={config.productCard.altText || config.productCard.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-charcoal-subtle" />
                        )}
                      </div>

                      <div className="space-y-0.5 text-left">
                        <div className="font-bold text-[10px] text-charcoal truncate">{config.productCard.name}</div>
                        <div className="text-[10px] font-extrabold text-forest">
                          ₹{config.productCard.price} <span className="text-[8px] text-charcoal-muted line-through">₹{config.productCard.originalPrice}</span>
                        </div>
                      </div>

                      <div className="w-full py-1 rounded-lg bg-brand text-white text-center text-[9px] font-bold">
                        {config.productCard.bottomPromoMessage || 'Free Delivery Unlocked!'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-charcoal-subtle text-center pt-1">
              Preview updates in real-time. Remember to click "Save Changes" to publish.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
