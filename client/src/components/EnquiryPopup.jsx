import React, { useEffect } from 'react';
import { FaTimes, FaBriefcaseMedical, FaCheck } from 'react-icons/fa';
import ContactForm from './ContactForm';
import './EnquiryPopup.css';

const EnquiryPopup = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-modal">
        <button className="popup-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        
        <div className="popup-content">
          <div className="popup-left">
            <div className="popup-left-content">
              <FaBriefcaseMedical className="popup-icon" />
              <h2>Get Free Franchise Kit</h2>
              <p>Partner with Fibax Pharma for Ayurvedic PCD Franchise Opportunities in India</p>
              <ul className="popup-benefits">
                <li><FaCheck /> 100% District Monopoly Rights</li>
                <li><FaCheck /> Free Visual Aids & Starter Kit</li>
                <li><FaCheck /> Low Initial Investment (₹30K - ₹50K)</li>
                <li><FaCheck /> 250+ DCGI-Approved Products</li>
              </ul>
            </div>
          </div>
          
          <div className="popup-right">
            <ContactForm 
              title="Quick Franchise Enquiry" 
              onSubmitSuccess={() => setTimeout(onClose, 2500)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryPopup;
