import React from 'react';
import { FaPlay, FaIndustry, FaCheck } from 'react-icons/fa';
import './CompanyIntro.css';

const CompanyIntro = ({ onOpenEnquiry }) => {
  return (
    <section id="about" className="company-intro-section">
      <div className="container">
        <div className="intro-grid">
          {/* Left: Text Description */}
          <div className="intro-text-col">
            <h2 className="intro-title">Fibax Pharma</h2>
            <h3 className="intro-subtitle">Top Ayurvedic PCD Company in India</h3>
            <p className="intro-paragraph">
              Fibax Pharma is a premier Ayurvedic pharmaceutical company with a rich legacy in formulating pure, safe, and effective herbal medicines. We are dedicated to providing entrepreneurs, medical representatives, and pharma distributors with lucrative Ayurvedic PCD Franchise opportunities across India.
            </p>
            <p className="intro-paragraph">
              Our state-of-the-art WHO-GMP compliant manufacturing facilities follow stringent quality benchmarks. With 250+ DCGI-approved formulations spanning syrups, capsules, tablets, juices, powders, and personal care products, we empower our franchise associates with 100% district monopoly rights and comprehensive marketing collateral.
            </p>
            <div className="intro-bullet-points">
              <div className="intro-bullet"><FaCheck className="check-icon" /> 100% Natural Herbal Extraction</div>
              <div className="intro-bullet"><FaCheck className="check-icon" /> WHO-GMP & ISO 9001 Certified</div>
              <div className="intro-bullet"><FaCheck className="check-icon" /> 24-48 Hours Fast Dispatch</div>
              <div className="intro-bullet"><FaCheck className="check-icon" /> Complete Free Visual Aids & Kit</div>
            </div>
          </div>

          {/* Right: Modern Lab / Plant Visual */}
          <div className="intro-video-col">
            <div className="plant-media-card">
              <img 
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1000&auto=format&fit=crop" 
                alt="Fibax Pharma Ayurvedic Manufacturing Facility" 
                className="plant-media-img"
              />
              <div className="plant-media-overlay">
                <div className="play-pulse-btn" onClick={() => onOpenEnquiry && onOpenEnquiry()}>
                  <FaPlay className="play-icon" />
                </div>
                <div className="plant-caption">
                  <FaIndustry className="caption-icon" />
                  <span>WHO-GMP Certified Automated Manufacturing Facility</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyIntro;
