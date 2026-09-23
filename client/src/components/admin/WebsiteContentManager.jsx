import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Sparkles,
  Globe,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Leaf,
  ArrowRight,
  ShieldCheck,
  FileText, AlertTriangle, Loader2
} from 'lucide-react';

export function WebsiteContentManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('about-hero'); // 'about-hero'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);


  const defaultFormData = {
    title: 'About Us Hero Banner',
    enabled: true,
    status: 'published',
    sortOrder: 1,
    desktopImage: '',
    mobileImage: '',
    badgeText: 'AUTHENTIC AYURVEDIC HERITAGE',
    heading: 'Pioneering Pure Ayurvedic Healthcare & Natural Wellness',
    description: 'Fibax Ayurveda is a premier herbal wellness brand dedicated to formulating authentic, research-driven botanical remedies. Backed by WHO-GMP certified infrastructure, we deliver pure, chemical-free healthcare solutions directly to households across India.',
    primaryBtnText: 'Browse 250+ Formulations',
    primaryBtnUrl: 'products',
    secondaryBtnText: 'Contact Us',
    secondaryBtnUrl: 'contact',
    trustPoints: [
      'Pure & Natural Ingredients',
      'WHO-GMP Certified',
      'Safe & Effective Formulations',
      'Made for Healthier India'
    ]
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [desktopMeta, setDesktopMeta] = useState(null);
  const [mobileMeta, setMobileMeta] = useState(null);

  useEffect(() => {
    if (!formData.desktopImage) {
      setDesktopMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1920 / 650;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setDesktopMeta({ width: w, height: h, isRatioOk: diff <= 0.3 });
      };
      img.onerror = () => setDesktopMeta(null);
      img.src = formData.desktopImage;
    }
  }, [formData.desktopImage]);

  useEffect(() => {
    if (!formData.mobileImage) {
      setMobileMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1080 / 900;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setMobileMeta({ width: w, height: h, isRatioOk: diff <= 0.3 });
      };
      img.onerror = () => setMobileMeta(null);
      img.src = formData.mobileImage;
    }
  }, [formData.mobileImage]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/website/about-banners');
      if (res.success && Array.isArray(res.data)) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch about banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      ...defaultFormData,
      sortOrder: banners.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || 'About Us Hero Banner',
      enabled: banner.enabled !== false,
      status: banner.status || 'published',
      sortOrder: Number(banner.sortOrder) || 1,
      desktopImage: banner.desktopImage || '',
      mobileImage: banner.mobileImage || '',
      badgeText: banner.badgeText || 'AUTHENTIC AYURVEDIC HERITAGE',
      heading: banner.heading || 'Pioneering Pure Ayurvedic Healthcare & Natural Wellness',
      description: banner.description || '',
      primaryBtnText: banner.primaryBtnText || 'Browse 250+ Formulations',
      primaryBtnUrl: banner.primaryBtnUrl || 'products',
      secondaryBtnText: banner.secondaryBtnText || 'Contact Us',
      secondaryBtnUrl: banner.secondaryBtnUrl || 'contact',
      trustPoints: Array.isArray(banner.trustPoints) && banner.trustPoints.length === 4
        ? banner.trustPoints
        : ['Pure & Natural Ingredients', 'WHO-GMP Certified', 'Safe & Effective Formulations', 'Made for Healthier India']
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.heading || !formData.title) {
      alert('Please enter banner title and main heading.');
      return;
    }

    try {
      if (editingBanner) {
        const res = await apiRequest(`/api/website/about-banners/${editingBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchBanners();
        } else {
          alert(res.error || 'Failed to update banner');
        }
      } else {
        const res = await apiRequest('/api/website/about-banners', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchBanners();
        } else {
          alert(res.error || 'Failed to create banner');
        }
      }
    } catch (err) {
      alert('Error saving banner: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this About Us hero banner?')) return;
    try {
      const res = await apiRequest(`/api/website/about-banners/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchBanners();
      }
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === 'published' ? 'draft' : 'published';
    try {
      const res = await apiRequest(`/api/website/about-banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        fetchBanners();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleEnabled = async (banner) => {
    const newEnabled = !banner.enabled;
    try {
      const res = await apiRequest(`/api/website/about-banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: newEnabled })
      });
      if (res.success) {
        fetchBanners();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleImageUpload = (file, isMobile = false) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5 MB limit. Please select a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const setter = isMobile ? setIsUploadingMobile : setIsUploadingDesktop;
      setter(true);
      try {
        const res = await apiRequest('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ image: base64, filename: file.name })
        });
        if (res.success && res.url) {
          setFormData(prev => ({
            ...prev,
            [isMobile ? 'mobileImage' : 'desktopImage']: res.url
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [isMobile ? 'mobileImage' : 'desktopImage']: base64
          }));
        }
      } catch (err) {
        setFormData(prev => ({
          ...prev,
          [isMobile ? 'mobileImage' : 'desktopImage']: base64
        }));
      } finally {
        setter(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Section Breadcrumb & Header */}
      <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Admin Navigation Path */}
          <div className="flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
            <Globe className="h-4 w-4 text-brand" />
            <span>Website Content</span>
            <span>&rsaquo;</span>
            <span>About Us</span>
            <span>&rsaquo;</span>
            <span className="text-brand">Hero Banner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-forest-deep">
            About Us Hero Banner Management
          </h2>
          <p className="text-xs text-charcoal-muted mt-1">
            Configure dynamic hero banners, custom headline visuals, CTA buttons, and trust points for the About Us page.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4 text-gold" />
          <span>+ Add New Banner</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-border pb-1">
        <button
          onClick={() => setActiveSubTab('about-hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'about-hero'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>About Us Hero Banners ({banners.length})</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-charcoal-muted bg-white rounded-3xl border border-sand-border">
            Loading Hero Banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-sand-border space-y-3">
            <FileText className="h-10 w-10 text-charcoal-subtle mx-auto" />
            <h3 className="text-sm font-bold text-charcoal">No Hero Banners Configured</h3>
            <p className="text-xs text-charcoal-muted">
              Click "+ Add New Banner" to create a custom hero banner for the About Us page.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Banner</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => {
              const isPublished = banner.status === 'published';
              const isEnabled = banner.enabled !== false;

              return (
                <div
                  key={banner.id}
                  className={`p-5 rounded-3xl bg-white border-2 transition-all shadow-xs space-y-4 ${
                    isPublished && isEnabled
                      ? 'border-forest/40 bg-sand/10'
                      : 'border-sand-border opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-border pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-extrabold flex items-center justify-center">
                        #{banner.sortOrder || index + 1}
                      </span>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-forest-deep flex items-center gap-2">
                          <span>{banner.title}</span>
                          {index === 0 && isPublished && isEnabled && (
                            <span className="bg-brand text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              Active Website Hero
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-charcoal-muted">ID: {banner.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Badge */}
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        {isPublished ? '● Published' : '○ Draft'}
                      </button>

                      {/* Enable Switch */}
                      <button
                        onClick={() => handleToggleEnabled(banner)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          isEnabled
                            ? 'bg-forest text-white'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="px-3 py-1 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border flex items-center gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-forest" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all border border-red-200 flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Banner Content Preview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2 space-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-leaf/20 text-leaf-dark text-[10px] font-bold uppercase">
                        <Leaf className="h-3 w-3" />
                        <span>{banner.badgeText || 'AUTHENTIC AYURVEDIC HERITAGE'}</span>
                      </div>
                      <h4 className="font-heading font-extrabold text-charcoal text-base">
                        {banner.heading}
                      </h4>
                      <p className="text-charcoal-muted line-clamp-2 leading-relaxed text-[11px]">
                        {banner.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="px-3 py-1 rounded-lg bg-brand text-white text-[10px] font-bold">
                          Primary: {banner.primaryBtnText} (&rsaquo; {banner.primaryBtnUrl})
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-sand text-charcoal text-[10px] font-bold">
                          Secondary: {banner.secondaryBtnText} (&rsaquo; {banner.secondaryBtnUrl})
                        </span>
                      </div>
                    </div>

                    {/* Image Preview Box */}
                    <div className="p-3 rounded-2xl bg-sand/40 border border-sand-border space-y-2">
                      <span className="text-[10px] font-bold text-charcoal uppercase block">
                        Desktop / Mobile Visuals
                      </span>
                      {banner.desktopImage ? (
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-sand border border-sand-border relative">
                          <img
                            src={banner.desktopImage}
                            alt="Desktop visual"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-sand/60 text-center text-[11px] text-charcoal-muted italic">
                          No custom banner image uploaded (uses responsive CSS header background).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <h3 className="font-heading font-extrabold text-forest-deep text-base">
                  {editingBanner ? 'Edit About Us Hero Banner' : 'Add New About Us Hero Banner'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* 1. Internal Title, Enabled, Status, Order */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal">
                    Internal Banner Title / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Primary About Us Hero"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Enable Banner</label>
                  <select
                    value={formData.enabled ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold"
                  >
                    <option value="true">ON (Enabled)</option>
                    <option value="false">OFF (Disabled)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Publish Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* 2. Visual Banner Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktop Image */}
                <div className="space-y-2 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                  <label className="block text-xs font-bold text-charcoal">
                    Desktop Banner / Hero Visual
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.desktopImage}
                      onChange={(e) => setFormData({ ...formData, desktopImage: e.target.value })}
                      placeholder="Image URL or upload below"
                      className="flex-1 px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                    <label className="px-3 py-2 rounded-xl bg-forest text-white text-xs font-bold cursor-pointer hover:bg-forest-light flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files?.[0], false)}
                      />
                    </label>
                  </div>
                  {formData.desktopImage && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-sand-border bg-sand">
                      <img src={formData.desktopImage} alt="Desktop preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, desktopImage: '' })}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Image */}
                <div className="space-y-2 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                  <label className="block text-xs font-bold text-charcoal">
                    Mobile Banner / Hero Visual <span className="text-charcoal-muted font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.mobileImage}
                      onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                      placeholder="Optional mobile image"
                      className="flex-1 px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                    <label className="px-3 py-2 rounded-xl bg-forest text-white text-xs font-bold cursor-pointer hover:bg-forest-light flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files?.[0], true)}
                      />
                    </label>
                  </div>
                  {formData.mobileImage && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-sand-border bg-sand">
                      <img src={formData.mobileImage} alt="Mobile preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mobileImage: '' })}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Badge & Heading */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="AUTHENTIC AYURVEDIC HERITAGE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">
                    Main Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    placeholder="Pioneering Pure Ayurvedic Healthcare & Natural Wellness"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Fibax Ayurveda is a premier herbal wellness brand..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-medium"
                  />
                </div>
              </div>

              {/* 4. CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                {/* Primary CTA */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">Primary Button</span>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button Text</label>
                    <input
                      type="text"
                      value={formData.primaryBtnText}
                      onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                      placeholder="Browse 250+ Formulations"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button URL / Destination</label>
                    <input
                      type="text"
                      value={formData.primaryBtnUrl}
                      onChange={(e) => setFormData({ ...formData, primaryBtnUrl: e.target.value })}
                      placeholder="products"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">Secondary Button</span>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button Text</label>
                    <input
                      type="text"
                      value={formData.secondaryBtnText}
                      onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                      placeholder="Contact Us"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button URL / Destination</label>
                    <input
                      type="text"
                      value={formData.secondaryBtnUrl}
                      onChange={(e) => setFormData({ ...formData, secondaryBtnUrl: e.target.value })}
                      placeholder="contact"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Trust Points */}
              <div className="space-y-2 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <span className="text-xs font-bold text-forest uppercase tracking-wider block">Trust Points</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal">Trust Point {idx + 1}</label>
                      <input
                        type="text"
                        value={formData.trustPoints[idx] || ''}
                        onChange={(e) => {
                          const updated = [...formData.trustPoints];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, trustPoints: updated });
                        }}
                        placeholder={`Trust Point ${idx + 1}`}
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
