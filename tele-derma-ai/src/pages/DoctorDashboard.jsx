import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserCircle, 
  FaCalendarAlt, 
  FaClock, 
  FaChevronRight, 
  FaHistory, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle
} from 'react-icons/fa';
import appointmentService from '../services/appointmentService';
import reportService from '../services/reportService';
import './Dashboard.css';

const DoctorDashboard = () => {
  const { user, API_URL } = useAuth();
  
  const [doctorStats, setDoctorStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [priorityReports, setPriorityReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDoctorDashboardData = async () => {
      try {
        const [statsRes, activityRes, reportsRes, apptsData] = await Promise.all([
          axios.get(`${API_URL}/doctor/dashboard-stats`).then(r => r.data).catch(() => null),
          axios.get(`${API_URL}/doctor/recent-activity`).then(r => r.data).catch(() => []),
          reportService.fetchReports(API_URL, user),
          appointmentService.fetchAppointments(API_URL, user)
        ]);

        setDoctorStats(statsRes);
        setRecentActivities(activityRes);
        setDoctorAppointments(apptsData);

        // Filter priority reports: High Risk & Pending dermatologist review
        const highRiskPending = reportsRes.filter(r => 
          r.riskLevel === 'High' && r.dermatologistReview?.status === 'Pending'
        );
        setPriorityReports(highRiskPending);
      } catch (error) {
        console.error('Failed to load doctor dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDoctorDashboardData();
    }
  }, [API_URL, user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Doctor Dashboard...</p>
      </div>
    );
  }

  // Filter today's appointments for active view list
  const todayAppointmentsList = doctorAppointments.filter(appt => 
    appt.date === todayStr && appt.status !== 'cancelled'
  );

  return (
    <div className="dashboard-wrapper fade-in">
      {/* Header Profile Greeting */}
      <header className="dashboard-header glass-card">
        <div className="profile-greeting">
          <FaUserCircle className="user-avatar-icon" />
          <div>
            <h1>Hello, {user?.name || 'Doctor'}</h1>
            <p className="user-badge">Clinical Dermatologist</p>
          </div>
        </div>
        
        {/* Doctor stats summary cards */}
        <div className="profile-stats">
          <div className="stat-pill">
            <span className="stat-num">{doctorStats?.todayAppointments || 0}</span>
            <span className="stat-label">Today's Appts</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num text-yellow">{doctorStats?.pendingReviews || 0}</span>
            <span className="stat-label">Pending Reviews</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{doctorStats?.totalPatients || 0}</span>
            <span className="stat-label">Total Patients</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num text-green">{doctorStats?.completedConsultations || 0}</span>
            <span className="stat-label">Completed Consults</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="dashboard-grid grid-2">
        {/* Left Side: Today's Appointments & Recent Activity */}
        <div className="left-dashboard-column">
          {/* Today's Appointments */}
          <section className="dashboard-card glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header-icon bg-primary-light">
              <FaCalendarAlt className="text-primary" />
              <h2>Today's Appointments</h2>
            </div>

            <div className="card-body-content">
              {todayAppointmentsList.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '140px' }}>
                  <p>No appointments scheduled for today.</p>
                  <p className="sub-text-dim">Your upcoming appointments will appear here.</p>
                </div>
              ) : (
                <div className="doctor-today-list">
                  {todayAppointmentsList.map((appt) => (
                    <div key={appt.id} className="today-appt-card glass-card">
                      <div className="today-appt-header">
                        <span className="time-badge">
                          <FaClock size={10} />
                          <span>{appt.time}</span>
                        </span>
                        <span className={`status-pill status-${appt.status?.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </div>
                      <div className="patient-summary">
                        <strong>{appt.patientName}</strong>
                        <span>Clinical Consultation</span>
                      </div>
                      <p className="symptoms-summary-line">
                        <strong>Symptoms:</strong> {appt.symptoms || 'General screening check'}
                      </p>
                      <Link to={`/appointments/${appt.id}`} className="btn-secondary btn-sm-padding text-center">
                        View Appointment
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/appointments" className="view-more-link" style={{ marginTop: '0.8rem' }}>
                <span>View All Appointments Queue</span>
                <FaChevronRight size={10} />
              </Link>
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section className="dashboard-card glass-card">
            <div className="card-header-icon bg-secondary-light">
              <FaHistory className="text-secondary" />
              <h2>Recent Activity Feed</h2>
            </div>

            <div className="card-body-content">
              {recentActivities.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '120px' }}>
                  <p>No recent clinical activity logged.</p>
                </div>
              ) : (
                <div className="activity-feed-timeline">
                  {recentActivities.map((act, idx) => (
                    <div key={idx} className="timeline-activity-item">
                      <div className="activity-bullet"></div>
                      <div className="activity-details">
                        <p>{act.text}</p>
                        <span className="activity-time-stamp">
                          {new Date(act.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Reports Awaiting Attention */}
        <div className="right-dashboard-column">
          <section className="dashboard-card glass-card h-100">
            <div className="card-header-icon bg-accent-light">
              <FaExclamationTriangle className="text-accent" />
              <h2>Reports Awaiting Attention</h2>
            </div>

            <div className="card-body-content">
              {priorityReports.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '220px' }}>
                  <FaCheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '0.8rem' }} />
                  <h3>No reports awaiting review</h3>
                  <p>You are all caught up!</p>
                </div>
              ) : (
                <div className="priority-reports-list">
                  <div className="priority-warning-tag">
                    <FaInfoCircle />
                    <span>AI-assisted high-risk classifications require prompt review.</span>
                  </div>
                  
                  {priorityReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="priority-report-card glass-card border-red">
                      <div className="priority-card-header">
                        <span className="p-card-badge">HIGH PRIORITY</span>
                        <span className="p-card-date">{report.scanDate}</span>
                      </div>
                      
                      <div className="priority-card-body">
                        <strong>Patient: {report.patientName || 'Dama Ashwitha'}</strong>
                        <h4>{report.predictedCondition}</h4>
                        <div className="confidence-level-line">
                          <span>AI Confidence Score: </span>
                          <strong>{report.confidence?.toFixed(1)}%</strong>
                        </div>
                      </div>

                      <Link to={`/reports/${report.id}`} className="btn-danger w-100 text-center btn-sm-padding flex-center" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <span>Review Now</span>
                        <FaChevronRight size={10} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/reports" className="view-more-link" style={{ marginTop: '0.8rem' }}>
                <span>View Clinical Reports Dashboard</span>
                <FaChevronRight size={10} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
