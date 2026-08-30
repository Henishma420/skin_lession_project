import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBookMedical, 
  FaSearch,
  FaShieldAlt, 
  FaExclamationTriangle, 
  FaHeartbeat, 
  FaStethoscope, 
  FaProcedures,
  FaArrowRight
} from 'react-icons/fa';
import skinConditions from '../data/skinConditions';
import './Library.css';

const Library = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list based on requirements
  const categories = ['All', 'Benign', 'Precancerous', 'Cancerous', 'Vascular'];

  // Map categories/conditions to specific medical icons
  const getConditionIcon = (id, category) => {
    switch (id) {
      case 'melanoma':
        return <FaExclamationTriangle className="text-danger" />;
      case 'basal-cell-carcinoma':
        return <FaHeartbeat className="text-orange" />;
      case 'actinic-keratosis':
        return <FaStethoscope className="text-warning" />;
      case 'vascular-lesions':
        return <FaProcedures className="text-info" />;
      case 'melanocytic-nevi':
        return <FaShieldAlt className="text-success" />;
      case 'benign-keratosis':
        return <FaBookMedical className="text-primary" />;
      default:
        return <FaBookMedical className="text-primary" />;
    }
  };

  // Filter conditions dynamically
  const filteredConditions = skinConditions.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.scientificName && item.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="library-page fade-in">
      <header className="page-header">
        <div className="header-with-icon">
          <FaBookMedical className="header-main-icon" />
          <div>
            <h1>Skin Health Library</h1>
            <p>A reference database of common skin lesions, symptoms, risk markers, and clinical prevention guidelines.</p>
          </div>
        </div>
      </header>

      {/* Search and Filter Controls */}
      <div className="library-controls glass-card">
        <div className="search-bar-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search skin conditions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-pills-wrapper">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List View */}
      {filteredConditions.length > 0 ? (
        <div className="library-grid-container">
          {filteredConditions.map((item) => (
            <div 
              key={item.id} 
              className="library-grid-card glass-card"
              onClick={() => navigate(`/skin-library/${item.id}`)}
            >
              <div className="card-header-top">
                <span className={`status-pill ${
                  item.category === 'Cancerous' ? 'status-malignant' : 
                  item.category === 'Precancerous' ? 'status-precancerous' : 'status-benign'
                }`}>
                  {item.category}
                </span>
              </div>
              
              <div className="card-body-content">
                <div className="card-title-icon-wrapper">
                  <div className="card-condition-icon">
                    {getConditionIcon(item.id, item.category)}
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    {item.scientificName && <span className="card-scientific">({item.scientificName})</span>}
                  </div>
                </div>
                <p className="card-description">{item.shortDescription}</p>
              </div>
              
              <div className="card-footer-action">
                <span className="view-details-link">
                  View Details <FaArrowRight />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results glass-card">
          <p>No skin conditions matched your search and filter criteria.</p>
          <button 
            className="btn-back" 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
