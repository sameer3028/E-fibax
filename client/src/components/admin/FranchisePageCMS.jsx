import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
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
  RefreshCw
} from 'lucide-react';

export function FranchisePageCMS() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Upload state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // New FAQ Form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/franchise/content', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res && res.success && res.data) {
        setConfig(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load franchise settings: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleHeroChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const handleToggleActive = () => {
    setConfig((prev) => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setConfig((prev) => ({
      ...prev,
      faqs: [
        ...(prev.faqs || []),
        { question: newQuestion.trim(), answer: newAnswer.trim() }
      ]
    }));
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteFaq = (index) => {
    setConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, idx) => idx !== index)
    }));
  };

  const handleFaqChange = (index, field, value) => {
    setConfig((prev) => {
      const updated = [...(prev.faqs || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleBenefitChange = (index, field, value) => {
    setConfig((prev) => {
      const updated = [...(prev.benefits || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, benefits: updated };
    });
  };

  const handleProcessChange = (index, field, value) => {
    setConfig((prev) => {
      const updated = [...(prev.processSteps || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, processSteps: updated };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (data && data.url) {
        handleHeroChange('bannerImage', data.url);
        setFeedback({ type: 'success', message: 'Banner image uploaded successfully!' });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Image upload failed: ' + err.message });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/franchise/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(config)
      });

      if (res && res.success) {
        setFeedback({ type: 'success', message: 'Franchise page settings saved successfully!' });
        if (res.data) setConfig(res.data);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Save error: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-charcoal-muted flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-forest" />
        <span>Loading Franchise CMS Settings...</span>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control Card */}
      <div className="bg-white p-5 rounded-2xl border border-sand-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-forest" />
            <h3 className="font-heading font-extrabold text-lg text-charcoal">
              PCD Pharma Franchise Page Editor
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                config.isActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {config.isActive ? 'Active on Live Site' : 'Paused'}
            </span>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Configure copy, banner imagery, business advantages, process steps, and FAQs for /pcd-pharma-franchise.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active / Paused Toggle */}
          <button
            type="button"
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              config.isActive
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {config.isActive ? (
              <>
                <ToggleRight className="h-4 w-4 text-emerald-600" />
                <span>Pause Page</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 text-rose-600" />
                <span>Activate Page</span>
              </>
            )}
          </button>

          <a
            href="/pcd-pharma-franchise"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Eye className="h-4 w-4 text-forest" />
            <span>View Live</span>
          </a>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-gold" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Hero Banner Section Form */}
      <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-xs space-y-4">
        <h4 className="font-heading font-extrabold text-sm text-forest uppercase tracking-wider flex items-center gap-2">
          <span>Section A: Hero Banner Content</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Top Trust Badge Text</label>
            <input
              type="text"
              value={config.hero?.badge || ''}
              onChange={(e) => handleHeroChange('badge', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-sand/20 border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Main Heading</label>
            <input
              type="text"
              value={config.hero?.heading || ''}
              onChange={(e) => handleHeroChange('heading', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-sand/20 border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Subtitle Description</label>
            <textarea
              rows={2}
              value={config.hero?.subtitle || ''}
              onChange={(e) => handleHeroChange('subtitle', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-sand/20 border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest resize-none"
            />
          </div>

          {/* Banner Image URL & Uploader */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-charcoal">Banner Image URL / Upload</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.hero?.bannerImage || ''}
                onChange={(e) => handleHeroChange('bannerImage', e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-sand/20 border border-sand-border text-xs text-charcoal focus:outline-none focus:border-forest"
                placeholder="https://..."
              />
              <label className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                <Upload className="h-4 w-4" />
                <span>{isUploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {config.hero?.bannerImage && (
              <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-sand-border">
                <img
                  src={config.hero.bannerImage}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Advantages (Why Choose) Editor */}
      <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-xs space-y-4">
        <h4 className="font-heading font-extrabold text-sm text-forest uppercase tracking-wider">
          Section B: Why Choose Fibax Ayurveda (6 Benefits)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config.benefits || []).map((ben, idx) => (
            <div key={ben.id || idx} className="p-4 rounded-xl bg-sand/20 border border-sand-border space-y-2">
              <span className="text-[10px] font-bold text-forest uppercase">Benefit #{idx + 1}</span>
              <input
                type="text"
                value={ben.title}
                onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-sand-border rounded-lg text-xs font-bold"
              />
              <textarea
                rows={2}
                value={ben.description}
                onChange={(e) => handleBenefitChange(idx, 'description', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-sand-border rounded-lg text-xs text-charcoal-muted resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5-Step Process Editor */}
      <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-xs space-y-4">
        <h4 className="font-heading font-extrabold text-sm text-forest uppercase tracking-wider">
          Section D: 5-Step Franchise Process
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {(config.processSteps || []).map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-sand/20 border border-sand-border space-y-2">
              <span className="text-[11px] font-bold text-gold bg-forest px-2 py-0.5 rounded-full inline-block">
                Step {idx + 1}
              </span>
              <input
                type="text"
                value={step.title}
                onChange={(e) => handleProcessChange(idx, 'title', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-sand-border rounded-lg text-xs font-bold"
              />
              <textarea
                rows={3}
                value={step.description}
                onChange={(e) => handleProcessChange(idx, 'description', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-sand-border rounded-lg text-[11px] text-charcoal-muted resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions Editor */}
      <div className="bg-white p-6 rounded-2xl border border-sand-border shadow-xs space-y-4">
        <h4 className="font-heading font-extrabold text-sm text-forest uppercase tracking-wider flex items-center justify-between">
          <span>Section G: Frequently Asked Questions ({config.faqs?.length || 0})</span>
        </h4>

        {/* List of FAQs */}
        <div className="space-y-3">
          {(config.faqs || []).map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-sand/20 border border-sand-border space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-forest uppercase">Question #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteFaq(idx)}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                  title="Delete Question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-sand-border rounded-lg text-xs font-bold"
              />
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-sand-border rounded-lg text-xs text-charcoal-muted resize-none"
              />
            </div>
          ))}
        </div>

        {/* Add New FAQ */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-dashed border-sand-border space-y-3">
          <span className="text-xs font-bold text-forest block">+ Add New Question &amp; Answer</span>
          <input
            type="text"
            placeholder="e.g. What is the minimum order quantity for first dispatch?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs font-bold"
          />
          <textarea
            rows={2}
            placeholder="e.g. First inventory dispatch order minimum is tailored to your district size..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs resize-none"
          />
          <button
            type="button"
            onClick={handleAddFaq}
            disabled={!newQuestion.trim() || !newAnswer.trim()}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold disabled:opacity-50 transition-colors"
          >
            Add FAQ to List
          </button>
        </div>
      </div>

      {/* Floating Save Button at Bottom */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-sand-border shadow-modal flex items-center justify-between">
        <span className="text-xs text-charcoal-muted font-medium">
          Ensure you click Save Changes to publish updates to https://fibaxpharma.com/pcd-pharma-franchise
        </span>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-gold" />
              <span>Save Franchise Settings</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
