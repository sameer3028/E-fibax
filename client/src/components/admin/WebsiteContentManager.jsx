import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import { CONCERNS } from '../../data/concerns';
import { BlogManager } from './BlogManager';
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
  FileText,
  AlertTriangle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  ExternalLink,
  RefreshCw,
  BookOpen
} from 'lucide-react';

export function WebsiteContentManager() {
  // Navigation Sub Tab: 'home-hero' or 'about-hero'
  const [activeSubTab, setActiveSubTab] = useState('home-hero');

  // Home Page Banners State
  const [homeBanners, setHomeBanners] = useState([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  const [editingHomeBanner, setEditingHomeBanner] = useState(null);
  const [homeDesktopMeta, setHomeDesktopMeta] = useState(null);
  const [homeMobileMeta, setHomeMobileMeta] = useState(null);
  const [isUploadingHomeDesktop, setIsUploadingHomeDesktop] = useState(false);
  const [isUploadingHomeMobile, setIsUploadingHomeMobile] = useState(false);

  // About Us Banners State (Preserved)
  const [aboutBanners, setAboutBanners] = useState([]);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [editingAboutBanner, setEditingAboutBanner] = useState(null);
  const [isUploadingAboutDesktop, setIsUploadingAboutDesktop] = useState(false);
  const [isUploadingAboutMobile, setIsUploadingAboutMobile] = useState(false);
  const [aboutDesktopMeta, setAboutDesktopMeta] = useState(null);
  const [aboutMobileMeta, setAboutMobileMeta] = useState(null);

  // Live Interactive Banner Preview Modal
  const [previewBanner, setPreviewBanner] = useState(null);
  const [previewViewport, setPreviewViewport] = useState('desktop'); // 'desktop' | 'mobile'

  // Quick Replace image target
  const [quickReplacingId, setQuickReplacingId] = useState(null);
  const quickFileInputRef = useRef(null);

  // -------------------------------------------------------------
  // HOME PAGE BANNER DEFAULT FORM DATA
  // -------------------------------------------------------------
  const defaultHomeFormData = {
    title: '',
    heading: '',
    subtitle: '',
    badge: 'TOP SELLER',
    chipLabel: '',
    desktopImage: '',
    mobileImage: '',
    primaryBtnText: 'Shop Now',
    primaryBtnUrl: 'products',
    secondaryBtnText: '',
    secondaryBtnUrl: '',
    productSlug: '',
    concernSlug: '',
    altText: '',
    sortOrder: 1,
    enabled: true,
    status: 'published'
  };
  const [homeFormData, setHomeFormData] = useState(defaultHomeFormData);

  // -------------------------------------------------------------
  // ABOUT US BANNER DEFAULT FORM DATA (Preserved)
  // -------------------------------------------------------------
  const defaultAboutFormData = {
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
  const [aboutFormData, setAboutFormData] = useState(defaultAboutFormData);

  // -------------------------------------------------------------
  // IMAGE METADATA DETECTION (Width, Height, Aspect Ratio Check)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!homeFormData.desktopImage) {
      setHomeDesktopMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1920 / 650;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setHomeDesktopMeta({ width: w, height: h, ratio: ratio.toFixed(2), isRatioOk: diff <= 0.35 });
      };
      img.onerror = () => setHomeDesktopMeta(null);
      img.src = homeFormData.desktopImage;
    }
  }, [homeFormData.desktopImage]);

  useEffect(() => {
    if (!homeFormData.mobileImage) {
      setHomeMobileMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1080 / 1350;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setHomeMobileMeta({ width: w, height: h, ratio: ratio.toFixed(2), isRatioOk: diff <= 0.4 });
      };
      img.onerror = () => setHomeMobileMeta(null);
      img.src = homeFormData.mobileImage;
    }
  }, [homeFormData.mobileImage]);

  useEffect(() => {
    if (!aboutFormData.desktopImage) {
      setAboutDesktopMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1920 / 650;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setAboutDesktopMeta({ width: w, height: h, isRatioOk: diff <= 0.3 });
      };
      img.onerror = () => setAboutDesktopMeta(null);
      img.src = aboutFormData.desktopImage;
    }
  }, [aboutFormData.desktopImage]);

  useEffect(() => {
    if (!aboutFormData.mobileImage) {
      setAboutMobileMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1080 / 900;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setAboutMobileMeta({ width: w, height: h, isRatioOk: diff <= 0.3 });
      };
      img.onerror = () => setAboutMobileMeta(null);
      img.src = aboutFormData.mobileImage;
    }
  }, [aboutFormData.mobileImage]);

  // -------------------------------------------------------------
  // FETCH API DATA
  // -------------------------------------------------------------
  const fetchHomeBanners = async () => {
    setLoadingHome(true);
    try {
      const res = await apiRequest('/api/website/home-banners');
      if (res.success && Array.isArray(res.data)) {
        setHomeBanners(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch home banners:', err);
    } finally {
      setLoadingHome(false);
    }
  };

  const fetchAboutBanners = async () => {
    setLoadingAbout(true);
    try {
      const res = await apiRequest('/api/website/about-banners');
      if (res.success && Array.isArray(res.data)) {
        setAboutBanners(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch about banners:', err);
    } finally {
      setLoadingAbout(false);
    }
  };

  useEffect(() => {
    fetchHomeBanners();
    fetchAboutBanners();
  }, []);

  // -------------------------------------------------------------
  // UPLOAD MEDIA HELPER (Shared permanent path storage)
  // -------------------------------------------------------------
  const uploadImageFile = (file, onSuccess, onError, setUploading) => {
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5 MB limit. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      if (setUploading) setUploading(true);
      try {
        const res = await apiRequest('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ image: base64, filename: file.name })
        });
        if (res.success && res.url) {
          onSuccess(res.url);
        } else {
          onSuccess(base64);
        }
      } catch (err) {
        onSuccess(base64);
      } finally {
        if (setUploading) setUploading(false);
      }
    };
    reader.onerror = () => {
      if (onError) onError();
      if (setUploading) setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // HOME PAGE BANNER ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddHomeModal = () => {
    setEditingHomeBanner(null);
    setHomeFormData({
      ...defaultHomeFormData,
      sortOrder: homeBanners.length + 1
    });
    setIsHomeModalOpen(true);
  };

  const handleOpenEditHomeModal = (banner) => {
    setEditingHomeBanner(banner);
    setHomeFormData({
      title: banner.title || '',
      heading: banner.heading || '',
      subtitle: banner.subtitle || banner.description || '',
      badge: banner.badge || '',
      chipLabel: banner.chipLabel || '',
      desktopImage: banner.desktopImage || banner.image || '',
      mobileImage: banner.mobileImage || '',
      primaryBtnText: banner.primaryBtnText || 'Shop Now',
      primaryBtnUrl: banner.primaryBtnUrl || 'products',
      secondaryBtnText: banner.secondaryBtnText || '',
      secondaryBtnUrl: banner.secondaryBtnUrl || '',
      productSlug: banner.productSlug || '',
      concernSlug: banner.concernSlug || '',
      altText: banner.altText || '',
      sortOrder: Number(banner.sortOrder) || 1,
      enabled: banner.enabled !== false,
      status: banner.status || 'published'
    });
    setIsHomeModalOpen(true);
  };

  const handleSaveHome = async (e) => {
    e.preventDefault();
    if (!homeFormData.title.trim()) {
      alert('Please enter an internal banner title/name.');
      return;
    }
    if (!homeFormData.desktopImage && !homeFormData.mobileImage) {
      alert('Please upload a desktop banner image.');
      return;
    }

    try {
      if (editingHomeBanner) {
        const res = await apiRequest(`/api/website/home-banners/${editingHomeBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(homeFormData)
        });
        if (res.success) {
          setIsHomeModalOpen(false);
          fetchHomeBanners();
        } else if (res.status === 401) {
          alert('Your admin session has expired. Please log in again to save changes.');
          localStorage.removeItem('fibax_admin_token');
          sessionStorage.removeItem('fibax_admin_token');
          window.location.reload();
        } else {
          alert(res.error || 'Failed to update banner');
        }
      } else {
        const res = await apiRequest('/api/website/home-banners', {
          method: 'POST',
          body: JSON.stringify(homeFormData)
        });
        if (res.success) {
          setIsHomeModalOpen(false);
          fetchHomeBanners();
        } else if (res.status === 401) {
          alert('Your admin session has expired. Please log in again to save changes.');
          localStorage.removeItem('fibax_admin_token');
          sessionStorage.removeItem('fibax_admin_token');
          window.location.reload();
        } else {
          alert(res.error || 'Failed to create banner');
        }
      }
    } catch (err) {
      alert('Error saving home banner: ' + err.message);
    }
  };

  const handleDeleteHome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Home Page hero banner?')) return;
    try {
      const res = await apiRequest(`/api/website/home-banners/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchHomeBanners();
      }
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleToggleHomeStatus = async (banner) => {
    const newStatus = banner.status === 'published' ? 'draft' : 'published';
    try {
      const res = await apiRequest(`/api/website/home-banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        fetchHomeBanners();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleHomeEnabled = async (banner) => {
    const newEnabled = !banner.enabled;
    try {
      const res = await apiRequest(`/api/website/home-banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: newEnabled })
      });
      if (res.success) {
        fetchHomeBanners();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleMoveHomeOrder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= homeBanners.length) return;

    const reordered = [...homeBanners];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    const payload = reordered.map((b, idx) => ({ id: b.id, sortOrder: idx + 1 }));
    try {
      const res = await apiRequest('/api/website/home-banners/reorder', {
        method: 'PUT',
        body: JSON.stringify({ order: payload })
      });
      if (res.success) {
        setHomeBanners(res.data);
      }
    } catch (err) {
      console.error('Failed to reorder banners:', err);
    }
  };

  // Quick Replace Desktop Image directly from banner card
  const handleTriggerQuickReplace = (bannerId) => {
    setQuickReplacingId(bannerId);
    if (quickFileInputRef.current) {
      quickFileInputRef.current.click();
    }
  };

  const handleQuickFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file || !quickReplacingId) return;

    uploadImageFile(file, async (url) => {
      try {
        const res = await apiRequest(`/api/website/home-banners/${quickReplacingId}`, {
          method: 'PUT',
          body: JSON.stringify({ desktopImage: url })
        });
        if (res.success) {
          fetchHomeBanners();
        }
      } catch (err) {
        alert('Failed to replace banner image: ' + err.message);
      } finally {
        setQuickReplacingId(null);
        if (quickFileInputRef.current) quickFileInputRef.current.value = '';
      }
    });
  };

  // -------------------------------------------------------------
  // ABOUT US BANNER ACTIONS (Preserved)
  // -------------------------------------------------------------
  const handleOpenAddAboutModal = () => {
    setEditingAboutBanner(null);
    setAboutFormData({
      ...defaultAboutFormData,
      sortOrder: aboutBanners.length + 1
    });
    setIsAboutModalOpen(true);
  };

  const handleOpenEditAboutModal = (banner) => {
    setEditingAboutBanner(banner);
    setAboutFormData({
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
    setIsAboutModalOpen(true);
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    if (!aboutFormData.heading || !aboutFormData.title) {
      alert('Please enter banner title and main heading.');
      return;
    }
    try {
      if (editingAboutBanner) {
        const res = await apiRequest(`/api/website/about-banners/${editingAboutBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(aboutFormData)
        });
        if (res.success) {
          setIsAboutModalOpen(false);
          fetchAboutBanners();
        } else if (res.status === 401) {
          alert('Your admin session has expired. Please log in again to save changes.');
          localStorage.removeItem('fibax_admin_token');
          sessionStorage.removeItem('fibax_admin_token');
          window.location.reload();
        } else {
          alert(res.error || 'Failed to update banner');
        }
      } else {
        const res = await apiRequest('/api/website/about-banners', {
          method: 'POST',
          body: JSON.stringify(aboutFormData)
        });
        if (res.success) {
          setIsAboutModalOpen(false);
          fetchAboutBanners();
        } else if (res.status === 401) {
          alert('Your admin session has expired. Please log in again to save changes.');
          localStorage.removeItem('fibax_admin_token');
          sessionStorage.removeItem('fibax_admin_token');
          window.location.reload();
        } else {
          alert(res.error || 'Failed to create banner');
        }
      }
    } catch (err) {
      alert('Error saving banner: ' + err.message);
    }
  };

  const handleDeleteAbout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this About Us hero banner?')) return;
    try {
      const res = await apiRequest(`/api/website/about-banners/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchAboutBanners();
      }
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleToggleAboutStatus = async (banner) => {
    const newStatus = banner.status === 'published' ? 'draft' : 'published';
    try {
      const res = await apiRequest(`/api/website/about-banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        fetchAboutBanners();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleAboutEnabled = async (banner) => {
    const newEnabled = !banner.enabled;
    try {
      const res = await apiRequest(`/api/website/about-banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: newEnabled })
      });
      if (res.success) {
        fetchAboutBanners();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hidden file input for one-click quick replacement */}
      <input
        type="file"
        ref={quickFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleQuickFileSelected}
      />

      {/* Top Section Breadcrumb & Header */}
      {activeSubTab !== 'blogs' && (
        <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Admin Navigation Path */}
            <div className="flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1 flex-wrap">
              <Globe className="h-4 w-4 text-brand" />
              <span>Website Content</span>
              <span>&rsaquo;</span>
              <span>{activeSubTab === 'home-hero' ? 'Home Page' : 'About Us'}</span>
              <span>&rsaquo;</span>
              <span className="text-brand">Hero Banners</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-forest-deep">
              {activeSubTab === 'home-hero'
                ? 'Home Page Hero Banner Management'
                : 'About Us Hero Banner Management'}
            </h2>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl">
              {activeSubTab === 'home-hero'
                ? 'Manage, replace, publish, reorder and preview promotional hero banners displayed on the Fibax Ayurveda Home Page.'
                : 'Configure dynamic hero banners, custom headline visuals, CTA buttons, and trust points for the About Us page.'}
            </p>
          </div>

          <button
            onClick={activeSubTab === 'home-hero' ? handleOpenAddHomeModal : handleOpenAddAboutModal}
            className="px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4 text-gold" />
            <span>{activeSubTab === 'home-hero' ? '+ Add New Home Banner' : '+ Add New About Banner'}</span>
          </button>
        </div>
      )}

      {/* Sub Tabs: Home Page Banners vs About Us Banner vs Blog Management */}
      <div className="flex items-center gap-2 border-b border-sand-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('home-hero')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'home-hero'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${activeSubTab === 'home-hero' ? 'text-amber-300' : 'text-gold'}`} />
          <span>Home Page Hero Banners ({homeBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('about-hero')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'about-hero'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-forest" />
          <span>About Us Hero Banner ({aboutBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('blogs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'blogs'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <BookOpen className={`h-3.5 w-3.5 ${activeSubTab === 'blogs' ? 'text-amber-300' : 'text-forest'}`} />
          <span>Blog Management</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: HOME PAGE HERO BANNERS MANAGEMENT                       */}
      {/* ============================================================= */}
      {activeSubTab === 'home-hero' && (
        <div className="space-y-4">
          {loadingHome ? (
            <div className="p-12 text-center text-xs font-bold text-charcoal-muted bg-white rounded-3xl border border-sand-border flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-forest" />
              <span>Loading Home Page Hero Banners...</span>
            </div>
          ) : homeBanners.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand-border space-y-3">
              <FileText className="h-10 w-10 text-charcoal-subtle mx-auto" />
              <h3 className="text-sm font-bold text-charcoal">No Home Page Hero Banners Configured</h3>
              <p className="text-xs text-charcoal-muted">
                Click "+ Add New Home Banner" to create a custom promotional banner for the Home Page.
              </p>
              <button
                onClick={handleOpenAddHomeModal}
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Banner</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {homeBanners.map((banner, index) => {
                const isPublished = banner.status === 'published';
                const isEnabled = banner.enabled !== false;
                const isActiveOnStore = isPublished && isEnabled;

                return (
                  <div
                    key={banner.id}
                    className={`p-5 rounded-3xl bg-white border-2 transition-all shadow-xs space-y-4 ${
                      isActiveOnStore
                        ? 'border-forest/40 bg-sand/10'
                        : 'border-sand-border opacity-90'
                    }`}
                  >
                    {/* Top Row: Sort Order, Title, Status & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveHomeOrder(index, -1)}
                            className="p-1 rounded-lg text-charcoal hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
                            #{banner.sortOrder || index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === homeBanners.length - 1}
                            onClick={() => handleMoveHomeOrder(index, 1)}
                            className="p-1 rounded-lg text-charcoal hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-heading font-bold text-sm text-forest-deep flex items-center gap-2 flex-wrap">
                            <span className="truncate">{banner.title}</span>
                            {isActiveOnStore && (
                              <span className="bg-brand text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" />
                                <span>Active on Home Page</span>
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
                            <span>ID: <code className="font-mono">{banner.id}</code></span>
                            {banner.chipLabel && (
                              <span>• Tab: <strong>{banner.chipLabel}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Toggle Badge */}
                        <button
                          type="button"
                          onClick={() => handleToggleHomeStatus(banner)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                          title="Click to toggle Published / Draft"
                        >
                          {isPublished ? '● Published' : '○ Draft'}
                        </button>

                        {/* Enable / Disable Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleHomeEnabled(banner)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            isEnabled
                              ? 'bg-forest text-white'
                              : 'bg-red-100 text-red-700'
                          }`}
                          title="Click to Enable / Disable"
                        >
                          {isEnabled ? 'ON' : 'OFF'}
                        </button>

                        {/* Quick Replace Image */}
                        <button
                          type="button"
                          onClick={() => handleTriggerQuickReplace(banner.id)}
                          className="px-3 py-1 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border flex items-center gap-1 cursor-pointer"
                          title="Quickly replace desktop banner image"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-forest" />
                          <span className="hidden sm:inline">Replace Image</span>
                        </button>

                        {/* Preview Banner Modal */}
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewBanner(banner);
                            setPreviewViewport('desktop');
                          }}
                          className="px-3 py-1 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border flex items-center gap-1 cursor-pointer"
                          title="Preview banner in Desktop and Mobile views"
                        >
                          <Eye className="h-3.5 w-3.5 text-forest" />
                          <span>Preview</span>
                        </button>

                        {/* Edit Banner Modal */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditHomeModal(banner)}
                          className="px-3 py-1 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-forest" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Banner */}
                        <button
                          type="button"
                          onClick={() => handleDeleteHome(banner.id)}
                          className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all border border-red-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Preview Grid: Text Specs + Visual Previews */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                      {/* Left: Metadata & CTA Destinations */}
                      <div className="lg:col-span-6 space-y-2">
                        {banner.badge && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-soft text-brand text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" />
                            <span>{banner.badge}</span>
                          </div>
                        )}
                        <h4 className="font-heading font-extrabold text-charcoal text-base">
                          {banner.heading || banner.title}
                        </h4>
                        {(banner.subtitle || banner.description) && (
                          <p className="text-charcoal-muted line-clamp-2 leading-relaxed text-[11px]">
                            {banner.subtitle || banner.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                          <span className="px-3 py-1 rounded-lg bg-brand text-white font-bold inline-flex items-center gap-1">
                            <span>Primary CTA: {banner.primaryBtnText || 'Shop Now'}</span>
                            <ArrowRight className="h-3 w-3" />
                            <code className="text-[10px] font-mono opacity-90">{banner.primaryBtnUrl || 'products'}</code>
                          </span>
                          {banner.secondaryBtnText && (
                            <span className="px-3 py-1 rounded-lg bg-sand text-charcoal font-bold inline-flex items-center gap-1 border border-sand-border">
                              <span>Secondary: {banner.secondaryBtnText}</span>
                              <code className="text-[10px] font-mono opacity-80">{banner.secondaryBtnUrl}</code>
                            </span>
                          )}
                        </div>

                        {/* Direct Targets */}
                        {(banner.productSlug || banner.concernSlug) && (
                          <div className="text-[10px] text-charcoal-muted pt-1 flex items-center gap-2">
                            <span>Direct Link:</span>
                            {banner.productSlug && (
                              <span className="bg-sand px-2 py-0.5 rounded font-mono">Product: {banner.productSlug}</span>
                            )}
                            {banner.concernSlug && (
                              <span className="bg-sand px-2 py-0.5 rounded font-mono">Concern: {banner.concernSlug}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Visual Thumbnails (Desktop + Mobile) */}
                      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Desktop Visual Box */}
                        <div className="p-3 rounded-2xl bg-sand/40 border border-sand-border space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-charcoal">
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3 text-forest" />
                              <span>Desktop Banner</span>
                            </span>
                            <span className="text-[9px] text-charcoal-muted">1920×650</span>
                          </div>
                          {banner.desktopImage ? (
                            <div className="aspect-[2.1/1] w-full rounded-xl overflow-hidden bg-stone-900 border border-sand-border relative group">
                              <img
                                src={banner.desktopImage}
                                alt="Desktop visual"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[2.1/1] rounded-xl bg-sand/60 flex items-center justify-center text-[10px] text-charcoal-muted italic">
                              No desktop image
                            </div>
                          )}
                        </div>

                        {/* Mobile Visual Box */}
                        <div className="p-3 rounded-2xl bg-sand/40 border border-sand-border space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-charcoal">
                            <span className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3 text-brand" />
                              <span>Mobile Banner</span>
                            </span>
                            <span className="text-[9px] text-charcoal-muted">1080×1350</span>
                          </div>
                          {banner.mobileImage ? (
                            <div className="aspect-[2.1/1] sm:aspect-square w-full rounded-xl overflow-hidden bg-stone-900 border border-sand-border relative group">
                              <img
                                src={banner.mobileImage}
                                alt="Mobile visual"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[2.1/1] sm:aspect-square rounded-xl bg-sand/60 flex flex-col items-center justify-center text-center p-2 text-[10px] text-charcoal-muted">
                              <span className="font-semibold text-charcoal">Same as Desktop</span>
                              <span className="text-[9px] text-charcoal-subtle">Responsive fallback</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: ABOUT US HERO BANNER MANAGEMENT (Preserved 100%)       */}
      {/* ============================================================= */}
      {activeSubTab === 'about-hero' && (
        <div className="space-y-4">
          {loadingAbout ? (
            <div className="p-12 text-center text-xs font-bold text-charcoal-muted bg-white rounded-3xl border border-sand-border flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-forest" />
              <span>Loading About Us Hero Banners...</span>
            </div>
          ) : aboutBanners.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand-border space-y-3">
              <FileText className="h-10 w-10 text-charcoal-subtle mx-auto" />
              <h3 className="text-sm font-bold text-charcoal">No About Us Hero Banners Configured</h3>
              <p className="text-xs text-charcoal-muted">
                Click "+ Add New About Banner" to create a custom hero banner for the About Us page.
              </p>
              <button
                onClick={handleOpenAddAboutModal}
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Banner</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {aboutBanners.map((banner, index) => {
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
                                Active About Page Hero
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-charcoal-muted">ID: {banner.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleAboutStatus(banner)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {isPublished ? '● Published' : '○ Draft'}
                        </button>

                        <button
                          onClick={() => handleToggleAboutEnabled(banner)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                            isEnabled
                              ? 'bg-forest text-white'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isEnabled ? 'ON' : 'OFF'}
                        </button>

                        <button
                          onClick={() => handleOpenEditAboutModal(banner)}
                          className="px-3 py-1 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-forest" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAbout(banner.id)}
                          className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all border border-red-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

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

                      <div className="p-3 rounded-2xl bg-sand/40 border border-sand-border space-y-2">
                        <span className="text-[10px] font-bold text-charcoal uppercase block">
                          Desktop / Mobile Visual
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
      )}

      {/* ============================================================= */}
      {/* TAB 3: BLOG MANAGEMENT SYSTEM                                  */}
      {/* ============================================================= */}
      {activeSubTab === 'blogs' && (
        <BlogManager />
      )}

      {/* ============================================================= */}
      {/* MODAL 1: ADD / EDIT HOME PAGE HERO BANNER                     */}
      {/* ============================================================= */}
      {isHomeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <h3 className="font-heading font-extrabold text-forest-deep text-base">
                  {editingHomeBanner ? 'Edit Home Page Hero Banner' : 'Add New Home Page Hero Banner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHomeModalOpen(false)}
                className="p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveHome} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* 1. Basic Identity & Publishing Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal">
                    Internal Banner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={homeFormData.title}
                    onChange={(e) => setHomeFormData({ ...homeFormData, title: e.target.value })}
                    placeholder="e.g. Multivitamin Promotional Banner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-medium bg-white"
                    required
                  />
                  <p className="text-[10px] text-charcoal-muted">Used for identification in Admin Portal.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Display Status</label>
                  <select
                    value={homeFormData.enabled ? 'true' : 'false'}
                    onChange={(e) => setHomeFormData({ ...homeFormData, enabled: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                  >
                    <option value="true">Active (ON)</option>
                    <option value="false">Inactive (OFF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Publish State</label>
                  <select
                    value={homeFormData.status}
                    onChange={(e) => setHomeFormData({ ...homeFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              {/* 2. Visual Banner Images Upload (Desktop & Mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktop Banner Image Upload */}
                <div className="space-y-2 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-forest" />
                      <span>Desktop Banner Image <span className="text-red-500">*</span></span>
                    </label>
                    <span className="text-[10px] font-semibold text-charcoal-muted">Recommended: 1920×650</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={homeFormData.desktopImage}
                      onChange={(e) => setHomeFormData({ ...homeFormData, desktopImage: e.target.value })}
                      placeholder="Image path or upload below"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-xs">
                      {isUploadingHomeDesktop ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={isUploadingHomeDesktop}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImageFile(
                              file,
                              (url) => setHomeFormData(prev => ({ ...prev, desktopImage: url })),
                              null,
                              setIsUploadingHomeDesktop
                            );
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Desktop Preview Frame */}
                  {homeFormData.desktopImage ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="relative aspect-[2.1/1] w-full rounded-xl overflow-hidden border border-sand-border bg-stone-900 group">
                        <img
                          src={homeFormData.desktopImage}
                          alt="Desktop banner preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setHomeFormData({ ...homeFormData, desktopImage: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer shadow-md"
                          title="Remove desktop image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Dimensions & Aspect Ratio Badge */}
                      {homeDesktopMeta && (
                        <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white border border-sand-border">
                          <span>Dimensions: <strong>{homeDesktopMeta.width} × {homeDesktopMeta.height} px</strong></span>
                          {homeDesktopMeta.isRatioOk ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Aspect ratio ~2.95:1 OK
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1" title="Aspect ratio differs from standard 1920×650. Banner will scale with object-cover.">
                              <AlertTriangle className="h-3 w-3" /> Ratio: {homeDesktopMeta.ratio}:1 (Scales via object-cover)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-sand-border bg-white text-center text-xs text-charcoal-muted">
                      No desktop banner uploaded. Supported formats: JPG, PNG, WebP (Max: 5 MB).
                    </div>
                  )}
                </div>

                {/* Mobile Banner Image Upload (Optional) */}
                <div className="space-y-2 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-brand" />
                      <span>Mobile Banner Image <span className="text-charcoal-muted font-normal">(Optional)</span></span>
                    </label>
                    <span className="text-[10px] font-semibold text-charcoal-muted">Recommended: 1080×1350</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={homeFormData.mobileImage}
                      onChange={(e) => setHomeFormData({ ...homeFormData, mobileImage: e.target.value })}
                      placeholder="Optional mobile image path"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-xs">
                      {isUploadingHomeMobile ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={isUploadingHomeMobile}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImageFile(
                              file,
                              (url) => setHomeFormData(prev => ({ ...prev, mobileImage: url })),
                              null,
                              setIsUploadingHomeMobile
                            );
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Mobile Preview Frame */}
                  {homeFormData.mobileImage ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="relative aspect-[2.1/1] sm:aspect-square w-full rounded-xl overflow-hidden border border-sand-border bg-stone-900 group">
                        <img
                          src={homeFormData.mobileImage}
                          alt="Mobile banner preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setHomeFormData({ ...homeFormData, mobileImage: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer shadow-md"
                          title="Remove mobile image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {homeMobileMeta && (
                        <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white border border-sand-border">
                          <span>Dimensions: <strong>{homeMobileMeta.width} × {homeMobileMeta.height} px</strong></span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Ratio: {homeMobileMeta.ratio}:1
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-sand-border bg-white text-center text-xs text-charcoal-muted">
                      Optional: If left empty, the desktop banner will automatically be used with responsive object-fit.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Slider Tab Chip, Badge & Text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">
                    Bottom Slider Tab Label
                  </label>
                  <input
                    type="text"
                    value={homeFormData.chipLabel}
                    onChange={(e) => setHomeFormData({ ...homeFormData, chipLabel: e.target.value })}
                    placeholder="e.g. Daily Multivitamin"
                    className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                  />
                  <p className="text-[10px] text-charcoal-muted">Displayed on the 3 quick-tab selectors below the banner.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">
                    Promotional Badge Tag
                  </label>
                  <input
                    type="text"
                    value={homeFormData.badge}
                    onChange={(e) => setHomeFormData({ ...homeFormData, badge: e.target.value })}
                    placeholder="e.g. TOP SELLER or TRIPLE THERAPY"
                    className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                  />
                  <p className="text-[10px] text-charcoal-muted">Small highlight tag on top of the banner.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={homeFormData.sortOrder}
                    onChange={(e) => setHomeFormData({ ...homeFormData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-bold bg-white"
                  />
                  <p className="text-[10px] text-charcoal-muted">Lower numbers appear first (#1, #2, #3).</p>
                </div>
              </div>

              {/* 4. Optional Text Overlays & Alt Text */}
              <div className="space-y-3 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Optional Text &amp; Accessibility (Embedded Artwork Supported)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Banner Heading</label>
                    <input
                      type="text"
                      value={homeFormData.heading}
                      onChange={(e) => setHomeFormData({ ...homeFormData, heading: e.target.value })}
                      placeholder="e.g. Natural Source of Multivitamin Daily Nutritional Syrup 500ml"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Subtitle / Short Description</label>
                    <input
                      type="text"
                      value={homeFormData.subtitle}
                      onChange={(e) => setHomeFormData({ ...homeFormData, subtitle: e.target.value })}
                      placeholder="e.g. Complete Daily Nutrition for a Stronger & Healthier You"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-charcoal">Image Alt Text (SEO &amp; Screen Readers)</label>
                  <input
                    type="text"
                    value={homeFormData.altText}
                    onChange={(e) => setHomeFormData({ ...homeFormData, altText: e.target.value })}
                    placeholder="Fibax Ayurveda Multivitamin Promotional Banner"
                    className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                  />
                </div>
              </div>

              {/* 5. Click Destination & CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                {/* Primary Button / Link */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Primary Click Action
                  </span>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">CTA Button Label</label>
                    <input
                      type="text"
                      value={homeFormData.primaryBtnText}
                      onChange={(e) => setHomeFormData({ ...homeFormData, primaryBtnText: e.target.value })}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">CTA Destination Link / URL</label>
                    <input
                      type="text"
                      value={homeFormData.primaryBtnUrl}
                      onChange={(e) => setHomeFormData({ ...homeFormData, primaryBtnUrl: e.target.value })}
                      placeholder="products?concern=immunity-vitality"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                    <p className="text-[10px] text-charcoal-muted">Target page route (e.g. <code>products</code>, <code>products?concern=pain-joint-care</code>, or full URL).</p>
                  </div>
                </div>

                {/* Direct Concern / Product Routing Helper */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Fast Route Selector
                  </span>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Route to Health Concern</label>
                    <select
                      value={homeFormData.concernSlug}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHomeFormData({
                          ...homeFormData,
                          concernSlug: val,
                          primaryBtnUrl: val ? `products?concern=${val}` : homeFormData.primaryBtnUrl
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    >
                      <option value="">-- Select Health Concern (Optional) --</option>
                      {CONCERNS.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Direct Product Slug (Optional)</label>
                    <input
                      type="text"
                      value={homeFormData.productSlug}
                      onChange={(e) => setHomeFormData({ ...homeFormData, productSlug: e.target.value })}
                      placeholder="e.g. ayurvedic-multivitamin-syrup"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setIsHomeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingHomeBanner ? 'Save Changes' : 'Publish Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: INTERACTIVE LIVE BANNER PREVIEW                      */}
      {/* ============================================================= */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-forest" />
                <div>
                  <h3 className="font-heading font-extrabold text-forest-deep text-sm sm:text-base">
                    Banner Preview: {previewBanner.title}
                  </h3>
                  <p className="text-[11px] text-charcoal-muted">Simulate desktop and mobile screen rendering.</p>
                </div>
              </div>

              {/* Viewport Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-sand-border">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewViewport === 'desktop' ? 'bg-forest text-white' : 'text-charcoal hover:bg-sand'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop (1920×650)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewViewport === 'mobile' ? 'bg-forest text-white' : 'text-charcoal hover:bg-sand'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Viewport Canvas */}
            <div className="p-6 bg-sand/30 flex items-center justify-center min-h-[350px]">
              {previewViewport === 'desktop' ? (
                <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-xl border border-sand-border bg-stone-900">
                  <div className="aspect-[2.1/1] w-full relative">
                    <img
                      src={previewBanner.desktopImage || previewBanner.image || '/banners/banner-multivitamin.jpg'}
                      alt="Desktop preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-[280px] sm:w-[320px] rounded-3xl overflow-hidden shadow-2xl border-4 border-charcoal bg-stone-900">
                  <div className="aspect-[4/5] w-full relative">
                    <img
                      src={previewBanner.mobileImage || previewBanner.desktopImage || previewBanner.image || '/banners/banner-multivitamin.jpg'}
                      alt="Mobile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Destination Info */}
            <div className="px-6 py-3 border-t border-sand-border bg-white flex items-center justify-between text-xs text-charcoal">
              <div className="flex items-center gap-2">
                <span className="font-bold text-forest">Click Target:</span>
                <span className="font-mono bg-sand px-2 py-0.5 rounded">{previewBanner.primaryBtnUrl || 'products'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="px-4 py-1.5 rounded-xl bg-forest text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: ABOUT US HERO BANNER MODAL (Preserved 100%)          */}
      {/* ============================================================= */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <h3 className="font-heading font-extrabold text-forest-deep text-base">
                  {editingAboutBanner ? 'Edit About Us Hero Banner' : 'Add New About Us Hero Banner'}
                </h3>
              </div>
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAbout} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal">
                    Internal Banner Title / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aboutFormData.title}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, title: e.target.value })}
                    placeholder="e.g. Primary About Us Hero"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Enable Banner</label>
                  <select
                    value={aboutFormData.enabled ? 'true' : 'false'}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, enabled: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold"
                  >
                    <option value="true">ON (Enabled)</option>
                    <option value="false">OFF (Disabled)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Publish Status</label>
                  <select
                    value={aboutFormData.status}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                  <label className="block text-xs font-bold text-charcoal">
                    Desktop Banner / Hero Visual
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aboutFormData.desktopImage}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, desktopImage: e.target.value })}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImageFile(
                              file,
                              (url) => setAboutFormData(prev => ({ ...prev, desktopImage: url })),
                              null,
                              setIsUploadingAboutDesktop
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                  {aboutFormData.desktopImage && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-sand-border bg-sand">
                      <img src={aboutFormData.desktopImage} alt="Desktop preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAboutFormData({ ...aboutFormData, desktopImage: '' })}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4 rounded-2xl bg-sand/20 border border-sand-border">
                  <label className="block text-xs font-bold text-charcoal">
                    Mobile Banner / Hero Visual <span className="text-charcoal-muted font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aboutFormData.mobileImage}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, mobileImage: e.target.value })}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImageFile(
                              file,
                              (url) => setAboutFormData(prev => ({ ...prev, mobileImage: url })),
                              null,
                              setIsUploadingAboutMobile
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                  {aboutFormData.mobileImage && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-sand-border bg-sand">
                      <img src={aboutFormData.mobileImage} alt="Mobile preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAboutFormData({ ...aboutFormData, mobileImage: '' })}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Badge Text</label>
                  <input
                    type="text"
                    value={aboutFormData.badgeText}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, badgeText: e.target.value })}
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
                    value={aboutFormData.heading}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, heading: e.target.value })}
                    placeholder="Pioneering Pure Ayurvedic Healthcare & Natural Wellness"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">Description</label>
                  <textarea
                    rows={3}
                    value={aboutFormData.description}
                    onChange={(e) => setAboutFormData({ ...aboutFormData, description: e.target.value })}
                    placeholder="Fibax Ayurveda is a premier herbal wellness brand..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">Primary Button</span>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button Text</label>
                    <input
                      type="text"
                      value={aboutFormData.primaryBtnText}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, primaryBtnText: e.target.value })}
                      placeholder="Browse 250+ Formulations"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button URL / Destination</label>
                    <input
                      type="text"
                      value={aboutFormData.primaryBtnUrl}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, primaryBtnUrl: e.target.value })}
                      placeholder="products"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">Secondary Button</span>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button Text</label>
                    <input
                      type="text"
                      value={aboutFormData.secondaryBtnText}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, secondaryBtnText: e.target.value })}
                      placeholder="Contact Us"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Button URL / Destination</label>
                    <input
                      type="text"
                      value={aboutFormData.secondaryBtnUrl}
                      onChange={(e) => setAboutFormData({ ...aboutFormData, secondaryBtnUrl: e.target.value })}
                      placeholder="contact"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-sand/30 border border-sand-border">
                <span className="text-xs font-bold text-forest uppercase tracking-wider block">Trust Points</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal">Trust Point {idx + 1}</label>
                      <input
                        type="text"
                        value={aboutFormData.trustPoints[idx] || ''}
                        onChange={(e) => {
                          const updated = [...aboutFormData.trustPoints];
                          updated[idx] = e.target.value;
                          setAboutFormData({ ...aboutFormData, trustPoints: updated });
                        }}
                        placeholder={`Trust Point ${idx + 1}`}
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
