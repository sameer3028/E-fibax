import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Scale,
  ShieldCheck,
  FileText,
  Save,
  Send,
  Eye,
  RotateCcw,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Calendar,
  Tag,
  AlertTriangle,
  X,
  History,
  Check,
  Sparkles,
  Info
} from 'lucide-react';

export function LegalPagesManager({ initialPage = 'terms' }) {
  // 'terms' | 'privacy'
  const [activePage, setActivePage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  // Page Form Data
  const [formData, setFormData] = useState({
    pageTitle: '',
    shortDescription: '',
    documentVersion: '1.0',
    lastUpdated: '',
    effectiveDate: '',
    status: 'published',
    content: ''
  });

  // Revision History
  const [historyList, setHistoryList] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);

  // Editor Mode: 'write' | 'preview'
  const [editorMode, setEditorMode] = useState('write');

  // Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Confirm Publish Modal
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  // Textarea Ref for cursor insertion
  const textareaRef = useRef(null);

  // Load active legal page from API
  const fetchLegalPage = async (slug) => {
    setLoading(true);
    setSaveSuccessMessage('');
    setSaveErrorMessage('');
    try {
      const res = await apiRequest(`/api/admin/legal/${slug}`);
      if (res.success && res.data) {
        const d = res.data;
        setFormData({
          pageTitle: d.pageTitle || (slug === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'),
          shortDescription: d.shortDescription || '',
          documentVersion: d.documentVersion || '1.0',
          lastUpdated: d.lastUpdated || new Date().toISOString().split('T')[0],
          effectiveDate: d.effectiveDate || d.lastUpdated || new Date().toISOString().split('T')[0],
          status: d.status || 'published',
          content: d.draftContent || d.publishedContent || ''
        });
        setHistoryList(Array.isArray(d.history) ? d.history : []);
      } else if (res.status === 401 || res.isAuthError) {
        setSaveErrorMessage('Unauthorized. Admin session required.');
      } else {
        setSaveErrorMessage(res.error || 'Failed to load document.');
      }
    } catch (err) {
      setSaveErrorMessage('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalPage(activePage);
  }, [activePage]);

  // Insert Rich Text Formatting at cursor position
  const insertMarkup = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter hyperlink URL (e.g. https://fibaxpharma.com):', 'https://');
    if (url && url !== 'https://') {
      const label = window.prompt('Enter link display text:', 'Read details');
      insertMarkup(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-forest font-semibold underline hover:text-forest-deep">${label || url}</a>`);
    }
  };

  const handleInsertTable = () => {
    const tableTemplate = `
<table class="w-full my-4 border-collapse border border-sand-border text-xs sm:text-sm">
  <thead>
    <tr class="bg-forest/10 text-forest-deep font-bold border-b border-sand-border">
      <th class="p-3 text-left">Category / Term</th>
      <th class="p-3 text-left">Regulatory Detail</th>
      <th class="p-3 text-left">Statutory Applicability</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-sand-border/60">
      <td class="p-3 font-semibold">Standard Provision</td>
      <td class="p-3 text-charcoal">Details and operational guidelines</td>
      <td class="p-3 text-emerald-800 font-medium">All Online Orders</td>
    </tr>
    <tr>
      <td class="p-3 font-semibold">Specific Exception</td>
      <td class="p-3 text-charcoal">Details of exception or special case</td>
      <td class="p-3 text-charcoal-muted font-medium">Subject to verification</td>
    </tr>
  </tbody>
</table>
`;
    insertMarkup(tableTemplate);
  };

  // Word and character counts
  const plainText = (formData.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = (formData.content || '').length;

  // Save Functionality (Draft or Publish)
  const handleSave = async (action = 'save_draft') => {
    if (!formData.pageTitle.trim()) {
      alert('Page Title is required.');
      return;
    }
    if (action === 'publish' && !formData.content.trim()) {
      alert('Document content cannot be empty when publishing.');
      return;
    }

    setSaving(true);
    setSaveSuccessMessage('');
    setSaveErrorMessage('');

    try {
      let res = await apiRequest(`/api/admin/legal/${activePage}`, {
        method: 'PUT',
        body: JSON.stringify({
          pageTitle: formData.pageTitle.trim(),
          shortDescription: formData.shortDescription.trim(),
          documentVersion: formData.documentVersion.trim() || '1.0',
          lastUpdated: formData.lastUpdated.trim() || new Date().toISOString().split('T')[0],
          effectiveDate: formData.effectiveDate.trim() || formData.lastUpdated.trim(),
          content: formData.content,
          action
        })
      });

      // Handle in-place re-auth if session expired
      if ((!res.success && (res.status === 401 || res.isAuthError)) || (res.error && res.error.toLowerCase().includes('unauthorized'))) {
        const pass = window.prompt('Admin session required. Please enter Admin Password to save changes:');
        if (pass) {
          const loginRes = await apiRequest('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'admin', password: pass.trim() })
          });
          if (loginRes.success && loginRes.token) {
            localStorage.setItem('fibax_admin_token', loginRes.token);
            sessionStorage.setItem('fibax_admin_token', loginRes.token);
            res = await apiRequest(`/api/admin/legal/${activePage}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${loginRes.token}` },
              body: JSON.stringify({
                pageTitle: formData.pageTitle.trim(),
                shortDescription: formData.shortDescription.trim(),
                documentVersion: formData.documentVersion.trim() || '1.0',
                lastUpdated: formData.lastUpdated.trim() || new Date().toISOString().split('T')[0],
                effectiveDate: formData.effectiveDate.trim() || formData.lastUpdated.trim(),
                content: formData.content,
                action
              })
            });
          } else {
            setSaveErrorMessage(loginRes.error || 'Authentication failed. Incorrect password.');
            return;
          }
        }
      }

      if (res.success && res.data) {
        setSaveSuccessMessage(res.message || (action === 'publish' ? 'Document published successfully!' : 'Draft saved successfully!'));
        setFormData(prev => ({
          ...prev,
          status: res.data.status,
          documentVersion: res.data.documentVersion,
          lastUpdated: res.data.lastUpdated
        }));
        setHistoryList(Array.isArray(res.data.history) ? res.data.history : []);
        setIsPublishConfirmOpen(false);
      } else {
        setSaveErrorMessage(res.error || 'Failed to save document.');
      }
    } catch (err) {
      setSaveErrorMessage('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Unpublish
  const handleUnpublish = async () => {
    if (!window.confirm(`Are you sure you want to unpublish the ${formData.pageTitle} page from the public website? Customers will see a maintenance notice until republished.`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest(`/api/admin/legal/${activePage}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'unpublish' })
      });
      if (res.success && res.data) {
        setSaveSuccessMessage(`${formData.pageTitle} has been unpublished.`);
        setFormData(prev => ({ ...prev, status: 'unpublished' }));
        setHistoryList(Array.isArray(res.data.history) ? res.data.history : []);
      } else {
        alert(res.error || 'Failed to unpublish.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (rev) => {
    if (!window.confirm(`Restore revision from ${new Date(rev.savedAt).toLocaleString()} (v${rev.version})? This will load the revision into your current editor.`)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      content: rev.content,
      documentVersion: rev.version || prev.documentVersion
    }));
    setSelectedRevision(null);
    setSaveSuccessMessage(`Revision v${rev.version} restored into the editor. Click "Save Draft" or "Save & Publish" to commit.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Navigation Bar */}
      <div className="bg-white p-6 rounded-3xl border border-sand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1 flex-wrap">
            <Scale className="h-4 w-4 text-brand" />
            <span>Website Content</span>
            <span>&rsaquo;</span>
            <span className="text-forest-deep">Legal Pages</span>
            <span>&rsaquo;</span>
            <span className="text-brand">
              {activePage === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest-deep">
              {activePage === 'terms' ? 'Terms & Conditions Management' : 'Privacy Policy Management'}
            </h2>
            {formData.status === 'published' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Published (v{formData.documentVersion})
              </span>
            ) : formData.status === 'unpublished' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <AlertCircle className="h-3.5 w-3.5" /> Unpublished
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="h-3.5 w-3.5" /> Draft Pending
              </span>
            )}
          </div>

          <p className="text-xs text-charcoal-muted mt-1 max-w-2xl">
            {activePage === 'terms'
              ? 'Manage, edit, format, and publish the official Terms & Conditions agreement governing all sales, orders, and interactions on fibaxpharma.com.'
              : 'Manage, edit, format, and publish the official Privacy Notice, DPDP Act compliance disclosures, and customer data fiduciary guidelines.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <a
            href={activePage === 'terms' ? '/terms' : '/privacy'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl border border-sand-border bg-[#FBF9F4] hover:bg-sand text-charcoal text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            title="View current live public page in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5 text-forest" />
            <span>View Live Page</span>
          </a>

          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5 text-forest" />
            <span>Preview Customer View</span>
          </button>
        </div>
      </div>

      {/* 2. Page Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-sand-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActivePage('terms')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activePage === 'terms'
              ? 'bg-forest text-white shadow-md'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <Scale className={`h-4 w-4 ${activePage === 'terms' ? 'text-gold' : 'text-forest'}`} />
          <span>Terms & Conditions</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePage('privacy')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activePage === 'privacy'
              ? 'bg-forest text-white shadow-md'
              : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
          }`}
        >
          <ShieldCheck className={`h-4 w-4 ${activePage === 'privacy' ? 'text-gold' : 'text-forest'}`} />
          <span>Privacy Policy</span>
        </button>
      </div>

      {/* Notifications */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {saveErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span className="font-semibold">{saveErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-sand-border text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-forest mx-auto" />
          <p className="text-xs font-bold text-charcoal-muted">Loading legal document content...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Editor Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Document Metadata Card */}
            <div className="bg-white p-5 rounded-3xl border border-sand-border shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-charcoal">
                    Page Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pageTitle}
                    onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                    placeholder="e.g. Terms & Conditions"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-bold text-charcoal focus:ring-2 focus:ring-forest/30 focus:border-forest"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      Document Version
                    </label>
                    <input
                      type="text"
                      value={formData.documentVersion}
                      onChange={(e) => setFormData({ ...formData, documentVersion: e.target.value })}
                      placeholder="e.g. 1.0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-medium text-charcoal focus:ring-2 focus:ring-forest/30 focus:border-forest font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      Last Updated Date
                    </label>
                    <input
                      type="date"
                      value={formData.lastUpdated}
                      onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs font-medium text-charcoal focus:ring-2 focus:ring-forest/30 focus:border-forest"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-charcoal">
                  Short Description / SEO Purpose Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Overview summary shown in page header and search metadata..."
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border text-xs text-charcoal focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
            </div>

            {/* Content Editor Card */}
            <div className="bg-white rounded-3xl border border-sand-border shadow-xs overflow-hidden">
              {/* Editor Top Bar with Mode Toggle */}
              <div className="px-5 py-3 border-b border-sand-border bg-sand/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-forest" />
                  <span className="font-heading font-extrabold text-sm text-forest-deep">
                    Document Content Editor
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-sand-border">
                  <button
                    type="button"
                    onClick={() => setEditorMode('write')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorMode === 'write'
                        ? 'bg-forest text-white shadow-xs'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    Edit Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorMode === 'preview'
                        ? 'bg-forest text-white shadow-xs'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    Formatted Preview
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar (Only in Write Mode) */}
              {editorMode === 'write' && (
                <div className="p-3 bg-[#FAF8F2] border-b border-sand-border flex flex-wrap items-center gap-1.5 text-xs">
                  {/* Headings */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkup('<h2 class="font-heading font-extrabold text-lg sm:text-xl text-forest-deep mt-6 mb-3">', '</h2>', 'Section Heading')}
                      title="Heading 2 (Section Title)"
                      className="px-2 py-1 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border font-bold text-xs cursor-pointer"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup('<h3 class="font-heading font-bold text-base text-forest mt-4 mb-2">', '</h3>', 'Subsection Heading')}
                      title="Heading 3 (Subsection Title)"
                      className="px-2 py-1 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border font-bold text-xs cursor-pointer"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup('<h4 class="font-bold text-sm text-charcoal mt-3 mb-1">', '</h4>', 'Sub-clause Header')}
                      title="Heading 4"
                      className="px-2 py-1 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border font-bold text-xs cursor-pointer"
                    >
                      H4
                    </button>
                  </div>

                  <span className="w-px h-5 bg-sand-border mx-1" />

                  {/* Formatting */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkup('<strong>', '</strong>', 'bold text')}
                      title="Bold Text"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup('<em>', '</em>', 'italic text')}
                      title="Italic Text"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="w-px h-5 bg-sand-border mx-1" />

                  {/* Lists & Quotes */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkup('\n<ul class="list-disc pl-5 my-3 space-y-1 text-xs sm:text-sm">\n  <li>', '</li>\n  <li>Second clause or condition</li>\n</ul>\n', 'First clause or condition')}
                      title="Bullet List"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup('\n<ol class="list-decimal pl-5 my-3 space-y-1 text-xs sm:text-sm">\n  <li>', '</li>\n  <li>Step two</li>\n</ol>\n', 'Step one')}
                      title="Numbered List"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup('\n<div class="p-4 my-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-1">\n  <strong>Legal Notice:</strong> ', '\n</div>\n', 'Insert important compliance notice here...')}
                      title="Important Advisory Notice"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    </button>
                  </div>

                  <span className="w-px h-5 bg-sand-border mx-1" />

                  {/* Advanced: Links, Tables, Dividers */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleInsertLink}
                      title="Insert Hyperlink"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertTable}
                      title="Insert Table"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkup('\n<hr class="my-6 border-sand-border" />\n')}
                      title="Section Divider"
                      className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white border border-sand-border cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Editor Workspace */}
              {editorMode === 'write' ? (
                <div className="p-4 sm:p-5">
                  <textarea
                    ref={textareaRef}
                    rows={24}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter or edit complete document content in HTML / rich formatting..."
                    className="w-full p-4 rounded-2xl border border-sand-border bg-[#FDFCF9] font-mono text-xs sm:text-sm leading-relaxed text-charcoal focus:ring-2 focus:ring-forest/30 focus:border-forest outline-none resize-y"
                  />
                  <div className="flex items-center justify-between text-[11px] text-charcoal-muted mt-2 pt-2 border-t border-sand-border">
                    <div className="flex items-center gap-4">
                      <span>Words: <strong>{wordCount.toLocaleString()}</strong></span>
                      <span>Characters: <strong>{charCount.toLocaleString()}</strong></span>
                      <span>Estimated Reading Time: <strong>{Math.ceil(wordCount / 200)} min</strong></span>
                    </div>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Auto-Sanitized on Save
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-10 max-h-[700px] overflow-y-auto space-y-4 text-sm text-charcoal leading-relaxed bg-white">
                  <div
                    className="legal-document-rendered prose prose-sm max-w-none space-y-4"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Publishing Controls & Revisions (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Publishing Action Box */}
            <div className="bg-white p-5 rounded-3xl border border-sand-border shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-forest-deep flex items-center gap-2 border-b border-sand-border pb-2.5">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>Publishing Controls</span>
              </h3>

              {/* Current Status Badge & Switch */}
              <div className="p-3.5 rounded-2xl bg-sand/30 border border-sand-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal">Public Visibility</span>
                  <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    formData.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : formData.status === 'unpublished'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {formData.status}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-muted">
                  {formData.status === 'published'
                    ? 'Published changes are live and visible to all storefront visitors.'
                    : formData.status === 'unpublished'
                    ? 'Page is unpublished; customers see a scheduled review notice.'
                    : 'Draft changes remain private until published.'}
                </p>
              </div>

              {/* Big Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Save & Publish Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsPublishConfirmOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-gold" />
                      <span>Save & Publish Live</span>
                    </>
                  )}
                </button>

                {/* 2. Save Draft Button */}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave('save_draft')}
                  className="w-full py-3 px-4 rounded-2xl border border-sand-border bg-white hover:bg-sand text-charcoal text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4 text-forest" />
                  <span>Save Draft Only</span>
                </button>

                {/* 3. Unpublish Button (if currently published) */}
                {formData.status === 'published' && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleUnpublish}
                    className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Unpublish Page from Storefront</span>
                  </button>
                )}
              </div>

              <div className="text-[10px] text-charcoal-muted pt-2 border-t border-sand-border space-y-1">
                <p>• Draft changes are never shown to storefront customers.</p>
                <p>• Every save automatically records a timestamped recovery revision.</p>
              </div>
            </div>

            {/* Document Revision History Card */}
            <div className="bg-white p-5 rounded-3xl border border-sand-border shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-sand-border pb-2.5">
                <h3 className="font-heading font-extrabold text-sm text-forest-deep flex items-center gap-2">
                  <History className="h-4 w-4 text-brand" />
                  <span>Revision History</span>
                </h3>
                <span className="text-[11px] font-bold text-charcoal-muted">
                  {historyList.length} Revisions
                </span>
              </div>

              {historyList.length === 0 ? (
                <p className="text-xs text-charcoal-muted italic py-2">
                  No revisions recorded yet. Revisions are created automatically whenever changes are saved.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {historyList.map((rev, idx) => (
                    <div
                      key={rev.id || idx}
                      className="p-3 rounded-2xl border border-sand-border bg-[#FDFCF9] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-forest text-[11px]">
                          v{rev.version || '1.0'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          rev.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'unpublished'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rev.status || 'draft'}
                        </span>
                      </div>

                      <div className="text-[11px] text-charcoal-muted">
                        <span>{new Date(rev.savedAt).toLocaleDateString()} at {new Date(rev.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {rev.adminUser && <span> by <strong>{rev.adminUser}</strong></span>}
                      </div>

                      {rev.note && (
                        <p className="text-[11px] text-charcoal font-medium truncate">
                          {rev.note}
                        </p>
                      )}

                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRevision(rev)}
                          className="text-[11px] text-forest font-bold hover:underline"
                        >
                          View Snapshot
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleRestoreRevision(rev)}
                          className="text-[11px] text-brand font-bold hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: CONFIRM SAVE & PUBLISH                               */}
      {/* ============================================================= */}
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-border space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-forest-deep text-base">
                  Publish {formData.pageTitle} Live?
                </h3>
                <p className="text-xs text-charcoal-muted">Version {formData.documentVersion}</p>
              </div>
            </div>

            <p className="text-xs text-charcoal leading-relaxed">
              This will immediately publish the current content to the live storefront website at{' '}
              <strong>https://fibaxpharma.com/{activePage}</strong>. Customers and regulators will immediately see the updated terms.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-sand-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Last Updated Date:</span>
                <span className="font-semibold">{formData.lastUpdated || 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Word Count:</span>
                <span className="font-semibold">{wordCount.toLocaleString()} words</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setIsPublishConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-sand-border text-charcoal hover:bg-sand text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('publish')}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>Confirm & Publish Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: FULL-SCREEN CUSTOMER PREVIEW MODAL                   */}
      {/* ============================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
          <div className="bg-[#FAF9F5] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-white">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-forest" />
                <h3 className="font-heading font-extrabold text-forest-deep text-base">
                  Live Customer Preview: {formData.pageTitle}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  Preview Mode
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Frame */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-8 bg-white">
              <div className="border-b border-sand-border pb-6 space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-forest text-sand text-[11px] font-bold uppercase tracking-wider">
                  Fibax Ayurveda • Official Legal Notice
                </span>
                <h1 className="font-heading text-2xl sm:text-3xl font-black text-forest-deep">
                  {formData.pageTitle}
                </h1>
                {formData.shortDescription && (
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    {formData.shortDescription}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-charcoal-muted pt-2 font-mono">
                  <span>Version: <strong>{formData.documentVersion}</strong></span>
                  <span>•</span>
                  <span>Last Updated: <strong>{formData.lastUpdated || 'Today'}</strong></span>
                </div>
              </div>

              {/* Rendered Body */}
              <div
                className="prose prose-sm max-w-none space-y-4 text-sm text-charcoal leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-sand-border bg-white flex items-center justify-between">
              <span className="text-xs text-charcoal-muted">
                This preview renders your current edits exactly as customer browsers will display them.
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: VIEW HISTORIC REVISION SNAPSHOT                      */}
      {/* ============================================================= */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-sand-border animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-forest" />
                <h3 className="font-heading font-extrabold text-forest-deep text-base">
                  Historic Snapshot: v{selectedRevision.version} ({new Date(selectedRevision.savedAt).toLocaleString()})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRevision(null)}
                className="p-1.5 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-3 rounded-xl bg-sand/30 text-xs flex justify-between items-center">
                <span>Saved by: <strong>{selectedRevision.adminUser || 'admin'}</strong></span>
                <span>Status: <strong>{selectedRevision.status || 'draft'}</strong></span>
              </div>

              <div
                className="prose prose-sm max-w-none text-xs text-charcoal space-y-3"
                dangerouslySetInnerHTML={{ __html: selectedRevision.content }}
              />
            </div>

            <div className="px-6 py-3.5 border-t border-sand-border bg-white flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRevision(null)}
                className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold hover:bg-sand transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleRestoreRevision(selectedRevision)}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore This Version</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default LegalPagesManager;
