import React from 'react';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import './FloatingButtons.css';

const FloatingButtons = () => {
  return (
    <>
      {/* Floating Action Buttons */}
      <div className="floating-buttons-container">
        <a 
          href="https://wa.me/918872544458?text=Hello%20Fibax%20Pharma,%20I%20am%20interested%20in%20Ayurvedic%20PCD%20Franchise%20opportunities.%20Please%20share%20product%20list%20and%20monopoly%20terms." 
          className="float-btn whatsapp-btn"
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Chat with Fibax Pharma on WhatsApp"
        >
          <FaWhatsapp />
          <span className="tooltip-text">Chat on WhatsApp</span>
        </a>
        
        <a 
          href="tel:+918872544458" 
          className="float-btn phone-btn"
          aria-label="Call Fibax Pharma"
        >
          <FaPhoneAlt />
          <span className="tooltip-text">Call Sales Manager</span>
        </a>
      </div>

      {/* Sticky Bottom Bar for Mobile Visitors */}
      <div className="mobile-sticky-cta-bar">
        <a href="tel:+918872544458" className="mobile-cta-btn call-action">
          <FaPhoneAlt /> Call Now
        </a>
        <a 
          href="https://wa.me/918872544458?text=Hello%20Fibax%20Pharma,%20I%20am%20interested%20in%20Ayurvedic%20PCD%20Franchise." 
          className="mobile-cta-btn whatsapp-action"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <FaWhatsapp /> WhatsApp Inquiry
        </a>
      </div>
    </>
  );
};

export default FloatingButtons;
