import React from 'react';
import { ArrowRight } from 'lucide-react';

export function ShopByCategoriesSection({ onSelectCategory }) {
  const categories = [
    {
      id: 'syrups',
      name: 'Syrups & Tonics',
      sub: 'Herbal Decoctions',
      image: '/categories/syrups.jpg',
      count: '14 Remedies',
    },
    {
      id: 'capsules',
      name: 'Capsules & Vati',
      sub: 'Standardized Extracts',
      image: '/categories/capsules.jpg',
      count: '10 Remedies',
    },
    {
      id: 'juices',
      name: 'Pure Juices (Swaras)',
      sub: 'Cold-Pressed Nutrition',
      image: '/categories/juices.png',
      count: '2 Formulations',
    },
    {
      id: 'powders',
      name: 'Churna & Powders',
      sub: 'Stone-Ground Herbs',
      image: '/categories/powders.png',
      count: '3 Single Herbs',
    },
    {
      id: 'oils',
      name: 'Therapeutic Oils',
      sub: 'Joint & Muscle Relief',
      image: '/categories/oils.avif',
      count: '1 Formulation',
    },
    {
      id: 'skincare',
      name: 'Herbal Soaps & Care',
      sub: 'Neem, Rose, Haldi',
      image: '/categories/skincare.png',
      count: '5 Handcrafted',
    },
  ];

  return (
    <section className="py-14 bg-[#124225] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Shop By Categories
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              Explore authentic traditional formulations by format and method of preparation
            </p>
          </div>
          <button
            onClick={() => onSelectCategory && onSelectCategory('all')}
            className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 6 Category Tiles with Real Product Packshots */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className="group bg-white rounded-2xl sm:rounded-3xl p-4 text-center cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-white/80 hover:border-amber-400/60 flex flex-col items-center justify-between min-h-[190px]"
            >
              {/* Product Packshot Image Thumbnail */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-b from-sand/40 to-white border border-sand-border p-2 mb-3 flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-brand/40 transition-all duration-300 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="w-full">
                <h4 className="font-heading font-extrabold text-forest-deep text-xs sm:text-sm group-hover:text-brand transition-colors leading-snug">
                  {cat.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-charcoal-muted mt-0.5">{cat.sub}</p>
              </div>

              <span className="text-[10px] font-bold text-forest bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2 border border-emerald-100/80 group-hover:bg-brand-soft group-hover:text-brand transition-colors">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
