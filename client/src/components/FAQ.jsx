import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FAQ.css';

const faqs = [
  {
    question: 'What is PCD Pharma Franchise?',
    answer: 'PCD (Propaganda Cum Distribution) Pharma Franchise is a business model where a pharmaceutical company grants distribution rights of its products to a franchise partner in a specific territory. You get the exclusive rights to market and sell the company\'s products in your designated area.',
  },
  {
    question: 'What is the minimum investment required?',
    answer: 'You can start your Ayurvedic PCD franchise with Fibax Pharma with an investment as low as ₹30,000 to ₹50,000. This includes your initial product stock. No royalty fees or hidden charges.',
  },
  {
    question: 'Do you provide monopoly rights?',
    answer: 'Yes, Fibax Pharma provides 100% exclusive monopoly rights for your territory. This means no other distributor will be appointed in your area, ensuring zero intra-brand competition and higher profit margins.',
  },
  {
    question: 'What promotional support do you provide?',
    answer: 'We provide a complete free promotional kit including Visual Aid folders, product brochures, MR bags, visiting cards, reminder cards, sample catch covers, branded pens, and prescription pads.',
  },
  {
    question: 'Do I need a drug license to start?',
    answer: 'For most classical Ayurvedic medicines, a drug license is not mandatory. However, for proprietary formulations, you may need a valid GST registration and drug license. Our team will guide you through the entire documentation process.',
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleAccordion(index)}
              >
                <h3>{faq.question}</h3>
                <span className="faq-icon">
                  {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div 
                className="faq-answer-wrapper"
                style={{ 
                  maxHeight: openIndex === index ? '200px' : '0px',
                  opacity: openIndex === index ? 1 : 0
                }}
              >
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
