import React from 'react';
import { FaCheckCircle, FaLeaf } from 'react-icons/fa';
import './FranchiseOpportunity.css';

const FranchiseOpportunity = ({ onOpenEnquiry }) => {
  return (
    <section id="franchise" className="franchise-opp-section">
      <div className="container">
        <div className="opp-grid">
          {/* Left: Botanical Collage with Center Badge */}
          <div className="collage-wrapper">
            <div className="botanical-collage">
              <div className="collage-tile tile-1">
                <img 
                  src="/herb-1.jpg" 
                  alt="Fresh Ayurvedic herbs and botanical leaves" 
                />
              </div>
              <div className="collage-tile tile-2">
                <img 
                  src="/herb-2.jpg" 
                  alt="Pure turmeric powder and Ayurvedic spices" 
                />
              </div>
              <div className="collage-tile tile-3">
                <img 
                  src="/herb-3.jpg" 
                  alt="Traditional Ayurvedic raw botanicals and roots" 
                />
              </div>
              <div className="collage-tile tile-4">
                <img 
                  src="/herb-4.jpg" 
                  alt="Herbal essential oils and extracts" 
                />
              </div>

              {/* Center Floating Badge */}
              <div className="center-floating-badge">
                <FaLeaf className="badge-leaf-icon" />
                <h4>Power Packed with Ayurveda</h4>
                <p>Pure • Potent • Proven</p>
              </div>
            </div>
          </div>

          {/* Right: Opportunity Content */}
          <div className="opp-content">
            <span className="opp-eyebrow">Fibax Pharma Opportunity</span>
            <h2 className="opp-heading">AYURVEDIC PCD PHARMA FRANCHISE OPPORTUNITY</h2>
            <p className="opp-desc">
              Fibax Pharma is an ISO 9001:2015 & WHO-GMP Certified Ayurvedic Franchise Company in India. We offer highly lucrative, low-risk business opportunities for medical representatives, stockists, and entrepreneurs looking to start their own Ayurvedic medicine distribution business with complete territory monopoly protection.
            </p>
            <p className="opp-desc">
              With an extensive catalog of 250+ products, attractive packaging, competitive net rates, and timely order fulfillment, our franchise associates enjoy sustainable growth and high profit margins from day one.
            </p>

            <div className="opp-benefits-grid">
              <div className="opp-benefit-item">
                <FaCheckCircle className="opp-check" />
                <span>100% Monopoly Rights</span>
              </div>
              <div className="opp-benefit-item">
                <FaCheckCircle className="opp-check" />
                <span>High Profit Margins</span>
              </div>
              <div className="opp-benefit-item">
                <FaCheckCircle className="opp-check" />
                <span>Free Visual Aids & Kit</span>
              </div>
              <div className="opp-benefit-item">
                <FaCheckCircle className="opp-check" />
                <span>Low Investment Threshold</span>
              </div>
            </div>

            <button 
              className="btn-enquire-opp"
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
            >
              ENQUIRE NOW
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FranchiseOpportunity;
