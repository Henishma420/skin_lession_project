import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaRobot, 
  FaUserMd, 
  FaBookOpen, 
  FaShieldAlt, 
  FaChevronRight, 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaFileMedical 
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { token, user } = useAuth();

  return (
    <div className="home-container fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          {token ? (
            <>
              <span className="badge-ai authenticated">Clinical Portal Active</span>
              <h1 className="hero-title">Welcome Back, {user?.name || 'User'}!</h1>
              <p className="hero-subtitle">
                You are currently signed in as a <span style={{ fontWeight: 600, color: '#3b82f6', textTransform: 'capitalize' }}>{user?.role || 'member'}</span>. 
                Jump straight to your clinical dashboard, check recent AI screenings, or manage appointments.
              </p>
              <div className="hero-actions">
                <Link to="/dashboard" className="btn-primary">
                  <span>Go to Dashboard</span>
                  <FaChevronRight size={12} />
                </Link>
                {user?.role === 'patient' ? (
                  <Link to="/analysis" className="btn-outline">
                    <span>Start AI Screening</span>
                  </Link>
                ) : (
                  <Link to="/reports" className="btn-outline">
                    <span>Review Reports</span>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="badge-ai">AI-Assisted Dermatology</span>
              <h1 className="hero-title">Early Skin Lesion Screening</h1>
              <p className="hero-subtitle">
                Leveraging state-of-the-art deep learning to flag potential skin concerns. 
                Empowering you with AI-assisted screenings, while trusted board-certified dermatologists provide the final clinical diagnosis.
              </p>
              <div className="hero-actions">
                <Link to="/login" className="btn-primary">
                  <span>Get Started</span>
                  <FaChevronRight size={12} />
                </Link>
                <Link to="/library" className="btn-outline">
                  <span>Skin Library</span>
                </Link>
              </div>
          </>
          )}
        </div>
      </section>

      {/* Dashboard Quick Access Portal for Logged-In Users */}
      {token && (
        <section className="quick-portal-section fade-in">
          <h2 className="section-title">Your Quick Access Portal</h2>
          <p className="section-subtitle-description">
            Quickly jump into the primary portal functionalities of the Tele-Derma AI platform.
          </p>
          
          <div className="grid-3 portal-grid">
            {/* Card 1: Dashboard Overview */}
            <Link to="/dashboard" className="service-card glass-card portal-card">
              <div className="card-icon-container bg-primary-light">
                <FaTachometerAlt className="card-icon text-primary" />
              </div>
              <h3>Clinical Dashboard</h3>
              <p>View overview statistics, case highlights, recent appointments, and active AI screening stats.</p>
              <span className="card-link">
                <span>View Dashboard</span>
                <FaChevronRight size={10} />
              </span>
            </Link>

            {/* Card 2: AI Scan Assistant / Case Review */}
            {user?.role === 'patient' ? (
              <Link to="/analysis" className="service-card glass-card portal-card">
                <div className="card-icon-container bg-accent-light">
                  <FaRobot className="card-icon text-accent" />
                </div>
                <h3>AI Skin Scan</h3>
                <p>Securely upload pictures of lesions to analyze risk probabilities and view heatmaps instantly.</p>
                <span className="card-link">
                  <span>Start Screening</span>
                  <FaChevronRight size={10} />
                </span>
              </Link>
            ) : (
              <Link to="/reports" className="service-card glass-card portal-card">
                <div className="card-icon-container bg-accent-light">
                  <FaFileMedical className="card-icon text-accent" />
                </div>
                <h3>Patient Cases</h3>
                <p>Examine patient AI scan results, check confidence levels, and input clinical reports.</p>
                <span className="card-link">
                  <span>Review Cases</span>
                  <FaChevronRight size={10} />
                </span>
              </Link>
            )}

            {/* Card 3: Consultations / Doctor Booking */}
            <Link to="/appointments" className="service-card glass-card portal-card">
              <div className="card-icon-container bg-secondary-light">
                <FaCalendarAlt className="card-icon text-secondary" />
              </div>
              <h3>Appointments</h3>
              <p>Book a consultation, view clinical availability, and manage your scheduled virtual meetups.</p>
              <span className="card-link">
                <span>Manage Appointments</span>
                <FaChevronRight size={10} />
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Trust & Workflow Disclaimer Banner */}
      <section className="disclaimer-banner glass-card">
        <div className="banner-icon-wrapper">
          <FaShieldAlt className="banner-icon" />
        </div>
        <div className="banner-text">
          <h3>The Clinical Workflow: AI + Expert Review</h3>
          <p>
            Our technology is designed for early-stage screening. The AI flags risk scores and shows highlights, 
            but a licensed doctor always makes the final diagnosis and signs off on your clinical reports.
          </p>
        </div>
      </section>

      {/* Services Grid (Always shown as a reference) */}
      <section className="services-section">
        <h2 className="section-title">Explore Our Platform Services</h2>
        <div className="grid-3">
          
          {/* Card 1 */}
          <div className="service-card glass-card">
            <div className="card-icon-container bg-primary-light">
              <FaRobot className="card-icon text-primary" />
            </div>
            <h3>AI Skin Analysis</h3>
            <p>Upload a clear photo of any skin lesion to get instant risk probability scores and Grad-CAM neural network visual overlays.</p>
            <Link to="/analysis" className="card-link">
              <span>Screen a Lesion</span>
              <FaChevronRight size={10} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="service-card glass-card">
            <div className="card-icon-container bg-secondary-light">
              <FaUserMd className="card-icon text-secondary" />
            </div>
            <h3>Consult a Dermatologist</h3>
            <p>Schedule online or in-person appointments with leading dermatologists. Share your AI reports for direct clinical feedback.</p>
            <Link to="/doctors" className="card-link">
              <span>Find a Specialist</span>
              <FaChevronRight size={10} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="service-card glass-card">
            <div className="card-icon-container bg-accent-light">
              <FaBookOpen className="card-icon text-accent" />
            </div>
            <h3>Skin Health Library</h3>
            <p>Learn about common skin lesions: Melanoma, Basal Cell Carcinoma (BCC), Nevus, AKIEC, and prevention best practices.</p>
            <Link to="/library" className="card-link">
              <span>Read Clinical Guide</span>
              <FaChevronRight size={10} />
            </Link>
          </div>

        </div>
      </section>

      {/* How it Works Workflow Section */}
      <section className="workflow-section">
        <h2 className="section-title text-center">How Tele-Derma AI Works</h2>
        <div className="workflow-steps">
          <div className="step-item">
            <div className="step-number">1</div>
            <h4>Capture & Upload</h4>
            <p>Take a well-lit photo of the skin lesion and upload it securely.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h4>AI Diagnostics</h4>
            <p>Neural networks assess risk levels and map visual highlights using Grad-CAM.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h4>Doctor Consultation</h4>
            <p>Share your reports with board-certified specialists for final clinical signoff.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
