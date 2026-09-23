import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Sparkles, Globe, Plus, Edit2, Trash2, Check, X, Upload, Leaf, FileText, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';

export function WebsiteContentManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('about-hero');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

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
        const res = await apiRequest(/api/website/about-banners/, {
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
      const res = await apiRequest(/api/website/about-banners/, {
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
      const res = await apiRequest(/api/website/about-banners/, {
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
      const res = await apiRequest(/api/website/about-banners/, {
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
