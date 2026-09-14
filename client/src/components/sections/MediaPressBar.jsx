import React from 'react';

export function MediaPressBar() {
  const publications = [
    { name: 'Forbes India', tag: 'Featured' },
    { name: 'The Hindu', tag: 'Health Desk' },
    { name: 'Hindustan Times', tag: 'Wellness' },
    { name: 'YourStory', tag: 'D2C Leader' },
    { name: 'Financial Express', tag: 'Industry' },
    { name: 'Outlook India', tag: 'Ayurveda' },
  ];

  return (
    <div className="py-8 bg-white border-y border-[#e8e2d5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[11px] font-extrabold text-charcoal-muted uppercase tracking-widest mb-4">
          RECOGNIZED & FEATURED ACROSS NATIONAL MEDIA
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-charcoal-muted opacity-80">
          {publications.map((pub, idx) => (
            <div key={idx} className="font-heading font-extrabold text-sm sm:text-base tracking-wider hover:text-forest transition-colors">
              {pub.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
