import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaUserMd, FaHeartbeat } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTab, setRoleTab] = useState('patient'); // 'patient' or 'doctor'
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
    
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
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
      
      <div className="login-card-container glass-card">
        {/* Brand Header */}
        <div className="login-header">
          <FaHeartbeat className="login-brand-icon" />
          <h2>Welcome Back</h2>
          <p>Sign in to manage your Tele-Derma accounts</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs">
          <button 
            type="button" 
            className={`tab-btn ${roleTab === 'patient' ? 'active' : ''}`}
            onClick={() => setRoleTab('patient')}
          >
            <FaUser size={14} />
            <span>Patient</span>
          </button>
          <button 
            type="button" 
            className={`tab-btn ${roleTab === 'doctor' ? 'active' : ''}`}
            onClick={() => setRoleTab('doctor')}
          >
            <FaUserMd size={14} />
            <span>Doctor</span>
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group-custom">
            <label htmlFor="email">Email Address</label>
            <div className="input-field-wrapper">
              <FaEnvelope className="field-icon" />
              <input 
                id="email"
                type="email" 
                placeholder="name@example.com"
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
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password-link">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-100" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <div className="inline-spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In as {roleTab === 'patient' ? 'Patient' : 'Doctor'}</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="login-footer">
          <p>Don't have an account yet?</p>
          <Link to="/register" className="register-redirect">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
