import React from 'react';
import './Testimonials.css';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Punjab',
      quote: 'Partnering with Fibax Pharma has been the best business decision. The product quality is exceptional and the monopoly rights ensure no competition in my area.',
      rating: 5,
      initials: 'RK'
    },
    {
      name: 'Dr. Priya Sharma',
      location: 'Maharashtra',
      quote: 'The Ayurvedic formulations from Fibax Pharma are well-received by my patients. Their WHO-GMP certification gives me confidence in prescribing.',
      rating: 5,
      initials: 'PS'
    },
    {
      name: 'Amit Verma',
      location: 'Uttar Pradesh',
      quote: 'Low investment, high returns, and excellent support. The promotional materials and timely delivery make running the franchise smooth and profitable.',
      rating: 5,
      initials: 'AV'
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title">What Our Partners Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p className="quote-text">"{testimonial.quote}"</p>
              <div className="testimonial-author">
                <div className="avatar">{testimonial.initials}</div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
