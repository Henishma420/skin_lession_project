const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./routes/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// --- Additional Endpoints to make the Tele-Derma AI Platform Fully Functional ---

// @route   GET /api/doctors
// @desc    Get all doctors (Dermatologists)
app.get('/api/doctors', async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.id, u.name, d.specialty, d.rating, d.experience_years, d.availability, d.consultation_type 
      FROM doctors d 
      JOIN users u ON d.id = u.id
    `);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments for the logged-in user (patient or doctor)
app.get('/api/appointments', authMiddleware, async (req, res) => {
  try {
    let query = '';
    if (req.user.role === 'doctor') {
      query = `
        SELECT 
          a.id, 
          a.date, 
          a.time, 
          a.symptoms, 
          a.status, 
          a.created_at AS createdAt,
          a.patient_id AS patientId,
          a.doctor_id AS doctorId,
          u.name AS patientName
        FROM appointments a 
        JOIN users u ON a.patient_id = u.id 
        WHERE a.doctor_id = ?
        ORDER BY a.date DESC, a.time DESC
      `;
    } else {
      query = `
        SELECT 
          a.id, 
          a.date, 
          a.time, 
          a.symptoms, 
          a.status, 
          a.created_at AS createdAt,
          a.patient_id AS patientId,
          a.doctor_id AS doctorId,
          u.name AS doctorName,
          d.specialty AS specialization,
          d.experience_years AS experience,
          d.consultation_type AS consultationType,
          d.rating AS rating
        FROM appointments a 
        JOIN users u ON a.doctor_id = u.id 
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.date DESC, a.time DESC
      `;
    }
    const [appointments] = await db.query(query, [req.user.id]);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get a single appointment by ID
app.get('/api/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const [appointments] = await db.query(`
      SELECT 
        a.id, 
        a.date, 
        a.time, 
        a.symptoms, 
        a.status, 
        a.created_at AS createdAt,
        a.patient_id AS patientId,
        a.doctor_id AS doctorId,
        u.name AS doctorName,
        d.specialty AS specialization,
        d.experience_years AS experience,
        d.consultation_type AS consultationType,
        d.rating AS rating
      FROM appointments a 
      JOIN users u ON a.doctor_id = u.id 
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ? AND (a.patient_id = ? OR a.doctor_id = ?)
    `, [req.params.id, req.user.id, req.user.id]);

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointments[0]);
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ message: 'Server error fetching appointment details' });
  }
});

// @route   POST /api/appointments
// @desc    Create a new appointment
app.post('/api/appointments', authMiddleware, async (req, res) => {
  const { doctorId, date, time, symptoms } = req.body;
  
  if (!doctorId || !date || !time || !symptoms) {
    return res.status(400).json({ message: 'Please select a doctor, date, time slot, and describe your symptoms.' });
  }

  try {
    // 1. Prevent duplicate bookings for same doctor, date, and time
    const [existing] = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != "cancelled"',
      [doctorId, date, time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked. Please select another time.' });
    }

    // 2. Insert new appointment
    const [result] = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, symptoms, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, doctorId, date, time, symptoms, 'pending']
    );
    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointmentId: result.insertId 
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error booking appointment' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Reschedule an existing appointment
app.put('/api/appointments/:id', authMiddleware, async (req, res) => {
  const { date, time } = req.body;
  const appointmentId = req.params.id;

  if (!date || !time) {
    return res.status(400).json({ message: 'Please provide both date and time to reschedule.' });
  }

  try {
    // Get existing appointment details to find doctorId
    const [appts] = await db.query('SELECT doctor_id, patient_id FROM appointments WHERE id = ?', [appointmentId]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { doctor_id: doctorId, patient_id: patientId } = appts[0];

    // Enforce patient ownership
    if (patientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reschedule this appointment.' });
    }

    // Prevent conflict with already occupied slots (by other patients/doctors)
    const [conflict] = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND id != ? AND status != "cancelled"',
      [doctorId, date, time, appointmentId]
    );

    if (conflict.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked. Please select another time.' });
    }

    // Update appointment
    await db.query(
      'UPDATE appointments SET date = ?, time = ?, status = "confirmed" WHERE id = ?',
      [date, time, appointmentId]
    );

    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Server error rescheduling appointment' });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an existing appointment
app.put('/api/appointments/:id/cancel', authMiddleware, async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const [appts] = await db.query('SELECT patient_id FROM appointments WHERE id = ?', [appointmentId]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appts[0].patient_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment.' });
    }

    await db.query('UPDATE appointments SET status = "cancelled" WHERE id = ?', [appointmentId]);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
});

// @route   GET /api/analyses
// @desc    Get analyses history (all for doctors, patient-specific for patients)
app.get('/api/analyses', authMiddleware, async (req, res) => {
  try {
    let query = '';
    let params = [];
    if (req.user.role === 'doctor') {
      query = `
        SELECT 
          a.id, 
          a.patient_id, 
          a.image_url, 
          a.prediction, 
          a.confidence, 
          a.grad_cam_url, 
          a.status, 
          a.created_at,
          a.report_data,
          r.doctor_opinion, 
          r.prescription, 
          r.created_at AS review_date,
          u.name AS doctor_name,
          p.name AS patient_name
        FROM analyses a 
        JOIN users p ON a.patient_id = p.id
        LEFT JOIN reports r ON a.id = r.analysis_id
        LEFT JOIN users u ON r.doctor_id = u.id
        ORDER BY a.created_at DESC
      `;
    } else {
      query = `
        SELECT 
          a.id, 
          a.patient_id, 
          a.image_url, 
          a.prediction, 
          a.confidence, 
          a.grad_cam_url, 
          a.status, 
          a.created_at,
          a.report_data,
          r.doctor_opinion, 
          r.prescription, 
          r.created_at AS review_date,
          u.name AS doctor_name
        FROM analyses a 
        LEFT JOIN reports r ON a.id = r.analysis_id
        LEFT JOIN users u ON r.doctor_id = u.id
        WHERE a.patient_id = ?
        ORDER BY a.created_at DESC
      `;
      params = [req.user.id];
    }
    const [analyses] = await db.query(query, params);
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ message: 'Server error fetching analyses' });
  }
});

// @route   POST /api/analyses
// @desc    Save an AI scan prediction and rich report data
app.post('/api/analyses', authMiddleware, async (req, res) => {
  const { prediction, confidence, imageUrl, gradCamUrl, reportData } = req.body;

  if (!prediction || confidence === undefined) {
    return res.status(400).json({ message: 'Please provide prediction and confidence details' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO analyses (patient_id, prediction, confidence, image_url, grad_cam_url, status, report_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id, 
        prediction, 
        confidence, 
        imageUrl || '', 
        gradCamUrl || '', 
        'Pending Dermatologist Review', 
        reportData ? JSON.stringify(reportData) : null
      ]
    );
    res.status(201).json({ 
      message: 'AI Scan saved successfully', 
      analysisId: result.insertId 
    });
  } catch (error) {
    console.error('Error saving AI analysis:', error);
    res.status(500).json({ message: 'Server error saving analysis' });
  }
});

// @route   POST /api/reports
// @desc    Submit a dermatologist review sign-off
app.post('/api/reports', authMiddleware, async (req, res) => {
  const { analysisId, doctorOpinion, prescription } = req.body;
  
  if (!analysisId || !doctorOpinion) {
    return res.status(400).json({ message: 'Please provide analysis ID and clinical opinion.' });
  }

  try {
    // Check if a review already exists
    const [existing] = await db.query('SELECT id FROM reports WHERE analysis_id = ?', [analysisId]);
    
    if (existing.length > 0) {
      await db.query(
        'UPDATE reports SET doctor_id = ?, doctor_opinion = ?, prescription = ?, created_at = CURRENT_TIMESTAMP WHERE analysis_id = ?',
        [req.user.id, doctorOpinion, prescription || '', analysisId]
      );
    } else {
      await db.query(
        'INSERT INTO reports (analysis_id, doctor_id, doctor_opinion, prescription) VALUES (?, ?, ?, ?)',
        [analysisId, req.user.id, doctorOpinion, prescription || '']
      );
    }
    
    // Update the analysis status to 'Reviewed' or 'Dermatologist Reviewed'
    await db.query(
      'UPDATE analyses SET status = "Reviewed" WHERE id = ?',
      [analysisId]
    );
    res.status(201).json({ message: 'Medical review submitted and saved successfully.' });
  } catch (error) {
    console.error('Error saving dermatologist review:', error);
    res.status(500).json({ message: 'Server error saving medical review' });
  }
});

// @route   DELETE /api/analyses/:id
// @desc    Delete an AI scan report and any associated oncologist comments
app.delete('/api/analyses/:id', authMiddleware, async (req, res) => {
  const reportId = req.params.id;
  try {
    const [appts] = await db.query('SELECT patient_id FROM analyses WHERE id = ?', [reportId]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (appts[0].patient_id !== req.user.id && req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized to delete this report.' });
    }

    await db.query('DELETE FROM analyses WHERE id = ?', [reportId]);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error deleting report' });
  }
});

// @route   GET /api/doctor/dashboard-stats
// @desc    Get dashboard metrics for logged-in doctor
app.get('/api/doctor/dashboard-stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Forbidden. Doctors only.' });
  }

  const doctorId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const [todayAppts] = await db.query(
      'SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND date = ? AND status != "cancelled"', 
      [doctorId, todayStr]
    );

    const [pendingReviews] = await db.query(`
      SELECT COUNT(DISTINCT a.id) AS count 
      FROM analyses a
      JOIN appointments appt ON a.patient_id = appt.patient_id
      WHERE appt.doctor_id = ? AND a.status = "Pending Dermatologist Review"
    `, [doctorId]);

    const [totalPatients] = await db.query(
      'SELECT COUNT(DISTINCT patient_id) AS count FROM appointments WHERE doctor_id = ?',
      [doctorId]
    );

    const [completedConsultations] = await db.query(
      'SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = "completed"',
      [doctorId]
    );

    res.json({
      todayAppointments: todayAppts[0]?.count || 0,
      pendingReviews: pendingReviews[0]?.count || 0,
      totalPatients: totalPatients[0]?.count || 0,
      completedConsultations: completedConsultations[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ message: 'Server error fetching doctor dashboard statistics' });
  }
});

// @route   GET /api/doctor/patients
// @desc    Get unique patients associated with the logged-in doctor
app.get('/api/doctor/patients', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Forbidden. Doctors only.' });
  }

  const doctorId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const [patients] = await db.query(`
      SELECT DISTINCT 
        p.id, 
        p.name, 
        p.email,
        (SELECT MAX(date) FROM appointments WHERE patient_id = p.id AND doctor_id = ? AND status = 'completed') AS lastConsultation,
        (SELECT COUNT(*) FROM analyses WHERE patient_id = p.id) AS reportsCount,
        (SELECT MIN(date) FROM appointments WHERE patient_id = p.id AND doctor_id = ? AND date >= ? AND status != 'cancelled') AS upcomingAppointment
      FROM users p
      JOIN appointments a ON p.id = a.patient_id
      WHERE a.doctor_id = ?
    `, [doctorId, doctorId, todayStr, doctorId]);

    res.json(patients);
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({ message: 'Server error fetching patients list' });
  }
});

// @route   GET /api/doctor/patients/:patientId
// @desc    Get profile, appointments, and report details for a patient
app.get('/api/doctor/patients/:patientId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Forbidden. Doctors only.' });
  }

  const doctorId = req.user.id;
  const patientId = req.params.patientId;

  try {
    const [relations] = await db.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1', 
      [doctorId, patientId]
    );
    if (relations.length === 0) {
      return res.status(403).json({ message: 'Not authorized to view this patient.' });
    }

    const [patient] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [patientId]);
    const [appts] = await db.query(
      'SELECT * FROM appointments WHERE patient_id = ? AND doctor_id = ? ORDER BY date DESC, time DESC', 
      [patientId, doctorId]
    );
    const [analyses] = await db.query(
      'SELECT id, prediction, confidence, image_url, status, created_at FROM analyses WHERE patient_id = ? ORDER BY created_at DESC', 
      [patientId]
    );

    res.json({
      profile: patient[0],
      appointments: appts,
      reports: analyses
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ message: 'Server error fetching patient clinical profile' });
  }
});

// @route   GET /api/doctor/recent-activity
// @desc    Get recent clinical activity for the doctor
app.get('/api/doctor/recent-activity', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const doctorId = req.user.id;

  try {
    // Dynamic query combining recent bookings and doctor reviews
    const [activity] = await db.query(`
      (SELECT CONCAT('New appointment booked by ', p.name) AS text, a.created_at AS time
       FROM appointments a 
       JOIN users p ON a.patient_id = p.id 
       WHERE a.doctor_id = ? 
       ORDER BY a.created_at DESC 
       LIMIT 3)
      UNION ALL
      (SELECT CONCAT('Reviewed ', p.name, '\\'s report') AS text, r.created_at AS time
       FROM reports r 
       JOIN analyses an ON r.analysis_id = an.id 
       JOIN users p ON an.patient_id = p.id 
       WHERE r.doctor_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT 3)
      ORDER BY time DESC 
      LIMIT 5
    `, [doctorId, doctorId]);

    res.json(activity);
  } catch (error) {
    console.error('Error fetching doctor activities:', error);
    res.status(500).json({ message: 'Server error fetching recent activity feed' });
  }
});

// @route   POST /api/appointments/:id/complete
// @desc    Submit consultation clinical notes and complete the appointment
app.post('/api/appointments/:id/complete', authMiddleware, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Forbidden. Doctors only.' });
  }

  const appointmentId = req.params.id;
  const { clinicalObservations, diagnosis, recommendedFollowUp, treatmentAdvice, prescription } = req.body;

  try {
    const [appts] = await db.query('SELECT doctor_id FROM appointments WHERE id = ?', [appointmentId]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appts[0].doctor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to sign off this appointment.' });
    }

    const notesJson = JSON.stringify({
      clinicalObservations: clinicalObservations || '',
      diagnosis: diagnosis || '',
      recommendedFollowUp: recommendedFollowUp || '',
      treatmentAdvice: treatmentAdvice || '',
      prescription: prescription || ''
    });

    await db.query(
      'UPDATE appointments SET status = "completed", consultation_notes = ? WHERE id = ?', 
      [notesJson, appointmentId]
    );

    res.json({ message: 'Consultation marked as completed successfully.' });
  } catch (error) {
    console.error('Error completing consultation:', error);
    res.status(500).json({ message: 'Server error completing consultation' });
  }
});

// Database Schema Migration (run once at startup)
(async () => {
  try {
    // 1. Alter analyses table to add report_data column
    try {
      await db.query(`ALTER TABLE analyses ADD COLUMN report_data LONGTEXT NULL`);
      console.log('✅ Database migration: report_data column verified.');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    // 2. Alter appointments table to add consultation_notes column
    try {
      await db.query(`ALTER TABLE appointments ADD COLUMN consultation_notes LONGTEXT NULL`);
      console.log('✅ Database migration: consultation_notes column verified.');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
  } catch (err) {
    console.error('❌ Database migration error:', err.message);
  }
})();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});
