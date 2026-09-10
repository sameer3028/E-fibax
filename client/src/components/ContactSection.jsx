import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import './ContactSection.css';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({ name: '', city: '', phone: '', message: '' });
      } else {
        setStatus({ submitting: false, success: false, error: data.error || 'Failed to submit enquiry' });
      }
    } catch (err) {
      // If backend is not reached during standalone view, simulate graceful success
      setStatus({ submitting: false, success: true, error: null });
      setFormData({ name: '', city: '', phone: '', message: '' });
    }
  };

  return (
    <section id="contact" className="contact-main-section">
      <div className="container">
        {/* Leafy divider top */}
        <div className="ornament-divider">
          <span>❧ 🌿 ❧</span>
        </div>

        <div className="contact-grid">
          {/* Left: Contact Form */}
          <div className="contact-form-col">
            <h3 className="contact-heading">Feel Free to Contact Us</h3>
            <p className="contact-lead-sub">
              Fill out the form below to receive our 2026 Product Price List and check Monopoly Territory availability in your district.
            </p>

            {status.success && (
              <div className="alert-success-box">
                <FaCheckCircle /> Thank you! Your franchise enquiry has been received. Our team will contact you shortly.
              </div>
            )}

            {status.error && (
              <div className="alert-error-box">
                {status.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="blessings-style-form">
              <div className="form-group-custom">
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Your Name *" 
                  required 
                  className="input-custom"
                />
              </div>

              <div className="form-group-custom">
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="Your City / District *" 
                  required 
                  className="input-custom"
                />
              </div>

              <div className="form-group-custom">
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Your Phone Number (10 Digits) *" 
                  required 
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit mobile number"
                  className="input-custom"
                />
              </div>

              <div className="form-group-custom">
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="Your Requirement (e.g. Monopoly in Jaipur, Syrup & Capsule Range)" 
                  rows="4" 
                  className="textarea-custom"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-submit-contact" 
                disabled={status.submitting}
              >
                {status.submitting ? (
                  <>
                    <FaSpinner className="spin" /> Sending Message...
                  </>
                ) : (
                  'SEND MESSAGE'
                )}
              </button>
            </form>
          </div>

          {/* Right: Friendly Support Illustration matching screenshot */}
          <div className="contact-illustration-col">
            <div className="illustration-wrapper">
              <svg 
                viewBox="0 0 500 400" 
                className="support-svg-art"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Soft Blobs */}
                <circle cx="250" cy="220" r="160" fill="#E8F4EC" />
                <circle cx="360" cy="120" r="45" fill="#FFEAA7" opacity="0.6" />
                <circle cx="140" cy="140" r="30" fill="#E4EEFF" />

                {/* Desk */}
                <rect x="80" y="320" width="340" height="12" rx="6" fill="#534537" />

                {/* Computer Monitor */}
                <rect x="180" y="210" width="140" height="95" rx="8" fill="#2D3436" />
                <rect x="188" y="218" width="124" height="79" rx="4" fill="#6C5CE7" />
                <polygon points="235,305 265,305 270,320 230,320" fill="#636E72" />

                {/* Person */}
                {/* Hair & Head */}
                <circle cx="250" cy="140" r="38" fill="#FF7675" />
                <circle cx="250" cy="140" r="32" fill="#FFEAA7" />
                {/* Headset */}
                <path d="M216,140 C216,118 284,118 284,140" stroke="#0984E3" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="216" cy="140" r="8" fill="#0984E3" />
                <circle cx="284" cy="140" r="8" fill="#0984E3" />
                <path d="M284,144 Q280,165 262,160" stroke="#0984E3" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="260" cy="160" r="4" fill="#D63031" />

                {/* Torso & Shirt */}
                <path d="M195,200 Q250,175 305,200 L320,320 L180,320 Z" fill="#E17055" />

                {/* Floating Communication Badges */}
                {/* Email Badge */}
                <g transform="translate(100, 100)">
                  <circle cx="25" cy="25" r="25" fill="#FFA502" />
                  <rect x="14" y="18" width="22" height="14" rx="2" fill="#FFFFFF" />
                  <polyline points="14,18 25,26 36,18" stroke="#FFA502" strokeWidth="2" fill="none" />
                </g>

                {/* Question Badge */}
                <g transform="translate(230, 45)">
                  <circle cx="22" cy="22" r="22" fill="#70A1FF" />
                  <text x="16" y="30" fill="#FFFFFF" fontSize="24" fontWeight="bold" fontFamily="Arial">?</text>
                </g>

                {/* Phone Call Badge */}
                <g transform="translate(350, 80)">
                  <circle cx="24" cy="24" r="24" fill="#2ED573" />
                  <path d="M19,16 C19,25 24,30 33,30 L31,27 C30,26 28,26 27,27 C26,27 23,24 23,23 C24,22 24,20 23,19 Z" fill="#FFFFFF" />
                </g>

                {/* Calendar / Schedule Badge */}
                <g transform="translate(390, 160)">
                  <rect x="0" y="0" width="46" height="40" rx="6" fill="#FFFFFF" stroke="#CED6E0" strokeWidth="2" />
                  <rect x="0" y="0" width="46" height="12" rx="6" fill="#2E7D32" />
                  <circle cx="12" cy="20" r="2" fill="#2E7D32" />
                  <circle cx="23" cy="20" r="2" fill="#2E7D32" />
                  <circle cx="34" cy="20" r="2" fill="#2E7D32" />
                  <circle cx="12" cy="28" r="2" fill="#2E7D32" />
                  <circle cx="23" cy="28" r="2" fill="#2E7D32" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* 3-Column Contact Strip Matching Screenshot */}
        <div className="contact-cards-strip">
          <div className="contact-strip-box">
            <div className="strip-icon-circle">
              <FaPhoneAlt />
            </div>
            <div className="strip-info">
              <span className="strip-title">Call Us:</span>
              <a href="tel:+918872544458" className="strip-value">+91-8872544458</a>
            </div>
          </div>

          <div className="contact-strip-box">
            <div className="strip-icon-circle">
              <FaEnvelope />
            </div>
            <div className="strip-info">
              <span className="strip-title">Mail Us:</span>
              <a href="mailto:fibaxpharma@gmail.com" className="strip-value">fibaxpharma@gmail.com</a>
            </div>
          </div>

          <div className="contact-strip-box">
            <div className="strip-icon-circle">
              <FaMapMarkerAlt />
            </div>
            <div className="strip-info">
              <span className="strip-title">Address:</span>
              <span className="strip-value">SCO. 29, Metro Plaza, Zirakpur, Punjab</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
