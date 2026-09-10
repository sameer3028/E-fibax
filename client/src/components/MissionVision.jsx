import React from 'react';
import { FaBullseye, FaEye, FaAward } from 'react-icons/fa';
import './MissionVision.css';

const MissionVision = () => {
  return (
    <section className="mission-vision-section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-eyebrow">Fibax Pharma</span>
          <h2 className="section-main-title">What Makes Us Best</h2>
        </div>

        <div className="mission-grid">
          {/* Card 1: Our Mission */}
          <div className="mv-card card-mission">
            <div className="mv-icon-circle icon-green">
              <FaBullseye />
            </div>
            <h3 className="mv-title">OUR MISSION</h3>
            <p className="mv-text">
              To formulate and supply 100% natural, scientifically-validated Ayurvedic medicines that deliver holistic healing without side effects. We are committed to making authentic herbal wellness affordable, accessible, and dependable for every Indian household.
            </p>
          </div>

          {/* Card 2: Our Vision */}
          <div className="mv-card card-vision">
            <div className="mv-icon-circle icon-gold">
              <FaEye />
            </div>
            <h3 className="mv-title">OUR VISION</h3>
            <p className="mv-text">
              To establish Fibax Pharma as India’s leading and most admired Ayurvedic PCD Pharma Franchise network. We aim to empower distributors, medical representatives, and business owners with sustainable, high-margin, monopoly-protected healthcare businesses.
            </p>
          </div>

          {/* Card 3: Quality Assurance */}
          <div className="mv-card card-quality">
            <div className="mv-icon-circle icon-purple">
              <FaAward />
            </div>
            <h3 className="mv-title">QUALITY ASSURANCE</h3>
            <p className="mv-text">
              Our automated WHO-GMP manufacturing facilities adhere to Good Laboratory Practices (GLP). Every batch undergoes rigorous microbiological, heavy metal, and phytochemical screening to ensure compliance with Ministry of AYUSH and DCGI statutory benchmarks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
