import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../data/blogs';
import { apiRequest } from '../utils/api';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  Bookmark,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Heart,
  User,
  Tag,
  ShieldCheck,
  Eye
} from 'lucide-react';

export function BlogDetail({ post, onNavigate }) {
  const [copied, setCopied] = useState(false);
  const [currentPost, setCurrentPost] = useState(post || BLOG_POSTS[0]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(!post);

  // Determine current identifier
  const identifier = useMemo(() => {
    if (post?.slug) return post.slug;
    if (post?.id) return String(post.id);
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      return decodeURIComponent(path.replace(/^\/blog\//, '')).trim();
    }
    return '';
  }, [post]);

  // Fetch full live post and related data from API
  useEffect(() => {
    let isMounted = true;
    const loadPostDetail = async () => {
      const target = identifier || currentPost?.slug || currentPost?.id;
      if (!target) return;

      try {
        const res = await apiRequest(`/api/blogs/${encodeURIComponent(target)}`);
        if (isMounted && res.success && res.data) {
          setCurrentPost(res.data);
          if (res.relatedPosts) setRelatedPosts(res.relatedPosts);
          if (res.prevPost) setPrevPost(res.prevPost);
          if (res.nextPost) setNextPost(res.nextPost);
        }
      } catch (err) {
        console.warn('Using local fallback for blog detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPostDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, [identifier]);

  // Dynamic SEO & Structured Data (Schema.org / JSON-LD)
  useEffect(() => {
    if (!currentPost) return;

    // Document title
    const metaTitle = currentPost.seo?.metaTitle || `${currentPost.title} | Fibax Ayurveda`;
    document.title = metaTitle;

    // Meta description
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', currentPost.seo?.metaDescription || currentPost.excerpt || '');

    // Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    const fullCanonical = `https://www.fibaxpharma.com/blog/${encodeURIComponent(currentPost.slug || currentPost.id)}`;
    canonicalTag.setAttribute('href', fullCanonical);

    // Schema.org JSON-LD Article structured data
    const schemaScriptId = 'fibax-blog-schema-jsonld';
    let scriptTag = document.getElementById(schemaScriptId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaScriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: currentPost.title,
      image: currentPost.image ? [currentPost.image] : [],
      datePublished: currentPost.publishedAt || currentPost.createdAt || new Date().toISOString(),
      dateModified: currentPost.updatedAt || currentPost.publishedAt || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: currentPost.author?.name || 'Dr. Sameer Patel, BAMS',
        jobTitle: currentPost.author?.role || 'Chief Ayurvedic Consultant'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Fibax Ayurveda',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.fibaxpharma.com/logo.png'
        }
      },
      description: currentPost.excerpt || '',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullCanonical
      }
    };
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const existing = document.getElementById(schemaScriptId);
      if (existing) existing.remove();
    };
  }, [currentPost]);

  // Fallback related posts from local cache if API returned empty
  const displayRelated = useMemo(() => {
    if (relatedPosts && relatedPosts.length > 0) return relatedPosts;
    const sameCategory = BLOG_POSTS.filter(p => p.id !== currentPost?.id && p.category === currentPost?.category).slice(0, 3);
    return sameCategory.length > 0 ? sameCategory : BLOG_POSTS.filter(p => p.id !== currentPost?.id).slice(0, 3);
  }, [relatedPosts, currentPost]);

  // Social sharing handlers
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Read this Ayurvedic guide: ${currentPost.title} on Fibax Pharma: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${currentPost.title}" — Ayurvedic insights by Fibax Pharma: ${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  // Content formatter: converts markdown syntax or returns rich sanitized HTML
  const formattedHtml = useMemo(() => {
    const raw = currentPost.content || '';
    if (!raw) return '';

    // If content already contains rich HTML tags, return it
    if (raw.includes('<p>') || raw.includes('<h2>') || raw.includes('<h3>') || raw.includes('<div>') || raw.includes('<table>')) {
      return raw;
    }

    // Markdown converter for headers, lists, and bold text
    return raw
      .split('\n\n')
      .map(block => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return `<h3 class="text-xl sm:text-2xl font-black text-forest-deep mt-8 mb-3">${trimmed.slice(4)}</h3>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h2 class="text-2xl sm:text-3xl font-black text-forest-deep mt-10 mb-4">${trimmed.slice(3)}</h2>`;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed
            .split('\n')
            .map(line => `<li class="ml-5 list-disc mb-1 leading-relaxed">${line.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`)
            .join('');
          return `<ul class="space-y-1.5 my-4">${items}</ul>`;
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed
            .split('\n')
            .map(line => `<li class="ml-5 list-decimal mb-1 leading-relaxed">${line.replace(/^\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`)
            .join('');
          return `<ol class="space-y-1.5 my-4">${items}</ol>`;
        }
        return `<p class="leading-relaxed text-charcoal mb-4">${trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      })
      .join('');
  }, [currentPost]);

  const handleOpenArticle = (targetPost) => {
    if (onNavigate) {
      onNavigate('blog-detail', { post: targetPost });
    } else {
      window.history.pushState({}, '', `/blog/${targetPost.slug || targetPost.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="w-full bg-[#fbf9f4] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Breadcrumbs & Top Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => onNavigate && onNavigate('blogs')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-sand-border text-forest hover:bg-sand font-bold text-xs transition-all shadow-xs group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Articles</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-sand-border text-charcoal hover:text-forest transition-colors shadow-xs cursor-pointer"
              title="Copy Article Link"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {copied && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
                Link Copied!
              </span>
            )}
          </div>
        </div>

        {/* 2. Main Article Card */}
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl overflow-hidden border border-sand-border shadow-botanical"
        >
          {/* Hero Packshot & Badges */}
          <div className="relative aspect-[21/9] sm:aspect-[21/8] w-full overflow-hidden bg-forest-deep">
            {currentPost.image ? (
              <img
                src={currentPost.image}
                alt={currentPost.imageAlt || currentPost.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <BookOpen className="h-16 w-16" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-forest text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {currentPost.category || 'Ayurveda'}
              </span>
              {currentPost.tag && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                  {currentPost.tag}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <h1 className="font-heading font-extrabold text-lg sm:text-2xl md:text-3xl text-white tracking-tight leading-tight">
                {currentPost.title}
              </h1>
            </div>
          </div>

          {/* Article Meta Header */}
          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sand-border gap-4">
              {/* Author Byline */}
              <div className="flex items-center gap-3">
                {currentPost.author?.avatar ? (
                  <img
                    src={currentPost.author.avatar}
                    alt={currentPost.author.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-forest/20 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-base">
                    {(currentPost.author?.name || 'Dr')[0]}
                  </div>
                )}
                <div>
                  <h4 className="font-heading font-bold text-sm sm:text-base text-forest-deep">
                    {currentPost.author?.name || 'Dr. Sameer Patel, BAMS'}
                  </h4>
                  <p className="text-[11px] text-charcoal-muted">
                    {currentPost.author?.role || 'Chief Ayurvedic Consultant'}
                  </p>
                </div>
              </div>

              {/* Publication Date & Reading Time */}
              <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-4 w-4 text-forest" />
                  <span>{currentPost.date || (currentPost.publishedAt ? new Date(currentPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent')}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-forest" />
                  <span>{currentPost.readTime || '4 min read'}</span>
                </span>
              </div>
            </div>

            {/* Social Sharing Bar */}
            <div className="flex items-center justify-between py-2 px-4 rounded-2xl bg-sand/40 border border-sand-border text-xs">
              <span className="font-bold text-forest-deep flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-forest" />
                <span>Share this Clinical Guide:</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={handleFacebookShare}
                  className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                >
                  Facebook
                </button>
                <button
                  onClick={handleShare}
                  className="px-3 py-1 rounded-xl bg-white hover:bg-sand text-charcoal border border-sand-border font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Lead Key Takeaway Box */}
            {currentPost.excerpt && (
              <div className="p-5 rounded-2xl bg-forest/5 border-l-4 border-forest text-sm sm:text-base text-forest-deep leading-relaxed font-medium">
                <span className="block text-xs font-bold uppercase tracking-widest text-forest mb-1">
                  Clinical Overview &amp; Vaidya Summary
                </span>
                {currentPost.excerpt}
              </div>
            )}

            {/* Full Body Formatted Content */}
            <div
              className="prose prose-sm sm:prose max-w-none text-charcoal leading-relaxed space-y-4 pt-4 border-t border-sand-border font-sans"
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />

            {/* Consultation CTA Banner */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-forest-deep to-forest text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-botanical">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">
                  Need Personalized Ayurvedic Care?
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                  Consult With Certified Fibax Vaidyas
                </h3>
                <p className="text-xs text-sand-warm/80 max-w-md">
                  Get custom dosha assessments, dietary protocols, and recommended herbal formulations.
                </p>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('contact')}
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-orange-glow transition-all flex-shrink-0 whitespace-nowrap cursor-pointer"
              >
                Schedule Free Consultation
              </button>
            </div>

            {/* Prev / Next Article Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-sand-border">
              {prevPost ? (
                <button
                  onClick={() => handleOpenArticle(prevPost)}
                  className="p-4 rounded-2xl bg-sand/40 hover:bg-sand border border-sand-border text-left transition-all group cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider flex items-center gap-1 mb-1">
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Guide</span>
                  </span>
                  <p className="font-heading font-bold text-xs sm:text-sm text-forest-deep line-clamp-1 group-hover:text-brand transition-colors">
                    {prevPost.title}
                  </p>
                </button>
              ) : <div />}

              {nextPost ? (
                <button
                  onClick={() => handleOpenArticle(nextPost)}
                  className="p-4 rounded-2xl bg-sand/40 hover:bg-sand border border-sand-border text-right transition-all group sm:ml-auto w-full cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider flex items-center justify-end gap-1 mb-1">
                    <span>Next Guide</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <p className="font-heading font-bold text-xs sm:text-sm text-forest-deep line-clamp-1 group-hover:text-brand transition-colors">
                    {nextPost.title}
                  </p>
                </button>
              ) : <div />}
            </div>
          </div>
        </motion.article>

        {/* 3. Related Articles Section */}
        {displayRelated.length > 0 && (
          <div className="mt-14 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-extrabold text-forest-deep">
                Related Wellness Articles
              </h3>
              <button
                onClick={() => onNavigate && onNavigate('blogs')}
                className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1 cursor-pointer"
              >
                <span>View All Articles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {displayRelated.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenArticle(item)}
                  className="bg-white rounded-2xl overflow-hidden border border-sand-border hover:shadow-botanical transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-sand">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 bg-forest-deep/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <span className="text-[10px] text-charcoal-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-forest" />
                        <span>{item.date || 'Recent'}</span>
                      </span>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-forest-deep group-hover:text-brand line-clamp-2 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-sand/30 border-t border-sand-border/80 flex items-center justify-between text-xs font-bold text-brand">
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default BlogDetail;
