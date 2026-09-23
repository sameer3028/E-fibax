import React, { useState } from 'react';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(2); // center user active

  const users = [
    {
      name: 'Dr. R. K. Joshi',
      title: 'Ayurvedic Vaidya, Pune',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'I regularly recommend Fibax Arthobax and Livupchar to my patients. The standardization and purity of herbal extracts produce steady, reliable results without synthetic side effects.',
    },
    {
      name: 'Sunil Malhotra',
      title: 'Verified Buyer, Delhi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'The Triphala Juice and Fp Enzyme completely cured my morning acidity and indigestion. Packaging was pristine and delivered in 2 days by Delhivery.',
    },
    {
      name: 'Gurpreet Singh',
      title: 'Verified Patient, Chandigarh',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'Fibax Pharma represents true Ayurvedic integrity. The Axe Ortho Oil and capsules gave my elderly mother immense relief from joint stiffness within 10 days.',
    },
    {
      name: 'Meenakshi Iyer',
      title: 'Bangalore',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'The Multivitamin syrup is fantastic. Restored my energy after prolonged fever fatigue. It tastes purely herbal and pleasant.',
    },
    {
      name: 'Harish Choudhury',
      title: 'Jaipur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'Authentic Ayurvedic products at very fair prices. The 499 free shipping threshold is very convenient. 5 stars for quality.',
    }
  ];

  const current = users[activeIdx];

  return (
    <section className="py-16 bg-forest-deep text-white text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">
          Over 1,00,000+ People Trust Fibax
        </h2>
        <p className="text-xs sm:text-sm text-sand/70 max-w-md mx-auto mb-8">
          Read genuine experiences from families and wellness seekers across India
        </p>

        {/* Avatar Bubbles Row */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          {users.map((u, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative rounded-full transition-all duration-300 p-0.5 ${
                i === activeIdx
                  ? 'ring-4 ring-gold scale-110'
                  : 'opacity-60 hover:opacity-100 scale-95'
              }`}
            >
              <img
                src={u.avatar}
                alt={u.name}
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Active Testimonial Card */}
        <div className="bg-forest/60 border border-forest-light/40 rounded-3xl p-6 sm:p-8 relative shadow-modal max-w-2xl mx-auto">
          <div className="flex justify-center text-gold mb-3">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>

          <p className="text-sm sm:text-base font-heading italic text-sand leading-relaxed">
            "{current.review}"
          </p>

          <div className="mt-4 pt-3 border-t border-forest-light/40">
            <h4 className="font-bold text-sm text-white">{current.name}</h4>
            <p className="text-xs text-sand/60">{current.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
