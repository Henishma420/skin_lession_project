import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaCalendarCheck, 
  FaClock, 
  FaUserMd, 
  FaNotesMedical, 
  FaCalendarAlt, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaHistory
} from 'react-icons/fa';
import appointmentService from '../services/appointmentService';
import './MyAppointments.css';

const MyAppointments = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering state
  const [historyFilter, setHistoryFilter] = useState('All');

  // Modals state
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [cancellingAppt, setCancellingAppt] = useState(null);

  // Form states inside rescheduling modal
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Available time slots (can be customized)
  const timeSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM'];

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch appointments
      const appts = await appointmentService.fetchAppointments(API_URL, user);
      setAppointments(appts);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setErrorMsg('Unable to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, user]);

  // Helper to parse status classes
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'confirmed':
        return 'status-confirmed';
      case 'rescheduled':
        return 'status-rescheduled';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  // Helper to parse display status labels
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'confirmed':
        return 'Upcoming';
      case 'rescheduled':
        return 'Rescheduled';
      case 'pending':
      default:
        return 'Upcoming';
    }
  };

  // Reschedule handler
  const handleOpenReschedule = (appt) => {
    setReschedulingAppt(appt);
    // Format date for HTML input (YYYY-MM-DD)
    const formattedDate = appt.date ? new Date(appt.date).toISOString().split('T')[0] : '';
    setNewDate(formattedDate);
    setNewTime(appt.time || '');
    setRescheduleError('');
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setRescheduleError('');
    if (!newDate || !newTime) {
      setRescheduleError('Please select both a date and time slot.');
      return;
    }

    setActionLoading(true);
    try {
      await appointmentService.rescheduleAppointment(API_URL, reschedulingAppt.id, newDate, newTime, user);
      
      // Show success alert and reload
      alert('Appointment Rescheduled Successfully');
      setReschedulingAppt(null);
      await loadData();
    } catch (error) {
      setRescheduleError(error.message || 'Failed to reschedule. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancellation handler
  const handleCancelSubmit = async () => {
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(API_URL, cancellingAppt.id, user);
      alert('Appointment Cancelled Successfully');
      setCancellingAppt(null);
      await loadData();
    } catch (error) {
      alert('Failed to cancel appointment: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="error-state-box glass-card text-center fade-in">
        <FaExclamationTriangle size={50} className="text-danger" />
        <h2>Error Loading Appointments</h2>
        <p>{errorMsg}</p>
        <button onClick={loadData} className="btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  // Calculate statistics
  const upcomingCount = appointments.filter(a => ['pending', 'confirmed', 'rescheduled'].includes(a.status?.toLowerCase())).length;
  const completedCount = appointments.filter(a => a.status?.toLowerCase() === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status?.toLowerCase() === 'cancelled').length;
  const totalCount = appointments.length;

  // Filter lists
  const upcomingAppointments = appointments.filter(a => 
    ['pending', 'confirmed', 'rescheduled'].includes(a.status?.toLowerCase())
  );


  // Apply history filter tabs
  const filteredHistory = appointments.filter(appt => {
    const status = appt.status?.toLowerCase();
    
    if (historyFilter === 'All') return true;
    if (historyFilter === 'Completed') return status === 'completed';
    if (historyFilter === 'Cancelled') return status === 'cancelled';
    if (historyFilter === 'Rescheduled') return status === 'rescheduled';
    return true;
  });

  return (
    <div className="my-appointments-page fade-in">
      <header className="page-header">
        <div className="header-with-icon">
          <FaCalendarCheck className="header-main-icon" />
          <div>
            <h1>My Appointments</h1>
            <p>View and manage your upcoming and previous dermatologist appointments.</p>
          </div>
        </div>
      </header>

      {/* Summary Stats Grid */}
      <section className="stats-summary-grid">
        <div className="stat-card glass-card">
          <FaCalendarAlt className="icon-blue" />
          <div>
            <span className="stat-label">Upcoming</span>
            <span className="stat-val">{upcomingCount}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <FaCheckCircle className="icon-success" />
          <div>
            <span className="stat-label">Completed</span>
            <span className="stat-val">{completedCount}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <FaBan className="icon-danger" />
          <div>
            <span className="stat-label">Cancelled</span>
            <span className="stat-val">{cancelledCount}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <FaHistory className="icon-primary" />
          <div>
            <span className="stat-label">Total Appointments</span>
            <span className="stat-val">{totalCount}</span>
          </div>
        </div>
      </section>

      {/* Empty State Check */}
      {totalCount === 0 ? (
        <div className="empty-appointments-box glass-card text-center">
          <FaCalendarCheck size={60} style={{ color: '#00d2ff', marginBottom: '1.2rem', opacity: 0.8 }} />
          <h3>No appointments yet.</h3>
          <p>Book your first dermatologist appointment with our top clinical specialists.</p>
          <button onClick={() => navigate('/appointments')} className="btn-primary" style={{ marginTop: '1.2rem' }}>
            Book Appointment
          </button>
        </div>
      ) : (
        <>
          {/* Upcoming Section */}
          <section className="appointments-section">
            <h2>Upcoming Appointments</h2>
            {upcomingAppointments.length === 0 ? (
              <div className="empty-sub-section glass-card">
                <p>You don't have any upcoming dermatologist appointments.</p>
                <button onClick={() => navigate('/appointments')} className="btn-outline-small">
                  Book an Appointment &rarr;
                </button>
              </div>
            ) : (
              <div className="appointments-cards-grid">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="appt-card glass-card">
                    <div className="appt-card-header">
                      <div className="doctor-meta-block">
                        <div className="doctor-avatar">
                          <FaUserMd />
                        </div>
                        <div>
                          <h3>{appt.doctorName}</h3>
                          <span className="doc-specialty">{appt.specialization || 'Dermatologist'}</span>
                        </div>
                      </div>
                      <span className={`status-pill ${getStatusClass(appt.status)}`}>
                        {getStatusLabel(appt.status)}
                      </span>
                    </div>

                    <div className="appt-card-body">
                      <div className="appt-timing-row">
                        <div className="timing-item">
                          <FaCalendarAlt className="icon-gold" />
                          <span>{new Date(appt.date).toLocaleDateString(undefined, { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="timing-item">
                          <FaClock className="icon-blue" />
                          <span>{appt.time}</span>
                        </div>
                      </div>
                      
                      <div className="appt-symptoms-box">
                        <FaNotesMedical className="icon-primary" />
                        <div>
                          <strong>Symptoms:</strong>
                          <p>{appt.symptoms || 'General screening'}</p>
                        </div>
                      </div>

                      <div className="appt-id-badge">
                        <span>Appointment ID:</span>
                        <strong>{String(appt.id).startsWith('APT-') ? appt.id : `APT-2026-0${appt.id}`}</strong>
                      </div>
                    </div>

                    <div className="appt-card-footer">
                      <button 
                        onClick={() => navigate(`/appointments/${appt.id}`)}
                        className="btn-outline-small"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleOpenReschedule(appt)}
                        className="btn-outline-small"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => setCancellingAppt(appt)}
                        className="btn-danger-small"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History Section */}
          <section className="appointments-section history-section-wrapper">
            <h2>Appointment History</h2>
            
            {/* Filter Tabs */}
            <div className="history-filter-tabs">
              {['All', 'Completed', 'Cancelled', 'Rescheduled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`filter-tab ${historyFilter === filter ? 'active' : ''}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredHistory.length === 0 ? (
              <div className="empty-sub-section glass-card">
                <p>No previous appointments match the selected filter.</p>
              </div>
            ) : (
              <div className="history-table-container glass-card">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Symptoms</th>
                      <th>Status</th>
                      <th>Appointment ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((appt) => (
                      <tr key={appt.id}>
                        <td>
                          <div className="table-doc-info">
                            <FaUserMd className="table-doc-icon" />
                            <strong>{appt.doctorName}</strong>
                          </div>
                        </td>
                        <td>{new Date(appt.date).toLocaleDateString()}</td>
                        <td>{appt.time}</td>
                        <td className="table-symptoms">{appt.symptoms || 'General Checkup'}</td>
                        <td>
                          <span className={`status-pill ${getStatusClass(appt.status)}`}>
                            {getStatusLabel(appt.status)}
                          </span>
                        </td>
                        <td>
                          <code className="appt-id-code">
                            {String(appt.id).startsWith('APT-') ? appt.id : `APT-2026-0${appt.id}`}
                          </code>
                        </td>
                        <td>
                          <button 
                            onClick={() => navigate(`/appointments/${appt.id}`)}
                            className="btn-view-link"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in">
            <h3>Reschedule Appointment</h3>
            <p>Select a new date and slot for your consultation with <strong>{reschedulingAppt.doctorName}</strong>.</p>
            
            {rescheduleError && <div className="error-alert-box">{rescheduleError}</div>}

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group-custom">
                <label>Select New Date</label>
                <input 
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]} // Block past dates
                  onChange={(e) => setNewDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {}
                  }}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label>Select Time Slot</label>
                <div className="time-slots-grid">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-btn ${newTime === slot ? 'active' : ''}`}
                      onClick={() => setNewTime(slot)}
                    >
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Confirm Reschedule'}
                </button>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setReschedulingAppt(null)}
                  disabled={actionLoading}
                >
                  Keep Existing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingAppt && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in text-center">
            <FaExclamationTriangle className="text-danger" size={50} style={{ marginBottom: '1rem' }} />
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel your appointment with <strong>{cancellingAppt.doctorName}</strong> on <strong>{new Date(cancellingAppt.date).toLocaleDateString()}</strong> at <strong>{cancellingAppt.time}</strong>?</p>
            <p className="cancel-note">This action cannot be undone, but the history record will be preserved.</p>

            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                onClick={handleCancelSubmit} 
                className="btn-danger"
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
              <button 
                onClick={() => setCancellingAppt(null)} 
                className="btn-outline"
                disabled={actionLoading}
              >
                Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
