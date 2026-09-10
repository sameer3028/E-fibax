import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ShieldCheck, Sparkles, ArrowRight, Star } from 'lucide-react';

export function HeroSection({ onExploreConcerns, onExploreBestsellers }) {
  return (
    <section className="relative bg-gradient-to-b from-sand-warm to-white py-12 md:py-20 overflow-hidden">
      {/* Subtle Botanical Ambient Accents */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-sage-soft/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gold-cream/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Sales Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-soft text-forest text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-sage" />
              <span>Standardized Botanical Extracts • 100% Ayurvedic</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-forest-deep leading-[1.15] tracking-tight">
              Restore Pure Vitality with <span className="text-forest italic">Ancient Herbal Science</span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Fibax Pharma combines sacred Ayurvedic formulations with modern pharmaceutical purity. Targeted natural relief for joint mobility, liver detox, digestive wellness, and daily vitality.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onExploreConcerns}
                className="w-full sm:w-auto font-bold text-base shadow-md flex items-center justify-center gap-2"
              >
                <span>Shop by Health Need</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onExploreBestsellers}
                className="w-full sm:w-auto font-semibold text-base"
              >
                Explore Bestsellers
              </Button>
            </div>

            {/* Social Proof Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal font-medium border-t border-sand-border/80">
              <div className="flex items-center gap-1.5">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span><strong>4.8/5</strong> Rating (15,000+ Families)</span>
              </div>
              <div className="flex items-center gap-1.5 text-forest">
                <ShieldCheck className="h-4 w-4 text-sage" />
                <span>AYUSH Approved & GMP Facility</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Packshot */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md bg-white rounded-3xl p-6 shadow-botanical border border-sand-border">
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="bestseller">FLAGSHIP FORMULA</Badge>
              </div>

              <div className="aspect-[4/3] rounded-2xl bg-sand/60 p-6 flex items-center justify-center mb-4">
                <img
                  src="https://fibaxpharma.com/wp-content/uploads/2025/11/Fibax-Multivita-500ml-2.jpg"
                  alt="Fibax Multivitamin Syrup 500ml"
                  className="h-64 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-sage uppercase tracking-wider block mb-1">
                  Immunity & Energy Booster
                </span>
                <h3 className="font-serif font-bold text-forest-deep text-lg leading-snug">
                  Fibax Multivitamin Syrup (500ml)
                </h3>
                <p className="text-xs text-charcoal-muted mt-1 line-clamp-2">
                  Complete natural recovery tonic for weakness, anemia, post-fever fatigue, and daily stamina.
                </p>

                <div className="mt-4 pt-3 border-t border-sand-border flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-forest">₹345</span>
                    <span className="text-xs text-charcoal-muted line-through ml-2">₹420</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onExploreBestsellers}
                    className="text-xs px-4"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
