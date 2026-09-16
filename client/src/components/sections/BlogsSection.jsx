import React from 'react';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blogs';

export function BlogsSection({ onNavigate }) {
  const articles = BLOG_POSTS.slice(0, 4);

  const handleOpenBlogs = () => {
    if (onNavigate) {
      onNavigate('blogs');
    } else {
      window.location.hash = 'blogs';
    }
  };

  return (
    <section className="py-14 bg-[#fbf9f4] border-b border-[#e8e2d5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider mb-1">
              <BookOpen className="h-3.5 w-3.5 text-forest" />
              <span>Ayurvedic Wellness Journal</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep tracking-tight">
              Evidence-Based <span className="text-brand">Herbal Insights</span>
            </h2>
          </div>
          <button
            onClick={handleOpenBlogs}
            className="text-xs font-bold text-forest hover:text-brand flex items-center gap-1.5 transition-colors group"
          >
            <span>Read All Articles</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Colorful Themed Cards Matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((item) => (
            <article
              key={item.id}
              onClick={handleOpenBlogs}
              className="group bg-white rounded-2xl overflow-hidden border border-[#e8e2d5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Colorful Block Header */}
                <div className={`p-4 ${item.colorBlock} flex items-center justify-between`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                  <span className="text-[10px] opacity-80">{item.readTime}</span>
                </div>

                {/* Article Image Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-sand">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Article Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-charcoal-muted">
                    <Calendar className="h-3 w-3 text-forest" />
                    <span>{item.date}</span>
                  </div>

                  <h4 className="font-heading font-extrabold text-xs sm:text-sm text-charcoal group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-charcoal-muted line-clamp-3 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              {/* Read More Footer */}
              <div className="p-4 pt-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-forest group-hover:text-brand transition-colors">
                  <span>Read Full Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
