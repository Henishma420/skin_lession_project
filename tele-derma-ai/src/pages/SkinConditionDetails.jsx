import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaInfoCircle, 
  FaStethoscope, 
  FaMapMarkerAlt, 
  FaProcedures,
  FaRobot,
  FaHeartbeat
} from 'react-icons/fa';
import skinConditions from '../data/skinConditions';
import './Library.css';

const SkinConditionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const condition = skinConditions.find(item => item.id === id);

  if (!condition) {
    return (
      <div className="library-page detail-view fade-in">
        <header className="page-header detail-header">
          <button className="btn-back" onClick={() => navigate('/library')}>
            <FaArrowLeft /> Back to Skin Library
          </button>
          <h1>Condition Not Found</h1>
          <p>The skin condition you are looking for does not exist in our library.</p>
        </header>
      </div>
    );
  }

  // Get related conditions objects
  const relatedList = condition.relatedConditions
    .map(relId => skinConditions.find(item => item.id === relId))
    .filter(Boolean);

  return (
    <div className="library-page detail-view fade-in">
      {/* Navigation Top */}
      <button className="btn-back" onClick={() => navigate('/library')}>
        <FaArrowLeft /> Back to Skin Library
      </button>

      {/* Clinical Image Section */}
      <div className="detail-image-section">
        <img 
          src={condition.image} 
          alt={condition.imageAlt} 
          className="clinical-image" 
        />
        <div className="image-caption-container">
          <p className="image-caption">{condition.imageCaption}</p>
          <span className="image-disclaimer">
            Images are provided for educational purposes only and should not be used for self-diagnosis.
          </span>
        </div>
      </div>

      {/* Header Info */}
      <header className="detail-header-info">
        <div className="header-title-wrapper">
          <div className="title-left">
            <h1>{condition.name}</h1>
            {condition.scientificName && <span className="scientific-name">({condition.scientificName})</span>}
          </div>
          <span className={`status-badge ${
            condition.category === 'Cancerous' ? 'status-malignant' : 
            condition.category === 'Precancerous' ? 'status-precancerous' : 'status-benign'
          }`}>
            {condition.cancerStatus}
          </span>
        </div>
        <p className="detail-short-desc">{condition.shortDescription}</p>
      </header>

      {/* Quick Facts Section */}
      <section className="quick-facts-section">
        <h3>Quick Facts</h3>
        <div className="quick-facts-grid">
          <div className="fact-card glass-card">
            <span className="fact-label">Category</span>
            <span className="fact-value">{condition.scientificName || condition.name}</span>
          </div>
          <div className="fact-card glass-card">
            <span className="fact-label">Cancer Status</span>
            <span className="fact-value">{condition.cancerStatus}</span>
          </div>
          <div className="fact-card glass-card">
            <span className="fact-label">Common Location</span>
            <span className="fact-value">Skin / Integumentary</span>
          </div>
          <div className="fact-card glass-card">
            <span className="fact-label">Diagnosis</span>
            <span className="fact-value">Exam, Dermoscopy, Biopsy</span>
          </div>
          <div className="fact-card glass-card">
            <span className="fact-label">Treatment</span>
            <span className="fact-value">Observation, Surgery, Topical</span>
          </div>
          <div className="fact-card glass-card">
            <span className="fact-label">Prevention</span>
            <span className="fact-value">Sun protection, Monitoring</span>
          </div>
        </div>
      </section>

      {/* Main Details Grid Layout */}
      <div className="detail-grid">
        {/* Left Column: Overview, Diagnosis, Treatment */}
        <div className="detail-left-column">
          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaInfoCircle className="icon-primary" />
              <h4>Overview</h4>
            </div>
            <p className="detail-card-content">{condition.overview}</p>
          </div>

          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaStethoscope className="icon-blue" />
              <h4>Common Forms of Diagnosis</h4>
            </div>
            <div className="detail-card-content">
              <p className="clinical-explanation-text">
                Dermatological assessment always begins with clinical screenings, while confirmatory diagnosis is obtained via laboratory testing:
              </p>
              <ul>
                {condition.diagnosis.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaProcedures className="icon-purple" />
              <h4>Treatment & Management</h4>
            </div>
            <div className="detail-card-content">
              <ul>
                {condition.treatment.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <p className="clinical-disclaimer-note">
                * Treatment decisions should be made by a qualified healthcare professional based on the individual patient's condition.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Symptoms, Locations, Risks, Prevention */}
        <div className="detail-right-column">
          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaHeartbeat className="icon-primary" />
              <h4>Common Symptoms & Characteristics</h4>
            </div>
            <div className="detail-card-content">
              <ul>
                {condition.symptoms.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaMapMarkerAlt className="icon-gold" />
              <h4>Common Locations</h4>
            </div>
            <div className="detail-card-content">
              <ul>
                {condition.commonLocations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaExclamationTriangle className="icon-danger" />
              <h4>Risk Factors</h4>
            </div>
            <div className="detail-card-content">
              <ul>
                {condition.riskFactors.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-card glass-card">
            <div className="detail-card-header-inner">
              <FaShieldAlt className="icon-success" />
              <h4>Clinical Prevention & Monitoring</h4>
            </div>
            <div className="detail-card-content">
              <ul>
                {condition.prevention.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Signs Callout */}
      {condition.warningSigns && condition.warningSigns.length > 0 && (
        <section className="warning-signs-section glass-card">
          <div className="warning-signs-header">
            <FaExclamationTriangle className="warning-icon" />
            <h3>⚠️ Key Warning Signs & When to See a Doctor</h3>
          </div>
          <div className="warning-signs-content">
            <p className="warning-explanation">
              You should prompt professional evaluation immediately if you notice any of the following warning signs. For pigmented lesions, use the ABCDE checklist as a screening guide:
            </p>
            <ul>
              {condition.warningSigns.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="warning-note">
              * Note: The ABCDE checklist is an educational screening aid. It does not replace a professional dermatological evaluation or biopsy.
            </p>
          </div>
        </section>
      )}

      {/* Prognosis Section */}
      <section className="prognosis-section glass-card">
        <h3>Prognosis & Outlook</h3>
        <p>{condition.prognosis}</p>
      </section>

      {/* Related Skin Conditions */}
      {relatedList.length > 0 && (
        <section className="related-conditions-section">
          <h3>Related Skin Conditions</h3>
          <div className="related-conditions-grid">
            {relatedList.map((rel) => (
              <div 
                key={rel.id} 
                className="related-card glass-card"
                onClick={() => navigate(`/skin-library/${rel.id}`)}
              >
                <h4>{rel.name}</h4>
                <p>{rel.shortDescription}</p>
                <span className="related-link">Learn More &rarr;</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Analysis Integration CTA */}
      <section className="ai-analysis-cta-box glass-card">
        <div className="cta-left-content">
          <FaRobot className="cta-ai-icon" />
          <div>
            <h3>Want to analyze a skin lesion?</h3>
            <p>Upload a skin image to get an AI-assisted classification and screening analysis.</p>
            <span className="cta-disclaimer">
              * Note: AI analysis is strictly assistive and educational. It does not replace a professional clinical diagnosis.
            </span>
          </div>
        </div>
        <button 
          className="btn-cta-navigate" 
          onClick={() => navigate('/analysis')}
        >
          Go to AI Analysis &rarr;
        </button>
      </section>

      {/* Medical Disclaimer Footer */}
      <footer className="detail-footer-disclaimer">
        <p>
          <strong>Medical Disclaimer:</strong> This information is provided for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. If you notice a new, changing, bleeding, or suspicious skin lesion, consult a qualified healthcare professional immediately.
        </p>
      </footer>
    </div>
  );
};

export default SkinConditionDetails;
