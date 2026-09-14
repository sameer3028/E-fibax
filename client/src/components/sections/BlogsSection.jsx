import React from 'react';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

export function BlogsSection() {
  const articles = [
    {
      id: 1,
      category: 'Liver Detox',
      title: '5 Ayurvedic Herbs to Cleanse Sluggish Liver & Restore SGPT Naturally',
      date: 'Aug 24, 2026',
      readTime: '4 min read',
      colorBlock: 'bg-[#581c87] text-white', // Deep Purple
      tag: 'Liver Health',
      excerpt: 'Discover how Bhumi Amla, Punarnava, and Kutki work in synergy to flush accumulated hepatic toxins and boost enzyme performance.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      category: 'Digestion & Gut',
      title: 'The Golden Ayurvedic Rule for Ending Chronic Acidity and Severe Bloating',
      date: 'Aug 18, 2026',
      readTime: '5 min read',
      colorBlock: 'bg-[#9a3412] text-white', // Rich Terracotta / Rust
      tag: 'Gut Wellness',
      excerpt: 'Mastering Agni: Why drinking chilled water during meals dampens digestive enzymes and how warm carminative swaras restore digestion.',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      category: 'Joint Care',
      title: 'Ayurvedic Remedies for Joint Pain: Ending Morning Stiffness Naturally',
      date: 'Aug 12, 2026',
      readTime: '6 min read',
      colorBlock: 'bg-[#285238] text-white', // Deep Olive Botanical
      tag: 'Pain Recovery',
      excerpt: 'How Shallaki and Guggulu reduce systemic joint inflammation, rebuild synovial fluid, and improve pain-free mobility.',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      category: 'Vitality & Vigor',
      title: 'Ashwagandha vs. Safed Musli: Choosing the Right Vitality Root for Energy',
      date: 'Aug 05, 2026',
      readTime: '4 min read',
      colorBlock: 'bg-[#1e293b] text-white', // Sophisticated Slate / Charcoal
      tag: 'Men Stamina',
      excerpt: 'A complete breakdown of adaptogenic root pharmacology, cortisol regulation, testosterone support, and stamina enhancement.',
      image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&auto=format&fit=crop&q=80',
    }
  ];

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
          <a
            href="#all-blogs"
            className="text-xs font-bold text-forest hover:text-brand flex items-center gap-1.5 transition-colors"
          >
            <span>Read All Articles</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* 4 Colorful Themed Cards Matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-[#e8e2d5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
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
