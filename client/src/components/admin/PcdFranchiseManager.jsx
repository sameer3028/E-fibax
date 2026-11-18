import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import { useProducts } from '../../context/ProductContext';
import { FranchisePage } from '../../pages/FranchisePage';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Upload,
  Layers,
  HelpCircle,
  Briefcase,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Eye,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Search,
  ExternalLink,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  History,
  ArrowRight,
  Award,
  Sparkles,
  Package,
  Pill,
  FlaskConical,
  Droplet,
  Heart,
  Headphones,
  MapPin,
  Truck,
  RotateCcw,
  CheckCheck,
  Lock,
  PhoneCall,
  MessageCircle,
  FileText
} from 'lucide-react';

const AVAILABLE_ICONS = [
  'Package',
  'Sparkles',
  'ShieldCheck',
  'Headphones',
  'MapPin',
  'Truck',
  'Award',
  'CheckCircle2',
  'Leaf',
  'Heart',
  'Pill',
  'FlaskConical',
  'Layers',
  'Droplet',
  'Briefcase',
  'Users'
];

export function PcdFranchiseManager() {
  const { products } = useProducts();

  // Active Tab: 1 of 9
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('subtab') || 'content';
    } catch {
      return 'content';
    }
  });

  // CMS State
  const [published, setPublished] = useState(null);
  const [draft, setDraft] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Preview State (Tab 9)
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | tablet | mobile
  const [previewSource, setPreviewSource] = useState('draft'); // draft | published

  // Modals
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, title }

  // Uploading states
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  // File Inputs
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const ogInputRef = useRef(null);

  // Fetch Full CMS structure from backend
  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/franchise/cms', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res && res.success) {
        setPublished(res.published);
        setDraft(res.draft);
        setHistory(res.history || []);
        setIsDraftDirty(res.isDraftDirty || false);
      } else {
        // Fallback for older server handler
        const fallback = await apiRequest('/api/admin/franchise/content', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (fallback && fallback.data) {
          setPublished(fallback.data);
          setDraft(JSON.parse(JSON.stringify(fallback.data)));
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load franchise settings: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  // Update URL subtab query parameter without full reload
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('subtab', tabId);
      window.history.replaceState({}, '', url.toString());
    } catch (_) {}
  };

  // Helper to update draft state immutably and mark dirty
  const updateDraft = (updater) => {
    setDraft((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setIsDraftDirty(true);
      return next;
    });
  };

  // -------------------------------------------------------------
  // SAVE DRAFT TO PERSISTENT DATABASE
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    if (!draft) return;
    setSavingDraft(true);
    setFeedback({ type: '', message: '' });

    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/franchise/cms/draft', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(draft)
      });

      if (res && res.success) {
        setIsDraftDirty(true);
        if (res.history) setHistory(res.history);
        setFeedback({
          type: 'success',
          message: 'Draft saved to persistent database. (Changes remain private until published).'
        });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      } else {
        throw new Error(res.error || 'Failed to save draft.');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSavingDraft(false);
    }
  };

  // -------------------------------------------------------------
  // PUBLISH CHANGES TO LIVE WEBSITE
  // -------------------------------------------------------------
  const handleConfirmPublish = async () => {
    setPublishing(true);
    setFeedback({ type: '', message: '' });

    try {
      // First save draft if modified
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      await apiRequest('/api/admin/franchise/cms/draft', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(draft)
      });

      // Now publish
      const res = await apiRequest('/api/admin/franchise/cms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ summary: publishSummary.trim() || 'Published PCD Franchise updates to live site' })
      });

      if (res && res.success) {
        setPublished(res.published);
        setDraft(res.draft);
        setHistory(res.history || []);
        setIsDraftDirty(false);
        setShowPublishModal(false);
        setPublishSummary('');
        setFeedback({
          type: 'success',
          message: '🎉 All changes are now live on the public PCD Franchise page!'
        });
        setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
      } else {
        throw new Error(res.error || 'Failed to publish changes.');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setPublishing(false);
    }
  };

  // -------------------------------------------------------------
  // DISCARD DRAFT & RESET TO PUBLISHED
  // -------------------------------------------------------------
  const handleConfirmDiscardDraft = async () => {
    setReverting(true);
    setFeedback({ type: '', message: '' });

    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/franchise/cms/revert', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res && res.success) {
        setDraft(res.draft);
        setHistory(res.history || []);
        setIsDraftDirty(false);
        setShowDiscardModal(false);
        setFeedback({
          type: 'info',
          message: 'Draft changes discarded. Restored currently published state.'
        });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      } else {
        throw new Error(res.error || 'Failed to revert draft.');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setReverting(false);
    }
  };

  // -------------------------------------------------------------
  // SECURE IMAGE UPLOAD HANDLER
  // -------------------------------------------------------------
  const handleUploadImage = async (file, targetField) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'File is too large. Maximum allowed size is 10MB.' });
      return;
    }

    if (targetField === 'desktopBanner') setUploadingDesktop(true);
    if (targetField === 'mobileBanner') setUploadingMobile(true);
    if (targetField === 'ogImage') setUploadingOg(true);

    try {
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/franchise/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          image: base64Data,
          filename: file.name
        })
      });

      if (res && res.success && res.url) {
        if (targetField === 'desktopBanner') {
          updateDraft((prev) => ({
            ...prev,
            banner: { ...prev.banner, desktopImage: res.url }
          }));
        } else if (targetField === 'mobileBanner') {
          updateDraft((prev) => ({
            ...prev,
            banner: { ...prev.banner, mobileImage: res.url }
          }));
        } else if (targetField === 'ogImage') {
          updateDraft((prev) => ({
            ...prev,
            seo: { ...prev.seo, ogImage: res.url }
          }));
        }
        setFeedback({ type: 'success', message: 'Image uploaded and applied to draft successfully!' });
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Upload error: ' + err.message });
    } finally {
      setUploadingDesktop(false);
      setUploadingMobile(false);
      setUploadingOg(false);
    }
  };

  // -------------------------------------------------------------
  // REORDER HELPER
  // -------------------------------------------------------------
  const reorderArray = (list, fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= list.length) return list;
    const result = Array.from(list);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-sand-border text-center shadow-subtle flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-forest animate-spin mb-4" />
        <h3 className="font-heading font-extrabold text-lg text-charcoal">Loading PCD Franchise CMS...</h3>
        <p className="text-xs text-charcoal-muted mt-1">Retrieving draft and published configurations from database.</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-base text-rose-700">Unable to load Franchise CMS</h3>
        <button
          onClick={fetchCmsData}
          className="mt-4 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* PERSISTENT HEADER CONTROL BAR                            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-sand-border shadow-subtle space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Badges */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-heading font-black text-xl text-forest flex items-center gap-2">
                <Award className="h-6 w-6 text-amber-500" />
                <span>PCD Franchise Management</span>
              </h2>

              {isDraftDirty ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Unpublished Draft Edits
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Live &amp; In Sync
                </span>
              )}

              {/* Master Active / Paused Pill */}
              <button
                type="button"
                onClick={() => updateDraft({ isActive: !draft.isActive })}
                title="Toggle franchise program public acceptance"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  draft.isActive
                    ? 'bg-forest/10 text-forest border border-forest/20 hover:bg-forest/15'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                {draft.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                <span>Status: {draft.isActive ? 'Active (Live)' : 'Paused (Notice Mode)'}</span>
              </button>
            </div>

            <p className="text-xs text-charcoal-muted">
              Configure content, media, product categories, steps, FAQs, and SEO for{' '}
              <a href="/pcd-pharma-franchise" target="_blank" rel="noopener noreferrer" className="text-forest underline font-bold inline-flex items-center gap-1">
                /pcd-pharma-franchise <ExternalLink className="h-3 w-3 inline" />
              </a>
            </p>
          </div>

          {/* Action Buttons: Discard, Save Draft, Publish, History */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* History Button */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-colors border border-sand-border"
              title="View change history log"
            >
              <History className="h-4 w-4 text-charcoal-muted" />
              <span className="hidden sm:inline">Change History</span>
            </button>

            {/* Discard Draft Button */}
            {isDraftDirty && (
              <button
                type="button"
                onClick={() => setShowDiscardModal(true)}
                disabled={reverting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                title="Discard all unpublished draft changes"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Discard Draft</span>
              </button>
            )}

            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border shadow-xs cursor-pointer disabled:opacity-60"
            >
              {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-forest" />}
              <span>Save Draft</span>
            </button>

            {/* Publish Changes Button */}
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-gold" />}
              <span>Publish to Live Site</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback.message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : feedback.type === 'info'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback({ type: '', message: '' })} className="text-charcoal-muted hover:text-charcoal">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9 CMS NAVIGATION TABS                                     */}
        {/* ======================================================== */}
        <div className="border-t border-sand-border/70 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'content', label: '1. Page Content', icon: FileText },
              { id: 'banner', label: '2. Banner Management', icon: ImageIcon },
              { id: 'benefits', label: '3. Benefits & Features', icon: Sparkles },
              { id: 'categories', label: '4. Product Categories', icon: Package },
              { id: 'process', label: '5. Franchise Process', icon: Layers },
              { id: 'faqs', label: '6. FAQ Management', icon: HelpCircle },
              { id: 'form', label: '7. Enquiry Form Settings', icon: Sliders },
              { id: 'seo', label: '8. SEO Settings', icon: Search },
              { id: 'preview', label: '9. Page Preview', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-forest text-white shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal hover:bg-sand'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-gold' : 'text-charcoal-muted'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: PAGE CONTENT                                      */}
      {/* ======================================================== */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-8">
          <div>
            <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              <span>Core Page Content &amp; Section Headings</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Customize primary headlines, marketing descriptions, section headers, and direct contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            
            {/* Main Page Heading */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">
                Main Page Heading (H1) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={draft.pageContent?.heading || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    pageContent: { ...prev.pageContent, heading: e.target.value }
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:border-forest"
                placeholder="Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda"
              />
            </div>

            {/* Subtitle & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  Subtitle
                </label>
                <textarea
                  rows={3}
                  value={draft.pageContent?.subtitle || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      pageContent: { ...prev.pageContent, subtitle: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:border-forest resize-none"
                  placeholder="Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  Extended Overview Description
                </label>
                <textarea
                  rows={3}
                  value={draft.pageContent?.description || ''}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      pageContent: { ...prev.pageContent, description: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:border-forest resize-none"
                  placeholder="Fibax Ayurveda is a premier Ayurvedic pharmaceutical company providing verified franchise opportunities..."
                />
              </div>
            </div>

            {/* Section Headings & Subtitles */}
            <div className="border-t border-sand-border/70 pt-6 space-y-4">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-charcoal-muted">
                Section Headings &amp; Subtitles
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Why Choose Fibax */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-sand-border/80 space-y-3">
                  <span className="text-[11px] font-bold text-forest uppercase tracking-wider">Section B: Benefits</span>
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.whyChoose || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, whyChoose: e.target.value }
                        }
                      }))
                    }
                    placeholder="Why Choose Fibax Ayurveda?"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.whyChooseSubtitle || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, whyChooseSubtitle: e.target.value }
                        }
                      }))
                    }
                    placeholder="Key business advantages of partnering with our growing Ayurvedic PCD franchise network."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                </div>

                {/* Product Portfolio */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-sand-border/80 space-y-3">
                  <span className="text-[11px] font-bold text-forest uppercase tracking-wider">Section C: Product Portfolio</span>
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.portfolio || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, portfolio: e.target.value }
                        }
                      }))
                    }
                    placeholder="Diverse Ayurvedic Formulations"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.portfolioSubtitle || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, portfolioSubtitle: e.target.value }
                        }
                      }))
                    }
                    placeholder="Explore our certified remedies tailored for high patient satisfaction and repeat distribution."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                </div>

                {/* 5-Step Process */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-sand-border/80 space-y-3">
                  <span className="text-[11px] font-bold text-forest uppercase tracking-wider">Section D: Process Steps</span>
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.process || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, process: e.target.value }
                        }
                      }))
                    }
                    placeholder="5 Simple Steps to Launch Your PCD Franchise"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.processSubtitle || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, processSubtitle: e.target.value }
                        }
                      }))
                    }
                    placeholder="Transparent, structured, and compliant partnership onboarding from enquiry to stock dispatch."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                </div>

                {/* FAQs */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-sand-border/80 space-y-3">
                  <span className="text-[11px] font-bold text-forest uppercase tracking-wider">Section G: FAQs</span>
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.faqs || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, faqs: e.target.value }
                        }
                      }))
                    }
                    placeholder="Frequently Asked Questions"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                  <input
                    type="text"
                    value={draft.pageContent?.sectionHeadings?.faqsSubtitle || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          sectionHeadings: { ...prev.pageContent?.sectionHeadings, faqsSubtitle: e.target.value }
                        }
                      }))
                    }
                    placeholder="Clear answers to the most common queries about our Ayurvedic PCD franchise model and terms."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sand-border text-xs"
                  />
                </div>
              </div>
            </div>

            {/* CTAs & Contact Information */}
            <div className="border-t border-sand-border/70 pt-6 space-y-4">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-charcoal-muted">
                Call to Action Buttons &amp; Helpline Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-charcoal">Primary CTA Label</label>
                  <input
                    type="text"
                    value={draft.pageContent?.ctaButtons?.primaryLabel || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          ctaButtons: { ...prev.pageContent?.ctaButtons, primaryLabel: e.target.value }
                        }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-sand-border text-xs"
                    placeholder="Apply for Franchise"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-charcoal">Secondary CTA Label</label>
                  <input
                    type="text"
                    value={draft.pageContent?.ctaButtons?.secondaryLabel || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          ctaButtons: { ...prev.pageContent?.ctaButtons, secondaryLabel: e.target.value }
                        }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-sand-border text-xs"
                    placeholder="WhatsApp Enquiry"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-charcoal">Helpline Phone Number</label>
                  <input
                    type="text"
                    value={draft.pageContent?.contactInfo?.helplineNumber || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          contactInfo: { ...prev.pageContent?.contactInfo, helplineNumber: e.target.value }
                        }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-sand-border text-xs"
                    placeholder="+91 88725 44458"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-charcoal">WhatsApp Number</label>
                  <input
                    type="text"
                    value={draft.pageContent?.contactInfo?.whatsappNumber || ''}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        pageContent: {
                          ...prev.pageContent,
                          contactInfo: { ...prev.pageContent?.contactInfo, whatsappNumber: e.target.value }
                        }
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-sand-border text-xs"
                    placeholder="918872544458"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BANNER MANAGEMENT                                 */}
      {/* ======================================================== */}
      {activeTab === 'banner' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-8">
          <div>
            <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-500" />
              <span>Hero Banner Media &amp; Responsive Layout</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Manage desktop and mobile hero images, trust badges, headlines, and visibility.
            </p>
          </div>

          {/* Banner Enable Toggle */}
          <div className="p-4 rounded-2xl bg-sand/30 border border-sand-border flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-charcoal block">Hero Banner Status</span>
              <span className="text-[11px] text-charcoal-muted">Enable or temporarily hide the visual hero banner</span>
            </div>
            <button
              type="button"
              onClick={() =>
                updateDraft((prev) => ({
                  ...prev,
                  banner: { ...prev.banner, enabled: !(prev.banner?.enabled !== false) }
                }))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                draft.banner?.enabled !== false
                  ? 'bg-forest text-white'
                  : 'bg-sand-border text-charcoal-muted'
              }`}
            >
              {draft.banner?.enabled !== false ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Badge & Banner Headings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Trust Badge Label</label>
              <input
                type="text"
                value={draft.banner?.badge || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    banner: { ...prev.banner, badge: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="WHO-GMP & AYUSH PREMIUM QUALITY ASSURED"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Banner Primary CTA Text</label>
              <input
                type="text"
                value={draft.banner?.primaryCtaText || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    banner: { ...prev.banner, primaryCtaText: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="Apply for Franchise"
              />
            </div>
          </div>

          {/* Responsive Banner Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Desktop Banner Image */}
            <div className="space-y-3 p-5 rounded-2xl bg-sand/20 border border-sand-border">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="h-4 w-4" /> Desktop Banner (16:9 / 1920x650)
                </span>
                {draft.banner?.desktopImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, desktopImage: '' }
                      }))
                    }
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-sand-border bg-slate-900/10 aspect-[16/9] flex items-center justify-center">
                {draft.banner?.desktopImage ? (
                  <img
                    src={draft.banner.desktopImage}
                    alt="Desktop Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 text-charcoal-muted mx-auto mb-1 opacity-50" />
                    <span className="text-[11px] text-charcoal-muted">No desktop banner set</span>
                  </div>
                )}
              </div>

              {/* Upload Desktop Button */}
              <input
                type="file"
                ref={desktopInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadImage(e.target.files?.[0], 'desktopBanner')}
              />
              <button
                type="button"
                onClick={() => desktopInputRef.current?.click()}
                disabled={uploadingDesktop}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-sand-border hover:bg-sand text-xs font-bold text-charcoal flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                {uploadingDesktop ? <Loader2 className="h-4 w-4 animate-spin text-forest" /> : <Upload className="h-4 w-4 text-forest" />}
                <span>{draft.banner?.desktopImage ? 'Replace Desktop Banner' : 'Upload Desktop Banner'}</span>
              </button>
            </div>

            {/* Mobile Banner Image */}
            <div className="space-y-3 p-5 rounded-2xl bg-sand/20 border border-sand-border">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4" /> Mobile Banner (Portrait / 1080x1350)
                </span>
                {draft.banner?.mobileImage && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, mobileImage: '' }
                      }))
                    }
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-sand-border bg-slate-900/10 aspect-[16/9] flex items-center justify-center">
                {draft.banner?.mobileImage ? (
                  <img
                    src={draft.banner.mobileImage}
                    alt="Mobile Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Smartphone className="h-8 w-8 text-charcoal-muted mx-auto mb-1 opacity-50" />
                    <span className="text-[11px] text-charcoal-muted">Fallback to desktop image on mobile</span>
                  </div>
                )}
              </div>

              {/* Upload Mobile Button */}
              <input
                type="file"
                ref={mobileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadImage(e.target.files?.[0], 'mobileBanner')}
              />
              <button
                type="button"
                onClick={() => mobileInputRef.current?.click()}
                disabled={uploadingMobile}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-sand-border hover:bg-sand text-xs font-bold text-charcoal flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                {uploadingMobile ? <Loader2 className="h-4 w-4 animate-spin text-forest" /> : <Upload className="h-4 w-4 text-forest" />}
                <span>{draft.banner?.mobileImage ? 'Replace Mobile Banner' : 'Upload Dedicated Mobile Banner'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BENEFITS & FEATURES                               */}
      {/* ======================================================== */}
      {activeTab === 'benefits' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Benefits &amp; Business Advantages</span>
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Add, reorder, toggle, or edit value proposition cards displayed in Section B.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newId = `ben_${Date.now()}`;
                updateDraft((prev) => ({
                  ...prev,
                  benefits: [
                    ...(prev.benefits || []),
                    {
                      id: newId,
                      title: 'New Franchise Advantage',
                      description: 'Comprehensive business benefits and institutional support.',
                      icon: 'ShieldCheck',
                      enabled: true,
                      order: (prev.benefits?.length || 0) + 1
                    }
                  ]
                }));
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Benefit Card</span>
            </button>
          </div>

          <div className="space-y-4">
            {(draft.benefits || []).map((ben, idx) => (
              <div
                key={ben.id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  ben.enabled !== false
                    ? 'bg-white border-sand-border shadow-xs'
                    : 'bg-sand/30 border-sand-border/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-sand-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-forest/10 text-forest font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-charcoal">Benefit #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...draft.benefits];
                        updated[idx].enabled = !(updated[idx].enabled !== false);
                        updateDraft({ benefits: updated });
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ben.enabled !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-sand text-charcoal-muted border border-sand-border'
                      }`}
                    >
                      {ben.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => updateDraft({ benefits: reorderArray(draft.benefits, idx, idx - 1) })}
                      className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (draft.benefits?.length || 0) - 1}
                      onClick={() => updateDraft({ benefits: reorderArray(draft.benefits, idx, idx + 1) })}
                      className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: 'benefit', index: idx, title: ben.title })}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer ml-1"
                      title="Delete Benefit Card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Card Title</label>
                    <input
                      type="text"
                      value={ben.title || ''}
                      onChange={(e) => {
                        const updated = [...draft.benefits];
                        updated[idx].title = e.target.value;
                        updateDraft({ benefits: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs"
                      placeholder="Wide Ayurvedic Product Portfolio"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Icon Identifier</label>
                    <select
                      value={ben.icon || 'ShieldCheck'}
                      onChange={(e) => {
                        const updated = [...draft.benefits];
                        updated[idx].icon = e.target.value;
                        updateDraft({ benefits: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs bg-white cursor-pointer"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Description</label>
                    <textarea
                      rows={2}
                      value={ben.description || ''}
                      onChange={(e) => {
                        const updated = [...draft.benefits];
                        updated[idx].description = e.target.value;
                        updateDraft({ benefits: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs resize-none"
                      placeholder="Detailed explanation of this franchise advantage..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PRODUCT CATEGORIES MANAGEMENT                     */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-6">
          <div>
            <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              <span>Product Categories Management</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Select which existing Fibax Ayurveda product categories appear on the franchise landing page. Products are fetched dynamically from the live database without inventory duplication.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Catalog Parity:</strong> There are currently <strong>{products.length} live products</strong> in the Fibax Ayurveda master catalog. Enabling a category below displays matching products in Section C on the franchise page.
            </span>
          </div>

          <div className="space-y-4">
            {(draft.productCategories || []).map((cat, idx) => {
              // Count matching products
              const matchCount = products.filter((p) => {
                const c = String(p.category || '').toLowerCase();
                const d = String(p.dosageForm || '').toLowerCase();
                const s = String(cat.slug || '').toLowerCase();
                return c.includes(s) || d.includes(s);
              }).length;

              return (
                <div
                  key={cat.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    cat.enabled !== false
                      ? 'bg-white border-sand-border shadow-xs'
                      : 'bg-sand/30 border-sand-border/60 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-sand-border/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-charcoal">{cat.name}</span>
                      <span className="text-[11px] font-semibold text-charcoal-muted">
                        ({matchCount} products matched)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...draft.productCategories];
                          updated[idx].enabled = !(updated[idx].enabled !== false);
                          updateDraft({ productCategories: updated });
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                          cat.enabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sand text-charcoal-muted border border-sand-border'
                        }`}
                      >
                        {cat.enabled !== false ? 'Show on Page' : 'Hidden'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => updateDraft({ productCategories: reorderArray(draft.productCategories, idx, idx - 1) })}
                        className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (draft.productCategories?.length || 0) - 1}
                        onClick={() => updateDraft({ productCategories: reorderArray(draft.productCategories, idx, idx + 1) })}
                        className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3">
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[11px] font-bold text-charcoal">Display Title</label>
                      <input
                        type="text"
                        value={cat.name || ''}
                        onChange={(e) => {
                          const updated = [...draft.productCategories];
                          updated[idx].name = e.target.value;
                          updateDraft({ productCategories: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-charcoal">Category Matching Slug</label>
                      <input
                        type="text"
                        value={cat.slug || ''}
                        onChange={(e) => {
                          const updated = [...draft.productCategories];
                          updated[idx].slug = e.target.value;
                          updateDraft({ productCategories: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs font-mono"
                        placeholder="capsules, syrups, oils..."
                      />
                    </div>

                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[11px] font-bold text-charcoal">Description / Tagline</label>
                      <input
                        type="text"
                        value={cat.description || ''}
                        onChange={(e) => {
                          const updated = [...draft.productCategories];
                          updated[idx].description = e.target.value;
                          updateDraft({ productCategories: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs"
                        placeholder="Premium standardized extract capsules in blister packaging."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FRANCHISE PROCESS MANAGEMENT                      */}
      {/* ======================================================== */}
      {activeTab === 'process' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-500" />
                <span>Franchise Process Steps Management</span>
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Configure the step-by-step partner onboarding journey displayed in Section D.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextStepNum = (draft.processSteps?.length || 0) + 1;
                updateDraft((prev) => ({
                  ...prev,
                  processSteps: [
                    ...(prev.processSteps || []),
                    {
                      id: `step_${Date.now()}`,
                      step: nextStepNum,
                      title: `Step ${nextStepNum} Title`,
                      description: 'Step description explaining requirements and expectations.',
                      enabled: true
                    }
                  ]
                }));
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Process Step</span>
            </button>
          </div>

          <div className="space-y-4">
            {(draft.processSteps || []).map((st, idx) => (
              <div
                key={st.id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  st.enabled !== false
                    ? 'bg-white border-sand-border shadow-xs'
                    : 'bg-sand/30 border-sand-border/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-sand-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-forest text-gold font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-charcoal">Step {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...draft.processSteps];
                        updated[idx].enabled = !(updated[idx].enabled !== false);
                        updateDraft({ processSteps: updated });
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                        st.enabled !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-sand text-charcoal-muted border border-sand-border'
                      }`}
                    >
                      {st.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => updateDraft({ processSteps: reorderArray(draft.processSteps, idx, idx - 1) })}
                      className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (draft.processSteps?.length || 0) - 1}
                      onClick={() => updateDraft({ processSteps: reorderArray(draft.processSteps, idx, idx + 1) })}
                      className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: 'step', index: idx, title: st.title })}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer ml-1"
                      title="Delete Step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Step Title</label>
                    <input
                      type="text"
                      value={st.title || ''}
                      onChange={(e) => {
                        const updated = [...draft.processSteps];
                        updated[idx].title = e.target.value;
                        updateDraft({ processSteps: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs"
                      placeholder="e.g. Submit Franchise Enquiry"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Description</label>
                    <textarea
                      rows={2}
                      value={st.description || ''}
                      onChange={(e) => {
                        const updated = [...draft.processSteps];
                        updated[idx].description = e.target.value;
                        updateDraft({ processSteps: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs resize-none"
                      placeholder="Details of what happens in this stage..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: FAQ MANAGEMENT                                    */}
      {/* ======================================================== */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500" />
                <span>Frequently Asked Questions (FAQs)</span>
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Manage questions and answers displayed in the accordion in Section G.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateDraft((prev) => ({
                  ...prev,
                  faqs: [
                    ...(prev.faqs || []),
                    {
                      id: `faq_${Date.now()}`,
                      question: 'New Frequently Asked Question',
                      answer: 'Provide a clear, accurate, and helpful response for distributors.',
                      enabled: true,
                      order: (prev.faqs?.length || 0) + 1
                    }
                  ]
                }));
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {(draft.faqs || []).map((faq, idx) => (
              <div
                key={faq.id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  faq.enabled !== false
                    ? 'bg-white border-sand-border shadow-xs'
                    : 'bg-sand/30 border-sand-border/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-sand-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...draft.faqs];
                        updated[idx].enabled = !(updated[idx].enabled !== false);
                        updateDraft({ faqs: updated });
                      }}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                        faq.enabled !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-sand text-charcoal-muted border border-sand-border'
                      }`}
                    >
                      {faq.enabled !== false ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => updateDraft({ faqs: reorderArray(draft.faqs, idx, idx - 1) })}
                      className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (draft.faqs?.length || 0) - 1}
                      onClick={() => updateDraft({ faqs: reorderArray(draft.faqs, idx, idx + 1) })}
                      className="p-1.5 rounded-lg hover:bg-sand text-charcoal disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: 'faq', index: idx, title: faq.question })}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer ml-1"
                      title="Delete FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Question</label>
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => {
                        const updated = [...draft.faqs];
                        updated[idx].question = e.target.value;
                        updateDraft({ faqs: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs"
                      placeholder="e.g. What is an Ayurvedic PCD Pharma Franchise?"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Answer</label>
                    <textarea
                      rows={3}
                      value={faq.answer || ''}
                      onChange={(e) => {
                        const updated = [...draft.faqs];
                        updated[idx].answer = e.target.value;
                        updateDraft({ faqs: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs resize-none leading-relaxed"
                      placeholder="Detailed answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: ENQUIRY FORM SETTINGS                             */}
      {/* ======================================================== */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-8">
          <div>
            <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
              <Sliders className="h-5 w-5 text-amber-500" />
              <span>Enquiry Form Configuration &amp; Dropdowns</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Customize form headers, dropdown options, labels, success confirmation text, and admin recipient.
            </p>
          </div>

          {/* Essential Validation Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Compliance Guard:</strong> Essential KYC and anti-spam validation (Full Name, 10-digit Indian Mobile, and Consent agreement) are permanently locked as mandatory to satisfy B2B regulatory and privacy requirements.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Form Heading</label>
              <input
                type="text"
                value={draft.formSettings?.heading || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    formSettings: { ...prev.formSettings, heading: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="Apply for Ayurvedic PCD Pharma Franchise"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Submit Button Label</label>
              <input
                type="text"
                value={draft.formSettings?.submitButtonText || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    formSettings: { ...prev.formSettings, submitButtonText: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="Submit Franchise Enquiry"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Form Description</label>
              <textarea
                rows={2}
                value={draft.formSettings?.description || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    formSettings: { ...prev.formSettings, description: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs resize-none"
                placeholder="Submit your territory requirements and our institutional sales desk will connect with you within 24 hours."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Admin Email Notification Recipient</label>
              <input
                type="email"
                value={draft.formSettings?.adminNotificationEmail || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    formSettings: { ...prev.formSettings, adminNotificationEmail: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="fibaxpharma@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Success Confirmation Title</label>
              <input
                type="text"
                value={draft.formSettings?.successTitle || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    formSettings: { ...prev.formSettings, successTitle: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="Application Received"
              />
            </div>
          </div>

          {/* Dynamic Dropdown Options */}
          <div className="border-t border-sand-border/70 pt-6 space-y-6">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-charcoal-muted">
              Dropdown Field Options
            </h4>

            {/* Business Types */}
            <div className="p-5 rounded-2xl bg-sand/20 border border-sand-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-charcoal">Business Profile Options</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = draft.formSettings?.businessTypes || [];
                    updateDraft((prev) => ({
                      ...prev,
                      formSettings: { ...prev.formSettings, businessTypes: [...current, 'New Business Option'] }
                    }));
                  }}
                  className="text-xs text-forest font-bold hover:underline"
                >
                  + Add Option
                </button>
              </div>

              <div className="space-y-2">
                {(draft.formSettings?.businessTypes || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...(draft.formSettings?.businessTypes || [])];
                        updated[idx] = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          formSettings: { ...prev.formSettings, businessTypes: updated }
                        }));
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-sand-border text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (draft.formSettings?.businessTypes || []).filter((_, i) => i !== idx);
                        updateDraft((prev) => ({
                          ...prev,
                          formSettings: { ...prev.formSettings, businessTypes: updated }
                        }));
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Ranges */}
            <div className="p-5 rounded-2xl bg-sand/20 border border-sand-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-charcoal">Investment Range Options</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = draft.formSettings?.investmentRanges || [];
                    updateDraft((prev) => ({
                      ...prev,
                      formSettings: { ...prev.formSettings, investmentRanges: [...current, '₹10,00,000+'] }
                    }));
                  }}
                  className="text-xs text-forest font-bold hover:underline"
                >
                  + Add Option
                </button>
              </div>

              <div className="space-y-2">
                {(draft.formSettings?.investmentRanges || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...(draft.formSettings?.investmentRanges || [])];
                        updated[idx] = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          formSettings: { ...prev.formSettings, investmentRanges: updated }
                        }));
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-sand-border text-xs bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (draft.formSettings?.investmentRanges || []).filter((_, i) => i !== idx);
                        updateDraft((prev) => ({
                          ...prev,
                          formSettings: { ...prev.formSettings, investmentRanges: updated }
                        }));
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: SEO SETTINGS                                      */}
      {/* ======================================================== */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-border shadow-subtle space-y-8">
          <div>
            <h3 className="font-heading font-extrabold text-base text-forest flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-500" />
              <span>Search Engine Optimization (SEO) &amp; Social Sharing</span>
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Control search engine indexing titles, descriptions, canonical URLs, and Open Graph social cards.
            </p>
          </div>

          {/* Google SERP Preview Simulator */}
          <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] space-y-1.5 font-sans">
            <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider block">
              Google Search Result Snippet Preview
            </span>
            <div className="text-xs text-[#202124] flex items-center gap-1.5">
              <span className="text-[11px] text-[#4d5156]">https://fibaxpharma.com &rsaquo; pcd-pharma-franchise</span>
            </div>
            <h4 className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer">
              {draft.seo?.title || 'Ayurvedic PCD Pharma Franchise | Fibax Ayurveda'}
            </h4>
            <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
              {draft.seo?.metaDescription || 'Explore PCD Pharma Franchise opportunities with Fibax Ayurveda. High-margin Ayurvedic remedies, monopoly marketing support, and fast dispatch across India.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-charcoal">SEO Meta Title</label>
                <span className={`text-[11px] font-mono ${
                  (draft.seo?.title?.length || 0) > 60 ? 'text-amber-600 font-bold' : 'text-charcoal-muted'
                }`}>
                  {draft.seo?.title?.length || 0} / 60 characters
                </span>
              </div>
              <input
                type="text"
                value={draft.seo?.title || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value }
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-sand-border text-xs"
                placeholder="Ayurvedic PCD Pharma Franchise | Fibax Ayurveda"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-charcoal">SEO Meta Description</label>
                <span className={`text-[11px] font-mono ${
                  (draft.seo?.metaDescription?.length || 0) > 160 ? 'text-amber-600 font-bold' : 'text-charcoal-muted'
                }`}>
                  {draft.seo?.metaDescription?.length || 0} / 160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={draft.seo?.metaDescription || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value }
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-sand-border text-xs resize-none leading-relaxed"
                placeholder="Explore PCD Pharma Franchise opportunities with Fibax Ayurveda..."
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">Canonical URL</label>
              <input
                type="url"
                value={draft.seo?.canonicalUrl || ''}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, canonicalUrl: e.target.value }
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-sand-border text-xs font-mono"
                placeholder="https://www.fibaxpharma.com/pcd-pharma-franchise"
              />
            </div>

            {/* Social Sharing Image */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-charcoal">Open Graph / Social Sharing Image</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl overflow-hidden border border-sand-border bg-sand flex items-center justify-center">
                  {draft.seo?.ogImage ? (
                    <img src={draft.seo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-charcoal-muted" />
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    ref={ogInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImage(e.target.files?.[0], 'ogImage')}
                  />
                  <button
                    type="button"
                    onClick={() => ogInputRef.current?.click()}
                    disabled={uploadingOg}
                    className="px-4 py-2 rounded-xl bg-white border border-sand-border hover:bg-sand text-xs font-bold text-charcoal flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {uploadingOg ? <Loader2 className="h-4 w-4 animate-spin text-forest" /> : <Upload className="h-4 w-4 text-forest" />}
                    <span>Upload Social Image</span>
                  </button>
                  <p className="text-[11px] text-charcoal-muted">Recommended dimension: 1200 x 630 pixels</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 9: PAGE PREVIEW (DESKTOP, TABLET, MOBILE)            */}
      {/* ======================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          
          {/* Preview Viewport Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-sand-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Viewport Selectors */}
            <div className="flex items-center gap-1.5 bg-sand/40 p-1 rounded-xl border border-sand-border/80">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'desktop' ? 'bg-white text-forest shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop (1280px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'tablet' ? 'bg-white text-forest shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
                <span>Tablet (768px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'mobile' ? 'bg-white text-forest shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile (390px)</span>
              </button>
            </div>

            {/* Source Toggle: Draft vs Published */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal-muted font-semibold">Preview Content:</span>
              <div className="flex items-center gap-1 bg-sand/40 p-1 rounded-xl border border-sand-border/80">
                <button
                  type="button"
                  onClick={() => setPreviewSource('draft')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    previewSource === 'draft' ? 'bg-amber-500 text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  Current Draft
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSource('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    previewSource === 'published' ? 'bg-forest text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  Live Published
                </button>
              </div>
            </div>

            {/* Quick Publish shortcut */}
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-extrabold shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
              <span>Publish This Version</span>
            </button>
          </div>

          {/* Interactive Preview Canvas Frame */}
          <div className="p-4 rounded-3xl bg-slate-900/5 border border-sand-border flex justify-center overflow-x-auto min-h-[600px]">
            <div
              className={`bg-white rounded-2xl shadow-xl border border-sand-border overflow-hidden transition-all duration-300 ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-6xl'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px]'
              }`}
            >
              {/* Simulated Device Frame Top Bar */}
              <div className="bg-sand/60 px-4 py-2 border-b border-sand-border flex items-center justify-between text-[11px] text-charcoal-muted font-mono">
                <span>fibaxpharma.com/pcd-pharma-franchise</span>
                <span className="font-bold uppercase text-forest">
                  {previewSource === 'draft' ? 'Draft Preview' : 'Live Site'}
                </span>
              </div>

              {/* Injected Preview of FranchisePage */}
              <div className="pointer-events-auto">
                <FranchisePage
                  previewMode={true}
                  previewData={previewSource === 'draft' ? draft : published}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM PUBLISH TO LIVE WEBSITE                   */}
      {/* ======================================================== */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand-border space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7 text-forest" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-black text-lg text-charcoal">
                Publish Changes to Live Website?
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Your draft settings will immediately become live for all visitors at <strong>/pcd-pharma-franchise</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal">Change Summary Note (for audit history)</label>
              <input
                type="text"
                value={publishSummary}
                onChange={(e) => setPublishSummary(e.target.value)}
                placeholder="e.g. Updated hero banner, benefits and added Haryana FAQ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:border-forest"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-3 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={publishing}
                className="flex-1 py-3 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-gold" />}
                <span>Confirm &amp; Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM DISCARD DRAFT                             */}
      {/* ======================================================== */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand-border space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="h-7 w-7 text-rose-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-black text-lg text-charcoal">
                Discard Draft Edits?
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                All unpublished edits made to this draft will be permanently discarded. The draft will be reset to match the currently published live configuration.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 py-3 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscardDraft}
                disabled={reverting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {reverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Discard Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM ITEM DELETION                             */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand-border space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-heading font-black text-lg text-charcoal">
                Delete {deleteConfirm.type === 'faq' ? 'FAQ' : deleteConfirm.type === 'step' ? 'Step' : 'Benefit'}?
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Are you sure you want to remove <strong>"{deleteConfirm.title}"</strong> from the draft?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'faq') {
                    updateDraft((prev) => ({
                      ...prev,
                      faqs: prev.faqs.filter((_, i) => i !== deleteConfirm.index)
                    }));
                  } else if (deleteConfirm.type === 'step') {
                    updateDraft((prev) => ({
                      ...prev,
                      processSteps: prev.processSteps.filter((_, i) => i !== deleteConfirm.index)
                    }));
                  } else if (deleteConfirm.type === 'benefit') {
                    updateDraft((prev) => ({
                      ...prev,
                      benefits: prev.benefits.filter((_, i) => i !== deleteConfirm.index)
                    }));
                  }
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CHANGE HISTORY LOG DRAWER                         */}
      {/* ======================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-sand-border space-y-5 animate-scaleUp max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-forest" />
                <h3 className="font-heading font-black text-base text-charcoal">Franchise CMS Change History</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg hover:bg-sand text-charcoal-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-charcoal-muted text-center py-8">No historical actions logged yet.</p>
              ) : (
                history.map((hist, i) => (
                  <div key={hist.id || i} className="p-3.5 rounded-2xl bg-sand/30 border border-sand-border/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                        hist.action === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : hist.action === 'draft_saved'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {hist.action.replace('_', ' ')}
                      </span>
                      <span className="text-charcoal-muted font-mono text-[11px]">
                        {new Date(hist.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="font-medium text-charcoal pt-1">{hist.summary}</p>
                    <span className="text-[10px] text-charcoal-muted block">By Admin: {hist.adminUser || 'admin'}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-2.5 rounded-xl bg-sand hover:bg-sand-border text-xs font-bold text-charcoal"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
