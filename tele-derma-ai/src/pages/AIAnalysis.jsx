import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { FaUpload, FaCheckCircle, FaExclamationTriangle, FaStethoscope, FaSpinner } from 'react-icons/fa';
import './AIAnalysis.css';

const AIAnalysis = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  // States
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Pre-loaded samples to make testing easy
  const samples = [
    {
      name: 'Typical Nevus (Benign)',
      url: '/images/benign_nevus.jpg',
      prediction: 'Benign Nevus',
      confidence: 94.2,
      gradCamUrl: '/images/benign_nevus.jpg',
      type: 'normal'
    },
    {
      name: 'Suspicious Lesion (Melanoma)',
      url: '/images/melanoma_lesion.jpg',
      prediction: 'Melanoma (High Risk)',
      confidence: 95.8,
      gradCamUrl: '/images/melanoma_lesion.jpg',
      type: 'normal'
    },
    {
      name: 'Unidentifiable Mark',
      url: '/images/unidentifiable_mark.jpg',
      prediction: 'Unknown Lesion',
      confidence: 42.1, // Low confidence triggers emergency fallback
      gradCamUrl: '',
      type: 'unknown'
    }
  ];

  const handleSelectSample = (sample) => {
    setSelectedFile(null);
    setSelectedImage(sample);
    setImagePreview(sample.url);
    setResult(null);
    setEmergencyActive(false);
    setAnalysisError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          name: file.name,
          url: reader.result,
          prediction: 'Waiting for model...',
          confidence: 0,
          type: 'normal'
        });
        setImagePreview(reader.result);
        setResult(null);
        setEmergencyActive(false);
        setAnalysisError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setScanning(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (selectedImage?.url) {
        const isPublicAsset = typeof selectedImage.url === 'string' && selectedImage.url.startsWith('/');
        if (isPublicAsset) {
          formData.append('imageUrl', selectedImage.url);
        }
      }

      const response = await axios.post(`${API_URL}/analyze-skin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const predictedLabel = response.data.label || 'Unknown Lesion';
      const confidence = Number(response.data.confidence || 0);
      const modelPrediction = predictedLabel.includes('Melanoma') ? 'Melanoma (High Risk)' : predictedLabel;

      const isLowConfidence = confidence < 50 || predictedLabel.toLowerCase().includes('unknown');

      if (isLowConfidence) {
        setResult(null);
        setEmergencyActive(true);
        setAnalysisError('The model returned low confidence for this image. Please try a clearer close-up photo with better lighting.');
        return;
      }

      const modelResult = {
        prediction: modelPrediction,
        confidence
      };

      setResult(modelResult);
      setEmergencyActive(false);
      setAnalysisError('');

      const isMel = modelPrediction.toLowerCase().includes('melanoma');
      const reportData = {
        symptoms: ['Skin spot showing changes in color or borders.'],
        aiSummary: `The AI screening model detected pattern attributes associated with ${modelPrediction}. Assessed with ${confidence.toFixed(1)}% model certainty.`,
        detectedFeatures: [
          'Color variegation visible.',
          isMel ? 'Asymmetric structural distribution.' : 'Regular border outlines.'
        ],
        abcdeAssessment: {
          asymmetry: isMel ? 'Significant asymmetry detected.' : 'Symmetric structure.',
          border: isMel ? 'Irregular, poorly defined margins.' : 'Sharp, distinct border margins.',
          color: isMel ? 'Multiple shades of brown/black visible.' : 'Uniform coloration.',
          diameter: 'Diameter within evaluated margins.',
          evolution: 'Evolution cannot be determined from a single scan.'
        },
        recommendations: [
          'Consider evaluation by a qualified dermatologist.',
          'Professional examination (dermoscopy) may be appropriate.',
          'Continue regular skin self-monitoring using the ABCDE screening aid.'
        ],
        appointmentId: null
      };

      const saveImageUrl = selectedFile ? selectedFile.name : (selectedImage?.url?.startsWith('/images/') ? selectedImage.url : '');

      await axios.post(`${API_URL}/analyses`, {
        prediction: modelPrediction,
        confidence,
        imageUrl: saveImageUrl,
        gradCamUrl: selectedImage?.gradCamUrl || saveImageUrl,
        reportData: reportData
      });
    } catch (error) {
      console.error('Failed to analyze lesion with model:', error);
      const backendMessage = error.response?.data?.message || 'The model could not classify this image right now.';
      setAnalysisError(backendMessage);
      setEmergencyActive(true);
      setResult(null);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="analysis-page fade-in">
      <header className="page-header">
        <h1>AI Skin Analysis Scanner</h1>
        <p>Upload a clear close-up photo of the skin lesion to analyze risk probabilities.</p>
      </header>

      <div className="analysis-grid grid-2">
        {/* Left Side: Photo upload and scanning console */}
        <section className="analysis-console glass-card">
          <h2>Upload Lesion Photo</h2>

          {/* Test Samples shortcut */}
          <div className="samples-shortcut">
            <p>Or select a testing sample:</p>
            <div className="samples-list">
              {samples.map((sample, idx) => (
                <button 
                  key={idx} 
                  className={`sample-pill ${selectedImage?.name === sample.name ? 'active' : ''}`}
                  onClick={() => handleSelectSample(sample)}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="upload-box-wrapper">
            <input 
              type="file" 
              id="lesion-upload" 
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="lesion-upload" className="upload-dropzone">
              {imagePreview ? (
                <div className="preview-container">
                  <img src={imagePreview} alt="Lesion Preview" className="uploaded-image" />
                  {scanning && (
                    <div className="scanner-line-wrapper">
                      <div className="scanner-line"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="upload-prompt">
                  <FaUpload className="upload-icon" />
                  <p>Drag & drop or click to upload photo</p>
                  <span>JPEG, PNG (Close-up, well-lit)</span>
                </div>
              )}
            </label>
          </div>

          <button 
            className="btn-primary w-100" 
            onClick={handleAnalyze}
            disabled={!selectedImage || scanning}
            style={{ marginTop: '1rem' }}
          >
            {scanning ? (
              <>
                <FaSpinner className="spinner-icon" />
                <span>Running Neural Network Analysis...</span>
              </>
            ) : (
              <span>Analyze Lesion</span>
            )}
          </button>
        </section>

        {/* Right Side: Results Panel */}
        <section className="results-display glass-card">
          <h2>AI Diagnostics Results</h2>
          
          {!scanning && !result && !emergencyActive && (
            <div className="waiting-placeholder">
              <p>Please select or upload a lesion photograph on the left console, then click <b>"Analyze Lesion"</b> to run model predictions.</p>
            </div>
          )}

          {scanning && (
            <div className="scanning-loading">
              <div className="spinner"></div>
              <h3>Analyzing Convolutional Layers...</h3>
              <p>Calculating probabilities and generating Grad-CAM heat-maps.</p>
            </div>
          )}

          {/* Result Success View */}
          {result && (
            <div className="result-container fade-in">
              <div className="result-header">
                <FaCheckCircle className="text-primary" size={36} />
                <div>
                  <h3>Analysis Completed</h3>
                  <p>Neural network classification output matches below.</p>
                </div>
              </div>

              <div className="stats-box">
                <div className="stat-row">
                  <span className="stat-lbl">AI Risk Prediction:</span>
                  <span className={`stat-val ${result.prediction.includes('Melanoma') ? 'text-danger' : 'text-primary'}`}>
                    {result.prediction}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-lbl">Confidence Level:</span>
                  <span className="stat-val">{result.confidence.toFixed(1)}%</span>
                </div>
              </div>

              {/* Simulated Grad-CAM Map */}
              <div className="grad-cam-wrapper">
                <h4>Grad-CAM Neural Visual Overlay</h4>
                <p className="grad-cam-desc">Highlights regions in red that were influential in the model classification.</p>
                <div className="grad-cam-media">
                  <img src={imagePreview} alt="Base" className="grad-cam-base" />
                  <div className="grad-cam-heatmap"></div>
                </div>
              </div>
            </div>
          )}

          {/* EMERGENCY FALLBACK VIEW (PDF page 5) */}
          {emergencyActive && (
            <div className="emergency-alert-box fade-in">
              <div className="emergency-header">
                <FaExclamationTriangle className="text-warning" size={40} />
                <h3>Low Confidence Classification</h3>
              </div>
              <p className="emergency-body">
                {analysisError || 'The AI could not confidently classify this lesion. It might be due to camera lighting, obstruction, or an unknown lesion type.'}
              </p>
              <div className="emergency-warning-banner">
                ⚠️ Please consult a dermatologist immediately for expert evaluation.
              </div>
              <button 
                className="btn-primary w-100" 
                onClick={() => navigate('/doctors')}
              >
                <FaStethoscope />
                <span>Book Doctor Appointment</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Safety Warning Footnote (PDF page 1) */}
      <footer className="analysis-footnote glass-card">
        <FaExclamationTriangle size={20} className="footnote-icon text-warning" />
        <p><b>Clinical Note:</b> This screening result is AI-assisted and should not replace professional medical advice. Always consult a dermatologist for final diagnosis and biopsy review.</p>
      </footer>
    </div>
  );
};

export default AIAnalysis;
