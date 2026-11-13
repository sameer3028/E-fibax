import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Share2,
  Tag,
  Copy,
  Sparkles,
  ExternalLink,
  Globe,
  Filter,
  RefreshCw,
  Smartphone,
  Monitor,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  Lock,
  Archive,
  RotateCcw,
  Sliders,
  Layers,
  HelpCircle,
  FolderPlus
} from 'lucide-react';

// Color themes for blog cards
const COLOR_THEMES = [
  { label: 'Forest Green', value: 'bg-[#285238] text-white', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Deep Purple', value: 'bg-[#581c87] text-white', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: 'Warm Orange', value: 'bg-[#9a3412] text-white', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
  { label: 'Slate Charcoal', value: 'bg-[#1e293b] text-white', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  { label: 'Indigo Blue', value: 'bg-[#4338ca] text-white', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { label: 'Botanical Teal', value: 'bg-[#0f766e] text-white', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
  { label: 'Amber Gold', value: 'bg-[#b45309] text-white', badge: 'bg-amber-100 text-amber-800 border-amber-200' }
];

export function BlogManager() {
  // Sub-view: 'posts' | 'categories'
  const [subView, setSubView] = useState('posts');

  // Blog Posts State
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, scheduled: 0, archived: 0 });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'scheduled' | 'archived'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add / Edit Blog Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic' | 'image' | 'content' | 'seo' | 'publish'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorMode, setEditorMode] = useState('write'); // 'write' | 'preview'
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', slug: '', description: '', displayOrder: 1, enabled: true });
  const [categoryError, setCategoryError] = useState('');

  // Interactive Live Preview Modal
  const [previewPost, setPreviewPost] = useState(null);
  const [previewViewport, setPreviewViewport] = useState('desktop'); // 'desktop' | 'mobile'

  // Delete Confirmation Modal
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Data State
  const defaultFormData = {
    title: '',
    slug: '',
    category: 'Ayurvedic Principles',
    tag: 'Ayurvedic Wellness',
    readTime: '4 min read',
    author: {
      name: 'Dr. Sameer Patel, BAMS',
      role: 'Chief Ayurvedic Consultant',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
    },
    colorBlock: 'bg-[#285238] text-white',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    image: '',
    imageAlt: '',
    excerpt: '',
    content: '',
    status: 'draft',
    enabled: true,
    publishedAt: new Date().toISOString().slice(0, 16),
    scheduledAt: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: ''
    }
  };
  const [formData, setFormData] = useState(defaultFormData);

  // Load Blog Posts & Categories
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/blogs');
      if (res.success) {
        setPosts(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest('/api/admin/blogs/categories');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Status filter
      if (statusFilter !== 'all' && (post.status || 'draft') !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && (post.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (post.title || '').toLowerCase().includes(q);
        const matchesCat = (post.category || '').toLowerCase().includes(q);
        const matchesAuthor = (post.author?.name || '').toLowerCase().includes(q);
        const matchesTag = (post.tag || '').toLowerCase().includes(q);
        const matchesExcerpt = (post.excerpt || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesAuthor && !matchesTag && !matchesExcerpt) {
          return false;
        }
      }
      return true;
    });
  }, [posts, statusFilter, categoryFilter, searchQuery]);

  // Handle Auto-generating slug from Title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/&/g, '-and-')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-update slug if it was empty or matched previous auto-generated slug
      slug: prev.slug === '' || prev.slug === defaultFormData.slug ? generatedSlug : prev.slug,
      seo: {
        ...prev.seo,
        metaTitle: prev.seo.metaTitle === '' || prev.seo.metaTitle.startsWith(prev.title)
          ? `${title} | Fibax Ayurveda`
          : prev.seo.metaTitle,
        ogTitle: prev.seo.ogTitle === '' || prev.seo.ogTitle === prev.title ? title : prev.seo.ogTitle
      }
    }));
  };

  // Content word count & reading time calculation
  const wordCount = useMemo(() => {
    const text = (formData.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [formData.content]);

  const autoReadTime = useMemo(() => {
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  }, [wordCount]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPost(null);
    setFormData({
      ...defaultFormData,
      category: categories[0]?.name || 'Ayurvedic Principles',
      publishedAt: new Date().toISOString().slice(0, 16)
    });
    setActiveFormTab('basic');
    setEditorMode('write');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'Ayurvedic Principles',
      tag: post.tag || 'Ayurvedic Wellness',
      readTime: post.readTime || calculateReadTime(post.content),
      author: post.author || {
        name: 'Dr. Sameer Patel, BAMS',
        role: 'Chief Ayurvedic Consultant',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      },
      colorBlock: post.colorBlock || 'bg-[#285238] text-white',
      badgeColor: post.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-200',
      image: post.image || '',
      imageAlt: post.imageAlt || post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      status: post.status || 'draft',
      enabled: post.enabled !== false,
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : new Date().toISOString().slice(0, 16),
      scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : '',
      seo: {
        metaTitle: post.seo?.metaTitle || `${post.title} | Fibax Ayurveda`,
        metaDescription: post.seo?.metaDescription || post.excerpt || '',
        focusKeyword: post.seo?.focusKeyword || post.tag || '',
        canonicalUrl: post.seo?.canonicalUrl || `/blog/${post.slug}`,
        ogTitle: post.seo?.ogTitle || post.title || '',
        ogDescription: post.seo?.ogDescription || post.excerpt || '',
        ogImage: post.seo?.ogImage || post.image || ''
      }
    });
    setActiveFormTab('basic');
    setEditorMode('write');
    setIsModalOpen(true);
  };

  // Calculate read time helper
  function calculateReadTime(content) {
    if (!content) return '1 min read';
    const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const count = plain.split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(count / 200))} min read`;
  }

  // Handle Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Only JPG, JPEG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds maximum limit of 5 MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await apiRequest('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      if (res.success && res.url) {
        setFormData(prev => ({
          ...prev,
          image: res.url,
          seo: {
            ...prev.seo,
            ogImage: prev.seo.ogImage || res.url
          }
        }));
      } else {
        alert(res.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Rich Text Editor Toolbar Helpers
  const insertContentMarkup = (before, after = '', placeholder = '') => {
    const textarea = document.getElementById('blog-content-textarea');
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

  const insertLink = () => {
    const url = prompt('Enter hyperlink URL:', 'https://');
    if (url && url !== 'https://') {
      const text = prompt('Enter link text:', 'Read more here');
      insertContentMarkup(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline font-semibold">${text || url}</a>`);
    }
  };

  const insertTable = () => {
    const tableMarkup = `
<table class="w-full my-4 border-collapse border border-sand-border text-sm">
  <thead>
    <tr class="bg-forest/10 text-forest-deep font-bold border-b border-sand-border">
      <th class="p-3 text-left">Ayurvedic Botanical</th>
      <th class="p-3 text-left">Active Phytochemicals</th>
      <th class="p-3 text-left">Clinical Benefit</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-sand-border/60">
      <td class="p-3 font-semibold">Bhumi Amla</td>
      <td class="p-3 text-charcoal-muted">Phyllanthin, Hypophyllanthin</td>
      <td class="p-3 text-emerald-800">Lowers elevated SGPT & SGOT markers</td>
    </tr>
    <tr>
      <td class="p-3 font-semibold">Kutki Rhizome</td>
      <td class="p-3 text-charcoal-muted">Kutkin & Picroside I & II</td>
      <td class="p-3 text-emerald-800">Protects hepatocytes from toxin damage</td>
    </tr>
  </tbody>
</table>
`;
    insertContentMarkup(tableMarkup);
  };

  const insertImageIntoContent = () => {
    const url = prompt('Enter image URL or path (/uploads/...):', '');
    if (url) {
      const alt = prompt('Enter image caption/alt text:', 'Ayurvedic Herb');
      insertContentMarkup(`\n<figure class="my-6">\n  <img src="${url}" alt="${alt || ''}" class="w-full rounded-2xl border border-sand-border shadow-xs" />\n  <figcaption class="text-center text-xs text-charcoal-muted mt-2 italic">${alt || ''}</figcaption>\n</figure>\n`);
    }
  };

  // Handle Save Blog
  const handleSaveBlog = async (targetStatus = null) => {
    if (!formData.title.trim()) {
      alert('Please provide a blog title.');
      setActiveFormTab('basic');
      return;
    }

    if (!formData.excerpt.trim()) {
      alert('Please provide a short excerpt / summary for the blog post.');
      setActiveFormTab('basic');
      return;
    }

    if (!formData.content.trim()) {
      alert('Please enter blog content before saving.');
      setActiveFormTab('content');
      return;
    }

    setIsSubmitting(true);
    const postStatus = targetStatus || formData.status || 'draft';

    const payload = {
      ...formData,
      status: postStatus,
      readTime: formData.readTime || autoReadTime
    };

    try {
      let res;
      if (editingPost) {
        res = await apiRequest(`/api/admin/blogs/${editingPost.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiRequest('/api/admin/blogs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.success) {
        setIsModalOpen(false);
        setEditingPost(null);
        await fetchPosts();
      } else {
        alert(res.error || 'Failed to save blog post.');
      }
    } catch (err) {
      console.error('Save blog error:', err);
      alert('An error occurred while saving the blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Publish / Unpublish Toggle
  const handleTogglePublish = async (post) => {
    try {
      const res = await apiRequest(`/api/admin/blogs/${post.id}/publish-toggle`, {
        method: 'POST'
      });
      if (res.success) {
        await fetchPosts();
      } else {
        alert(res.error || 'Failed to toggle publish status.');
      }
    } catch (err) {
      alert('Failed to update publish status.');
    }
  };

  // 1-Click Duplicate Post
  const handleDuplicate = async (post) => {
    try {
      const res = await apiRequest(`/api/admin/blogs/${post.id}/duplicate`, {
        method: 'POST'
      });
      if (res.success) {
        await fetchPosts();
      } else {
        alert(res.error || 'Failed to duplicate post.');
      }
    } catch (err) {
      alert('Failed to duplicate post.');
    }
  };

  // Toggle Archive
  const handleToggleArchive = async (post) => {
    try {
      const res = await apiRequest(`/api/admin/blogs/${post.id}/archive-toggle`, {
        method: 'POST'
      });
      if (res.success) {
        await fetchPosts();
      } else {
        alert(res.error || 'Failed to update archive status.');
      }
    } catch (err) {
      alert('Failed to update archive status.');
    }
  };

  // Delete Post
  const handleConfirmDelete = async () => {
    if (!deleteConfirmPost) return;
    setIsDeleting(true);
    try {
      const res = await apiRequest(`/api/admin/blogs/${deleteConfirmPost.id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setDeleteConfirmPost(null);
        await Promise.all([fetchPosts(), fetchCategories()]);
      } else {
        alert(res.error || 'Failed to delete blog post.');
      }
    } catch (err) {
      alert('Failed to delete blog post: ' + (err.message || 'Server connection error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Category Management Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
      enabled: true
    });
    setCategoryError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      displayOrder: cat.displayOrder || 1,
      enabled: cat.enabled !== false
    });
    setCategoryError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      setCategoryError('Category name is required.');
      return;
    }

    try {
      let res;
      if (editingCategory) {
        res = await apiRequest(`/api/admin/blogs/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryFormData)
        });
      } else {
        res = await apiRequest('/api/admin/blogs/categories', {
          method: 'POST',
          body: JSON.stringify(categoryFormData)
        });
      }

      if (res.success) {
        setIsCategoryModalOpen(false);
        await fetchCategories();
        await fetchPosts();
      } else {
        setCategoryError(res.error || 'Failed to save category.');
      }
    } catch (err) {
      setCategoryError('Failed to save category.');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      const res = await apiRequest(`/api/admin/blogs/categories/${cat.id}`, {
        method: 'DELETE'
      });

      if (res.success) {
        await fetchCategories();
      } else {
        // Show cascade check error clearly
        alert(res.error || 'Cannot delete category.');
      }
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  // Format content for preview (handles both HTML and markdown syntax)
  const formatBodyContent = (raw) => {
    if (!raw) return '';
    // If raw already looks like full HTML, return sanitized
    if (raw.includes('<p>') || raw.includes('<h2>') || raw.includes('<h3>') || raw.includes('<div>')) {
      return raw;
    }
    // Simple markdown paragraph & heading converter for preview
    return raw
      .split('\n\n')
      .map(block => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return `<h3 class="text-xl font-black text-forest-deep mt-6 mb-3">${trimmed.slice(4)}</h3>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h2 class="text-2xl font-black text-forest-deep mt-8 mb-4">${trimmed.slice(3)}</h2>`;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').map(line => `<li class="ml-4 list-disc">${line.replace(/^[-*]\s+/, '')}</li>`).join('');
          return `<ul class="space-y-1 my-3">${items}</ul>`;
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').map(line => `<li class="ml-4 list-decimal">${line.replace(/^\d+\.\s+/, '')}</li>`).join('');
          return `<ol class="space-y-1 my-3">${items}</ol>`;
        }
        return `<p class="leading-relaxed text-charcoal mb-4">${trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      })
      .join('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Management Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sand-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider mb-1">
            <BookOpen className="h-4 w-4 text-forest" />
            <span>Fibax Blog &amp; Journal Management</span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-forest-deep">
            {subView === 'posts' ? 'Articles & Publications' : 'Blog Categories Manager'}
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Create, edit, publish, schedule, format, and organize scientific Ayurvedic articles for Fibax customers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Subview switcher */}
          <div className="inline-flex bg-sand p-1 rounded-xl border border-sand-border">
            <button
              onClick={() => setSubView('posts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subView === 'posts'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal hover:text-forest'
              }`}
            >
              All Articles ({posts.length})
            </button>
            <button
              onClick={() => setSubView('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subView === 'categories'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal hover:text-forest'
              }`}
            >
              Categories ({categories.length})
            </button>
          </div>

          {subView === 'posts' ? (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-gold" />
              <span>+ Add New Article</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="h-4 w-4 text-gold" />
              <span>+ Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Metrics Bar (Visible in Posts view) */}
      {subView === 'posts' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
            <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider block">Total Articles</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-forest-deep">{stats.total}</span>
              <BookOpen className="h-5 w-5 text-forest/40" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Published Live</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-600">{stats.published}</span>
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Drafts</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-600">{stats.draft}</span>
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Scheduled</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-indigo-600">{stats.scheduled}</span>
              <Clock className="h-5 w-5 text-indigo-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Archived</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-500">{stats.archived}</span>
              <Archive className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW A: BLOG POSTS LIST TABLE & CONTROLS            */}
      {/* ==================================================== */}
      {subView === 'posts' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="h-4 w-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles by title, category, author, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-sand/50 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category dropdown filter */}
              <div className="relative sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sand/50 border border-sand-border text-xs font-semibold text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                >
                  <option value="all">All Categories ({posts.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All', count: stats.total },
                { id: 'published', label: 'Published', count: stats.published },
                { id: 'draft', label: 'Drafts', count: stats.draft },
                { id: 'scheduled', label: 'Scheduled', count: stats.scheduled },
                { id: 'archived', label: 'Archived', count: stats.archived }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-forest text-white shadow-xs'
                      : 'bg-sand/60 text-charcoal hover:bg-sand border border-sand-border/80'
                  }`}
                >
                  {tab.label} <span className="opacity-75">({tab.count})</span>
                </button>
              ))}

              <button
                onClick={() => { fetchPosts(); fetchCategories(); }}
                title="Refresh table"
                className="p-2 rounded-lg bg-sand/60 hover:bg-sand text-charcoal border border-sand-border/80 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Posts Table */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-sand-border flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 text-forest animate-spin mb-3" />
              <p className="text-xs font-bold text-forest-deep">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-sand-border text-center space-y-3">
              <BookOpen className="h-10 w-10 text-charcoal-muted mx-auto opacity-40" />
              <h4 className="font-heading font-extrabold text-base text-forest-deep">
                No articles found
              </h4>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No blog posts match your current search query or filter criteria. Try clearing filters.'
                  : 'Get started by creating your first evidence-based Ayurvedic article.'}
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                + Create New Article
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-sand/70 border-b border-sand-border text-[11px] font-bold text-forest-deep uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Published Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border/60">
                    {filteredPosts.map((post) => {
                      const isPublished = post.status === 'published';
                      const isScheduled = post.status === 'scheduled';
                      const isDraft = post.status === 'draft';
                      const isArchived = post.status === 'archived';

                      return (
                        <tr
                          key={post.id}
                          className="hover:bg-sand/30 transition-colors group"
                        >
                          {/* Article Title & Thumbnail */}
                          <td className="py-3.5 px-4 min-w-[280px]">
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-sand border border-sand-border flex-shrink-0 relative">
                                {post.image ? (
                                  <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-charcoal-muted">
                                    <ImageIcon className="h-5 w-5 opacity-40" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <h4
                                  onClick={() => setPreviewPost(post)}
                                  className="font-heading font-extrabold text-xs sm:text-sm text-forest-deep hover:text-brand transition-colors line-clamp-1 cursor-pointer"
                                  title={post.title}
                                >
                                  {post.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-charcoal-muted">
                                  <span className="font-mono bg-sand px-1.5 py-0.5 rounded border border-sand-border text-charcoal">
                                    /blog/{post.slug}
                                  </span>
                                  <span>&bull;</span>
                                  <span>{post.readTime || '4 min read'}</span>
                                  {post.views !== undefined && (
                                    <>
                                      <span>&bull;</span>
                                      <span>{post.views} views</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-forest/10 text-forest border border-forest/20">
                              <Tag className="h-2.5 w-2.5" />
                              <span>{post.category || 'Ayurvedic Principles'}</span>
                            </span>
                          </td>

                          {/* Author Info */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {post.author?.avatar ? (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author?.name}
                                  className="w-6 h-6 rounded-full object-cover border border-sand-border"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-[10px]">
                                  {post.author?.name ? post.author.name[0] : 'V'}
                                </div>
                              )}
                              <span className="font-semibold text-charcoal text-[11px]">
                                {post.author?.name || 'Dr. Sameer Patel, BAMS'}
                              </span>
                            </div>
                          </td>

                          {/* Published / Scheduled Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-[11px] text-charcoal">
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar className="h-3 w-3 text-forest" />
                                <span>{post.date || new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </span>
                              {isScheduled && post.scheduledAt && (
                                <span className="text-[10px] text-indigo-600 block mt-0.5 font-bold">
                                  Scheduled: {new Date(post.scheduledAt).toLocaleDateString()} {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {isPublished && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Published</span>
                              </span>
                            )}
                            {isDraft && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span>Draft</span>
                              </span>
                            )}
                            {isScheduled && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                                <Clock className="h-2.5 w-2.5" />
                                <span>Scheduled</span>
                              </span>
                            )}
                            {isArchived && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                <Archive className="h-2.5 w-2.5" />
                                <span>Archived</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              {/* Preview */}
                              <button
                                onClick={() => setPreviewPost(post)}
                                title="Interactive Preview"
                                className="p-1.5 rounded-lg bg-sand/60 hover:bg-sand text-charcoal hover:text-forest transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditModal(post)}
                                title="Edit Article"
                                className="p-1.5 rounded-lg bg-sand/60 hover:bg-forest hover:text-white text-forest transition-all cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              {/* Quick 1-Click Publish / Unpublish Toggle */}
                              <button
                                onClick={() => handleTogglePublish(post)}
                                title={isPublished ? 'Unpublish to Draft' : 'Publish Live Now'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isPublished
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                }`}
                              >
                                {isPublished ? <Check className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(post)}
                                title="Duplicate Article"
                                className="p-1.5 rounded-lg bg-sand/60 hover:bg-sand text-charcoal hover:text-forest transition-colors cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {/* Archive / Restore */}
                              <button
                                onClick={() => handleToggleArchive(post)}
                                title={isArchived ? 'Restore from Archive' : 'Archive Article'}
                                className="p-1.5 rounded-lg bg-sand/60 hover:bg-sand text-charcoal hover:text-slate-700 transition-colors cursor-pointer"
                              >
                                {isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirmPost(post)}
                                title="Delete Article"
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-sand/40 px-4 py-3 border-t border-sand-border flex items-center justify-between text-xs text-charcoal-muted">
                <span>
                  Showing {filteredPosts.length} of {posts.length} articles
                </span>
                <span className="font-semibold text-forest">
                  {stats.published} currently visible on public storefront
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW B: CATEGORIES MANAGEMENT TABLE & CONTROLS      */}
      {/* ==================================================== */}
      {subView === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
            <div className="p-4 bg-sand/40 border-b border-sand-border flex items-center justify-between">
              <div>
                <h4 className="font-heading font-extrabold text-sm text-forest-deep">
                  Blog Categories
                </h4>
                <p className="text-xs text-charcoal-muted">
                  Categories organize articles on the storefront and enable customer filtering.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="px-3.5 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-sand/70 border-b border-sand-border text-[11px] font-bold text-forest-deep uppercase tracking-wider">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Assigned Articles</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/60">
                  {categories.map((cat, idx) => (
                    <tr key={cat.id || idx} className="hover:bg-sand/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-muted">
                        #{cat.displayOrder || idx + 1}
                      </td>
                      <td className="py-3 px-4 font-heading font-extrabold text-forest-deep">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal-muted">
                        {cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </td>
                      <td className="py-3 px-4 text-charcoal text-xs max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (cat.totalPosts || 0) > 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-sand text-charcoal-muted border border-sand-border'
                        }`}>
                          {cat.totalPosts || 0} articles
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.enabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {cat.enabled !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            title="Edit Category"
                            className="p-1.5 rounded-lg bg-sand/60 hover:bg-forest hover:text-white text-forest transition-all cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            title="Delete Category (Safety protected)"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. ADD / EDIT BLOG MODAL                             */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-sand-border overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-forest-deep to-forest text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-amber-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                    {editingPost ? `Edit Article: ${formData.title || 'Untitled'}` : 'Write New Ayurvedic Article'}
                  </h3>
                  <p className="text-[11px] text-sand-warm/80">
                    Draft, format, review SEO, and publish high-converting botanical health content.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  formData.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                    : formData.status === 'scheduled'
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                }`}>
                  Status: {formData.status}
                </span>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-2 bg-sand/50 border-b border-sand-border overflow-x-auto flex-shrink-0">
              {[
                { id: 'basic', label: '1. Basic Info', icon: FileText },
                { id: 'image', label: '2. Featured Media', icon: ImageIcon },
                { id: 'content', label: '3. Rich Content Editor', icon: Edit2 },
                { id: 'seo', label: '4. SEO & Social', icon: Globe },
                { id: 'publish', label: '5. Publishing Settings', icon: Upload }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                      activeFormTab === tab.id
                        ? 'bg-forest text-white shadow-xs'
                        : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: BASIC INFO */}
              {activeFormTab === 'basic' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1.5">
                        Article Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 Ayurvedic Herbs to Cleanse Sluggish Liver & Restore SGPT Naturally"
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-sand/30 border border-sand-border text-sm text-charcoal font-semibold focus:bg-white focus:outline-hidden focus:border-forest"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-forest-deep uppercase tracking-wider">
                          URL Slug <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-charcoal-muted font-mono">
                          Live URL: /blog/{formData.slug || 'slug'}
                        </span>
                      </div>
                      <div className="flex rounded-xl border border-sand-border overflow-hidden bg-sand/30 focus-within:border-forest focus-within:bg-white">
                        <span className="px-3 py-2.5 bg-sand text-xs text-charcoal-muted font-mono border-r border-sand-border select-none">
                          https://fibaxpharma.com/blog/
                        </span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') }))}
                          placeholder="article-url-slug"
                          className="flex-1 px-3 py-2.5 text-xs font-mono text-charcoal focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category, Tag & Reading Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-forest-deep uppercase tracking-wider">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenAddCategory}
                          className="text-[10px] font-bold text-brand hover:underline"
                        >
                          + New
                        </button>
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-sand/30 border border-sand-border text-xs font-semibold text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1.5">
                        Card Tag Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Liver Health, Gut Wellness"
                        value={formData.tag}
                        onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-forest-deep uppercase tracking-wider">
                          Reading Time
                        </label>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          Est: {autoReadTime}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 4 min read"
                        value={formData.readTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      />
                    </div>
                  </div>

                  {/* Excerpt / Lead Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-forest-deep uppercase tracking-wider">
                        Short Excerpt / Clinical Summary <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-charcoal-muted">
                        {(formData.excerpt || '').length} characters (Recommended: 120-160)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Brief 1-2 sentence overview shown on blog cards and Google snippets..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        excerpt: e.target.value,
                        seo: {
                          ...prev.seo,
                          metaDescription: prev.seo.metaDescription === '' || prev.seo.metaDescription === prev.excerpt ? e.target.value.slice(0, 160) : prev.seo.metaDescription
                        }
                      }))}
                      className="w-full p-3 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      required
                    />
                  </div>

                  {/* Author Information */}
                  <div className="p-4 rounded-2xl bg-sand/40 border border-sand-border space-y-3">
                    <h5 className="font-heading font-extrabold text-xs text-forest-deep flex items-center gap-1.5">
                      <User className="h-4 w-4 text-forest" />
                      <span>Author &amp; Vaidya Byline</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal mb-1">Author Name</label>
                        <input
                          type="text"
                          value={formData.author.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, author: { ...prev.author, name: e.target.value } }))}
                          placeholder="Dr. Sameer Patel, BAMS"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-hidden focus:border-forest"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-charcoal mb-1">Author Role / Title</label>
                        <input
                          type="text"
                          value={formData.author.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, author: { ...prev.author, role: e.target.value } }))}
                          placeholder="Chief Ayurvedic Consultant"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-hidden focus:border-forest"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-charcoal mb-1">Author Avatar URL</label>
                        <input
                          type="text"
                          value={formData.author.avatar}
                          onChange={(e) => setFormData(prev => ({ ...prev, author: { ...prev.author, avatar: e.target.value } }))}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-hidden focus:border-forest"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Color Theme */}
                  <div>
                    <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-2">
                      Card Aesthetic Theme (Shown on Storefront Grid)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {COLOR_THEMES.map((theme) => {
                        const isSelected = formData.colorBlock === theme.value;
                        return (
                          <button
                            key={theme.label}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, colorBlock: theme.value, badgeColor: theme.badge }))}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-forest ring-2 ring-forest/30 bg-forest/5'
                                : 'border-sand-border bg-white hover:bg-sand/30'
                            }`}
                          >
                            <div className={`h-4 rounded-md ${theme.value} mb-1.5`} />
                            <span className="text-[10px] font-bold text-charcoal block truncate">{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURED MEDIA */}
              {activeFormTab === 'image' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-6 rounded-2xl bg-sand/30 border border-sand-border space-y-4">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-forest-deep">
                        Featured Header &amp; Card Image
                      </h4>
                      <p className="text-xs text-charcoal-muted mt-0.5">
                        Primary image displayed on public blog cards, social media cards, and the article hero banner.
                        Recommended resolution: <strong>1200 × 630 px</strong> (or 16:9 ratio). Max size: <strong>5 MB</strong>.
                      </p>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {formData.image ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[16/9] max-w-xl mx-auto rounded-2xl overflow-hidden border border-sand-border shadow-md bg-forest-deep">
                          <img
                            src={formData.image}
                            alt={formData.imageAlt || formData.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                              Live Upload
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Replace Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove Image</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-sand-border hover:border-forest/50 bg-white hover:bg-sand/30 p-10 rounded-2xl text-center cursor-pointer transition-all space-y-3"
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 text-forest animate-spin mb-2" />
                            <span className="text-xs font-bold text-forest">Uploading to permanent server storage...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
                              <Upload className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-forest-deep">
                                Click or drag and drop to upload featured image
                              </p>
                              <p className="text-[11px] text-charcoal-muted mt-1">
                                Supported formats: JPG, JPEG, PNG, WebP (Max 5 MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Image Alt Text */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                        Image Alt Text (SEO &amp; Accessibility)
                      </label>
                      <input
                        type="text"
                        placeholder="Descriptive caption for search engines and screen readers"
                        value={formData.imageAlt}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-hidden focus:border-forest"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RICH CONTENT EDITOR */}
              {activeFormTab === 'content' && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Editor Mode & Formatting Toolbar */}
                  <div className="bg-sand/60 p-2.5 rounded-2xl border border-sand-border flex flex-wrap items-center justify-between gap-2">
                    {/* Formatting Buttons */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('<h2>', '</h2>', 'Key Botanical Section')}
                        title="Heading 2"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border text-xs font-bold cursor-pointer"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('<h3>', '</h3>', 'Subsection Header')}
                        title="Heading 3"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border text-xs font-bold cursor-pointer"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('<h4>', '</h4>', 'Key Takeaway')}
                        title="Heading 4"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border text-xs font-bold cursor-pointer"
                      >
                        H4
                      </button>
                      <span className="w-px h-5 bg-sand-border mx-1" />

                      <button
                        type="button"
                        onClick={() => insertContentMarkup('<strong>', '</strong>', 'bold text')}
                        title="Bold Text"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('<em>', '</em>', 'italic text')}
                        title="Italic Text"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-px h-5 bg-sand-border mx-1" />

                      <button
                        type="button"
                        onClick={() => insertContentMarkup('\n<ul class="my-3 space-y-1 list-disc pl-5">\n  <li>', '</li>\n  <li>Second key point</li>\n</ul>\n', 'First key point')}
                        title="Bullet List"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('\n<ol class="my-3 space-y-1 list-decimal pl-5">\n  <li>', '</li>\n  <li>Next step in protocol</li>\n</ol>\n', 'First step in protocol')}
                        title="Numbered List"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('\n<blockquote class="p-4 my-4 rounded-xl bg-forest/5 border-l-4 border-forest text-forest-deep italic font-medium">\n  "', '"\n  <cite class="block text-xs font-bold text-forest mt-1">— Charaka Samhita, Sutrasthana</cite>\n</blockquote>\n', 'Classical Ayurvedic Quote')}
                        title="Blockquote"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-px h-5 bg-sand-border mx-1" />

                      <button
                        type="button"
                        onClick={insertLink}
                        title="Insert Link"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={insertImageIntoContent}
                        title="Insert Image"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={insertTable}
                        title="Insert Formatted Table"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border cursor-pointer"
                      >
                        <TableIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertContentMarkup('\n<hr class="my-6 border-sand-border" />\n')}
                        title="Horizontal Rule"
                        className="p-1.5 rounded-lg bg-white hover:bg-forest hover:text-white text-charcoal border border-sand-border text-xs font-bold cursor-pointer"
                      >
                        &mdash;
                      </button>
                    </div>

                    {/* Write vs Preview Mode Toggle */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-sand-border">
                      <button
                        type="button"
                        onClick={() => setEditorMode('write')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editorMode === 'write'
                            ? 'bg-forest text-white'
                            : 'text-charcoal hover:bg-sand'
                        }`}
                      >
                        Write HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('preview')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editorMode === 'preview'
                            ? 'bg-forest text-white'
                            : 'text-charcoal hover:bg-sand'
                        }`}
                      >
                        Live Preview
                      </button>
                    </div>
                  </div>

                  {/* Editor Content Area */}
                  {editorMode === 'write' ? (
                    <div>
                      <textarea
                        id="blog-content-textarea"
                        rows={16}
                        placeholder="Write your article body using HTML tags (<h2>, <p>, <ul>, <blockquote>, <table>) or clean paragraphs..."
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full p-4 rounded-2xl bg-white border border-sand-border text-xs sm:text-sm font-mono text-charcoal leading-relaxed focus:outline-hidden focus:border-forest shadow-inner"
                        required
                      />
                      <div className="flex items-center justify-between mt-2 text-[11px] text-charcoal-muted">
                        <span>Word count: <strong>{wordCount}</strong> words</span>
                        <span>Estimated reading time: <strong>{autoReadTime}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white border border-sand-border min-h-[350px] max-h-[500px] overflow-y-auto">
                      <div
                        className="prose prose-sm sm:prose max-w-none text-charcoal leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatBodyContent(formData.content) }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SEO & SOCIAL METADATA */}
              {activeFormTab === 'seo' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Google Search Result Preview */}
                  <div className="p-5 rounded-2xl bg-white border border-sand-border shadow-xs space-y-2">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-widest flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-forest" />
                      <span>Google Search Engine Result Snippet Preview</span>
                    </span>

                    <div className="p-4 rounded-xl bg-sand/30 border border-sand-border max-w-2xl font-sans">
                      <div className="flex items-center gap-2 text-xs text-emerald-800">
                        <span className="font-semibold">fibaxpharma.com</span>
                        <span>&rsaquo;</span>
                        <span className="text-charcoal-muted">blog</span>
                        <span>&rsaquo;</span>
                        <span className="text-charcoal-muted">{formData.slug || 'url-slug'}</span>
                      </div>
                      <h4 className="font-medium text-base sm:text-lg text-blue-700 hover:underline cursor-pointer line-clamp-1 mt-0.5">
                        {formData.seo.metaTitle || formData.title || 'Article Title'}
                      </h4>
                      <p className="text-xs text-charcoal-muted line-clamp-2 mt-1 leading-relaxed">
                        {formData.seo.metaDescription || formData.excerpt || 'Excerpt description for search engine results...'}
                      </p>
                    </div>
                  </div>

                  {/* SEO Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-forest-deep uppercase tracking-wider">
                          Meta Title
                        </label>
                        <span className={`text-[10px] font-bold ${
                          (formData.seo.metaTitle || '').length > 60 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {(formData.seo.metaTitle || '').length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Title displayed on search engine tabs"
                        value={formData.seo.metaTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaTitle: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. liver detox herbs, fatty liver ayurveda"
                        value={formData.seo.focusKeyword}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, focusKeyword: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-forest-deep uppercase tracking-wider">
                        Meta Description
                      </label>
                      <span className={`text-[10px] font-bold ${
                        (formData.seo.metaDescription || '').length > 160 ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {(formData.seo.metaDescription || '').length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Snippet description displayed on Google search results"
                      value={formData.seo.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaDescription: e.target.value } }))}
                      className="w-full p-3 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                    />
                  </div>

                  {/* Canonical URL & OG Share Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        placeholder="/blog/slug"
                        value={formData.seo.canonicalUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                        Social Share Image (OG Image)
                      </label>
                      <input
                        type="text"
                        placeholder="Defaults to featured image URL"
                        value={formData.seo.ogImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                      />
                    </div>
                  </div>

                  {/* Structured Data (JSON-LD) Preview */}
                  <div className="p-4 rounded-2xl bg-sand/40 border border-sand-border space-y-2">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                      <span>Schema.org (Article / BlogPosting) JSON-LD Auto-Generated</span>
                    </span>
                    <pre className="p-3 rounded-xl bg-forest-deep text-emerald-300 text-[10px] font-mono overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${formData.title || 'Article Headline'}",
  "image": "${formData.image || 'https://www.fibaxpharma.com/logo.png'}",
  "author": {
    "@type": "Person",
    "name": "${formData.author.name}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Fibax Ayurveda",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.fibaxpharma.com/logo.png"
    }
  },
  "datePublished": "${formData.publishedAt}",
  "description": "${(formData.excerpt || '').slice(0, 150)}"
}`}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 5: PUBLISHING SETTINGS */}
              {activeFormTab === 'publish' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-sand/40 border border-sand-border space-y-4">
                    <h4 className="font-heading font-extrabold text-sm text-forest-deep">
                      Publication &amp; Visibility Controls
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Status Selector */}
                      <div>
                        <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1.5">
                          Publish Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-sand-border text-xs font-bold text-charcoal focus:outline-hidden focus:border-forest"
                        >
                          <option value="draft">Draft (Private, not visible to customers)</option>
                          <option value="published">Published (Visible immediately on website)</option>
                          <option value="scheduled">Scheduled (Auto-publish at specific time)</option>
                          <option value="archived">Archived (Unpublished from public catalog)</option>
                        </select>
                      </div>

                      {/* Scheduled Date/Time Input if status is scheduled */}
                      {formData.status === 'scheduled' && (
                        <div>
                          <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1.5">
                            Scheduled Date &amp; Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.scheduledAt}
                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 text-xs text-charcoal focus:outline-hidden focus:border-indigo-600"
                            required
                          />
                          <p className="text-[10px] text-indigo-600 mt-1">
                            The post will automatically transition to Published when this time arrives.
                          </p>
                        </div>
                      )}

                      {/* Public Published Date */}
                      {formData.status !== 'scheduled' && (
                        <div>
                          <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1.5">
                            Publication Date
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.publishedAt}
                            onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-sand-border text-xs text-charcoal focus:outline-hidden focus:border-forest"
                          />
                        </div>
                      )}
                    </div>

                    {/* Enable / Disable Switch */}
                    <div className="flex items-center justify-between pt-3 border-t border-sand-border">
                      <div>
                        <span className="text-xs font-bold text-forest-deep block">Active on Storefront</span>
                        <span className="text-[11px] text-charcoal-muted">Enable or disable this article immediately</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-sand-border peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Footer Actions */}
            <div className="px-6 py-4 bg-white border-t border-sand-border flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-sand/60 hover:bg-sand text-charcoal text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveBlog('draft')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-warm text-charcoal text-xs font-bold transition-all border border-sand-border cursor-pointer disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveBlog(formData.status === 'scheduled' ? 'scheduled' : 'published')}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-gold" />
                      <span>{editingPost ? 'Update Article' : formData.status === 'scheduled' ? 'Schedule Article' : 'Publish Article'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. INTERACTIVE LIVE PREVIEW MODAL                    */}
      {/* ==================================================== */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fbf9f4] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-sand-border overflow-hidden">
            {/* Preview Top Control Bar */}
            <div className="px-5 py-3 bg-forest-deep text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" />
                <span className="font-heading font-extrabold text-xs sm:text-sm">Storefront Article Preview</span>
              </div>

              {/* Viewport switcher: Desktop vs Mobile */}
              <div className="flex items-center gap-2">
                <div className="inline-flex bg-white/10 p-0.5 rounded-lg">
                  <button
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                      previewViewport === 'desktop' ? 'bg-forest text-white shadow-xs' : 'text-sand-warm hover:text-white'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                      previewViewport === 'mobile' ? 'bg-forest text-white shadow-xs' : 'text-sand-warm hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mobile (375px)</span>
                  </button>
                </div>

                <button
                  onClick={() => setPreviewPost(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#f0ede6]">
              <div
                className={`bg-white rounded-3xl border border-sand-border shadow-botanical overflow-hidden transition-all duration-300 ${
                  previewViewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-3xl'
                }`}
              >
                {/* Hero packshot */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-forest-deep">
                  {previewPost.image ? (
                    <img
                      src={previewPost.image}
                      alt={previewPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      {previewPost.category}
                    </span>
                    <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white mt-1.5 leading-snug">
                      {previewPost.title}
                    </h2>
                  </div>
                </div>

                {/* Article Meta Bar */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-charcoal-muted pb-4 border-b border-sand-border">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-forest" />
                      <span className="font-semibold text-charcoal">{previewPost.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{previewPost.date || 'Today'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{previewPost.readTime || '4 min read'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary / Excerpt Box */}
                  <div className="p-4 rounded-2xl bg-forest/5 border-l-4 border-forest text-xs sm:text-sm text-forest-deep font-medium leading-relaxed">
                    <span className="block text-[10px] font-bold text-forest uppercase tracking-widest mb-1">
                      Clinical Overview &amp; Vaidya Summary
                    </span>
                    {previewPost.excerpt}
                  </div>

                  {/* Body Content */}
                  <div
                    className="prose prose-sm max-w-none text-charcoal leading-relaxed space-y-3 pt-2"
                    dangerouslySetInnerHTML={{ __html: formatBodyContent(previewPost.content) }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. CATEGORY ADD / EDIT MODAL                         */}
      {/* ==================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-sand-border overflow-hidden">
            <div className="px-6 py-4 bg-forest-deep text-white flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-sm text-white">
                {editingCategory ? 'Edit Blog Category' : 'Create New Category'}
              </h4>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {categoryError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {categoryError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Respiratory Health"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: prev.slug === '' ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug
                  }))}
                  className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal font-semibold focus:bg-white focus:outline-hidden focus:border-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="respiratory-health"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') }))}
                  className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs font-mono text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of articles in this category..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryFormData.displayOrder}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 rounded-xl bg-sand/30 border border-sand-border text-xs text-charcoal focus:bg-white focus:outline-hidden focus:border-forest"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.enabled}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded text-forest"
                    />
                    <span className="text-xs font-bold text-charcoal">Active Category</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-sand-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-sand text-charcoal text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. DELETE CONFIRMATION MODAL                         */}
      {/* ==================================================== */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-sand-border text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-base text-forest-deep">
                Confirm Deletion
              </h4>
              <p className="text-xs text-charcoal-muted">
                Are you sure you want to permanently delete:
              </p>
              <p className="font-bold text-xs text-red-700 bg-red-50 p-2 rounded-xl border border-red-200 mt-1">
                "{deleteConfirmPost.title}"
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPost(null)}
                className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-warm text-charcoal text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BlogManager;
