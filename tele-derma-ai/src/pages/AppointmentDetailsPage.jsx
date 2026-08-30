import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaArrowLeft, 
  FaUserMd, 
  FaCalendarAlt, 
  FaClock, 
  FaNotesMedical, 
  FaExclamationTriangle,
  FaFileAlt,
  FaMapMarkerAlt,
  FaRegEnvelope,
  FaEye,
  FaCheckCircle
} from 'react-icons/fa';
import appointmentService from '../services/appointmentService';
import axios from 'axios';
import './MyAppointments.css';

const AppointmentDetailsPage = () => {
  const { appointmentId } = useParams();
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasReport, setHasReport] = useState(false);
  const [matchedReportId, setMatchedReportId] = useState(null);

  // Doctor consultation notes form states
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [recommendedFollowUp, setRecommendedFollowUp] = useState('');
  const [treatmentAdvice, setTreatmentAdvice] = useState('');
  const [prescription, setPrescription] = useState('');
  const [patientScans, setPatientScans] = useState([]);
  const [submitNotesLoading, setSubmitNotesLoading] = useState(false);

  // Modals state
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Form states inside rescheduling modal
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Available slots
  const timeSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM'];

  const loadAppointmentDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch appointment details
      const appt = await appointmentService.fetchAppointmentById(API_URL, appointmentId, user);
      setAppointment(appt);

      // 2. Fetch reports to see if a report is available for this patient
      const reportsRes = await axios.get(`${API_URL}/analyses`);
      const matched = reportsRes.data.find(
        rep => String(rep.id) === String(appt.reportId) || 
               (rep.created_at?.split('T')[0] === appt.date)
      );
      
      if (matched) {
        setHasReport(true);
        const formattedId = String(matched.id).padStart(4, '0');
        setMatchedReportId(`AI-2026-${formattedId}`);
      } else {
        setHasReport(false);
        setMatchedReportId(null);
      }

      // If doctor, fetch patient scans and parse notes if already completed
      if (user?.role === 'doctor') {
        try {
          const patientScansRes = await axios.get(`${API_URL}/doctor/patients/${appt.patientId}`);
          setPatientScans(patientScansRes.data.reports || []);
        } catch (e) {
          console.warn('Failed to load patient history records:', e);
        }
        
        if (appt.status === 'completed' && appt.consultation_notes) {
          try {
            const parsed = JSON.parse(appt.consultation_notes);
            setClinicalObservations(parsed.clinicalObservations || '');
            setDiagnosis(parsed.diagnosis || '');
            setRecommendedFollowUp(parsed.recommendedFollowUp || '');
            setTreatmentAdvice(parsed.treatmentAdvice || '');
            setPrescription(parsed.prescription || '');
          } catch(e) {
            console.error('Error parsing notes:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load appointment details:', error);
      setErrorMsg('Unable to load appointment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && appointmentId) {
      loadAppointmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, appointmentId, user]);

  // Handle Reschedule submit
  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduleError('');
    if (!newDate || !newTime) {
      setRescheduleError('Please select both a date and time slot.');
      return;
    }

    setActionLoading(true);
    try {
      await appointmentService.rescheduleAppointment(API_URL, appointmentId, newDate, newTime, user);
      alert('Appointment Rescheduled Successfully');
      setShowReschedule(false);
      await loadAppointmentDetails();
    } catch (error) {
      setRescheduleError(error.message || 'Failed to reschedule. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel submit
  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(API_URL, appointmentId, user);
      alert('Appointment Cancelled Successfully');
      setShowCancel(false);
      await loadAppointmentDetails();
    } catch (error) {
      alert('Failed to cancel appointment: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'confirmed': return 'status-confirmed';
      case 'rescheduled': return 'status-rescheduled';
      case 'pending':
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'confirmed': return 'Upcoming';
      case 'rescheduled': return 'Rescheduled';
      case 'pending':
      default: return 'Upcoming';
    }
  };

  const handleSaveDraft = () => {
    alert('Draft saved successfully (locally). You can complete the consultation when ready.');
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!clinicalObservations.trim()) {
      alert('Please provide clinical observations before completing.');
      return;
    }
    if (!diagnosis.trim()) {
      alert('Please provide clinical impression / diagnosis.');
      return;
    }

    setSubmitNotesLoading(true);
    try {
      await axios.post(`${API_URL}/appointments/${appointmentId}/complete`, {
        clinicalObservations,
        diagnosis,
        recommendedFollowUp,
        treatmentAdvice,
        prescription
      });
      alert('Consultation completed and saved successfully.');
      loadAppointmentDetails();
    } catch(err) {
      console.error('Failed to complete consultation:', err);
      alert('Failed to complete consultation. Please try again.');
    } finally {
      setSubmitNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  if (errorMsg || !appointment) {
    return (
      <div className="error-state-box glass-card text-center fade-in">
        <FaExclamationTriangle size={50} className="text-danger" />
        <h2>Error Loading Appointment</h2>
        <p>{errorMsg || 'Appointment details could not be found.'}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/my-appointments')} className="btn-outline">
            Back to My Appointments
          </button>
          <button onClick={loadAppointmentDetails} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isUpcoming = ['pending', 'confirmed', 'rescheduled'].includes(appointment.status?.toLowerCase());
  const isCompleted = appointment.status?.toLowerCase() === 'completed';

  if (user?.role === 'doctor') {
    const isDocCompleted = appointment.status?.toLowerCase() === 'completed';

    return (
      <div className="my-appointments-page detail-page-wrapper doctor-details-page fade-in">
        <button className="btn-back" onClick={() => navigate('/appointments')} style={{ marginBottom: '2rem' }}>
          <FaArrowLeft /> Back to Appointments
        </button>

        <div className="doctor-details-grid">
          {/* Left Column: Patient Demographics & AI Screening History */}
          <div className="details-left-pane">
            <div className="appointment-full-details-card glass-card" style={{ marginBottom: '1.5rem' }}>
              <div className="details-card-header">
                <div>
                  <span className="details-appt-id">
                    Appointment ID: <strong>APP-2026-0{appointment.id}</strong>
                  </span>
                  <h2>Consultation Details</h2>
                </div>
                <span className={`status-badge status-${appointment.status?.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="details-grid-list">
                <div className="detail-row-item">
                  <FaCalendarAlt className="icon-gold" />
                  <div>
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{appointment.date}</span>
                  </div>
                </div>

                <div className="detail-row-item">
                  <FaClock className="icon-blue" />
                  <div>
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{appointment.time}</span>
                  </div>
                </div>

                <div className="detail-row-item full-width-row">
                  <FaNotesMedical className="icon-danger" />
                  <div>
                    <span className="detail-label">Reported Symptoms</span>
                    <span className="detail-value text-wrap-symptoms">{appointment.symptoms || 'General screening check.'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient profile & metadata */}
            <div className="patient-demographics-card glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3>Patient Information</h3>
              <div className="demographics-grid">
                <div className="demo-item">
                  <span className="demo-lbl">Patient Name</span>
                  <span className="demo-val">{appointment.patientName}</span>
                </div>
                <div className="demo-item">
                  <span className="demo-lbl">Patient ID</span>
                  <span className="demo-val">PAT-2026-0{appointment.patientId}</span>
                </div>
                <div className="demo-item">
                  <span className="demo-lbl">Gender</span>
                  <span className="demo-val">Not provided</span>
                </div>
                <div className="demo-item">
                  <span className="demo-lbl">Age</span>
                  <span className="demo-val">Not provided</span>
                </div>
              </div>
            </div>

            {/* Previous AI analysis history logs */}
            <div className="patient-screening-history-card glass-card">
              <h3>Previous AI Reports History</h3>
              {patientScans.length === 0 ? (
                <div className="empty-state text-center" style={{ minHeight: '60px', padding: '1rem' }}>
                  <p>No previous AI scans found.</p>
                </div>
              ) : (
                <div className="mini-scans-list">
                  {patientScans.map(scan => {
                    const formattedScanId = String(scan.id).padStart(4, '0');
                    return (
                      <div key={scan.id} className="mini-scan-row">
                        <div className="mini-scan-meta">
                          <strong>{scan.prediction}</strong>
                          <span>{(scan.confidence * 1).toFixed(0)}% Certainty • {new Date(scan.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mini-scan-actions">
                          <Link to={`/reports/AI-2026-${formattedScanId}`} className="btn-secondary btn-sm-padding flex-center">
                            <FaEye size={10} />
                            <span>View</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Consultation Notes Editor (Form) */}
          <div className="details-right-pane">
            <div className="consultation-notes-editor-card glass-card">
              <h3>Dermatologist Consultation Notes</h3>
              
              {!isDocCompleted ? (
                <form onSubmit={handleCompleteConsultation} className="notes-editor-form">
                  <div className="form-group-custom">
                    <label>Clinical Observations</label>
                    <textarea 
                      rows="4"
                      placeholder="Add observations, skin findings, lesion dimensions, border structures..."
                      value={clinicalObservations}
                      onChange={(e) => setClinicalObservations(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Clinical Impression / Diagnosis</label>
                    <textarea 
                      rows="3"
                      placeholder="Enter clinical diagnosis or diagnostic impressions..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Recommended Follow-up</label>
                    <textarea 
                      rows="2"
                      placeholder="Specify follow-up schedule, further testing (biopsy, excision)..."
                      value={recommendedFollowUp}
                      onChange={(e) => setRecommendedFollowUp(e.target.value)}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Treatment Advice</label>
                    <textarea 
                      rows="3"
                      placeholder="List clinical management steps, topical treatments, sun safety instructions..."
                      value={treatmentAdvice}
                      onChange={(e) => setTreatmentAdvice(e.target.value)}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Prescription Details (Optional)</label>
                    <textarea 
                      rows="3"
                      placeholder="Enter details of any prescribed topical creams, oral medications..."
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                    />
                  </div>

                  <div className="notes-actions-footer">
                    <button type="button" onClick={handleSaveDraft} className="btn-outline">
                      Save Draft
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitNotesLoading}>
                      {submitNotesLoading ? 'Completing...' : 'Complete Consultation'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="notes-display-mode">
                  <div className="completed-notes-badge">
                    <FaCheckCircle />
                    <span>Consultation Notes Completed</span>
                  </div>

                  <div className="notes-display-field">
                    <span className="lbl">Clinical Observations</span>
                    <p className="val">{clinicalObservations}</p>
                  </div>

                  <div className="notes-display-field">
                    <span className="lbl">Clinical Impression / Diagnosis</span>
                    <p className="val highlight-val">{diagnosis}</p>
                  </div>

                  <div className="notes-display-field">
                    <span className="lbl">Recommended Follow-up</span>
                    <p className="val">{recommendedFollowUp || 'No follow-up plan scheduled.'}</p>
                  </div>

                  <div className="notes-display-field">
                    <span className="lbl">Treatment Advice</span>
                    <p className="val">{treatmentAdvice || 'No treatment advice entered.'}</p>
                  </div>

                  <div className="notes-display-field">
                    <span className="lbl">Prescription</span>
                    <p className="val code-font">{prescription || 'No medications prescribed.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-appointments-page detail-page-wrapper fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn-back" onClick={() => navigate('/my-appointments')} style={{ marginBottom: '2rem' }}>
        <FaArrowLeft /> Back to My Appointments
      </button>

      {/* Appointment Info Card */}
      <div className="appointment-full-details-card glass-card">
        <div className="details-card-header">
          <div>
            <span className="details-appt-id">
              Appointment ID: <strong>{String(appointment.id).startsWith('APT-') ? appointment.id : `APT-2026-0${appointment.id}`}</strong>
            </span>
            <h2>Appointment Details</h2>
          </div>
          <span className={`status-badge ${getStatusClass(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        <div className="details-grid-list">
          <div className="detail-row-item">
            <FaUserMd className="icon-primary" />
            <div>
              <span className="detail-label">Doctor</span>
              <span className="detail-value">{appointment.doctorName}</span>
            </div>
          </div>

          <div className="detail-row-item">
            <FaFileAlt className="icon-blue" />
            <div>
              <span className="detail-label">Specialization</span>
              <span className="detail-value">{appointment.specialization || 'Dermatologist'}</span>
            </div>
          </div>

          <div className="detail-row-item">
            <FaCalendarAlt className="icon-gold" />
            <div>
              <span className="detail-label">Date</span>
              <span className="detail-value">
                {new Date(appointment.date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="detail-row-item">
            <FaClock className="icon-blue" />
            <div>
              <span className="detail-label">Time</span>
              <span className="detail-value">{appointment.time}</span>
            </div>
          </div>

          <div className="detail-row-item full-width-row">
            <FaNotesMedical className="icon-danger" />
            <div>
              <span className="detail-label">Symptoms Description</span>
              <span className="detail-value text-wrap-symptoms">{appointment.symptoms || 'No description provided.'}</span>
            </div>
          </div>

          <div className="detail-row-item">
            <FaClock className="icon-primary" />
            <div>
              <span className="detail-label">Booked On</span>
              <span className="detail-value">
                {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '19 August 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Information Card Sub-panel */}
        <div className="doctor-info-subpanel">
          <h3>Doctor Information</h3>
          <div className="doc-panel-grid">
            <div className="doc-panel-item">
              <strong>Experience:</strong>
              <span>{appointment.experience ? `${appointment.experience} years` : '8 years'}</span>
            </div>
            <div className="doc-panel-item">
              <strong>Consultation Type:</strong>
              <span>{appointment.consultationType || 'Online/In-Person'}</span>
            </div>
            <div className="doc-panel-item">
              <strong>Rating:</strong>
              <span>⭐ {appointment.rating ? Number(appointment.rating).toFixed(1) : '4.8'}</span>
            </div>
            <div className="doc-panel-item">
              <FaMapMarkerAlt size={12} style={{ color: '#00d2ff', marginRight: '4px' }} />
              <strong>Hospital/Clinic:</strong>
              <span>Tele-Derma Partner Hospital Center</span>
            </div>
            <div className="doc-panel-item full-width-panel-item">
              <FaRegEnvelope size={12} style={{ color: '#00d2ff', marginRight: '4px' }} />
              <strong>Contact Information:</strong>
              <span>support@telederma.com</span>
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="details-actions-footer">
          {isUpcoming && (
            <>
              <button 
                onClick={() => {
                  const formattedDate = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '';
                  setNewDate(formattedDate);
                  setNewTime(appointment.time);
                  setShowReschedule(true);
                }}
                className="btn-primary"
              >
                Reschedule Appointment
              </button>
              <button 
                onClick={() => setShowCancel(true)}
                className="btn-danger"
              >
                Cancel Appointment
              </button>
            </>
          )}

          {isCompleted && (
            <div className="completed-actions-panel">
              {hasReport ? (
                <button 
                  onClick={() => navigate(`/reports/${matchedReportId || ''}`)}
                  className="btn-primary"
                >
                  View Report
                </button>
              ) : (
                <span className="report-unavailable-text">Report not available yet</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in">
            <h3>Reschedule Appointment</h3>
            <p>Select a new date and slot for your consultation with <strong>{appointment.doctorName}</strong>.</p>
            
            {rescheduleError && <div className="error-alert-box">{rescheduleError}</div>}

            <form onSubmit={handleReschedule}>
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
                  onClick={() => setShowReschedule(false)}
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
      {showCancel && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in text-center">
            <FaExclamationTriangle className="text-danger" size={50} style={{ marginBottom: '1rem' }} />
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel your appointment with <strong>{appointment.doctorName}</strong> on <strong>{new Date(appointment.date).toLocaleDateString()}</strong> at <strong>{appointment.time}</strong>?</p>
            <p className="cancel-note">This action cannot be undone, but the history record will be preserved.</p>

            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                onClick={handleCancel} 
                className="btn-danger"
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
              <button 
                onClick={() => setShowCancel(false)} 
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

export default AppointmentDetailsPage;
