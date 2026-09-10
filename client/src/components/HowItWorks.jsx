import React from 'react';
import './HowItWorks.css';
import { FaFileAlt, FaComments, FaRocket } from 'react-icons/fa';

const HowItWorks = () => {
  return (
    <section id="franchise" className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">Start Your Franchise in 3 Easy Steps</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">
              <FaFileAlt />
            </div>
            <h3>Submit Enquiry</h3>
            <p>Fill out the franchise enquiry form with your details and preferred territory.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">
              <FaComments />
            </div>
            <h3>Discuss & Choose</h3>
            <p>Our franchise manager will discuss product range, investment, and monopoly territory with you.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">
              <FaRocket />
            </div>
            <h3>Start Your Business</h3>
            <p>Receive your stock, promotional kit, and start distributing Ayurvedic products in your territory.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
