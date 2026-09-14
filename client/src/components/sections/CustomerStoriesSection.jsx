import React from 'react';
import { Play, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

export function CustomerStoriesSection({ onSelectProduct }) {
  const stories = [
    {
      id: '1',
      customerName: 'Pooja Sharma',
      city: 'Delhi',
      concern: 'Knee & Joint Pain',
      duration: '1:12',
      thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
      productTitle: 'Axe Ortho Pain Relief Syrup 200ml',
      price: 210,
      quote: 'Severe knee pain had stopped my morning walks. After 3 weeks of Axe Ortho, stiffness is gone!',
    },
    {
      id: '2',
      customerName: 'Rohit Verma',
      city: 'Jaipur',
      concern: 'Fatty Liver & Digestion',
      duration: '0:55',
      thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
      productTitle: 'Livupchar Liver Detox Syrup',
      price: 229,
      quote: 'Enzymes and SGPT levels normalized naturally. 100% natural and effective.',
    },
    {
      id: '3',
      customerName: 'Meenakshi Iyer',
      city: 'Bangalore',
      concern: 'Daily Digestion & Acidity',
      duration: '1:45',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      productTitle: 'Fp Enzyme Gut Syrup 200ml',
      price: 150,
      quote: 'No more bloating or acidity after dinner. Fibax enzyme syrup worked wonders.',
    },
    {
      id: '4',
      customerName: 'Sanjay Deshmukh',
      city: 'Pune',
      concern: 'Blood Sugar Balance',
      duration: '1:05',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      productTitle: 'Diabdic Sugar Care Syrup',
      price: 290,
      quote: 'My fasting sugar stabilized without synthetic pills. True Ayurvedic blessing.',
    },
    {
      id: '5',
      customerName: 'Ananya Sen',
      city: 'Kolkata',
      concern: 'Immunity & Stamina',
      duration: '1:20',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      productTitle: 'Fibax Ashwagandha Powder 100gm',
      price: 230,
      quote: 'Noticeable boost in my daily energy levels and stress recovery. Highly recommend!',
    }
  ];

  return (
    <section className="py-14 bg-[#fbf9f4] border-b border-[#e8e2d5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Real Customer Stories</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep tracking-tight">
              Watch Real Patient <span className="text-brand">Recoveries</span>
            </h2>
          </div>
          <span className="text-xs text-charcoal-muted font-medium hidden sm:inline">
            Over 1,00,000+ happy verified customers across India
          </span>
        </div>

        {/* 5 Vertical Reel Cards (9:16 aspect ratio) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group rounded-2xl overflow-hidden bg-white border border-[#e8e2d5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Video Thumbnail with Play Button Overlay */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-forest">
                <img
                  src={story.thumbnail}
                  alt={story.customerName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Video Duration Badge */}
                <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {story.duration}
                </span>

                {/* Customer Info Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="flex items-center gap-1">
                    <span className="font-heading font-bold text-xs">{story.customerName}</span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 fill-emerald-400 text-forest" />
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium">{story.concern} • {story.city}</div>
                </div>
              </div>

              {/* Bottom Remedy Snippet */}
              <div className="p-3 bg-white space-y-2">
                <p className="text-[11px] text-charcoal-muted line-clamp-2 italic font-sans">
                  "{story.quote}"
                </p>
                <div className="pt-1 border-t border-sand-border flex items-center justify-between">
                  <span className="text-xs font-bold text-forest">{formatPrice(story.price)}</span>
                  <button
                    onClick={() => onSelectProduct && onSelectProduct({ title: story.productTitle, salePrice: story.price })}
                    className="px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-hover text-white text-[10px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>Shop</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
