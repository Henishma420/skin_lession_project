import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { FaStar, FaStethoscope, FaRegClock, FaVideo } from 'react-icons/fa';
import './Doctors.css';

const Doctors = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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
    navigate(`/appointments?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}`);
  };

  return (
    <div className="doctors-page fade-in">
      <header className="page-header">
        <h1>Dermatologist Specialists</h1>
        <p>Select a specialist to book an online consultation or in-person evaluation.</p>
      </header>

      <div className="doctors-grid grid-2">
        {doctors.length === 0 ? (
          <div className="glass-card empty-state w-100">
            <p>No registered dermatologists found in the database.</p>
          </div>
        ) : (
          doctors.map((doc) => (
            <div key={doc.id} className="doctor-card glass-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar-placeholder">
                  {doc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="doctor-meta">
                  <h3>{doc.name}</h3>
                  <span className="doc-specialty">{doc.specialty}</span>
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
                <span>Book Appointment</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Doctors;
