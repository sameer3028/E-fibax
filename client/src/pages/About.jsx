import React from 'react';
import {
  ShieldCheck,
  Award,
  Leaf,
  Building2,
  CheckCircle2,
  Factory,
  Microscope,
  Target,
  Eye,
  HeartPulse,
  Users,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MANUFACTURING_STATS } from '../data/industries';

export function About({ onNavigate }) {
  return (
    <div className="w-full bg-white">
      {/* 1. Page Hero Banner */}
      <section className="relative py-20 bg-forest-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf/20 text-leaf border border-leaf/30 text-xs font-bold uppercase tracking-wider mb-4">
              <Leaf className="h-3.5 w-3.5" />
              <span>Authentic Ayurvedic Heritage</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Pioneering Pure Ayurvedic Healthcare & Natural Wellness
            </h1>
            <p className="mt-4 text-sm sm:text-base text-sand-warm/80 leading-relaxed">
              Fibax Ayurveda is a premier herbal wellness brand dedicated to formulating authentic, research-driven botanical remedies. Backed by WHO-GMP certified infrastructure, we deliver pure, chemical-free healthcare solutions directly to households across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
              <button
                onClick={() => onNavigate && onNavigate('products')}
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-orange-glow transition-all flex items-center gap-2"
              >
                <span>Browse 250+ Formulations</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate && onNavigate('contact')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Consult Ayurvedic Doctor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistical Milestone Ribbon */}
      <section className="py-10 bg-sand border-b border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {MANUFACTURING_STATS.map((stat, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-forest">{stat.value}</div>
                <div className="text-xs font-bold text-charcoal mt-1">{stat.label}</div>
                <div className="text-[11px] text-charcoal-subtle mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Company Story & Botanical Philosophy */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-3">
                Our Genesis & Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-deep leading-tight">
                Ancient Ayurvedic Wisdom Validated by Modern Pharmaceutical Precision
              </h2>
              
              <div className="mt-5 space-y-4 text-sm text-charcoal-muted leading-relaxed">
                <p>
                  Rooted in the timeless principles of the Atharva Veda and Charaka Samhita, Fibax Pharma was founded with a singular conviction: genuine healing occurs when potent botanicals are sourced from their native habitats and formulated with modern analytical accuracy.
                </p>
                <p>
                  While conventional commercial formulations often compromise on active phytochemical concentrations, Fibax utilizes standardized herbal extracts with verified bioactive markers. Whether it is Curcumin in our joint care products, Gymnemic acids in diabetic care, or Silymarin & Kutki in our liver tonics, we guarantee therapeutic potency in every single dose.
                </p>
                <p>
                  Today, Fibax Ayurveda stands as a trusted wellness brand chosen by over 50,000 families, practitioners, and wellness seekers across all 28 states of India for authentic holistic healing.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 text-xs font-bold text-forest">
                  <CheckCircle2 className="h-4 w-4 text-leaf" />
                  <span>100% Herbal Extraction</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-forest">
                  <CheckCircle2 className="h-4 w-4 text-leaf" />
                  <span>Zero Heavy Metal Toxicity</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-forest">
                  <CheckCircle2 className="h-4 w-4 text-leaf" />
                  <span>WHO-GMP & ISO Quality</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-forest">
                  <CheckCircle2 className="h-4 w-4 text-leaf" />
                  <span>100% Safe, Pure & Chemical-Free</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-botanical border border-sand-border">
                <img
                  src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop"
                  alt="Fibax Pharma Advanced Ayurvedic Laboratory"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-forest text-white p-5 rounded-2xl shadow-modal border border-white/20 max-w-xs hidden sm:block">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Quality Benchmarks
                  </span>
                </div>
                <p className="text-xs text-sand-warm mt-1">
                  100% Batch Consistency Verified by High-Performance Liquid Chromatography (HPLC).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Mission, Vision, and Values Cards */}
      <section className="py-16 bg-sand border-y border-sand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-2">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-deep">
              Our Mission, Vision & Quality Commitment
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
              Upholding the highest standards of integrity, scientific validation, and partner profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl border border-sand-border shadow-subtle hover:shadow-botanical transition-all">
              <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-5">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-deep mb-2">OUR MISSION</h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                To formulate, standardize, and distribute 100% safe, non-toxic, and therapeutically efficacious Ayurvedic medicines that make authentic holistic healthcare accessible and affordable to every Indian household.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl border border-sand-border shadow-subtle hover:shadow-botanical transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-5">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-deep mb-2">OUR VISION</h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                To stand as India’s most trusted direct-to-consumer Ayurvedic wellness brand, making pure, chemical-free herbal healthcare accessible, transparent, and transformative for every household.
              </p>
            </div>

            {/* Quality Assurance */}
            <div className="bg-white p-8 rounded-2xl border border-sand-border shadow-subtle hover:shadow-botanical transition-all">
              <div className="w-12 h-12 rounded-xl bg-leaf/20 text-leaf-dark flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-forest-deep mb-2">QUALITY ASSURANCE</h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                Adhering strictly to WHO-GMP and Good Laboratory Practices (GLP). Every formulation batch passes strict chemical characterization, disintegration testing, microbial limits, and heavy metal screenings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Infrastructure & Manufacturing Capabilities */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-sand border border-sand-border">
                  <Factory className="h-6 w-6 text-forest mb-2" />
                  <h4 className="text-sm font-bold text-forest-deep">Automated Liquid Plant</h4>
                  <p className="text-xs text-charcoal-muted mt-1">High-speed rotary filling and hermetic capping lines for syrups & juices.</p>
                </div>
                <div className="p-5 rounded-2xl bg-sand border border-sand-border">
                  <Microscope className="h-6 w-6 text-brand mb-2" />
                  <h4 className="text-sm font-bold text-forest-deep">Analytical QC Lab</h4>
                  <p className="text-xs text-charcoal-muted mt-1">Fully equipped phytochemical, microbiological & stability chambers.</p>
                </div>
                <div className="p-5 rounded-2xl bg-sand border border-sand-border">
                  <Building2 className="h-6 w-6 text-leaf-dark mb-2" />
                  <h4 className="text-sm font-bold text-forest-deep">Solid Dosage Suite</h4>
                  <p className="text-xs text-charcoal-muted mt-1">Class 100,000 clean rooms for rotary tablet presses and capsule encapsulation.</p>
                </div>
                <div className="p-5 rounded-2xl bg-sand border border-sand-border">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 mb-2" />
                  <h4 className="text-sm font-bold text-forest-deep">Alu-Alu & Blistering</h4>
                  <p className="text-xs text-charcoal-muted mt-1">Climate-controlled blister packaging ensuring maximum shelf stability.</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold text-forest uppercase tracking-widest bg-forest/10 px-3 py-1 rounded-full inline-block mb-3">
                High-Tech Infrastructure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-deep leading-tight">
                25,000+ Sq. Ft. World-Class Manufacturing Plant
              </h2>
              <p className="mt-4 text-sm text-charcoal-muted leading-relaxed">
                Located with premier logistics access, Fibax Pharma’s manufacturing plants are engineered to exceed DCGI and Ministry of AYUSH norms. Clean room environments, automated HEPA air handling systems, and untouched-by-hand filling protocols safeguard the integrity of every herbal extract.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => onNavigate && onNavigate('products')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-forest-light group"
                >
                  <span>Explore Our Certified Herbal Formulations</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Certifications Strip */}
      <section className="py-12 bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Our Certified Quality Accreditations</h3>
          <p className="text-xs text-sand-warm/70 max-w-xl mx-auto mb-8">
            Every product manufactured and marketed by Fibax Pharma is licensed and compliant with national regulatory statutory bodies.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              WHO-GMP Certified
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              ISO 9001:2015 Accredited
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              Ministry of AYUSH Licensed
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              DCGI Approved Formulations
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              GLP Compliant Laboratory
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold">
              100% Vegetarian & Halal Compliant
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call-to-Action */}
      <section className="py-16 bg-sand text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-forest-deep">
            Begin Your Natural Ayurvedic Healing Journey Today
          </h2>
          <p className="text-sm text-charcoal-muted mt-3 max-w-2xl mx-auto">
            Experience the revitalizing power of authentic herbs. Get free personalized dosage consultation, lab-tested classical formulations, and express doorstep delivery across India.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate && onNavigate('products')}
              className="px-8 py-3.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-hover shadow-orange-glow transition-all flex items-center gap-2"
            >
              <span>Shop All Formulations</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('contact')}
              className="px-8 py-3.5 rounded-xl bg-white text-forest border border-sand-border font-bold text-sm hover:bg-sand-warm shadow-xs transition-all"
            >
              Contact Support &amp; Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
