import React, { useEffect, useState, useRef } from 'react';
import { FaClock, FaCapsules, FaUsers, FaHeadset } from 'react-icons/fa';
import './StatsCounter.css';

const statsData = [
  {
    id: 1,
    icon: FaClock,
    target: 10,
    suffix: '+',
    label: 'Years of Experience',
    sublabel: 'Decade of Ayurvedic Trust',
    colorClass: 'stat-pink'
  },
  {
    id: 2,
    icon: FaCapsules,
    target: 250,
    suffix: '+',
    label: 'Approved Products',
    sublabel: 'DCGI & AYUSH Certified',
    colorClass: 'stat-purple'
  },
  {
    id: 3,
    icon: FaUsers,
    target: 1500,
    suffix: '+',
    label: 'Satisfied Customers',
    sublabel: 'Active Franchise Associates',
    colorClass: 'stat-teal'
  },
  {
    id: 4,
    icon: FaHeadset,
    target: 24,
    suffix: '/7',
    label: 'Franchise Support',
    sublabel: 'Dedicated Business Guidance',
    colorClass: 'stat-blue'
  }
];

const StatsCounter = () => {
  const [counts, setCounts] = useState(statsData.map(() => 0));
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          statsData.forEach((stat, index) => {
            let start = 0;
            const duration = 1800;
            const steps = 40;
            const stepTime = duration / steps;
            const increment = stat.target / steps;

            const timer = setInterval(() => {
              start += increment;
              if (start >= stat.target) {
                setCounts(prev => {
                  const updated = [...prev];
                  updated[index] = stat.target;
                  return updated;
                });
                clearInterval(timer);
              } else {
                setCounts(prev => {
                  const updated = [...prev];
                  updated[index] = Math.floor(start);
                  return updated;
                });
              }
            }, stepTime);
          });
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="stats-section" ref={sectionRef}>
      {/* Decorative leafy floral ornament top */}
      <div className="ornament-divider">
        <span>❧ 🌿 ❧</span>
      </div>

      <div className="container">
        <div className="stats-grid">
          {statsData.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className={`stat-card ${stat.colorClass}`}>
                <div className="stat-icon-wrapper">
                  <IconComponent className="stat-icon" />
                </div>
                <div className="stat-number">
                  {counts[idx]}
                  <span className="stat-suffix">{stat.suffix}</span>
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-sublabel">{stat.sublabel}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative leafy floral ornament bottom */}
      <div className="ornament-divider">
        <span>❧ 🌿 ❧</span>
      </div>
    </section>
  );
};

export default StatsCounter;
