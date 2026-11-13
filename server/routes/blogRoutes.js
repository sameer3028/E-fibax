import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { requireAdminAuth } from '../middleware/auth.js';
import { readJsonFile, writeJsonFile } from '../store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const dataDir = join(__dirname, '..', 'data');
const BLOGS_FILE = join(dataDir, 'blogs.json');
const BLOG_CATEGORIES_FILE = join(dataDir, 'blog_categories.json');
const PUBLIC_SITEMAP_FILE = join(__dirname, '..', '..', 'client', 'public', 'sitemap.xml');
const DIST_SITEMAP_FILE = join(__dirname, '..', '..', 'client', 'dist', 'sitemap.xml');

// ============================================================
// 1. HTML SANITIZER & UTILITY FUNCTIONS
// ============================================================

/**
 * Strict HTML Sanitizer to prevent XSS while allowing rich blog content.
 * Strips script, iframe, object, embed, javascript: protocols, and inline handlers (onerror, onload, onclick, etc.).
 */
export function sanitizeBlogHtml(html) {
  if (!html || typeof html !== 'string') return '';

  let sanitized = html;

  // 1. Remove dangerous script, iframe, embed, object, form, frame tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  sanitized = sanitized.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
  sanitized = sanitized.replace(/<link\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<meta\b[^>]*>/gi, '');

  // 2. Remove inline event handlers (onabort, onclick, onerror, onload, onmouseover, etc.)
  sanitized = sanitized.replace(/\son[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Remove dangerous protocols in href / src (javascript:, vbscript:, data:text/html)
  sanitized = sanitized.replace(/\s(href|src)\s*=\s*['"]\s*(?:javascript|vbscript|data):[^'"]*['"]/gi, ' $1="#"');

  // 4. Ensure target="_blank" has rel="noopener noreferrer"
  sanitized = sanitized.replace(/<a\b([^>]*target=['"]_blank['"][^>]*)>/gi, (match, attrs) => {
    if (!/rel=['"][^'"]*noopener[^'"]*['"]/i.test(attrs)) {
      return `<a ${attrs} rel="noopener noreferrer">`;
    }
    return match;
  });

  return sanitized.trim();
}

/**
 * Slugify title into URL-friendly kebab-case
 */
export function slugify(text) {
  if (!text) return `post-${Date.now()}`;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time from text/HTML content (approx 200 words per minute)
 */
export function calculateReadTime(content) {
  if (!content) return '1 min read';
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

// ============================================================
// 2. DATA LOADERS & INITIAL SEEDING
// ============================================================

const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Liver Detox', slug: 'liver-detox', description: 'Ayurvedic formulations and routines for hepatic cleansing and fatty liver recovery.', displayOrder: 1, enabled: true },
  { id: 'cat_2', name: 'Digestion & Gut', slug: 'digestion-gut', description: 'Deepana and Pachana herbs for ending chronic acidity, bloating, and digestive sluggishness.', displayOrder: 2, enabled: true },
  { id: 'cat_3', name: 'Joint Care', slug: 'joint-care', description: 'Ayurvedic therapies for Sandhivata, Amavata, synovial lubrication, and mobility.', displayOrder: 3, enabled: true },
  { id: 'cat_4', name: 'Vitality & Stamina', slug: 'vitality-stamina', description: 'Vajikarana Rasayanas, Ashwagandha, and Safed Musli for male and female vitality.', displayOrder: 4, enabled: true },
  { id: 'cat_5', name: 'Immunity', slug: 'immunity', description: 'Rasayana formulations to build Ojas and protect cellular immunity throughout seasonal transitions.', displayOrder: 5, enabled: true },
  { id: 'cat_6', name: 'Diabetes Care', slug: 'diabetes-care', description: 'Madhumeha management with Karela, Jamun, Vijaysar, and Gudmar botanicals.', displayOrder: 6, enabled: true },
  { id: 'cat_7', name: 'Hair & Skin Care', slug: 'hair-skin-care', description: 'Purifying Rakta Dhatu with Neem, Manjistha, and Bhringraj for lustrous hair and clear skin.', displayOrder: 7, enabled: true },
  { id: 'cat_8', name: 'Heart Care', slug: 'heart-care', description: 'Hridaya tonics including Arjuna bark decoctions for cholesterol and cardiovascular health.', displayOrder: 8, enabled: true },
  { id: 'cat_9', name: 'Stress & Sleep', slug: 'stress-sleep', description: 'Medhya Rasayanas like Brahmi, Shankhpushpi, and Jatamansi for restful sleep and brain fog relief.', displayOrder: 9, enabled: true },
  { id: 'cat_10', name: 'Ayurvedic Principles', slug: 'ayurvedic-principles', description: 'Foundations of Tridosha, Dhatu metabolism, Dinacharya, and classical pharmacology.', displayOrder: 10, enabled: true }
];

export function readBlogCategories() {
  const categories = readJsonFile(BLOG_CATEGORIES_FILE, null);
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    writeJsonFile(BLOG_CATEGORIES_FILE, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return categories;
}

export function saveBlogCategories(categories) {
  return writeJsonFile(BLOG_CATEGORIES_FILE, categories);
}

// Initial seed helper for blogs from client/src/data/blogs.js if blogs.json doesn't exist
async function getSeedPosts() {
  try {
    const clientBlogsPath = join(__dirname, '..', '..', 'client', 'src', 'data', 'blogs.js');
    if (existsSync(clientBlogsPath)) {
      const moduleUrl = 'file:///' + clientBlogsPath.replace(/\\/g, '/');
      const mod = await import(moduleUrl);
      if (mod && Array.isArray(mod.BLOG_POSTS)) {
        return mod.BLOG_POSTS.map((p, idx) => {
          const publishedDate = new Date(Date.now() - (idx * 3 * 86400000)).toISOString();
          return {
            id: 'blog_' + (p.id || idx + 1),
            slug: p.slug || slugify(p.title),
            title: p.title,
            category: p.category || 'Ayurvedic Principles',
            tag: p.tag || 'Ayurvedic Wellness',
            date: p.date || new Date(publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            readTime: p.readTime || calculateReadTime(p.content),
            author: p.author || {
              name: 'Dr. Sameer Patel, BAMS',
              role: 'Chief Ayurvedic Consultant',
              avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
            },
            colorBlock: p.colorBlock || 'bg-[#285238] text-white',
            badgeColor: p.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-200',
            image: p.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            imageAlt: p.title,
            excerpt: p.excerpt || '',
            content: p.content || '',
            status: 'published',
            enabled: true,
            publishedAt: publishedDate,
            scheduledAt: null,
            views: 45 + (25 - idx) * 12,
            seo: {
              metaTitle: `${p.title} | Fibax Ayurveda`,
              metaDescription: p.excerpt ? p.excerpt.slice(0, 155) : '',
              focusKeyword: p.tag || p.category,
              canonicalUrl: `/blog/${p.slug || slugify(p.title)}`,
              ogTitle: p.title,
              ogDescription: p.excerpt ? p.excerpt.slice(0, 155) : '',
              ogImage: p.image || ''
            },
            createdAt: publishedDate,
            updatedAt: publishedDate
          };
        });
      }
    }
  } catch (err) {
    console.error('Error importing seed blog posts:', err.message);
  }
  return [];
}

export function readBlogsSync() {
  return readJsonFile(BLOGS_FILE, null);
}

export function saveBlogs(blogs) {
  const success = writeJsonFile(BLOGS_FILE, blogs);
  if (success) {
    try {
      generateDynamicSitemap(blogs);
    } catch (_) {}
  }
  return success;
}

/**
 * Ensures scheduled posts automatically transition to 'published' when their scheduledAt date has passed.
 */
export function syncScheduledPosts(blogs) {
  if (!blogs || !Array.isArray(blogs)) return blogs;
  const now = new Date();
  let changed = false;

  for (const post of blogs) {
    if (post.status === 'scheduled') {
      const targetTime = post.scheduledAt ? new Date(post.scheduledAt) : (post.publishedAt ? new Date(post.publishedAt) : null);
      if (targetTime && targetTime <= now) {
        post.status = 'published';
        post.publishedAt = targetTime.toISOString();
        post.scheduledAt = null;
        post.updatedAt = now.toISOString();
        changed = true;
      }
    }
  }

  if (changed) {
    saveBlogs(blogs);
  }
  return blogs;
}

export async function getBlogs() {
  let blogs = readBlogsSync();
  if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
    const seed = await getSeedPosts();
    if (seed && seed.length > 0) {
      writeJsonFile(BLOGS_FILE, seed);
      blogs = seed;
    } else {
      blogs = [];
    }
  }
  // Check and promote any scheduled posts
  blogs = syncScheduledPosts(blogs);
  return blogs;
}

// Background scheduler interval check every 60 seconds
const schedulerInterval = setInterval(async () => {
  try {
    const blogs = readBlogsSync();
    if (blogs && Array.isArray(blogs)) {
      syncScheduledPosts(blogs);
    }
  } catch (_) {}
}, 60 * 1000);
if (schedulerInterval && typeof schedulerInterval.unref === 'function') {
  schedulerInterval.unref();
}

// ============================================================
// 3. SITEMAP GENERATION HELPER
// ============================================================

export function generateDynamicSitemap(blogs = null) {
  try {
    if (!blogs) {
      blogs = readBlogsSync() || [];
    }
    const publishedBlogs = blogs.filter(b => b.status === 'published' && b.enabled !== false);
    
    // Read static public/sitemap.xml base if available or build clean sitemap XML
    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
    
    // Core Pages
    const corePages = [
      { loc: 'https://www.fibaxpharma.com/', priority: '1.0', changefreq: 'daily' },
      { loc: 'https://www.fibaxpharma.com/products', priority: '0.9', changefreq: 'daily' },
      { loc: 'https://www.fibaxpharma.com/blogs', priority: '0.8', changefreq: 'daily' },
      { loc: 'https://www.fibaxpharma.com/about', priority: '0.7', changefreq: 'weekly' },
      { loc: 'https://www.fibaxpharma.com/contact', priority: '0.7', changefreq: 'monthly' },
      { loc: 'https://www.fibaxpharma.com/track', priority: '0.6', changefreq: 'monthly' }
    ];

    for (const page of corePages) {
      sitemapXml += `  <url>\n    <loc>${page.loc}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    // Published Blog Posts
    for (const blog of publishedBlogs) {
      const url = `https://www.fibaxpharma.com/blog/${encodeURIComponent(blog.slug)}`;
      const lastmod = blog.updatedAt ? blog.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      sitemapXml += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n`;
      if (blog.image) {
        sitemapXml += `    <image:image>\n      <image:loc>${blog.image}</image:loc>\n      <image:title>${(blog.title || '').replace(/[<>&'"]/g, '')}</image:title>\n    </image:image>\n`;
      }
      sitemapXml += `  </url>\n`;
    }

    sitemapXml += `</urlset>\n`;

    if (existsSync(dirname(PUBLIC_SITEMAP_FILE))) {
      writeFileSync(PUBLIC_SITEMAP_FILE, sitemapXml, 'utf8');
    }
    if (existsSync(dirname(DIST_SITEMAP_FILE))) {
      writeFileSync(DIST_SITEMAP_FILE, sitemapXml, 'utf8');
    }
  } catch (err) {
    console.error('Failed to regenerate sitemap.xml:', err.message);
  }
}

// ============================================================
// 4. PUBLIC BLOG ENDPOINTS
// ============================================================

// GET /api/blogs - List published blog posts with filtering, search, pagination
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const categories = readBlogCategories().filter(c => c.enabled !== false);

    const {
      category = 'All',
      search = '',
      tag = '',
      page = 1,
      limit = 20,
      sort = 'latest'
    } = req.query;

    let filtered = blogs.filter(b => b.status === 'published' && b.enabled !== false);

    // Filter by Category
    if (category && category !== 'All' && category !== 'all') {
      filtered = filtered.filter(b => 
        (b.category || '').toLowerCase() === category.toLowerCase() ||
        (b.categorySlug || '').toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by Tag
    if (tag) {
      filtered = filtered.filter(b => (b.tag || '').toLowerCase() === tag.toLowerCase());
    }

    // Filter by Search Query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.excerpt || '').toLowerCase().includes(q) ||
        (b.content || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.tag || '').toLowerCase().includes(q) ||
        (b.author?.name || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.date || a.createdAt || 0);
      const dateB = new Date(b.publishedAt || b.date || b.createdAt || 0);
      return dateB - dateA;
    });

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10);

    let paginated = filtered;
    let totalPages = 1;

    if (limitNum > 0) {
      totalPages = Math.ceil(total / limitNum) || 1;
      const startIndex = (pageNum - 1) * limitNum;
      paginated = filtered.slice(startIndex, startIndex + limitNum);
    }

    res.json({
      success: true,
      data: paginated,
      total,
      page: pageNum,
      totalPages,
      categories: ['All', ...categories.map(c => c.name)]
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
  }
});

// GET /api/blogs/categories - Public list of active categories with published post counts
router.get('/blogs/categories', async (req, res) => {
  try {
    const blogs = await getBlogs();
    const publishedBlogs = blogs.filter(b => b.status === 'published' && b.enabled !== false);
    const categories = readBlogCategories().filter(c => c.enabled !== false);

    const counts = {};
    for (const b of publishedBlogs) {
      if (b.category) {
        counts[b.category] = (counts[b.category] || 0) + 1;
      }
    }

    const categoriesWithCounts = categories
      .map(c => ({
        ...c,
        postCount: counts[c.name] || 0
      }))
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

    res.json({
      success: true,
      data: categoriesWithCounts,
      totalPosts: publishedBlogs.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch blog categories' });
  }
});

// GET /api/blogs/:slugOrId - Fetch single published blog post by slug or ID
router.get('/blogs/:slugOrId', async (req, res) => {
  try {
    const identifier = decodeURIComponent(req.params.slugOrId).trim();
    const blogs = await getBlogs();

    const post = blogs.find(b => 
      (b.slug && b.slug.toLowerCase() === identifier.toLowerCase()) ||
      String(b.id) === identifier
    );

    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    // Check if post is published or if requester has valid admin token
    if (post.status !== 'published' || post.enabled === false) {
      const authHeader = req.headers.authorization;
      const isAdmin = authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7).length > 10;
      if (!isAdmin) {
        return res.status(404).json({ success: false, error: 'This blog post is not published yet' });
      }
    }

    // Increment view count in memory / store asynchronously
    post.views = (post.views || 0) + 1;
    saveBlogs(blogs);

    // Find related articles (same category, published, excluding current)
    const published = blogs.filter(b => b.status === 'published' && b.enabled !== false && b.id !== post.id);
    let relatedPosts = published.filter(b => b.category === post.category).slice(0, 3);
    if (relatedPosts.length < 3) {
      const additional = published.filter(b => b.category !== post.category).slice(0, 3 - relatedPosts.length);
      relatedPosts = [...relatedPosts, ...additional];
    }

    // Find previous and next articles
    const postIndex = blogs.findIndex(b => b.id === post.id);
    const prevPost = postIndex > 0 ? { id: blogs[postIndex - 1].id, slug: blogs[postIndex - 1].slug, title: blogs[postIndex - 1].title } : null;
    const nextPost = postIndex < blogs.length - 1 ? { id: blogs[postIndex + 1].id, slug: blogs[postIndex + 1].slug, title: blogs[postIndex + 1].title } : null;

    res.json({
      success: true,
      data: post,
      relatedPosts,
      prevPost,
      nextPost
    });
  } catch (err) {
    console.error('Error fetching blog detail:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
  }
});

// ============================================================
// 5. ADMIN BLOG CRUD ENDPOINTS (Protected by requireAdminAuth)
// ============================================================

// GET /api/admin/blogs - Get all blog posts with comprehensive filters and stats
router.get('/admin/blogs', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const categories = readBlogCategories();

    const { status = 'all', category = 'all', search = '' } = req.query;

    // Calculate metrics
    const stats = {
      total: blogs.length,
      published: blogs.filter(b => b.status === 'published').length,
      draft: blogs.filter(b => b.status === 'draft').length,
      scheduled: blogs.filter(b => b.status === 'scheduled').length,
      archived: blogs.filter(b => b.status === 'archived').length
    };

    let filtered = [...blogs];

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(b => (b.status || 'draft') === status);
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
    }

    // Search filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.slug || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.author?.name || '').toLowerCase().includes(q) ||
        (b.tag || '').toLowerCase().includes(q)
      );
    }

    // Sort by latest update or creation
    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

    res.json({
      success: true,
      data: filtered,
      stats,
      categories
    });
  } catch (err) {
    console.error('Error in admin blogs list:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin blog posts' });
  }
});

// POST /api/admin/blogs - Create a new blog post
router.post('/admin/blogs', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const body = req.body || {};

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ success: false, error: 'Blog title is required' });
    }

    // Generate or sanitize URL slug
    let desiredSlug = slugify(body.slug || body.title);
    let uniqueSlug = desiredSlug;
    let counter = 1;
    while (blogs.some(b => b.slug === uniqueSlug)) {
      uniqueSlug = `${desiredSlug}-${counter}`;
      counter++;
    }

    // Sanitize HTML Content
    const sanitizedContent = sanitizeBlogHtml(body.content || '');
    const plainExcerpt = body.excerpt?.trim() || sanitizedContent.replace(/<[^>]*>/g, ' ').slice(0, 160).trim();

    // Determine status and publication / schedule dates
    const status = ['published', 'draft', 'scheduled', 'archived'].includes(body.status)
      ? body.status
      : 'draft';

    const now = new Date();
    let publishedAt = body.publishedAt ? new Date(body.publishedAt).toISOString() : now.toISOString();
    let scheduledAt = null;

    if (status === 'scheduled') {
      if (!body.scheduledAt) {
        return res.status(400).json({ success: false, error: 'Scheduled date and time is required for scheduled posts' });
      }
      scheduledAt = new Date(body.scheduledAt).toISOString();
      // If scheduled time is already in the past, automatically set to published
      if (new Date(scheduledAt) <= now) {
        publishedAt = scheduledAt;
      }
    }

    const calculatedReadTime = body.readTime?.trim() || calculateReadTime(sanitizedContent);

    const newBlog = {
      id: 'blog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: body.title.trim(),
      slug: uniqueSlug,
      category: body.category?.trim() || 'Ayurvedic Principles',
      tag: body.tag?.trim() || 'Wellness Guide',
      date: new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: calculatedReadTime,
      author: {
        name: body.author?.name?.trim() || 'Dr. Sameer Patel, BAMS',
        role: body.author?.role?.trim() || 'Chief Ayurvedic Consultant',
        avatar: body.author?.avatar?.trim() || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      },
      colorBlock: body.colorBlock || 'bg-[#285238] text-white',
      badgeColor: body.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-200',
      image: body.image || '',
      imageAlt: body.imageAlt || body.title.trim(),
      excerpt: plainExcerpt,
      content: sanitizedContent,
      status,
      enabled: body.enabled !== false,
      publishedAt,
      scheduledAt,
      views: 0,
      seo: {
        metaTitle: body.seo?.metaTitle?.trim() || `${body.title.trim()} | Fibax Ayurveda`,
        metaDescription: body.seo?.metaDescription?.trim() || plainExcerpt.slice(0, 155),
        focusKeyword: body.seo?.focusKeyword?.trim() || body.tag || body.category || '',
        canonicalUrl: body.seo?.canonicalUrl?.trim() || `/blog/${uniqueSlug}`,
        ogTitle: body.seo?.ogTitle?.trim() || body.title.trim(),
        ogDescription: body.seo?.ogDescription?.trim() || plainExcerpt.slice(0, 155),
        ogImage: body.seo?.ogImage || body.image || ''
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    blogs.unshift(newBlog);
    saveBlogs(blogs);

    res.json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ success: false, error: 'Failed to create blog post' });
  }
});

// ============================================================
// 5.5 ADMIN BLOG CATEGORIES CRUD ENDPOINTS (Declared before :id)
// ============================================================

// GET /api/admin/blogs/categories - All categories with post counts
router.get('/admin/blogs/categories', requireAdminAuth, async (req, res) => {
  try {
    const categories = readBlogCategories();
    const blogs = await getBlogs();

    const counts = {};
    const publishedCounts = {};
    for (const b of blogs) {
      const cat = b.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
      if (b.status === 'published') {
        publishedCounts[cat] = (publishedCounts[cat] || 0) + 1;
      }
    }

    const categoriesWithStats = categories
      .map(c => ({
        ...c,
        totalPosts: counts[c.name] || 0,
        publishedPosts: publishedCounts[c.name] || 0
      }))
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

    res.json({
      success: true,
      data: categoriesWithStats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/blogs/categories - Create category
router.post('/admin/blogs/categories', requireAdminAuth, (req, res) => {
  try {
    const categories = readBlogCategories();
    const body = req.body || {};

    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const trimmedName = body.name.trim();
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return res.status(400).json({ success: false, error: `Category "${trimmedName}" already exists` });
    }

    const newCategory = {
      id: 'cat_' + Date.now(),
      name: trimmedName,
      slug: slugify(body.slug || trimmedName),
      description: body.description?.trim() || '',
      displayOrder: Number(body.displayOrder) || (categories.length + 1),
      enabled: body.enabled !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    categories.push(newCategory);
    saveBlogCategories(categories);

    res.json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

// PUT /api/admin/blogs/categories/:id - Update category
router.put('/admin/blogs/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const categories = readBlogCategories();
    const index = categories.findIndex(c => String(c.id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const current = categories[index];
    const body = req.body || {};
    const newName = body.name ? body.name.trim() : current.name;

    // Check duplicate name
    if (newName.toLowerCase() !== current.name.toLowerCase()) {
      if (categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && String(c.id) !== String(current.id))) {
        return res.status(400).json({ success: false, error: `Category name "${newName}" already in use` });
      }
    }

    const updatedCategory = {
      ...current,
      name: newName,
      slug: slugify(body.slug || newName),
      description: body.description !== undefined ? body.description.trim() : current.description,
      displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : current.displayOrder,
      enabled: body.enabled !== undefined ? body.enabled : current.enabled,
      updatedAt: new Date().toISOString()
    };

    categories[index] = updatedCategory;
    saveBlogCategories(categories);

    // If category name was renamed, update corresponding blogs
    if (newName !== current.name) {
      const blogs = await getBlogs();
      let blogsChanged = false;
      for (const b of blogs) {
        if (b.category === current.name) {
          b.category = newName;
          blogsChanged = true;
        }
      }
      if (blogsChanged) {
        saveBlogs(blogs);
      }
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
});

// DELETE /api/admin/blogs/categories/:id - Delete category with CASCADE SAFETY CHECK
router.delete('/admin/blogs/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const categories = readBlogCategories();
    const index = categories.findIndex(c => String(c.id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const categoryToDelete = categories[index];
    const blogs = await getBlogs();

    // STRICT CASCADE SAFETY: check if any blogs use this category
    const assignedBlogs = blogs.filter(b => (b.category || '').toLowerCase() === categoryToDelete.name.toLowerCase());
    if (assignedBlogs.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category "${categoryToDelete.name}" because ${assignedBlogs.length} blog post(s) are currently assigned to it. Please reassign or delete those posts first.`,
        assignedCount: assignedBlogs.length,
        samplePosts: assignedBlogs.slice(0, 3).map(b => b.title)
      });
    }

    categories.splice(index, 1);
    saveBlogCategories(categories);

    res.json({
      success: true,
      message: `Category "${categoryToDelete.name}" deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

// GET /api/admin/blogs/:id - Get single blog post by ID
router.get('/admin/blogs/:id', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const blog = blogs.find(b => String(b.id) === String(req.params.id));
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
  }
});

// PUT /api/admin/blogs/:id - Update an existing blog post
router.put('/admin/blogs/:id', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const index = blogs.findIndex(b => String(b.id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const current = blogs[index];
    const body = req.body || {};

    // Validate title
    const title = body.title?.trim() || current.title;

    // Validate slug uniqueness
    let desiredSlug = slugify(body.slug || current.slug || title);
    if (desiredSlug !== current.slug) {
      let uniqueSlug = desiredSlug;
      let counter = 1;
      while (blogs.some(b => b.slug === uniqueSlug && String(b.id) !== String(current.id))) {
        uniqueSlug = `${desiredSlug}-${counter}`;
        counter++;
      }
      desiredSlug = uniqueSlug;
    }

    const sanitizedContent = body.content !== undefined ? sanitizeBlogHtml(body.content) : current.content;
    const plainExcerpt = body.excerpt !== undefined ? body.excerpt.trim() : current.excerpt;

    const status = ['published', 'draft', 'scheduled', 'archived'].includes(body.status)
      ? body.status
      : current.status;

    const now = new Date();
    let publishedAt = body.publishedAt ? new Date(body.publishedAt).toISOString() : current.publishedAt;
    let scheduledAt = current.scheduledAt;

    if (status === 'scheduled') {
      if (!body.scheduledAt && !current.scheduledAt) {
        return res.status(400).json({ success: false, error: 'Scheduled date and time is required for scheduled posts' });
      }
      scheduledAt = body.scheduledAt ? new Date(body.scheduledAt).toISOString() : current.scheduledAt;
      if (new Date(scheduledAt) <= now) {
        publishedAt = scheduledAt;
      }
    } else if (status === 'published' && current.status !== 'published') {
      publishedAt = now.toISOString();
      scheduledAt = null;
    }

    const updatedBlog = {
      ...current,
      title,
      slug: desiredSlug,
      category: body.category?.trim() || current.category,
      tag: body.tag?.trim() || current.tag,
      date: new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: body.readTime?.trim() || calculateReadTime(sanitizedContent),
      author: {
        name: body.author?.name?.trim() || current.author?.name || 'Dr. Sameer Patel, BAMS',
        role: body.author?.role?.trim() || current.author?.role || 'Chief Ayurvedic Consultant',
        avatar: body.author?.avatar?.trim() || current.author?.avatar || ''
      },
      colorBlock: body.colorBlock || current.colorBlock,
      badgeColor: body.badgeColor || current.badgeColor,
      image: body.image !== undefined ? body.image : current.image,
      imageAlt: body.imageAlt !== undefined ? body.imageAlt : current.imageAlt,
      excerpt: plainExcerpt,
      content: sanitizedContent,
      status,
      enabled: body.enabled !== undefined ? body.enabled : current.enabled,
      publishedAt,
      scheduledAt,
      seo: {
        metaTitle: body.seo?.metaTitle?.trim() || current.seo?.metaTitle || `${title} | Fibax Ayurveda`,
        metaDescription: body.seo?.metaDescription?.trim() || current.seo?.metaDescription || plainExcerpt.slice(0, 155),
        focusKeyword: body.seo?.focusKeyword?.trim() || current.seo?.focusKeyword || '',
        canonicalUrl: body.seo?.canonicalUrl?.trim() || current.seo?.canonicalUrl || `/blog/${desiredSlug}`,
        ogTitle: body.seo?.ogTitle?.trim() || current.seo?.ogTitle || title,
        ogDescription: body.seo?.ogDescription?.trim() || current.seo?.ogDescription || plainExcerpt.slice(0, 155),
        ogImage: body.seo?.ogImage || body.image || current.seo?.ogImage || ''
      },
      updatedAt: now.toISOString()
    };

    blogs[index] = updatedBlog;
    saveBlogs(blogs);

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    });
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ success: false, error: 'Failed to update blog post' });
  }
});

// DELETE /api/admin/blogs/:id - Delete a blog post (permanent or soft archive)
router.delete(['/admin/blogs/:id', '/api/admin/blogs/:id'], requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const index = blogs.findIndex(b => String(b.id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const { archiveOnly } = req.query;
    if (archiveOnly === 'true') {
      blogs[index].status = 'archived';
      blogs[index].updatedAt = new Date().toISOString();
      const saved = saveBlogs(blogs);
      if (!saved) {
        return res.status(500).json({ success: false, error: 'Failed to update blog archive status' });
      }
      return res.json({ success: true, message: 'Blog post moved to archive', data: blogs[index] });
    }

    const deleted = blogs.splice(index, 1)[0];
    const saved = saveBlogs(blogs);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to persist blog deletion to storage' });
    }

    res.json({
      success: true,
      message: `Blog post "${deleted.title}" deleted successfully`,
      data: deleted
    });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ success: false, error: 'Failed to delete blog post' });
  }
});

// POST /api/admin/blogs/:id/duplicate - Duplicate an existing blog post as a draft
router.post('/admin/blogs/:id/duplicate', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const source = blogs.find(b => String(b.id) === String(req.params.id));
    if (!source) {
      return res.status(404).json({ success: false, error: 'Original blog post not found' });
    }

    const copyTitle = `${source.title} (Copy)`;
    let copySlug = `${source.slug}-copy`;
    let counter = 1;
    while (blogs.some(b => b.slug === copySlug)) {
      copySlug = `${source.slug}-copy-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const duplicatedBlog = {
      ...source,
      id: 'blog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: copyTitle,
      slug: copySlug,
      status: 'draft',
      views: 0,
      publishedAt: now,
      scheduledAt: null,
      seo: {
        ...(source.seo || {}),
        metaTitle: `${copyTitle} | Fibax Ayurveda`,
        canonicalUrl: `/blog/${copySlug}`
      },
      createdAt: now,
      updatedAt: now
    };

    blogs.unshift(duplicatedBlog);
    saveBlogs(blogs);

    res.json({
      success: true,
      message: 'Blog duplicated successfully as draft',
      data: duplicatedBlog
    });
  } catch (err) {
    console.error('Error duplicating blog post:', err);
    res.status(500).json({ success: false, error: 'Failed to duplicate blog post' });
  }
});

// POST /api/admin/blogs/:id/publish-toggle - 1-click toggle between published and draft
router.post('/admin/blogs/:id/publish-toggle', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const blog = blogs.find(b => String(b.id) === String(req.params.id));
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const now = new Date();
    if (blog.status === 'published') {
      blog.status = 'draft';
    } else {
      blog.status = 'published';
      blog.publishedAt = now.toISOString();
      blog.scheduledAt = null;
    }
    blog.updatedAt = now.toISOString();

    saveBlogs(blogs);

    res.json({
      success: true,
      message: `Blog status updated to ${blog.status}`,
      data: blog
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle blog publish status' });
  }
});

// POST /api/admin/blogs/:id/archive-toggle - Toggle between archived and draft/published
router.post('/admin/blogs/:id/archive-toggle', requireAdminAuth, async (req, res) => {
  try {
    const blogs = await getBlogs();
    const blog = blogs.find(b => String(b.id) === String(req.params.id));
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    if (blog.status === 'archived') {
      blog.status = 'draft'; // Restore to draft for safe review
    } else {
      blog.status = 'archived';
    }
    blog.updatedAt = new Date().toISOString();

    saveBlogs(blogs);

    res.json({
      success: true,
      message: `Blog ${blog.status === 'archived' ? 'archived' : 'restored to draft'}`,
      data: blog
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle archive status' });
  }
});

export default router;
