import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { CallbackModal, DEFAULT_CALLBACK_CONFIG, ICON_MAP } from '../common/CallbackModal';
import {
  PhoneCall,
  ShieldCheck,
  Lock,
  Sparkles,
  HeartPulse,
  Clock,
  CheckCircle2,
  Leaf,
  Send,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
  Monitor,
  Smartphone,
  Sliders,
  Palette,
  Check,
  X,
  ChevronDown,
  Layers,
  HelpCircle,
  GripVertical,
  Type,
  ListFilter,
  MessageSquare
} from 'lucide-react';

const ICON_CHOICES = [
  { id: 'phone', label: 'Doctor Call / Phone', icon: PhoneCall },
  { id: 'shield', label: 'Safety Shield', icon: ShieldCheck },
  { id: 'lock', label: 'Privacy Lock', icon: Lock },
  { id: 'sparkles', label: 'Sparkles / Premium', icon: Sparkles },
  { id: 'heart', label: 'Health Pulse / Heart', icon: HeartPulse },
  { id: 'clock', label: 'Clock / Quick Slot', icon: Clock },
  { id: 'check', label: 'Verified Checkmark', icon: CheckCircle2 },
  { id: 'leaf', label: 'Ayurvedic Leaf', icon: Leaf },
  { id: 'send', label: 'Send / Submit', icon: Send },
  { id: 'calendar', label: 'Calendar / Schedule', icon: Calendar }
];

export function DoctorCallbackManager() {
  const [config, setConfig] = useState(DEFAULT_CALLBACK_CONFIG);
  const [initialConfig, setInitialConfig] = useState(DEFAULT_CALLBACK_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }
  const [activeTab, setActiveTab] = useState('header'); // 'header' | 'fields' | 'submit' | 'design' | 'preview'
  const [previewViewport, setPreviewViewport] = useState('desktop'); // 'desktop' | 'mobile'

  // Custom Field Creator Modal State
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    options: ['Option 1', 'Option 2']
  });

  // Reset to default confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/website/callback-form', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.success && res.data) {
        setConfig(res.data);
        setInitialConfig(res.data);
      }
    } catch (err) {
      console.error('Failed to load callback form config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for deep property updates
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

  // Unsaved changes detector
  const hasChanges = JSON.stringify(config) !== JSON.stringify(initialConfig);

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/website/callback-form', {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: JSON.stringify(config)
      });

      if (res.success && res.data) {
        setConfig(res.data);
        setInitialConfig(res.data);
        setStatusMsg({ type: 'success', text: 'Doctor callback form settings saved and published successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to save callback form settings.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error saving callback form settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setConfig(JSON.parse(JSON.stringify(initialConfig)));
    setStatusMsg({ type: 'info', text: 'Unsaved changes discarded.' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Reset to default
  const handleResetToDefault = () => {
    setConfig(JSON.parse(JSON.stringify(DEFAULT_CALLBACK_CONFIG)));
    setIsResetConfirmOpen(false);
    setStatusMsg({ type: 'info', text: 'Form settings reset to original defaults. Click Save Changes to publish.' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Field Reordering Helpers
  const handleMoveField = (index, direction) => {
    const fields = [...config.fields];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[targetIndex];
    fields[targetIndex] = temp;

    // Reassign order indices
    fields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setConfig(prev => ({ ...prev, fields }));
  };

  // Toggle field enabled
  const handleToggleFieldEnabled = (fieldId) => {
    const fields = config.fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, enabled: f.enabled === false ? true : false };
      }
      return f;
    });
    setConfig(prev => ({ ...prev, fields }));
  };

  // Toggle field required
  const handleToggleFieldRequired = (fieldId) => {
    const fields = config.fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, required: !f.required };
      }
      return f;
    });
    setConfig(prev => ({ ...prev, fields }));
  };

  // Dropdown options management
  const handleAddOption = (fieldId, optionText) => {
    if (!optionText || !optionText.trim()) return;
    const clean = optionText.trim();
    const fields = config.fields.map(f => {
      if (f.id === fieldId) {
        const currentOptions = Array.isArray(f.options) ? f.options : [];
        if (!currentOptions.includes(clean)) {
          return { ...f, options: [...currentOptions, clean] };
        }
      }
      return f;
    });
    setConfig(prev => ({ ...prev, fields }));
  };

  const handleRemoveOption = (fieldId, optionIndex) => {
    const fields = config.fields.map(f => {
      if (f.id === fieldId) {
        const currentOptions = Array.isArray(f.options) ? [...f.options] : [];
        currentOptions.splice(optionIndex, 1);
        return { ...f, options: currentOptions };
      }
      return f;
    });
    setConfig(prev => ({ ...prev, fields }));
  };

  // Custom Field Addition
  const handleCreateCustomField = () => {
    if (!newFieldData.label.trim()) return;

    const fieldId = 'custom_' + newFieldData.label.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) + '_' + Date.now().toString(36);
    const newField = {
      id: fieldId,
      name: fieldId,
      type: newFieldData.type,
      label: newFieldData.label.trim(),
      placeholder: newFieldData.placeholder.trim(),
      required: Boolean(newFieldData.required),
      enabled: true,
      system: false,
      order: (config.fields?.length || 0) + 1,
      ...(newFieldData.type === 'select' ? { options: newFieldData.options.filter(o => o.trim()) } : {})
    };

    setConfig(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));

    setIsAddFieldModalOpen(false);
    setNewFieldData({
      label: '',
      type: 'text',
      placeholder: '',
      required: false,
      options: ['Option 1', 'Option 2']
    });
  };

  // Delete Custom Field
  const handleDeleteField = (fieldId) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      const fields = config.fields.filter(f => f.id !== fieldId);
      fields.forEach((f, idx) => { f.order = idx + 1; });
      setConfig(prev => ({ ...prev, fields }));
    }
  };

  const isPaused = config.status === 'paused' || config.enabled === false;

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-charcoal-muted bg-white rounded-3xl border border-sand-border flex items-center justify-center gap-2">
        <div className="h-5 w-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
        <span>Loading Doctor Callback Form Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ============================================================= */}
      {/* TOP HEADER & CONTROLS BAR                                      */}
      {/* ============================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sand-border shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-forest/10 text-forest">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-extrabold text-forest-deep text-lg">
                    Doctor Call Back Form CMS
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      !isPaused
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {!isPaused ? '● Active on Site' : '⏸ Paused (Hidden)'}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Customise form content, fields, dropdown options, CTA button, styling and responsive popup behaviour.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {hasChanges && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                Unsaved Changes
              </span>
            )}

            <button
              type="button"
              onClick={handleDiscard}
              disabled={!hasChanges || saving}
              className="px-3.5 py-2 rounded-xl border border-sand-border text-charcoal-muted hover:text-charcoal hover:bg-sand text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-sand-border text-charcoal-muted hover:text-charcoal hover:bg-sand text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Visibility & Device Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-sand-border">
          {/* Active / Paused Switch */}
          <div className="p-3 rounded-2xl bg-sand/30 border border-sand-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-charcoal block">Form Status</span>
              <span className="text-[10px] text-charcoal-muted">
                {config.status === 'active' ? 'Visible to visitors' : 'Paused on live site'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextStatus = config.status === 'active' ? 'paused' : 'active';
                setConfig(prev => ({ ...prev, status: nextStatus, enabled: nextStatus === 'active' }));
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                config.status === 'active'
                  ? 'bg-forest text-white'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {config.status === 'active' ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>

          {/* Desktop Visibility */}
          <div className="p-3 rounded-2xl bg-sand/30 border border-sand-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-charcoal flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5 text-forest" />
                <span>Desktop Popup</span>
              </span>
              <span className="text-[10px] text-charcoal-muted">Show on wide screens</span>
            </div>
            <button
              type="button"
              onClick={() => updateField('showOnDesktop', !config.showOnDesktop)}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                config.showOnDesktop !== false
                  ? 'bg-forest text-white'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {config.showOnDesktop !== false ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Mobile Visibility */}
          <div className="p-3 rounded-2xl bg-sand/30 border border-sand-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-charcoal flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-brand" />
                <span>Mobile Popup</span>
              </span>
              <span className="text-[10px] text-charcoal-muted">Show on phone viewports</span>
            </div>
            <button
              type="button"
              onClick={() => updateField('showOnMobile', !config.showOnMobile)}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                config.showOnMobile !== false
                  ? 'bg-forest text-white'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {config.showOnMobile !== false ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Popup Trigger Enable */}
          <div className="p-3 rounded-2xl bg-sand/30 border border-sand-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-charcoal flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-amber-warm" />
                <span>Popup Modal</span>
              </span>
              <span className="text-[10px] text-charcoal-muted">Allow trigger modals</span>
            </div>
            <button
              type="button"
              onClick={() => updateField('popupEnabled', !config.popupEnabled)}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                config.popupEnabled !== false
                  ? 'bg-forest text-white'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {config.popupEnabled !== false ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : statusMsg.type === 'error'
                ? 'bg-rose-50 text-rose-900 border border-rose-200'
                : 'bg-sand text-charcoal border border-sand-border'
            }`}
          >
            {statusMsg.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
            {statusMsg.type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* EDITOR NAVIGATION TABS                                         */}
      {/* ============================================================= */}
      <div className="flex items-center gap-2 border-b border-sand-border pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'header'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Type className="h-3.5 w-3.5 text-amber-300" />
          <span>Header &amp; Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'fields'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <ListFilter className="h-3.5 w-3.5 text-leaf" />
          <span>Form Fields &amp; Dropdowns ({config.fields?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Send className="h-3.5 w-3.5 text-brand" />
          <span>Submit Button &amp; Privacy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'design'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Palette className="h-3.5 w-3.5 text-gold" />
          <span>Popup Design &amp; Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Eye className="h-3.5 w-3.5 text-emerald-400" />
          <span>Live Interactive Preview</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: HEADER & IDENTITY EDITING                              */}
      {/* ============================================================= */}
      {activeTab === 'header' && (
        <div className="p-6 rounded-3xl bg-white border border-sand-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-sand-border pb-3">
            <div>
              <h4 className="font-heading font-extrabold text-charcoal text-sm">
                Modal Header Content &amp; Branding
              </h4>
              <p className="text-xs text-charcoal-muted">
                Configure the title, description, top badge text, icon, and custom colour palette.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Main Heading */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-charcoal">
                Main Heading Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.header?.heading || ''}
                onChange={(e) => updateField('header.heading', e.target.value)}
                placeholder="e.g. Request a Doctor Call Back"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-medium bg-sand/30 focus:bg-white focus:outline-none focus:border-forest"
              />
            </div>

            {/* Description Subtitle */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-charcoal">
                Description / Subtitle
              </label>
              <textarea
                rows="2"
                value={config.header?.description || ''}
                onChange={(e) => updateField('header.description', e.target.value)}
                placeholder="Leave your contact details and our certified Ayurvedic health consultants will call you back..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-medium bg-sand/30 focus:bg-white focus:outline-none focus:border-forest resize-none"
              />
            </div>

            {/* Badge Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">
                Top Badge Text
              </label>
              <input
                type="text"
                value={config.header?.badgeText || ''}
                onChange={(e) => updateField('header.badgeText', e.target.value)}
                placeholder="FREE AYURVEDIC CARE CALLBACK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-medium bg-sand/30 focus:bg-white focus:outline-none focus:border-forest"
              />
            </div>

            {/* Badge Icon Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal">
                Badge Icon
              </label>
              <select
                value={config.header?.badgeIcon || 'phone'}
                onChange={(e) => updateField('header.badgeIcon', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-bold bg-sand/30 focus:bg-white focus:outline-none focus:border-forest cursor-pointer"
              >
                {ICON_CHOICES.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Colour Styling */}
          <div className="pt-4 border-t border-sand-border space-y-3">
            <h5 className="font-heading font-extrabold text-charcoal text-xs flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-forest" />
              <span>Header Colours &amp; Typography</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {/* Header Background */}
              <div className="p-3 rounded-2xl bg-sand/20 border border-sand-border space-y-1.5">
                <label className="block font-bold text-[11px] text-charcoal">Header Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.header?.bgColor || '#173e27'}
                    onChange={(e) => updateField('header.bgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.header?.bgColor || '#173e27'}
                    onChange={(e) => updateField('header.bgColor', e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white uppercase"
                  />
                </div>
              </div>

              {/* Heading Text Colour */}
              <div className="p-3 rounded-2xl bg-sand/20 border border-sand-border space-y-1.5">
                <label className="block font-bold text-[11px] text-charcoal">Heading Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.header?.headingColor || '#ffffff'}
                    onChange={(e) => updateField('header.headingColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.header?.headingColor || '#ffffff'}
                    onChange={(e) => updateField('header.headingColor', e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white uppercase"
                  />
                </div>
              </div>

              {/* Description Colour */}
              <div className="p-3 rounded-2xl bg-sand/20 border border-sand-border space-y-1.5">
                <label className="block font-bold text-[11px] text-charcoal">Description Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.header?.descriptionColor?.startsWith('#') ? config.header.descriptionColor : '#f3eedd'}
                    onChange={(e) => updateField('header.descriptionColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.header?.descriptionColor || '#f3eedd'}
                    onChange={(e) => updateField('header.descriptionColor', e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white"
                  />
                </div>
              </div>

              {/* Badge Background */}
              <div className="p-3 rounded-2xl bg-sand/20 border border-sand-border space-y-1.5">
                <label className="block font-bold text-[11px] text-charcoal">Badge Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.header?.badgeBgColor?.startsWith('#') ? config.header.badgeBgColor : '#1b4d3e'}
                    onChange={(e) => updateField('header.badgeBgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.header?.badgeBgColor || '#1b4d3e'}
                    onChange={(e) => updateField('header.badgeBgColor', e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white"
                  />
                </div>
              </div>

              {/* Badge Text Colour */}
              <div className="p-3 rounded-2xl bg-sand/20 border border-sand-border space-y-1.5">
                <label className="block font-bold text-[11px] text-charcoal">Badge Text Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.header?.badgeTextColor || '#6ee7b7'}
                    onChange={(e) => updateField('header.badgeTextColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.header?.badgeTextColor || '#6ee7b7'}
                    onChange={(e) => updateField('header.badgeTextColor', e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: FORM FIELDS & DROPDOWNS MANAGEMENT                      */}
      {/* ============================================================= */}
      {activeTab === 'fields' && (
        <div className="p-6 rounded-3xl bg-white border border-sand-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-border pb-3">
            <div>
              <h4 className="font-heading font-extrabold text-charcoal text-sm">
                Form Fields, Required Rules &amp; Dynamic Dropdown Options
              </h4>
              <p className="text-xs text-charcoal-muted">
                Edit labels, toggle required fields, adjust display order, add custom fields, or modify dropdown choices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddFieldModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Custom Field</span>
            </button>
          </div>

          {/* Fields List Table */}
          <div className="space-y-4">
            {config.fields?.map((field, index) => {
              const isFirst = index === 0;
              const isLast = index === (config.fields?.length || 1) - 1;
              const isSelect = field.type === 'select';

              return (
                <div
                  key={field.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                    field.enabled !== false
                      ? 'bg-sand/10 border-sand-border'
                      : 'bg-sand/5 border-dashed border-sand-border/70 opacity-60'
                  }`}
                >
                  {/* Top Bar of Field Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      {/* Order Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMoveField(index, -1)}
                          className="p-1 rounded-lg text-charcoal hover:bg-sand disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 h-6 rounded-full bg-forest text-white text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMoveField(index, 1)}
                          className="p-1 rounded-lg text-charcoal hover:bg-sand disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="font-heading font-extrabold text-charcoal text-xs">
                        {field.label}
                      </span>

                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sand border border-sand-border text-charcoal-muted">
                        {field.type}
                      </span>

                      {field.system && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-forest/10 text-forest">
                          Core Field
                        </span>
                      )}
                    </div>

                    {/* Field Toggles: Enabled & Required */}
                    <div className="flex items-center gap-2">
                      {/* Required Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleFieldRequired(field.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                          field.required
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-sand text-charcoal-muted border border-sand-border'
                        }`}
                        title="Click to toggle required / optional"
                      >
                        {field.required ? '★ Required' : '○ Optional'}
                      </button>

                      {/* Enable / Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleFieldEnabled(field.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                          field.enabled !== false
                            ? 'bg-forest text-white'
                            : 'bg-red-100 text-red-700'
                        }`}
                        title="Click to Enable / Disable"
                      >
                        {field.enabled !== false ? 'ON' : 'OFF'}
                      </button>

                      {/* Delete Custom Field */}
                      {!field.system && (
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete custom field"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Field Input Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-charcoal mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig(prev => ({
                            ...prev,
                            fields: prev.fields.map(f => f.id === field.id ? { ...f, label: val } : f)
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-sand-border bg-white text-xs font-medium focus:outline-none focus:border-forest"
                      />
                    </div>

                    {!isSelect && (
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal mb-1">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig(prev => ({
                              ...prev,
                              fields: prev.fields.map(f => f.id === field.id ? { ...f, placeholder: val } : f)
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-sand-border bg-white text-xs font-medium focus:outline-none focus:border-forest"
                        />
                      </div>
                    )}

                    {field.id === 'phone' && (
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal mb-1">
                          Country Dial Code
                        </label>
                        <input
                          type="text"
                          value={field.countryCode || '+91'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig(prev => ({
                              ...prev,
                              fields: prev.fields.map(f => f.id === field.id ? { ...f, countryCode: val } : f)
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-sand-border bg-white text-xs font-medium focus:outline-none focus:border-forest"
                        />
                      </div>
                    )}

                    {field.type === 'textarea' && (
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal mb-1">
                          Character Limit
                        </label>
                        <input
                          type="number"
                          value={field.maxLength || 300}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 300;
                            setConfig(prev => ({
                              ...prev,
                              fields: prev.fields.map(f => f.id === field.id ? { ...f, maxLength: val } : f)
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-sand-border bg-white text-xs font-medium focus:outline-none focus:border-forest"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dropdown Options Manager for 'select' fields */}
                  {isSelect && (
                    <div className="p-3.5 rounded-xl bg-white border border-sand-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-forest-deep flex items-center gap-1.5">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span>Editable Dropdown Choices ({(field.options || []).length})</span>
                        </span>
                        <span className="text-[10px] text-charcoal-muted">
                          These options appear in the live customer dropdown.
                        </span>
                      </div>

                      {/* Current Options Pills */}
                      <div className="flex flex-wrap gap-2">
                        {(field.options || []).map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sand border border-sand-border text-xs text-charcoal"
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(field.id, optIdx)}
                              className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                              title="Remove option"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Option Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Type new option name..."
                          id={`new_opt_${field.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target;
                              handleAddOption(field.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-sand-border text-xs bg-sand/20 focus:bg-white focus:outline-none focus:border-forest"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`new_opt_${field.id}`);
                            if (input && input.value) {
                              handleAddOption(field.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all border border-sand-border cursor-pointer flex-shrink-0"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: SUBMIT BUTTON & PRIVACY NOTE                            */}
      {/* ============================================================= */}
      {activeTab === 'submit' && (
        <div className="p-6 rounded-3xl bg-white border border-sand-border shadow-xs space-y-6">
          <div className="border-b border-sand-border pb-3">
            <h4 className="font-heading font-extrabold text-charcoal text-sm">
              Submit CTA Button &amp; Trust / Privacy Messaging
            </h4>
            <p className="text-xs text-charcoal-muted">
              Configure button text, icon, button colours, and the bottom patient confidentiality disclaimer.
            </p>
          </div>

          {/* Submit Button Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sand/20 border border-sand-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-xs text-charcoal flex items-center gap-1.5">
                <Send className="h-4 w-4 text-brand" />
                <span>Submit Button Settings</span>
              </span>
              <button
                type="button"
                onClick={() => updateField('submitButton.enabled', config.submitButton?.enabled === false ? true : false)}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                  config.submitButton?.enabled !== false
                    ? 'bg-forest text-white'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {config.submitButton?.enabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-charcoal mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={config.submitButton?.text || 'Request Call Back Now'}
                  onChange={(e) => updateField('submitButton.text', e.target.value)}
                  placeholder="Request Call Back Now"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-medium focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">
                  Button Icon
                </label>
                <select
                  value={config.submitButton?.icon || 'phone'}
                  onChange={(e) => updateField('submitButton.icon', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-bold focus:outline-none focus:border-forest cursor-pointer"
                >
                  {ICON_CHOICES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Colours */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">
                  Button Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.submitButton?.bgColor || '#ea580c'}
                    onChange={(e) => updateField('submitButton.bgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={config.submitButton?.bgColor || '#ea580c'}
                    onChange={(e) => updateField('submitButton.bgColor', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-sand-border text-[11px] font-mono bg-white uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Message Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sand/20 border border-sand-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-xs text-charcoal flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Bottom Privacy &amp; Anti-Spam Message</span>
              </span>
              <button
                type="button"
                onClick={() => updateField('privacy.enabled', config.privacy?.enabled === false ? true : false)}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${
                  config.privacy?.enabled !== false
                    ? 'bg-forest text-white'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {config.privacy?.enabled !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-charcoal mb-1">
                  Privacy Statement
                </label>
                <input
                  type="text"
                  value={config.privacy?.message || ''}
                  onChange={(e) => updateField('privacy.message', e.target.value)}
                  placeholder="Your number is 100% private. No spam, only genuine Ayurvedic assistance."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-medium focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal mb-1">
                  Privacy Icon
                </label>
                <select
                  value={config.privacy?.icon || 'shield'}
                  onChange={(e) => updateField('privacy.icon', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border bg-white text-xs font-bold focus:outline-none focus:border-forest cursor-pointer"
                >
                  <option value="shield">Safety Shield</option>
                  <option value="lock">Privacy Lock</option>
                  <option value="check">Checkmark</option>
                  <option value="leaf">Natural Leaf</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: POPUP DESIGN & LAYOUT                                  */}
      {/* ============================================================= */}
      {activeTab === 'design' && (
        <div className="p-6 rounded-3xl bg-white border border-sand-border shadow-xs space-y-6">
          <div className="border-b border-sand-border pb-3">
            <h4 className="font-heading font-extrabold text-charcoal text-sm">
              Popup Modal Layout &amp; Theme Styling
            </h4>
            <p className="text-xs text-charcoal-muted">
              Configure border radii, desktop max width, input borders, and background colours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Modal Border Radius */}
            <div className="p-3.5 rounded-2xl bg-sand/20 border border-sand-border space-y-1">
              <label className="block font-bold text-charcoal">Modal Border Radius</label>
              <input
                type="text"
                value={config.design?.borderRadius || '24px'}
                onChange={(e) => updateField('design.borderRadius', e.target.value)}
                placeholder="24px"
                className="w-full px-3 py-2 rounded-xl border border-sand-border bg-white text-xs font-medium"
              />
            </div>

            {/* Desktop Width */}
            <div className="p-3.5 rounded-2xl bg-sand/20 border border-sand-border space-y-1">
              <label className="block font-bold text-charcoal">Desktop Max Width</label>
              <input
                type="text"
                value={config.design?.desktopWidth || '520px'}
                onChange={(e) => updateField('design.desktopWidth', e.target.value)}
                placeholder="520px"
                className="w-full px-3 py-2 rounded-xl border border-sand-border bg-white text-xs font-medium"
              />
            </div>

            {/* Input Border Colour */}
            <div className="p-3.5 rounded-2xl bg-sand/20 border border-sand-border space-y-1">
              <label className="block font-bold text-charcoal">Input Border Colour</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.design?.inputBorderColor || '#e2d9cc'}
                  onChange={(e) => updateField('design.inputBorderColor', e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={config.design?.inputBorderColor || '#e2d9cc'}
                  onChange={(e) => updateField('design.inputBorderColor', e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white uppercase"
                />
              </div>
            </div>

            {/* Input Background Colour */}
            <div className="p-3.5 rounded-2xl bg-sand/20 border border-sand-border space-y-1">
              <label className="block font-bold text-charcoal">Input Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.design?.inputBgColor || '#f8f6f0'}
                  onChange={(e) => updateField('design.inputBgColor', e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={config.design?.inputBgColor || '#f8f6f0'}
                  onChange={(e) => updateField('design.inputBgColor', e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-sand-border text-[11px] font-mono bg-white uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: LIVE INTERACTIVE PREVIEW                                */}
      {/* ============================================================= */}
      {activeTab === 'preview' && (
        <div className="p-6 rounded-3xl bg-white border border-sand-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-border pb-3">
            <div>
              <h4 className="font-heading font-extrabold text-charcoal text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-forest" />
                <span>Live Interactive Preview</span>
                {hasChanges && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Previewing Unsaved Changes
                  </span>
                )}
              </h4>
              <p className="text-xs text-charcoal-muted">
                Test and interact with the Doctor Callback modal exactly as your customers will experience it.
              </p>
            </div>

            {/* Viewport Selector */}
            <div className="inline-flex items-center gap-1 p-1 bg-sand rounded-xl border border-sand-border flex-shrink-0">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewViewport === 'desktop'
                    ? 'bg-white text-forest shadow-xs'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop (520px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewViewport === 'mobile'
                    ? 'bg-white text-forest shadow-xs'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Interactive Frame Container */}
          <div className="p-4 sm:p-8 rounded-3xl bg-[#0b2416]/90 backdrop-blur-xs flex items-center justify-center min-h-[550px] overflow-hidden">
            <div
              style={{
                width: previewViewport === 'mobile' ? '375px' : '520px',
                maxWidth: '100%',
                transition: 'all 0.3s ease'
              }}
              className="relative shadow-2xl rounded-3xl overflow-hidden"
            >
              <CallbackModal
                isOpen={true}
                onClose={() => alert('Close button clicked in preview mode.')}
                previewConfig={config}
                inPreviewContainer={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: ADD CUSTOM FIELD                                        */}
      {/* ============================================================= */}
      {isAddFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-border space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h4 className="font-heading font-extrabold text-forest-deep text-sm">
                Add Custom Form Field
              </h4>
              <button
                type="button"
                onClick={() => setIsAddFieldModalOpen(false)}
                className="p-1 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-sand"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patient Age, Alternate Number, Pin Code"
                  value={newFieldData.label}
                  onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-border focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">
                  Field Type
                </label>
                <select
                  value={newFieldData.type}
                  onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-border bg-sand/30 font-bold focus:outline-none focus:border-forest"
                >
                  <option value="text">Single-line Text</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown Choice (Select)</option>
                  <option value="textarea">Multi-line Text (Textarea)</option>
                  <option value="email">Email Address</option>
                </select>
              </div>

              {newFieldData.type !== 'select' && (
                <div>
                  <label className="block font-bold text-charcoal mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Enter value..."
                    value={newFieldData.placeholder}
                    onChange={(e) => setNewFieldData({ ...newFieldData, placeholder: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-sand-border focus:outline-none focus:border-forest"
                  />
                </div>
              )}

              {newFieldData.type === 'select' && (
                <div className="space-y-2">
                  <label className="block font-bold text-charcoal">
                    Initial Options (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Option A, Option B, Option C"
                    value={newFieldData.options.join(', ')}
                    onChange={(e) => setNewFieldData({
                      ...newFieldData,
                      options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-sand-border focus:outline-none focus:border-forest"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new_field_req"
                  checked={newFieldData.required}
                  onChange={(e) => setNewFieldData({ ...newFieldData, required: e.target.checked })}
                  className="rounded text-forest focus:ring-forest cursor-pointer"
                />
                <label htmlFor="new_field_req" className="font-bold text-charcoal cursor-pointer">
                  Mark as Required Field
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setIsAddFieldModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomField}
                disabled={!newFieldData.label.trim()}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold disabled:opacity-50"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: RESET TO DEFAULT CONFIRMATION                          */}
      {/* ============================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-sand-border space-y-4 animate-scaleIn text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-charcoal text-base">
                Reset to Default Settings?
              </h4>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                This will restore the original Ayurvedic doctor callback form content, default dropdown options, and brand styling.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
