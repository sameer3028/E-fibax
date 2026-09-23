import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { ArrowRight, Check } from 'lucide-react';

export function ComboDealsSection({ onExploreCombos }) {
  const { addToCart } = useCart();

  const comboDeals = [
    {
      id: 'combo-1',
      title: 'Joint Relief Duo: Axe Ortho Oil + Syrup',
      mrp: 365,
      salePrice: 299,
      discount: 'SAVE 18%',
      img1: '/uploads/axe-ortho-oil.png',
      img2: '/uploads/axe-ortho-syurp.png',
      features: ['Deep tissue penetration', 'Relieves chronic joint stiffness'],
    },
    {
      id: 'combo-2',
      title: 'Digestive Detox: Triphala Juice + Fp Enzyme',
      mrp: 430,
      salePrice: 349,
      discount: 'SAVE 19%',
      img1: '/uploads/triphla-juice.png',
      img2: '/uploads/fp-enzyme.png',
      features: ['Enhances gut digestion', 'Flushes toxin buildup naturally'],
    },
    {
      id: 'combo-3',
      title: 'Liver Rejuvenator: Livupchar Syrup + Capsules',
      mrp: 495,
      salePrice: 399,
      discount: 'SAVE 19%',
      img1: '/uploads/livupchar.png',
      img2: '/uploads/livupchar.png',
      features: ['Restores healthy SGOT/SGPT', 'Accelerates cellular repair'],
    },
    {
      id: 'combo-4',
      title: 'Diabetes Balance: Diabdic Syrup + Capsules',
      mrp: 709,
      salePrice: 569,
      discount: 'SAVE 20%',
      img1: '/uploads/diabdic-syurp.png',
      img2: '/uploads/diabdic-capsule.png',
      features: ['Supports metabolic balance', 'Karela & Jamun active extracts'],
    },
  ];

  return (
    <section className="py-14 bg-sand-warm border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-forest-deep">
              Combo <span className="text-amber-warm">Deals</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Synergistic formulas designed to be taken together for enhanced relief
            </p>
          </div>
          <button
            onClick={onExploreCombos}
            className="text-xs font-bold text-forest hover:text-forest-light flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 2-Column Grid of Combo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comboDeals.map((deal) => (
            <div
              key={deal.id}
              className="p-4 rounded-2xl bg-white border border-sand-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-forest/30 transition-all"
            >
              {/* Product Packshot Duo */}
              <div className="flex items-center gap-2 flex-shrink-0 bg-sand/60 p-2 rounded-xl">
                <img src={deal.img1} alt={deal.title} className="w-14 h-14 object-contain" />
                <span className="text-xs font-bold text-forest">+</span>
                <img src={deal.img2} alt={deal.title} className="w-14 h-14 object-contain" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className="inline-block text-[10px] font-bold text-crimson bg-crimson/10 px-2 py-0.5 rounded uppercase">
                  {deal.discount}
                </span>
                <h4 className="font-heading font-bold text-sm text-forest-deep mt-1 truncate">
                  {deal.title}
                </h4>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-base font-bold text-forest">
                    {formatPrice(deal.salePrice)}
                  </span>
                  <span className="text-xs text-charcoal-muted line-through">
                    {formatPrice(deal.mrp)}
                  </span>
                </div>
              </div>

              {/* Add CTA */}
              <button
                onClick={() => addToCart({
                  id: deal.id,
                  title: deal.title,
                  salePrice: deal.salePrice,
                  mrp: deal.mrp,
                  dosageForm: 'Combo Deal',
                  volumeWeight: '2-Pack Kit',
                  featuredImage: deal.img1,
                }, 1)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-colors whitespace-nowrap"
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
