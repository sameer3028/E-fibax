import React from 'react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../lib/utils';
import { ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';

export function CombosSection() {
  const { addToCart } = useCart();

  const combos = [
    {
      id: 'combo-joint-relief',
      title: 'Complete Joint & Arthritis Relief Course',
      subtitle: 'Triple Internal & External Anti-Inflammatory Therapy',
      itemsIncluded: ['Axe Ortho Pain Relief Oil (60ml)', 'Axe Ortho Capsules (30 Caps)', 'Axe Ortho Herbal Syrup (200ml)'],
      mrp: 730,
      salePrice: 599,
      discount: 18,
      image: 'https://fibaxpharma.com/wp-content/uploads/2023/10/arthobax-1000-pxl-2.png',
      badge: 'SAVE 18%',
      benefits: ['Rapid synovial lubrication', 'Eases morning stiffness', 'Relieves uric acid inflammation'],
    },
    {
      id: 'combo-liver-detox',
      title: 'Complete Hepatic Detox & Digestive Cleanse',
      subtitle: 'Liver Enzyme Rejuvenation + Colon Flush',
      itemsIncluded: ['Livupchar Liver Care Syrup (200ml)', 'Livupchar Liver Detox Capsules (30s)', 'Fibax Triphala Juice (500ml)'],
      mrp: 744,
      salePrice: 619,
      discount: 17,
      image: 'https://fibaxpharma.com/wp-content/uploads/2025/11/Fibax-Multivita-500ml-2.jpg',
      badge: 'SAVE 17%',
      benefits: ['Balances SGOT/SGPT enzymes', 'Relieves chronic abdominal gas', 'Detoxifies sluggish metabolism'],
    },
    {
      id: 'combo-diabetic-care',
      title: 'Glycemic Support & Blood Sugar Balance Pack',
      subtitle: 'Metabolic Support Kit for Healthy Insulin Response',
      itemsIncluded: ['Diabdic Ayurvedic Syrup (300ml)', 'Diabdic Sugar Balance Capsules (30s)', 'Neem Karela Jamun Juice (500ml)'],
      mrp: 949,
      salePrice: 799,
      discount: 16,
      image: 'https://fibaxpharma.com/wp-content/uploads/2023/10/arthobax-1000-pxl-2.png',
      badge: 'SAVE 16%',
      benefits: ['Promotes healthy glucose utilization', 'Regulates sugar cravings', 'Pure Karela & Jamun actives'],
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="bestseller" className="mb-2">AOV VALUE MULTIPLIERS</Badge>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-forest-deep">
            Synergistic Ayurvedic Course Packs
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
            Ancient Ayurveda works best when internal systemic formulas are paired with targeted topical treatments. Save up to 20% on complete course kits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="rounded-3xl border border-sand-border bg-sand-warm p-6 flex flex-col justify-between hover:shadow-botanical hover:border-forest/30 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="discount">{combo.badge}</Badge>
                  <span className="text-[11px] font-bold text-forest">Free Delivery Unlocked</span>
                </div>

                <div className="aspect-[4/3] rounded-2xl bg-white p-4 mb-4 flex items-center justify-center">
                  <img
                    src={combo.image}
                    alt={combo.title}
                    className="h-44 object-contain"
                  />
                </div>

                <h3 className="font-heading font-bold text-lg text-forest-deep leading-snug">
                  {combo.title}
                </h3>
                <p className="text-xs text-sage-dark font-medium mt-1">
                  {combo.subtitle}
                </p>

                {/* Items included */}
                <div className="mt-4 pt-3 border-t border-sand-border/80">
                  <p className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider mb-2">
                    Course Inclusions:
                  </p>
                  <ul className="space-y-1.5 text-xs text-charcoal">
                    {combo.itemsIncluded.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-forest flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pricing & Add */}
              <div className="mt-6 pt-4 border-t border-sand-border flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-forest-deep">
                      {formatPrice(combo.salePrice)}
                    </span>
                    <span className="text-xs text-charcoal-muted line-through">
                      {formatPrice(combo.mrp)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Save {formatPrice(combo.mrp - combo.salePrice)} instantly
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => addToCart({
                    id: combo.id,
                    title: combo.title,
                    salePrice: combo.salePrice,
                    mrp: combo.mrp,
                    volumeWeight: '3-Item Course',
                    dosageForm: 'Combo Kit',
                    featuredImage: combo.image,
                  }, 1)}
                  className="font-bold text-xs px-4"
                >
                  Buy Course
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
