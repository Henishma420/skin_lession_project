import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaNotesMedical, FaCheckCircle, FaStar, FaUserMd, FaSearch, FaEye } from 'react-icons/fa';
import appointmentService from '../services/appointmentService';
import './Appointment.css';

const Appointment = () => {
  const { API_URL, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Doctor appointments list state
  const [allDocAppointments, setAllDocAppointments] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch doctor appointments on load
  useEffect(() => {
    if (user?.role === 'doctor') {
      const loadDocAppts = async () => {
        try {
          const list = await appointmentService.fetchAppointments(API_URL, user);
          setAllDocAppointments(list);
        } catch (error) {
          console.error('Failed to load doctor appointments:', error);
        } finally {
          setDoctorLoading(false);
        }
      };
      loadDocAppts();
    }
  }, [API_URL, user]);

  // Route Params
  const queryDoctorId = searchParams.get('doctorId');
  const queryDoctorName = searchParams.get('doctorName');

  // Form states
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(queryDoctorId || '');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Already booked slots for the selected doctor & date
  const [bookedSlots, setBookedSlots] = useState([]);

  // Time slots list
  const timeSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM'];

  // Load doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_URL}/doctors`);
        setDoctors(response.data);
        if (!queryDoctorId && response.data.length > 0) {
          setSelectedDoctorId(String(response.data[0].id));
        }
      } catch (error) {
        console.error('Failed to load doctors list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [API_URL, queryDoctorId]);

  // Load already booked slots when selected doctor or date changes
  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!selectedDoctorId || !appointmentDate) {
        setBookedSlots([]);
        return;
      }
      try {
        const appts = await appointmentService.fetchAppointments(API_URL, user);
        // Filter appointments matching selected doctor, selected date, and not cancelled
        const slots = appts
          .filter(a => 
            Number(a.doctorId) === Number(selectedDoctorId) && 
            a.date === appointmentDate && 
            a.status !== 'cancelled'
          )
          .map(a => a.time);
        setBookedSlots(slots);
      } catch (error) {
        console.error('Failed to check slot availability:', error);
      }
    };
    loadBookedSlots();
  }, [selectedDoctorId, appointmentDate, API_URL, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!selectedDoctorId) {
      setErrorMsg('Please select a dermatologist.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Please select a date.');
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMsg('Please select a time slot.');
      return;
    }
    if (!symptoms.trim()) {
      setErrorMsg('Please provide a description of your symptoms.');
      return;
    }

    // Block past dates validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      setErrorMsg('Cannot book appointments in the past.');
      return;
    }

    setSubmitting(true);
    try {
      const apptData = {
        doctorId: selectedDoctorId,
        date: appointmentDate,
        time: selectedTimeSlot,
        symptoms
      };

      await appointmentService.bookAppointment(API_URL, apptData, user, doctors);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setErrorMsg(error.message || 'Failed to book appointment. Please select another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role === 'doctor') {
    if (doctorLoading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Doctor Consultations...</p>
        </div>
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const filteredDocAppts = allDocAppointments.filter(appt => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = q ? (
        appt.patientName?.toLowerCase().includes(q) ||
        appt.symptoms?.toLowerCase().includes(q) ||
        String(appt.id).includes(q)
      ) : true;

      const matchesDate = filterDate ? appt.date === filterDate : true;

      let matchesTab = true;
      const apptStatus = appt.status?.toLowerCase();
      
      if (activeTab === 'Today') {
        matchesTab = appt.date === todayStr && apptStatus !== 'cancelled';
      } else if (activeTab === 'Upcoming') {
        matchesTab = appt.date > todayStr && apptStatus !== 'cancelled' && apptStatus !== 'completed';
      } else if (activeTab === 'Completed') {
        matchesTab = apptStatus === 'completed';
      } else if (activeTab === 'Cancelled') {
        matchesTab = apptStatus === 'cancelled';
      }

      return matchesQuery && matchesDate && matchesTab;
    });

    return (
      <div className="appointment-page fade-in">
        <header className="page-header">
          <h1>Doctor Appointments</h1>
          <p>Track, manage, and review dermatologist consultation bookings assigned to you.</p>
        </header>

        {/* Tabs selector */}
        <div className="appt-tabs-bar">
          {['Today', 'Upcoming', 'Completed', 'Cancelled', 'All'].map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} Appointments
            </button>
          ))}
        </div>

        {/* Search controls */}
        <div className="appt-controls-bar glass-card">
          <div className="search-box-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search patient or symptoms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="date-filter-wrapper">
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onClick={(e) => {
                try { e.target.showPicker(); } catch(err) {}
              }}
            />
          </div>
        </div>

        {/* Table & Cards Layout */}
        <div className="doctor-appts-container">
          {filteredDocAppts.length === 0 ? (
            <div className="glass-card empty-state text-center" style={{ padding: '3.5rem' }}>
              <FaCalendarAlt size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }} />
              <h2>No Appointments Scheduled</h2>
              <p>No appointments match the active criteria in your schedule queue.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="doctor-appts-table glass-card hide-on-mobile">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocAppts.map(appt => (
                    <tr key={appt.id}>
                      <td>
                        <div className="patient-meta-cell">
                          <strong>{appt.patientName}</strong>
                          <span className="symptoms-inline-sub">Symptoms: {appt.symptoms || 'General Check'}</span>
                        </div>
                      </td>
                      <td>{appt.date}</td>
                      <td>{appt.time}</td>
                      <td>
                        <span className={`status-badge-inline status-${appt.status?.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-secondary btn-sm-padding flex-center" onClick={() => navigate(`/appointments/${appt.id}`)}>
                          <FaEye size={12} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card Grid View */}
              <div className="doctor-appts-cards-grid show-on-mobile">
                {filteredDocAppts.map(appt => (
                  <div key={appt.id} className="appt-card-mobile glass-card">
                    <div className="card-header">
                      <strong>{appt.patientName}</strong>
                      <span className={`status-badge-inline status-${appt.status?.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="meta-row">
                        <span>Date: {appt.date}</span>
                        <span>Time: {appt.time}</span>
                      </div>
                      <p><strong>Symptoms:</strong> {appt.symptoms || 'General check'}</p>
                    </div>
                    <button className="btn-secondary w-100 btn-sm-padding flex-center" onClick={() => navigate(`/appointments/${appt.id}`)}>
                      <FaEye size={12} />
                      <span>View Details</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Appointment Form...</p>
      </div>
    );
  }

  // Find currently selected doctor info
  const selectedDoctor = doctors.find(doc => Number(doc.id) === Number(selectedDoctorId));
  
  // Format date nicely for success message
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="appointment-page fade-in">
      <header className="page-header">
        <h1>Book Dermatologist Appointment</h1>
        <p>Choose an available slot and enter your symptoms for medical screening review.</p>
      </header>

      <div className="appointment-layout">
        {success ? (
          <div className="booking-success-card glass-card text-center fade-in">
            <FaCheckCircle className="success-check-icon" size={60} />
            <h2>Appointment Confirmed Successfully!</h2>
            <p className="success-confirm-msg">
              Your appointment with <strong>{queryDoctorName || selectedDoctor?.name}</strong> has been scheduled for <strong>{getFormattedDate(appointmentDate)}</strong> at <strong>{selectedTimeSlot}</strong>.
            </p>
            <div className="summary-details">
              <div><strong>Specialization:</strong> {selectedDoctor?.specialty || 'Dermatologist'}</div>
              <div><strong>Symptoms:</strong> {symptoms}</div>
            </div>
            <p className="redirect-note">Redirecting to Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="appointment-form glass-card">
            {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

            {/* Doctor Select */}
            <div className="form-group-custom">
              <label>Select Dermatologist</label>
              {queryDoctorId && queryDoctorName ? (
                <div className="static-doctor-box">
                  <FaUserMd className="doc-avatar-small" />
                  <div>
                    <strong>{queryDoctorName}</strong>
                    <span>(Dermatologist)</span>
                  </div>
                </div>
              ) : (
                <select 
                  value={selectedDoctorId} 
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setSelectedTimeSlot(''); // reset slot
                  }}
                  className="custom-select"
                  required
                >
                  <option value="" disabled>-- Select a Dermatologist --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Doctor Profile Details Card */}
            {selectedDoctor && (
              <div className="selected-doctor-profile-box fade-in">
                <div className="doc-profile-inner">
                  <div className="doc-rating">
                    <FaStar className="star-icon" />
                    <span>{selectedDoctor.rating}</span>
                  </div>
                  <div>
                    <strong>{selectedDoctor.name}</strong>
                    <div className="doc-meta-pills">
                      <span>Experience: {selectedDoctor.experience_years} years</span>
                      <span>•</span>
                      <span>Consultation: ₹{selectedDoctor.experience_years > 10 ? '700' : '500'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date Select */}
            <div className="form-group-custom">
              <label htmlFor="appt-date">Select Date</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="field-icon" />
                <input 
                  id="appt-date"
                  type="date" 
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]} // Block past dates
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setSelectedTimeSlot(''); // reset slot
                  }}
                  onClick={(e) => {
                    try {
                      e.target.showPicker();
                    } catch (err) {}
                  }}
                  required
                />
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="form-group-custom">
              <label>Select Time Slot</label>
              <div className="time-slots-grid">
                {timeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      className={`time-slot-btn ${selectedTimeSlot === slot ? 'active' : ''} ${isBooked ? 'booked-slot' : ''}`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      <FaClock size={12} />
                      <span>{slot}{isBooked ? ' – Booked' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptoms Input */}
            <div className="form-group-custom">
              <label htmlFor="appt-symptoms">Symptoms Description</label>
              <div className="textarea-with-icon">
                <FaNotesMedical className="field-icon-textarea" />
                <textarea
                  id="appt-symptoms"
                  rows="4"
                  placeholder="Describe your skin symptoms (e.g. itchy mole, change in spot size, redness, duration...)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100" 
              disabled={submitting}
              style={{ marginTop: '1rem' }}
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm Appointment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Appointment;
