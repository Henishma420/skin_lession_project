import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { FaSearch, FaUserCircle, FaCalendarAlt, FaFileMedical, FaEye } from 'react-icons/fa';
import './MyPatients.css';

const MyPatients = () => {
  const { API_URL } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API_URL}/doctor/patients`);
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to load doctor patients list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Patient Directory...</p>
      </div>
    );
  }

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase().trim();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      String(patient.id).includes(query)
    );
  });

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return 'None';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="patients-page fade-in">
      <header className="page-header">
        <h1>My Patients</h1>
        <p>Manage and view clinical records for patients associated with your consultations.</p>
      </header>

      {/* Search Filter Controls */}
      <div className="patients-controls-bar glass-card">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search patients by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="patients-list-grid">
        {filteredPatients.length === 0 ? (
          <div className="glass-card empty-state text-center w-100" style={{ padding: '3.5rem' }}>
            <FaUserCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }} />
            <h2>No Patients Found</h2>
            <p>Patients who have scheduled consultations with you will appear in this directory.</p>
          </div>
        ) : (
          filteredPatients.map((pat) => (
            <div key={pat.id} className="patient-card glass-card">
              <div className="patient-card-header">
                <FaUserCircle className="patient-avatar" />
                <div className="patient-meta">
                  <h3>{pat.name}</h3>
                  <span className="patient-email-sub">{pat.email}</span>
                </div>
              </div>

              <div className="patient-card-stats-grid">
                <div className="card-stat-item">
                  <span className="stat-label">Last Consultation</span>
                  <span className="stat-val">{getFormattedDate(pat.lastConsultation)}</span>
                </div>
                <div className="card-stat-item">
                  <span className="stat-label">Reports Logged</span>
                  <span className="stat-val flex-align">
                    <FaFileMedical className="small-icon" />
                    <span>{pat.reportsCount || 0} AI Reports</span>
                  </span>
                </div>
                <div className="card-stat-item full-width-item">
                  <span className="stat-label">Upcoming Appointment</span>
                  <span className="stat-val flex-align">
                    <FaCalendarAlt className="small-icon icon-blue" />
                    <span>{getFormattedDate(pat.upcomingAppointment)}</span>
                  </span>
                </div>
              </div>

              <Link to={`/patients/${pat.id}`} className="btn-primary w-100 text-center flex-center">
                <FaEye size={12} />
                <span>View Patient Profile</span>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPatients;
