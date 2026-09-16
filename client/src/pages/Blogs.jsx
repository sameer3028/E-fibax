import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../data/blogs';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Share2,
  X,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

const POSTS_PER_PAGE = 20;

export function Blogs({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeArticle, setActiveArticle] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const topListRef = useRef(null);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tag.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Handle page change with smooth scroll to top of list
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (topListRef.current) {
      topListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle category change
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Copy share link
  const handleShare = (article) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full bg-[#fbf9f4] min-h-screen">
      {/* 1. Hero Header Banner */}
      <section className="bg-gradient-to-br from-forest-deep via-forest to-[#052113] text-white py-14 sm:py-18 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-300 font-bold text-xs uppercase tracking-widest border border-white/15 mb-4"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Fibax Ayurvedic Health Journal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto"
          >
            Evidence-Based Insights &{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Ayurvedic Wisdom
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sand-warm/80 text-sm sm:text-base max-w-2xl mx-auto mt-3.5 leading-relaxed"
          >
            Explore clinical formulations, seasonal Dinacharya protocols, herbal pharmacology, and doctor-approved remedies written by certified BAMS vaidyas.
          </motion.p>

          {/* Quick Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by health concern, herb (e.g. Ashwagandha, Liver, Acidity)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-charcoal text-sm placeholder-charcoal-muted/70 focus:outline-none focus:ring-2 focus:ring-brand shadow-lg border border-white/20"
              />
              <Search className="h-5 w-5 text-forest absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Category Filters Strip */}
      <section className="bg-white border-b border-sand-border sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {BLOG_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-forest text-white shadow-sm font-bold scale-102'
                      : 'bg-sand hover:bg-sand-border/70 text-charcoal hover:text-forest'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Articles Grid Container */}
      <div ref={topListRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Results Counter & Active Filter Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-sand-border gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-forest-deep text-lg sm:text-xl">
              All Articles
            </span>
            <span className="text-xs font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Post' : 'Posts'}
            </span>
            {selectedCategory !== 'All' && (
              <span className="text-xs text-charcoal-muted">
                in <span className="font-semibold text-charcoal">"{selectedCategory}"</span>
              </span>
            )}
          </div>

          {/* Showing X - Y of Z */}
          {filteredPosts.length > 0 && (
            <div className="text-xs font-medium text-charcoal-muted">
              Showing{' '}
              <span className="font-bold text-charcoal">{startIndex + 1}</span>
              {' – '}
              <span className="font-bold text-charcoal">
                {Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)}
              </span>{' '}
              of <span className="font-bold text-charcoal">{filteredPosts.length}</span> articles
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-sand-border p-8">
            <BookOpen className="h-12 w-12 text-forest/40 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-forest-deep mb-1">
              No matching articles found
            </h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto mb-5">
              We couldn't find any articles matching "{searchQuery}". Try searching for another herb or selecting "All" categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-deep transition-all"
            >
              Reset Filters & View All
            </button>
          </div>
        )}

        {/* Blog Post Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPosts.map((post) => (
            <motion.article
              key={post.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveArticle(post)}
              className="group bg-white rounded-2xl overflow-hidden border border-sand-border shadow-xs hover:shadow-botanical transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Header colored banner */}
                <div className={`px-4 py-2.5 ${post.colorBlock} flex items-center justify-between`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    {post.tag}
                  </span>
                  <span className="text-[10px] font-semibold opacity-90 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                {/* Article Image Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-forest-deep/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                </div>

                {/* Article Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-subtle">
                    <Calendar className="h-3 w-3 text-forest" />
                    <span>{post.date}</span>
                  </div>

                  <h3 className="font-heading font-bold text-forest-deep group-hover:text-brand text-sm leading-snug line-clamp-2 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-3 font-sans">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer: Author and Read Button */}
              <div className="px-4 py-3 bg-sand/40 border-t border-sand-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-sand-border flex-shrink-0"
                  />
                  <span className="text-[11px] font-semibold text-charcoal truncate">
                    {post.author.name.split(',')[0]}
                  </span>
                </div>

                <span className="text-xs font-bold text-brand group-hover:text-brand-hover inline-flex items-center gap-1 flex-shrink-0">
                  <span>Read</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* 4. Pagination (Rendered ONLY if total posts > 20 on page) */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 border-t border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-charcoal-muted order-2 sm:order-1">
              Showing page <span className="font-bold text-forest">{currentPage}</span> of{' '}
              <span className="font-bold text-forest">{totalPages}</span> ({filteredPosts.length} total articles)
            </p>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === 1
                    ? 'bg-sand/60 text-charcoal-muted/50 cursor-not-allowed border border-sand-border/50'
                    : 'bg-white text-forest hover:bg-forest hover:text-white border border-sand-border shadow-xs'
                }`}
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand text-white shadow-md scale-105'
                          : 'bg-white text-charcoal hover:bg-sand border border-sand-border'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === totalPages
                    ? 'bg-sand/60 text-charcoal-muted/50 cursor-not-allowed border border-sand-border/50'
                    : 'bg-white text-forest hover:bg-forest hover:text-white border border-sand-border shadow-xs'
                }`}
                aria-label="Next Page"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Full Article Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white rounded-3xl shadow-2xl border border-sand-border max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10"
            >
              {/* Top Banner Image */}
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-forest">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Category & Tag on Image */}
                <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-2">
                  <span className="bg-brand text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                    {activeArticle.tag}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeArticle.category}
                  </span>
                </div>
              </div>

              {/* Article Content Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Meta info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sand-border text-xs text-charcoal-muted">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeArticle.author.avatar}
                      alt={activeArticle.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-sand-border"
                    />
                    <div>
                      <h4 className="font-bold text-forest-deep text-sm">{activeArticle.author.name}</h4>
                      <p className="text-[11px] text-charcoal-muted">{activeArticle.author.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-forest" />
                      <span>{activeArticle.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-forest" />
                      <span>{activeArticle.readTime}</span>
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-forest-deep leading-tight">
                  {activeArticle.title}
                </h2>

                {/* Lead Excerpt */}
                <p className="text-sm font-medium text-forest bg-forest/5 p-4 rounded-2xl border-l-4 border-forest leading-relaxed">
                  {activeArticle.excerpt}
                </p>

                {/* Full Markdown-style text */}
                <div className="prose prose-sm max-w-none text-charcoal leading-relaxed whitespace-pre-line space-y-4 font-sans">
                  {activeArticle.content}
                </div>

                {/* Action Bar */}
                <div className="pt-6 border-t border-sand-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => handleShare(activeArticle)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-all w-full sm:w-auto justify-center"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share This Guide'}</span>
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveArticle(null);
                        if (onNavigate) onNavigate('products');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-glow transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <span>Explore Related Remedies</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
