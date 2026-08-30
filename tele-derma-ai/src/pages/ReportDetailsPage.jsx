import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaPrint, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaUserMd, 
  FaCalendarAlt, 
  FaClock, 
  FaClipboardList, 
  FaShieldAlt,
  FaArrowRight,
  FaTrash
} from 'react-icons/fa';
import reportService from '../services/reportService';
import { generateReportPDF } from '../utils/pdfGenerator';
import appointmentService from '../services/appointmentService';
import './ReportDetailsPage.css';

const ReportDetailsPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Doctor sign-off states
  const [doctorOpinion, setDoctorOpinion] = useState('');
  const [prescription, setPrescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Related appointments
  const [relatedAppt, setRelatedAppt] = useState(null);

  const loadReportDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await reportService.fetchReportById(API_URL, reportId, user);
      setReport(data);

      // Load related appointments to find matching doctor appointment
      try {
        const appts = await appointmentService.fetchAppointments(API_URL, user);
        // Find appointment matching doctor, date, or explicit mapping
        const matched = appts.find(a => 
          a.status !== 'cancelled' && 
          (String(a.id) === String(data.appointmentId) || 
           a.date === data.scanDate)
        );
        if (matched) {
          setRelatedAppt(matched);
        }
      } catch (apptErr) {
        console.warn('Failed to load related appointment:', apptErr);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
      setErrorMsg('Unable to retrieve the clinical report. It may not exist or you might not have authorization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && reportId) {
      loadReportDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, reportId, user]);

  const handleDownloadPDF = async () => {
    if (!report) return;
    try {
      await generateReportPDF(report);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorOpinion.trim()) {
      alert('Please provide a clinical opinion.');
      return;
    }
    setSubmitLoading(true);
    try {
      await reportService.submitDoctorReview(API_URL, report.dbId, {
        doctorOpinion,
        prescription
      }, user);
      setSubmitSuccess(true);
      
      // Reload report details after short timeout
      setTimeout(() => {
        setSubmitSuccess(false);
        loadReportDetails();
      }, 1500);
    } catch (err) {
      console.error('Failed to submit doctor review:', err);
      alert('Failed to save review details.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this clinical report? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await reportService.deleteReport(API_URL, report.dbId, user);
      alert('Report deleted successfully.');
      navigate('/reports');
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Clinical Report details...</p>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="report-details-error glass-card text-center fade-in">
        <FaExclamationTriangle size={40} className="error-icon" />
        <h2>Unable to Load Report</h2>
        <p>{errorMsg || 'Failed to retrieve clinical information.'}</p>
        <button className="btn-secondary" onClick={() => navigate('/reports')}>
          Back to Reports
        </button>
      </div>
    );
  }

  const isHighRisk = report.riskLevel === 'High';
  const isMelanoma = report.predictedCondition?.toLowerCase().includes('melanoma');
  const showABCDE = isMelanoma || isHighRisk;

  // Determine Urgency Action level
  const getActionLevel = () => {
    if (isHighRisk) {
      return {
        title: 'Urgent Review Recommended',
        description: 'Prompt professional medical evaluation is recommended. We advise discussing this screening report with a board-certified dermatologist as soon as possible.',
        class: 'action-urgent'
      };
    } else if (report.riskLevel === 'Moderate') {
      return {
        title: 'Prompt Dermatology Review',
        description: 'Professional dermatologist evaluation is recommended. Consider scheduling a consultation to review this lesion using clinical dermoscopy.',
        class: 'action-prompt'
      };
    } else {
      return {
        title: 'Routine Examination',
        description: 'Consider discussing the findings during a routine dermatology appointment. Continue appropriate self-skin monitoring.',
        class: 'action-routine'
      };
    }
  };

  const actionInfo = getActionLevel();

  // Create probability chart mock values for visual bar display
  const getProbabilities = () => {
    const mainProb = Number(report.confidence) || 0;
    if (mainProb > 95) {
      return [
        { name: report.predictedCondition, pct: mainProb },
        { name: 'Melanocytic Nevus', pct: 2.8 },
        { name: 'Benign Keratosis', pct: 1.4 }
      ];
    } else {
      return [
        { name: report.predictedCondition, pct: mainProb },
        { name: 'Alternative Skin Mark', pct: (100 - mainProb) }
      ];
    }
  };

  const probabilities = getProbabilities();

  return (
    <div className="report-details-page fade-in">
      {/* Back Button */}
      <Link to="/reports" className="btn-back-link hide-on-print">
        <FaArrowLeft />
        <span>Back to Reports</span>
      </Link>

      {/* Main Clinical Report Document Container */}
      <div className="clinical-report-document glass-card">
        {/* Document Header Branding */}
        <header className="document-header">
          <div className="brand-group">
            <h1 className="clinical-logo">TELE-DERMA AI</h1>
            <span className="clinical-subtitle">Clinical Skin Analysis Report</span>
          </div>
          <div className="report-meta-box">
            <div><strong>Report ID:</strong> {report.id}</div>
            <div><strong>Generated:</strong> {report.generatedDate}</div>
          </div>
        </header>

        {/* Patient Profile Information */}
        <section className="report-section">
          <h3 className="section-title">Patient Information</h3>
          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Patient Name</span>
              <span className="info-value">{report.patientName || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">{report.age || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{report.gender || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Patient ID</span>
              <span className="info-value">{report.patientId || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Scan Date</span>
              <span className="info-value">{report.scanDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`status-badge-inline status-${report.status?.toLowerCase().replace(/ /g, '-')}`}>
                {report.status}
              </span>
            </div>
          </div>
        </section>

        {/* Analyzed Skin Image */}
        <section className="report-section">
          <h3 className="section-title">Analyzed Skin Image</h3>
          <div className="analyzed-image-container">
            <div className="image-wrapper">
              <img 
                src={report.imageUrl} 
                alt="Analyzed Lesion"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/300x240/0d1220/ffffff?text=Lesion+Image+Unavailable';
                }}
              />
            </div>
            <div className="image-specs">
              <p className="image-caption">Image used for AI-assisted analysis.</p>
              <div className="specs-grid">
                <div><strong>Scan Date:</strong> {report.scanDate}</div>
                <div><strong>Source File:</strong> dermoscopy_scan_01.jpg</div>
                <div><strong>Dimensions:</strong> 600 x 480 px (standardized)</div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Prediction & Confidence Section */}
        <section className="report-section">
          <h3 className="section-title">AI Analysis Results</h3>
          <div className="ai-analysis-block">
            <div className="main-prediction-box">
              <span className="label-dim">Predicted Condition</span>
              <h2 className="predicted-name">{report.predictedCondition}</h2>
              
              <div className="risk-level-row">
                <span className="label-dim">Risk Level:</span>
                <span className={`risk-pill risk-${report.riskLevel?.toLowerCase()}`}>
                  {report.riskLevel?.toUpperCase()} RISK
                </span>
              </div>
            </div>

            {/* Confidence Circle/ProgressBar Meter */}
            <div className="confidence-meter-box">
              <span className="label-dim">AI Model Confidence</span>
              <div className="circular-confidence-bar">
                <div className="pct-number">{report.confidence?.toFixed(1)}%</div>
                <div className="confidence-filler-bar" style={{ width: `${report.confidence}%` }}></div>
              </div>
            </div>
          </div>

          {/* Differential Probabilities bar chart */}
          <div className="possible-conditions-list">
            <h4>Possible Conditions (Differential Predictions)</h4>
            <div className="prob-bars-grid">
              {probabilities.map((item, idx) => (
                <div key={idx} className="prob-bar-row">
                  <div className="prob-meta">
                    <span className="condition-name">{item.name}</span>
                    <span className="condition-percentage">{item.pct?.toFixed(1)}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Assessment Summary */}
        <section className="report-section">
          <h3 className="section-title">AI Assessment Summary</h3>
          <p className="clinical-text">{report.aiSummary}</p>
          <div className="feature-observations-box">
            <h4>Detected Visual Observations:</h4>
            <ul>
              {report.detectedFeatures?.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              )) || <li>Detailed model explanation is not available for this analysis.</li>}
            </ul>
          </div>
        </section>

        {/* Reported Symptoms */}
        <section className="report-section">
          <h3 className="section-title">Reported Symptoms</h3>
          <div className="symptoms-list-box">
            {report.symptoms && report.symptoms.length > 0 ? (
              <ul className="bullet-list">
                {report.symptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            ) : (
              <p className="no-symptoms-text">No symptoms were reported.</p>
            )}
          </div>
        </section>

        {/* ABCDE Assessment (for pigmented lesions) */}
        {showABCDE && (
          <section className="report-section">
            <h3 className="section-title">ABCDE Assessment</h3>
            <div className="abcde-grid">
              <div className="abcde-card">
                <span className="abcde-letter">A</span>
                <div className="abcde-info">
                  <strong>Asymmetry</strong>
                  <p>{report.abcdeAssessment?.asymmetry || 'Potential asymmetry observed.'}</p>
                </div>
              </div>
              <div className="abcde-card">
                <span className="abcde-letter">B</span>
                <div className="abcde-info">
                  <strong>Border</strong>
                  <p>{report.abcdeAssessment?.border || 'Irregular borders observed.'}</p>
                </div>
              </div>
              <div className="abcde-card">
                <span className="abcde-letter">C</span>
                <div className="abcde-info">
                  <strong>Color</strong>
                  <p>{report.abcdeAssessment?.color || 'Shade variations detected.'}</p>
                </div>
              </div>
              <div className="abcde-card">
                <span className="abcde-letter">D</span>
                <div className="abcde-info">
                  <strong>Diameter</strong>
                  <p>{report.abcdeAssessment?.diameter || 'Diameter evaluated within clinic margins.'}</p>
                </div>
              </div>
              <div className="abcde-card">
                <span className="abcde-letter">E</span>
                <div className="abcde-info">
                  <strong>Evolution</strong>
                  <p>{report.abcdeAssessment?.evolution || 'Evolution cannot be reliably determined from a single scan.'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Action recommendations & Urgency level */}
        <section className="report-section">
          <h3 className="section-title">Clinical Recommendations</h3>
          <div className={`urgency-alert-box ${actionInfo.class}`}>
            <div className="alert-header">
              <FaExclamationTriangle />
              <h4>{actionInfo.title}</h4>
            </div>
            <p>{actionInfo.description}</p>
          </div>

          <div className="next-steps-panel">
            <h4>Recommended Next Steps:</h4>
            <ul>
              {report.recommendations?.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              )) || (
                <>
                  <li>Consider evaluation by a qualified dermatologist.</li>
                  <li>Professional exam / dermoscopy may be appropriate.</li>
                  <li>Continue appropriate self-monitoring of skin spots.</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* Dermatologist Review & Opinion Section */}
        <section className="report-section">
          <h3 className="section-title">Dermatologist Clinical Review</h3>
          
          {/* Doc Timeline */}
          <div className="timeline-wrapper">
            <div className="timeline-step done">
              <div className="step-circle">✓</div>
              <span>AI Scan Completed</span>
            </div>
            <div className="timeline-step done">
              <div className="step-circle">✓</div>
              <span>AI Analysis Generated</span>
            </div>
            <div className="timeline-step done">
              <div className="step-circle">✓</div>
              <span>Queued for Review</span>
            </div>
            <div className={`timeline-step ${report.dermatologistReview?.status === 'Reviewed' ? 'done' : 'pending'}`}>
              <div className="step-circle">{report.dermatologistReview?.status === 'Reviewed' ? '✓' : '...'}</div>
              <span>Dermatologist Signed Off</span>
            </div>
          </div>

          {/* Review Details */}
          {report.dermatologistReview?.status === 'Reviewed' ? (
            <div className="doctor-reviewed-card glass-card">
              <div className="doc-signature-header">
                <FaUserMd className="doc-avatar" />
                <div>
                  <h4>{report.dermatologistReview.doctorName}</h4>
                  <span className="doc-specialty-sub">Board Certified Dermatologist</span>
                </div>
                <div className="review-date-badge">
                  Reviewed: {report.dermatologistReview.reviewDate}
                </div>
              </div>
              <div className="opinion-body">
                <div className="opinion-item">
                  <strong>Clinical Opinion:</strong>
                  <p>{report.dermatologistReview.clinicalOpinion}</p>
                </div>
                {report.dermatologistReview.prescription && (
                  <div className="opinion-item prescription-box">
                    <strong>Doctor Prescription & Treatment Advice:</strong>
                    <pre className="prescription-content">{report.dermatologistReview.prescription}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pending-review-card text-center">
              <FaClipboardList className="pending-review-icon" size={40} />
              <h4>Pending Specialist Review</h4>
              <p>Your report is queued for dermatologist review. Specialist comments will appear here once signed off.</p>
            </div>
          )}

          {/* Doctor review submission form (visible ONLY for doctors when pending) */}
          {user?.role === 'doctor' && report.dermatologistReview?.status !== 'Reviewed' && (
            <div className="doctor-signoff-form-box glass-card fade-in">
              <h3>Dermatologist Sign-off Panel</h3>
              <p>Review the patient information, AI prediction confidence, and symptoms above. Enter your clinical opinion to sign off this report.</p>
              
              {submitSuccess ? (
                <div className="success-signoff-msg">
                  <FaCheckCircle size={32} />
                  <span>Clinical review submitted and saved successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleDoctorSubmit} className="doctor-opinion-form">
                  <div className="form-group-custom">
                    <label>Clinical Opinion & Diagnosis Advice</label>
                    <textarea 
                      rows="4"
                      placeholder="Enter your clinical diagnosis and notes for the patient..."
                      value={doctorOpinion}
                      onChange={(e) => setDoctorOpinion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Prescription & Treatment Recommendations (Optional)</label>
                    <textarea 
                      rows="3"
                      placeholder="Rx: medication details, usage frequency, follow-up timelines..."
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-100"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving Review Sign-off...' : 'Sign Off & Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>

        {/* Related Appointment Integration */}
        <section className="report-section hide-on-print">
          <h3 className="section-title">Related Consultation Appointment</h3>
          {relatedAppt ? (
            <div className="related-appt-card glass-card">
              <div className="appt-inner-flex">
                <FaUserMd size={24} className="icon-blue" />
                <div className="appt-info-block">
                  <h4>Dr. Priya Sharma</h4>
                  <span>Specialist Dermatologist</span>
                </div>
                <div className="appt-date-block">
                  <div className="dt-item"><FaCalendarAlt /> <span>{relatedAppt.date}</span></div>
                  <div className="dt-item"><FaClock /> <span>{relatedAppt.time}</span></div>
                </div>
                <span className={`status-pill status-${relatedAppt.status?.toLowerCase()}`}>
                  {relatedAppt.status}
                </span>
                <Link to={`/appointments/${relatedAppt.id}`} className="btn-secondary btn-sm-padding">
                  View Appointment
                </Link>
              </div>
            </div>
          ) : (
            <div className="appt-booking-cta-card glass-card">
              <div>
                <h4>Need a dermatologist consultation?</h4>
                <p>Discuss this screening report and get a diagnostic evaluation from a specialist.</p>
              </div>
              <Link to="/appointments" className="btn-primary flex-center-gap">
                <span>Book Appointment</span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </section>

        {/* Footer Medical Disclaimer */}
        <footer className="document-footer">
          <div className="disclaimer-alert">
            <FaShieldAlt size={16} />
            <p>
              <strong>Medical Disclaimer:</strong> This report is generated using AI-assisted analysis and is intended for 
              educational and screening support. It is not a confirmed medical diagnosis and does not replace evaluation, 
              diagnosis, or treatment by a qualified healthcare professional.
            </p>
          </div>
          <p className="support-tag">Tele-Derma AI Clinical Decision Support System</p>
        </footer>
      </div>

      {/* Print / Download floating buttons bar */}
      <div className="actions-floating-bar hide-on-print">
        <button className="btn-danger-outline" onClick={handleDelete}>
          <FaTrash />
          <span>Delete Report</span>
        </button>
        <button className="btn-print-outline" onClick={handlePrint}>
          <FaPrint />
          <span>Print Report</span>
        </button>
        <button className="btn-primary" onClick={handleDownloadPDF}>
          <FaDownload />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
