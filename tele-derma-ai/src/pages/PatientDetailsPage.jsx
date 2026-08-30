import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaUserCircle, 
  FaCalendarAlt, 
  FaFileMedical, 
  FaStethoscope, 
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';
import './PatientDetailsPage.css';

const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await axios.get(`${API_URL}/doctor/patients/${patientId}`);
        setPatientData(response.data);
      } catch (error) {
        console.error('Failed to load patient profile data:', error);
        setErrorMsg('Unable to access this patient profile. Ensure you have consultations associated with this patient.');
      } finally {
        setLoading(false);
      }
    };

    if (user && patientId) {
      fetchPatientData();
    }
  }, [API_URL, patientId, user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Retrieving Patient Clinical Profile...</p>
      </div>
    );
  }

  if (errorMsg || !patientData) {
    return (
      <div className="patient-error-state glass-card text-center fade-in">
        <FaUserCircle size={40} className="error-icon" />
        <h2>Profile Access Denied</h2>
        <p>{errorMsg || 'Failed to retrieve patient information.'}</p>
        <button className="btn-secondary" onClick={() => navigate('/patients')}>
          Back to Directory
        </button>
      </div>
    );
  }

  const { profile, appointments, reports } = patientData;

  // Calculate stats
  const totalAppointments = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const loggedReports = reports.length;
  const reviewedReports = reports.filter(r => r.status?.toLowerCase() === 'reviewed' || r.status?.toLowerCase() === 'completed').length;

  return (
    <div className="patient-details-page fade-in">
      {/* Back Link */}
      <Link to="/patients" className="btn-back-link">
        <FaArrowLeft />
        <span>Back to Directory</span>
      </Link>

      <div className="patient-profile-wrapper">
        {/* Profile Card Summary Header */}
        <div className="patient-profile-header glass-card">
          <div className="header-meta">
            <FaUserCircle className="patient-avatar-large" />
            <div>
              <h2>{profile.name}</h2>
              <span className="patient-id-sub">Patient ID: PAT-2026-{String(profile.id).padStart(4, '0')}</span>
              <div className="demographics-row">
                <span><strong>Email:</strong> {profile.email}</span>
                <span>•</span>
                <span><strong>Age:</strong> Not provided</span>
                <span>•</span>
                <span><strong>Gender:</strong> Not provided</span>
              </div>
            </div>
          </div>
          
          <div className="quick-stats-bar">
            <div className="q-stat">
              <span className="num">{totalAppointments}</span>
              <span className="lbl">Appointments</span>
            </div>
            <div className="q-stat">
              <span className="num">{loggedReports}</span>
              <span className="lbl">AI Scans</span>
            </div>
            <div className="q-stat">
              <span className="num">{reviewedReports}</span>
              <span className="lbl">Reviewed Scans</span>
            </div>
          </div>
        </div>

        {/* Tab Controls Navigation */}
        <div className="patient-tabs-nav glass-card">
          {['Overview', 'Appointments', 'AI Reports', 'Clinical History'].map(tab => (
            <button 
              key={tab}
              className={`tab-nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Overview' && <FaUserCircle />}
              {tab === 'Appointments' && <FaCalendarAlt />}
              {tab === 'AI Reports' && <FaFileMedical />}
              {tab === 'Clinical History' && <FaStethoscope />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="patient-tab-content">
          {activeTab === 'Overview' && (
            <div className="overview-tab-panel glass-card fade-in">
              <h3>Clinical Overview Summary</h3>
              <p className="overview-description">A quick clinical summary of the patient's records and consultations logged under your care.</p>
              
              <div className="overview-grid">
                <div className="summary-info-box">
                  <h4>Account Demographics</h4>
                  <ul>
                    <li><strong>Full Name:</strong> {profile.name}</li>
                    <li><strong>Registered Email:</strong> {profile.email}</li>
                    <li><strong>Profile Status:</strong> Active Patient</li>
                    <li><strong>Onboard Date:</strong> August 2026</li>
                  </ul>
                </div>

                <div className="summary-info-box">
                  <h4>Activity Summary</h4>
                  <ul>
                    <li><strong>Consultation Bookings:</strong> {totalAppointments} booked</li>
                    <li><strong>Consultations Completed:</strong> {completedAppts} finished</li>
                    <li><strong>AI Screening Logs:</strong> {loggedReports} scans uploaded</li>
                    <li><strong>Reviews Completed:</strong> {reviewedReports} reports reviewed</li>
                  </ul>
                </div>
              </div>

              <div className="booking-cta-subpanel">
                <div>
                  <h4>Schedule a follow-up appointment?</h4>
                  <p>Book another dermatology screening or clinical evaluation consultation for this patient.</p>
                </div>
                <Link to="/appointments" className="btn-primary">
                  <span>Schedule Consultation</span>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'Appointments' && (
            <div className="appointments-tab-panel glass-card fade-in">
              <h3>Consultation History</h3>
              {appointments.length === 0 ? (
                <div className="empty-state text-center" style={{ minHeight: '120px' }}>
                  <p>No appointments found for this patient.</p>
                </div>
              ) : (
                <div className="patient-appts-list">
                  {appointments.map(appt => (
                    <div key={appt.id} className="patient-appt-item glass-card">
                      <div className="appt-badge-header">
                        <span className={`status-badge-inline status-${appt.status?.toLowerCase()}`}>
                          {appt.status}
                        </span>
                        <span className="appt-id-text">ID: APP-2026-{String(appt.id).padStart(4, '0')}</span>
                      </div>
                      
                      <div className="appt-row-meta">
                        <div className="meta-block">
                          <FaCalendarAlt />
                          <span>{appt.date}</span>
                        </div>
                        <div className="meta-block">
                          <FaClock />
                          <span>{appt.time}</span>
                        </div>
                      </div>

                      <p className="symptoms-text">
                        <strong>Symptoms described:</strong> {appt.symptoms || 'No description provided.'}
                      </p>

                      <Link to={`/appointments/${appt.id}`} className="btn-secondary btn-sm-padding text-center">
                        View Details &amp; Notes
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'AI Reports' && (
            <div className="reports-tab-panel glass-card fade-in">
              <h3>Patient AI Screening Scans</h3>
              {reports.length === 0 ? (
                <div className="empty-state text-center" style={{ minHeight: '120px' }}>
                  <p>No AI reports found for this patient.</p>
                </div>
              ) : (
                <div className="patient-reports-list">
                  {reports.map(rep => {
                    const formattedId = String(rep.id).padStart(4, '0');
                    return (
                      <div key={rep.id} className="patient-report-item glass-card">
                        <div className="report-item-header">
                          <span className="report-id-txt">Report #AI-2026-{formattedId}</span>
                          <span className={`status-badge-inline status-${rep.status?.toLowerCase().replace(/ /g, '-')}`}>
                            {rep.status}
                          </span>
                        </div>

                        <div className="report-item-body">
                          <div className="lesion-preview-box">
                            <img 
                              src={rep.image_url} 
                              alt="Lesion Preview"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x80/0d1220/ffffff?text=Image';
                              }}
                            />
                          </div>
                          
                          <div className="report-predictions-meta">
                            <h4>{rep.prediction}</h4>
                            <div className="pct-row">
                              <span>Confidence: <strong>{Number(rep.confidence).toFixed(1)}%</strong></span>
                              <span>•</span>
                              <span>Scan Date: {new Date(rep.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <Link to={`/reports/AI-2026-${formattedId}`} className="btn-secondary btn-sm-padding text-center">
                          View Full Report
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Clinical History' && (
            <div className="history-tab-panel glass-card fade-in">
              <h3>Dermatologist Signed Reviews</h3>
              {reports.filter(r => r.status?.toLowerCase() === 'reviewed' || r.status?.toLowerCase() === 'completed').length === 0 ? (
                <div className="empty-state text-center" style={{ minHeight: '120px' }}>
                  <p>No reviewed clinical reports found for this patient.</p>
                </div>
              ) : (
                <div className="clinical-history-timeline">
                  {reports
                    .filter(r => r.status?.toLowerCase() === 'reviewed' || r.status?.toLowerCase() === 'completed')
                    .map(rep => {
                      const formattedId = String(rep.id).padStart(4, '0');
                      return (
                        <div key={rep.id} className="history-timeline-card glass-card">
                          <div className="history-card-header">
                            <div className="header-icon-badge">
                              <FaCheckCircle className="text-blue" />
                              <span>Clinical Sign-off Completed</span>
                            </div>
                            <span className="history-date">{new Date(rep.created_at).toLocaleDateString()}</span>
                          </div>

                          <div className="history-card-body">
                            <h4>Report: AI-2026-{formattedId} ({rep.prediction})</h4>
                            
                            <div className="notes-box">
                              <strong>Visual Diagnosis & comments:</strong>
                              <p>Clinically reviewed and matched with AI prediction scan. Clinical advice provided to patient record log.</p>
                            </div>
                          </div>

                          <Link to={`/reports/AI-2026-${formattedId}`} className="btn-secondary btn-sm-padding">
                            View Reviewed Report
                          </Link>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
