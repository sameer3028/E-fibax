import React, { useState } from 'react';
import { 
  FaCapsules, 
  FaPrescriptionBottle, 
  FaMortarPestle, 
  FaGlassWhiskey, 
  FaPumpMedical, 
  FaOilCan, 
  FaSpa, 
  FaMale 
} from 'react-icons/fa';
import './SelectionCategories.css';

const categories = [
  { id: 'all', name: 'All Products', icon: FaCapsules, color: '#2e7d32' },
  { id: 'tablets-capsules', name: 'Tablets & Capsules', icon: FaCapsules, color: '#e67e22' },
  { id: 'syrups', name: 'Syrups', icon: FaPrescriptionBottle, color: '#8e44ad' },
  { id: 'granules-churna', name: 'Granules & Churna', icon: FaMortarPestle, color: '#2980b9' },
  { id: 'juices', name: 'Juices & Ras', icon: FaGlassWhiskey, color: '#27ae60' },
  { id: 'ointments', name: 'Ointment & Creams', icon: FaPumpMedical, color: '#16a085' },
  { id: 'oils', name: 'Oil & Pain Balms', icon: FaOilCan, color: '#0097e6' },
  { id: 'cosmetics', name: 'Herbal Cosmetics', icon: FaSpa, color: '#e84393' },
  { id: 'men-range', name: 'Men Range', icon: FaMale, color: '#2c3e50' }
];

const SelectionCategories = ({ onSelectCategory, activeCategory = 'all' }) => {
  return (
    <section id="selection" className="selection-section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-eyebrow">Fibax Pharma</span>
          <h2 className="section-main-title">OUR SELECTION</h2>
          <p className="selection-subtext">
            Explore our comprehensive portfolio of 250+ DCGI-approved Ayurvedic formulations
          </p>
        </div>

        <div className="category-chips-grid">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              >
                <span 
                  className="chip-icon-circle" 
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Icon />
                </span>
                <span className="chip-label">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SelectionCategories;
