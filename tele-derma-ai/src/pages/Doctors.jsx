import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { FaStar, FaStethoscope, FaRegClock, FaVideo, FaFilter } from 'react-icons/fa';
import './Doctors.css';

const skinTypeCategories = [
  'All Specialists',
  'Melanoma',
  'Melanocytic Nevus',
  'Basal Cell Carcinoma',
  'Actinic Keratosis',
  'Vascular Lesion',
  'Benign Keratosis',
  'General Dermatology'
];

const Doctors = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialParam = searchParams.get('skinType') || 'All Specialists';
  const [selectedSkinType, setSelectedSkinType] = useState(initialParam);

  useEffect(() => {
    const fromQuery = searchParams.get('skinType');
    if (fromQuery) {
      const match = skinTypeCategories.find(c => 
        c.toLowerCase().includes(fromQuery.toLowerCase()) || 
        fromQuery.toLowerCase().includes(c.toLowerCase())
      );
      setSelectedSkinType(match || fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_URL}/doctors`);
        setDoctors(response.data);
      } catch (error) {
        console.error('Failed to retrieve doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Finding available dermatologists...</p>
      </div>
    );
  }

  const handleBook = (doctor) => {
    navigate(`/appointments?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}&skinType=${encodeURIComponent(doctor.skin_type_focus || '')}`);
  };

  const filteredDoctors = doctors.filter(doc => {
    if (selectedSkinType === 'All Specialists') return true;
    const focus = (doc.skin_type_focus || '').toLowerCase();
    const specialty = (doc.specialty || '').toLowerCase();
    const target = selectedSkinType.toLowerCase();
    return focus.includes(target) || specialty.includes(target) || target.includes(focus);
  });

  return (
    <div className="doctors-page fade-in">
      <header className="page-header">
        <h1>Dermatologist Specialists</h1>
        <p>Connect with expert dermatologists specializing in your specific skin lesion or skin type.</p>
      </header>

      {/* Skin-Type Specialisation Filter Bar */}
      <div className="skin-filter-container glass-card" style={{ padding: '1.2rem', borderRadius: '12px' }}>
        <div className="skin-filter-label">
          <FaFilter size={12} className="text-primary" />
          <span>Filter Doctors by Specific Skin-Type Specialisation:</span>
        </div>
        <div className="skin-filter-bar">
          {skinTypeCategories.map((type) => (
            <button
              key={type}
              type="button"
              className={`skin-filter-chip ${selectedSkinType === type ? 'active' : ''}`}
              onClick={() => {
                setSelectedSkinType(type);
                if (type === 'All Specialists') {
                  searchParams.delete('skinType');
                  setSearchParams(searchParams);
                } else {
                  setSearchParams({ skinType: type });
                }
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="doctors-grid grid-2">
        {filteredDoctors.length === 0 ? (
          <div className="glass-card empty-state w-100" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>No dermatologists currently registered for the "{selectedSkinType}" specialization.</p>
            <button 
              className="btn-outline" 
              style={{ marginTop: '1rem' }} 
              onClick={() => {
                setSelectedSkinType('All Specialists');
                searchParams.delete('skinType');
                setSearchParams(searchParams);
              }}
            >
              View All Specialists
            </button>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div key={doc.id} className="doctor-card glass-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar-placeholder">
                  {doc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="doctor-meta">
                  <h3>{doc.name}</h3>
                  <span className="doc-specialty">{doc.specialty}</span>
                  <div className="doc-skin-badge">
                    <FaStethoscope size={10} />
                    <span>Focus: {doc.skin_type_focus || 'General Dermatology'}</span>
                  </div>
                  <div className="doc-rating">
                    <FaStar className="star-icon" />
                    <span>{Number(doc.rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="doctor-details">
                <div className="detail-item">
                  <FaRegClock />
                  <span>{doc.experience_years} Years Experience</span>
                </div>
                <div className="detail-item">
                  <FaVideo />
                  <span>{doc.consultation_type}</span>
                </div>
                <div className="doc-availability-tag">
                  {doc.availability}
                </div>
              </div>

              <button 
                className="btn-primary w-100" 
                onClick={() => handleBook(doc)}
              >
                <FaStethoscope />
                <span>Book Consultation</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Doctors;
