import React from 'react';
import { FaCheck } from 'react-icons/fa';
import './WhyChooseUs.css';

const WhyChooseUs = ({ onOpenEnquiry }) => {
  return (
    <section id="why-choose" className="why-choose-section">
      <div className="container">
        <div className="why-grid">
          {/* Left: Custom Ayurvedic Collage Image (from Blessings reference) */}
          <div className="why-image-wrapper">
            <div className="why-image-frame">
              <img 
                src="/why-choose-collage.png" 
                alt="Ayurvedic herbs, formulations and mortar pestle" 
                className="why-collage-photo"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="why-content">
            <span className="why-eyebrow">Fibax Pharma</span>
            <h2 className="why-title">Why Choose Us</h2>
            <p className="why-text">
              <strong>Best Ayurveda Company In India</strong> – Fibax Pharma has earned immense trust and reputation across India by manufacturing and supplying a comprehensive, scientifically-validated range of Ayurvedic medicines. Our formulations possess exceptional traits such as complete safety, extended shelf life, tamper-proof induction packaging, and high therapeutic efficacy.
            </p>
            <p className="why-text">
              By partnering with Fibax Pharma, you gain access to an established brand, competitive PTR/PTS pricing, zero hidden charges, and continuous marketing guidance to establish a dominant presence in your designated territory.
            </p>

            <div className="why-checklist">
              <div className="checklist-col">
                <div className="check-item">
                  <span className="check-bullet"><FaCheck /></span>
                  <span>100% Ayurvedic</span>
                </div>
                <div className="check-item">
                  <span className="check-bullet"><FaCheck /></span>
                  <span>Self Formulation</span>
                </div>
              </div>

              <div className="checklist-col">
                <div className="check-item">
                  <span className="check-bullet"><FaCheck /></span>
                  <span>Hereditary Recipe</span>
                </div>
                <div className="check-item">
                  <span className="check-bullet"><FaCheck /></span>
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>

            <button 
              className="btn-more-about"
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
            >
              MORE ABOUT US
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
