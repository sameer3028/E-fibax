import React from 'react';
import './Certifications.css';
import { FaCertificate, FaIndustry, FaShieldAlt, FaClipboardCheck, FaLeaf } from 'react-icons/fa';

const Certifications = () => {
  const certs = [
    {
      icon: <FaCertificate />,
      title: 'ISO 9001:2015',
      subtitle: 'Quality Management System'
    },
    {
      icon: <FaIndustry />,
      title: 'WHO-GMP',
      subtitle: 'Good Manufacturing Practices'
    },
    {
      icon: <FaShieldAlt />,
      title: 'AYUSH Ministry',
      subtitle: 'Government Approved'
    },
    {
      icon: <FaClipboardCheck />,
      title: 'FSSAI',
      subtitle: 'Food Safety Certified'
    },
    {
      icon: <FaLeaf />,
      title: '100% Herbal',
      subtitle: 'Pure Ayurvedic'
    }
  ];

  return (
    <section className="certifications-section">
      <div className="container">
        <h2 className="section-title">Our Certifications & Quality Standards</h2>
        <div className="certs-grid">
          {certs.map((cert, index) => (
            <div key={index} className="cert-badge">
              <div className="cert-icon-wrapper">
                <div className="cert-icon">{cert.icon}</div>
              </div>
              <h3>{cert.title}</h3>
              <p>{cert.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
