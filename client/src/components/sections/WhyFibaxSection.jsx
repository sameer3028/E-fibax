import React from 'react';
import { ShieldCheck, Leaf, FlaskConical, Award } from 'lucide-react';

export function WhyFibaxSection() {
  const features = [
    {
      icon: Leaf,
      title: '100% Pure Botanical Extracts',
      desc: 'Formulated exclusively with wildcrafted, pesticide-free Ayurvedic herbs standardized for maximum bioactive potency.',
    },
    {
      icon: FlaskConical,
      title: 'Pharmaceutical Precision',
      desc: 'Manufactured in certified GMP facilities adhering to stringent Ayush pharmacopeial standards and heavy-metal testing.',
    },
    {
      icon: Award,
      title: 'Decades of Heritage',
      desc: 'Over 35 proprietary herbal remedies perfected across decades of clinical validation and patient satisfaction.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Chemical Fillers',
      desc: 'Free from synthetic binders, artificial sweeteners, parabens, and hazardous additives for worry-free daily wellness.',
    },
  ];

  return (
    <section id="about" className="py-16 bg-sand-warm border-b border-sand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-sage uppercase tracking-widest block mb-1.5">
            The Fibax Promise
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-forest-deep">
            Why Thousands Choose Fibax Pharma
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
            Bridging the timeless wisdom of traditional Charaka Samhita with modern pharmacological rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-sand-border shadow-subtle text-center hover:border-sage/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-sage-soft text-forest mx-auto flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-heading font-bold text-base text-forest-deep mb-2">
                  {feat.title}
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
