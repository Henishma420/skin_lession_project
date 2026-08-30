import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserCircle, 
  FaCalendarCheck, 
  FaRobot, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaClock,
  FaUserMd
} from 'react-icons/fa';
import appointmentService from '../services/appointmentService';
import './Dashboard.css';

const PatientDashboard = () => {
  const { user, API_URL } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [analysesRes, apptsData] = await Promise.all([
          axios.get(`${API_URL}/analyses`).then(r => r.data).catch(() => []),
          appointmentService.fetchAppointments(API_URL, user)
        ]);
        setAnalyses(analysesRes);
        setAppointments(apptsData);
      } catch (error) {
        console.error('Failed to load patient dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPatientData();
    }
  }, [API_URL, user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  // Formatting date helper
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper to parse 24h format for sorting
  function convertTo24h(timeStr) {
    if (!timeStr) return '00:00';
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier?.toLowerCase() === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const upcomingAppts = appointments.filter(a => 
    ['pending', 'confirmed', 'rescheduled'].includes(a.status?.toLowerCase())
  );
  
  const sortedUpcoming = [...upcomingAppts].sort((a, b) => {
    const dateA = new Date(`${a.date}T${convertTo24h(a.time)}`);
    const dateB = new Date(`${b.date}T${convertTo24h(b.time)}`);
    return dateA - dateB;
  });

  const nearestAppt = sortedUpcoming[0];
  const upcomingCount = upcomingAppts.length;
  const completedCount = appointments.filter(a => a.status?.toLowerCase() === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status?.toLowerCase() === 'cancelled').length;

  return (
    <div className="dashboard-wrapper fade-in">
      {/* Header Profile Greeting */}
      <header className="dashboard-header glass-card">
        <div className="profile-greeting">
          <FaUserCircle className="user-avatar-icon" />
          <div>
            <h1>Hello, {user?.name || 'User'}</h1>
            <p className="user-badge">Patient Member</p>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-pill">
            <span className="stat-num">{analyses.length}</span>
            <span className="stat-label">AI Analyses</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{appointments.length}</span>
            <span className="stat-label">Appointments</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="dashboard-grid grid-2">
        {/* Left Hand: Clinical Scans */}
        <section className="dashboard-card glass-card">
          <div className="card-header-icon bg-primary-light">
            <FaRobot className="text-primary" />
            <h2>Recent AI Screenings</h2>
          </div>
          
          <div className="card-body-content">
            {analyses.length === 0 ? (
              <div className="empty-state">
                <p>No screening reports stored in database.</p>
                <Link to="/analysis" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Start Scan
                </Link>
              </div>
            ) : (
              <div className="data-list">
                {analyses.slice(0, 3).map((item) => (
                  <div key={item.id} className="data-item">
                    <div className="data-info">
                      <span className="data-title">{item.prediction}</span>
                      <span className="data-meta">Confidence: {(item.confidence * 1).toFixed(0)}%</span>
                    </div>
                    <span className="data-date">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
                <Link to="/reports" className="view-more-link">
                  <span>View All Reports</span>
                  <FaChevronRight size={10} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Right Hand: Consultations */}
        <section className="dashboard-card glass-card">
          <div className="card-header-icon bg-secondary-light">
            <FaCalendarCheck className="text-secondary" />
            <h2>Dermatologist Consultations</h2>
          </div>

          <div className="card-body-content">
            <div className="dashboard-appt-panel">
              <div className="nearest-appt-wrapper">
                {nearestAppt ? (
                  <div className="nearest-appt-details-card glass-card">
                    <div className="appt-card-title-row">
                      <span className="appt-section-label">Upcoming Appointment</span>
                      <span className={`status-pill ${
                        nearestAppt.status === 'rescheduled' ? 'status-rescheduled' : 'status-confirmed'
                      }`}>
                        {nearestAppt.status === 'rescheduled' ? 'Rescheduled' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="doc-summary-line">
                      <FaUserMd className="doc-icon-blue" />
                      <div>
                        <h4>{nearestAppt.doctorName}</h4>
                        <span className="doc-specialization-text">{nearestAppt.specialization || 'Dermatologist'}</span>
                      </div>
                    </div>
                    <div className="appt-time-info">
                      <div className="time-info-item">
                        <FaCalendarAlt />
                        <span>{getFormattedDate(nearestAppt.date)}</span>
                      </div>
                      <div className="time-info-item">
                        <FaClock />
                        <span>{nearestAppt.time}</span>
                      </div>
                    </div>
                    <p className="appt-symptoms-summary">
                      <strong>Symptoms:</strong> {nearestAppt.symptoms || 'General screening check'}
                    </p>
                    <Link to={`/appointments/${nearestAppt.id}`} className="btn-primary w-100 text-center" style={{ display: 'block', marginTop: '1rem' }}>
                      View Appointment
                    </Link>
                  </div>
                ) : (
                  <div className="empty-state" style={{ minHeight: '160px' }}>
                    <h3>No Upcoming Appointments</h3>
                    <p>You don't have any upcoming dermatologist appointments.</p>
                    <Link to="/appointments" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem', display: 'inline-block' }}>
                      Book an Appointment &rarr;
                    </Link>
                  </div>
                )}
              </div>

              <div className="dashboard-appt-summary-card glass-card">
                <h4>Appointments Summary</h4>
                <div className="summary-list">
                  <div className="summary-item">
                    <span>Upcoming</span>
                    <span className="summary-badge bg-blue">{upcomingCount}</span>
                  </div>
                  <div className="summary-item">
                    <span>Completed</span>
                    <span className="summary-badge bg-green">{completedCount}</span>
                  </div>
                  <div className="summary-item">
                    <span>Cancelled</span>
                    <span className="summary-badge bg-red">{cancelledCount}</span>
                  </div>
                </div>
                <Link to="/my-appointments" className="view-more-link" style={{ marginTop: '0.8rem' }}>
                  <span>View All Appointments</span>
                  <FaChevronRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
