import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserMd, FaHeartbeat, FaTint, FaStethoscope } from 'react-icons/fa';
import './Login.css'; // Reuse form styles

const Register = () => {
  const { register, token, loading } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [bloodType, setBloodType] = useState('O+');
  const [skinTypeFocus, setSkinTypeFocus] = useState('Melanoma');
  const [specialty, setSpecialty] = useState('Melanoma & High-Risk Lesions');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to Home
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const extraData = role === 'patient' 
      ? { bloodType } 
      : { specialty, skinTypeFocus };
    const result = await register(name, email, password, role, extraData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="login-page-wrapper fade-in">
      <div className="login-backdrop-glow"></div>

      <div className="login-card-container glass-card" style={{ maxWidth: '480px' }}>
        {/* Brand Header */}
        <div className="login-header">
          <FaHeartbeat className="login-brand-icon" />
          <h2>Create Account</h2>
          <p>Register as a Patient or Doctor to begin screening</p>
        </div>

        {/* Role Toggle for Registration */}
        <div className="role-tabs">
          <button 
            type="button" 
            className={`tab-btn ${role === 'patient' ? 'active' : ''}`}
            onClick={() => setRole('patient')}
          >
            <FaUser size={14} />
            <span>Patient</span>
          </button>
          <button 
            type="button" 
            className={`tab-btn ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            <FaUserMd size={14} />
            <span>Doctor</span>
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group-custom">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-field-wrapper">
              <FaUser className="field-icon" />
              <input 
                id="fullName"
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group-custom">
            <label htmlFor="email">Email Address</label>
            <div className="input-field-wrapper">
              <FaEnvelope className="field-icon" />
              <input 
                id="email"
                type="email" 
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group-custom">
            <label htmlFor="password">Password</label>
            <div className="input-field-wrapper">
              <FaLock className="field-icon" />
              <input 
                id="password"
                type="password" 
                placeholder="Create password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group-custom">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-field-wrapper">
              <FaLock className="field-icon" />
              <input 
                id="confirmPassword"
                type="password" 
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {role === 'patient' ? (
            <div className="input-group-custom">
              <label htmlFor="bloodType">Blood Group / Type</label>
              <div className="input-field-wrapper">
                <FaTint className="field-icon text-danger" />
                <select 
                  id="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '0.6rem 0.5rem', outline: 'none' }}
                >
                  <option value="O+" style={{ background: '#111827' }}>O+ (O Positive)</option>
                  <option value="O-" style={{ background: '#111827' }}>O- (O Negative)</option>
                  <option value="A+" style={{ background: '#111827' }}>A+ (A Positive)</option>
                  <option value="A-" style={{ background: '#111827' }}>A- (A Negative)</option>
                  <option value="B+" style={{ background: '#111827' }}>B+ (B Positive)</option>
                  <option value="B-" style={{ background: '#111827' }}>B- (B Negative)</option>
                  <option value="AB+" style={{ background: '#111827' }}>AB+ (AB Positive)</option>
                  <option value="AB-" style={{ background: '#111827' }}>AB- (AB Negative)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="input-group-custom">
              <label htmlFor="skinTypeFocus">Skin Type Specialisation</label>
              <div className="input-field-wrapper">
                <FaStethoscope className="field-icon text-primary" />
                <select 
                  id="skinTypeFocus"
                  value={skinTypeFocus}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSkinTypeFocus(val);
                    const titleMap = {
                      'Melanoma': 'Melanoma & High-Risk Lesions',
                      'Melanocytic Nevus': 'Melanocytic Nevi & Mole Specialist',
                      'Basal Cell Carcinoma': 'Basal Cell Carcinoma Specialist',
                      'Actinic Keratosis': 'Actinic Keratosis & Precancerous Lesions',
                      'Vascular Lesion': 'Vascular Lesions & Angioma Specialist',
                      'Benign Keratosis': 'Benign Keratosis & Dermatofibroma Specialist',
                      'General Dermatology': 'General Dermatology & Sensitive Skin'
                    };
                    setSpecialty(titleMap[val] || `${val} Specialist`);
                  }}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '0.6rem 0.5rem', outline: 'none' }}
                >
                  <option value="Melanoma" style={{ background: '#111827' }}>Melanoma & High-Risk Lesions</option>
                  <option value="Melanocytic Nevus" style={{ background: '#111827' }}>Melanocytic Nevi & Moles</option>
                  <option value="Basal Cell Carcinoma" style={{ background: '#111827' }}>Basal Cell Carcinoma</option>
                  <option value="Actinic Keratosis" style={{ background: '#111827' }}>Actinic Keratosis & Precancerous</option>
                  <option value="Vascular Lesion" style={{ background: '#111827' }}>Vascular Lesions & Angioma</option>
                  <option value="Benign Keratosis" style={{ background: '#111827' }}>Benign Keratosis & Dermatofibroma</option>
                  <option value="General Dermatology" style={{ background: '#111827' }}>General Dermatology & Sensitive Skin</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary w-100" 
            style={{ marginTop: '0.5rem' }}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <div className="inline-spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create {role === 'patient' ? 'Patient' : 'Doctor'} Account</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="login-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="register-redirect">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
