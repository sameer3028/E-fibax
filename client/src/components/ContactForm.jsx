import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = ({ title = 'Feel Free to Contact Us', onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: '',
    requirement: ''
  });
  
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', city: '', phone: '', requirement: '' });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: 'Something went wrong. Please try again later or call us directly.' 
      });
    }
  };

  return (
    <div className="contact-form-container">
      <h3 className="form-title">{title}</h3>
      
      {status.success ? (
        <div className="form-success-message">
          Thank you! Our team will contact you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              name="city"
              placeholder="Your City *"
              value={formData.city}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <textarea
              name="requirement"
              placeholder="Your Requirement"
              value={formData.requirement}
              onChange={handleChange}
              rows="4"
              className="form-control"
            ></textarea>
          </div>
          
          {status.error && <div className="form-error-message">{status.error}</div>}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={status.loading}
          >
            {status.loading ? (
              <span className="spinner"></span>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
