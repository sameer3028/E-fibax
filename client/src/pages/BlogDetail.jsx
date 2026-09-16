import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../data/blogs';
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
  Heart
} from 'lucide-react';

export function BlogDetail({ post, onNavigate }) {
  const [copied, setCopied] = useState(false);

  // Fallback to first post if none passed directly
  const currentPost = post || BLOG_POSTS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPost]);

  // Find related articles in the same category
  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.id !== currentPost.id && p.category === currentPost.category
  ).slice(0, 3);

  // Fallback to other posts if fewer than 3 in same category
  const displayRelated = relatedPosts.length > 0
    ? relatedPosts
    : BLOG_POSTS.filter((p) => p.id !== currentPost.id).slice(0, 3);

  // Next & Prev posts in array
  const currentIndex = BLOG_POSTS.findIndex((p) => p.id === currentPost.id);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

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

  return (
    <div className="w-full bg-[#fbf9f4] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Breadcrumbs & Back Navigation */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => onNavigate && onNavigate('blogs')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-sand-border text-forest hover:bg-sand font-bold text-xs transition-all shadow-xs group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Articles</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-sand-border text-charcoal hover:text-forest transition-colors shadow-xs"
              title="Copy Link"
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
            <img
              src={currentPost.image}
              alt={currentPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 flex flex-wrap items-center gap-2">
              <span className="bg-brand text-white font-extrabold text-xs uppercase px-3.5 py-1 rounded-full shadow-md">
                {currentPost.tag}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full border border-white/20">
                {currentPost.category}
              </span>
            </div>
          </div>

          {/* Article Header & Meta */}
          <div className="p-6 sm:p-10 lg:p-12 space-y-6">
            {/* Date & Read Time */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-muted">
              <span className="flex items-center gap-1.5 font-semibold text-forest">
                <Calendar className="h-3.5 w-3.5" />
                <span>Published on {currentPost.date}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{currentPost.readTime}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-forest-deep leading-tight">
              {currentPost.title}
            </h1>

            {/* Author Profile Strip */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-sand/60 border border-sand-border gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentPost.author.avatar}
                  alt={currentPost.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-forest/30 flex-shrink-0"
                />
                <div>
                  <h4 className="font-heading font-extrabold text-forest-deep text-sm sm:text-base">
                    {currentPost.author.name}
                  </h4>
                  <p className="text-xs text-charcoal-muted font-medium">
                    {currentPost.author.role} • Fibax Herbal Research Wing
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Lead Key Takeaway Box */}
            <div className="p-5 rounded-2xl bg-forest/5 border-l-4 border-forest text-sm sm:text-base text-forest-deep leading-relaxed font-medium">
              <span className="block text-xs font-bold uppercase tracking-widest text-forest mb-1">
                Clinical Overview & Vaidya Summary
              </span>
              {currentPost.excerpt}
            </div>

            {/* Full Body Markdown-style Content */}
            <div className="prose prose-sm sm:prose max-w-none text-charcoal leading-relaxed whitespace-pre-line font-sans space-y-4 pt-4 border-t border-sand-border">
              {currentPost.content}
            </div>

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
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-orange-glow transition-all flex-shrink-0 whitespace-nowrap"
              >
                Schedule Free Consultation
              </button>
            </div>

            {/* Prev / Next Article Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-sand-border">
              {prevPost ? (
                <button
                  onClick={() => onNavigate && onNavigate('blog-detail', { post: prevPost })}
                  className="p-4 rounded-2xl bg-sand/40 hover:bg-sand border border-sand-border text-left transition-all group"
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
                  onClick={() => onNavigate && onNavigate('blog-detail', { post: nextPost })}
                  className="p-4 rounded-2xl bg-sand/40 hover:bg-sand border border-sand-border text-right transition-all group sm:ml-auto w-full"
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
                className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1"
              >
                <span>View All Articles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {displayRelated.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate && onNavigate('blog-detail', { post: item })}
                  className="bg-white rounded-2xl overflow-hidden border border-sand-border hover:shadow-botanical transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-sand">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 bg-forest-deep/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <span className="text-[10px] text-charcoal-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-forest" />
                        <span>{item.date}</span>
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
