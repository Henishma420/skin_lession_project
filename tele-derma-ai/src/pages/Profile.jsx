import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaUserTag, 
  FaDatabase, 
  FaSignOutAlt, 
  FaEdit, 
  FaLock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUserMd,
  FaClock 
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, setUser, logout, API_URL } = useAuth();

  // Edit Form States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status States
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync inputs with user details when component mounts or user details load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage(null);
    setPassword('');
    setConfirmPassword('');
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Basic Validation
    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required fields.' });
      return;
    }

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, {
        name,
        email,
        password: password || undefined
      });

      // Update global user context state
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Update profile error:', error);
      const errMsg = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page fade-in">
      <header className="page-header">
        <h1>Your Profile</h1>
        <p>Manage your Tele-Derma account details and connection integrations.</p>
      </header>

      <div className="profile-layout grid-2">
        {/* User Card */}
        <div className="profile-card glass-card">
          <div className="profile-card-header text-center">
            <FaUserCircle className="profile-avatar" />
            <h2>{user?.name}</h2>
            <span className="profile-badge">{user?.role}</span>
          </div>

          {/* Success/Error Alerts */}
          {message && (
            <div className={`profile-alert ${message.type}`}>
              {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
              <span>{message.text}</span>
            </div>
          )}

          {!isEditing ? (
            /* Static View Mode */
            <div className="profile-details-list">
              <div className="profile-detail-row">
                <div className="row-lbl">
                  <FaEnvelope />
                  <span>Email Address</span>
                </div>
                <div className="row-val">{user?.email}</div>
              </div>

              {user?.role === 'doctor' && (
                <>
                  <div className="profile-detail-row">
                    <div className="row-lbl">
                      <FaUserMd />
                      <span>Specialization</span>
                    </div>
                    <div className="row-val">Dermatologist</div>
                  </div>

                  <div className="profile-detail-row">
                    <div className="row-lbl">
                      <FaUserTag />
                      <span>Qualifications</span>
                    </div>
                    <div className="row-val">MD, MBBS</div>
                  </div>

                  <div className="profile-detail-row">
                    <div className="row-lbl">
                      <FaClock />
                      <span>Consultation Hours</span>
                    </div>
                    <div className="row-val">Mon - Fri (09:00 AM - 05:00 PM)</div>
                  </div>
                </>
              )}

              <div className="profile-detail-row">
                <div className="row-lbl">
                  <FaUserTag />
                  <span>Account Role</span>
                </div>
                <div className="row-val" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
              </div>

              <div className="profile-actions-row">
                <button className="btn-primary" onClick={handleEditToggle} style={{ width: '100%' }}>
                  <FaEdit style={{ marginRight: '8px' }} />
                  <span>Edit Profile</span>
                </button>
                <button className="btn-outline btn-logout-profile" onClick={logout} style={{ marginTop: '0.5rem' }}>
                  <FaSignOutAlt style={{ marginRight: '8px' }} />
                  <span>Log Out Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Editable Form Mode */
            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="form-group-profile">
                <label htmlFor="name">Full Name</label>
                <div className="input-with-icon-profile">
                  <FaUserCircle className="input-icon-profile" />
                  <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Enter full name"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-group-profile">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon-profile">
                  <FaEnvelope className="input-icon-profile" />
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Enter email address"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-group-profile">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <div className="input-with-icon-profile">
                  <FaLock className="input-icon-profile" />
                  <input 
                    type="password" 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter new password"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {password && (
                <div className="form-group-profile">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon-profile">
                    <FaLock className="input-icon-profile" />
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Confirm new password"
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions-profile">
                <button type="submit" className="btn-primary" disabled={isSaving} style={{ flex: 1 }}>
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button type="button" className="btn-outline" onClick={handleEditToggle} disabled={isSaving} style={{ flex: 1 }}>
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Database Status Card */}
        <div className="profile-card glass-card">
          <div className="card-header-icon bg-primary-light" style={{ marginBottom: '1.5rem', padding: '0.8rem 1.2rem', borderRadius: '8px' }}>
            <FaDatabase className="text-primary" />
            <h2>System Status</h2>
          </div>

          <div className="status-grid">
            <div className="status-row">
              <span className="status-lbl">MySQL Database</span>
              <span className="status-indicator online">Connected</span>
            </div>
            <div className="status-row">
              <span className="status-lbl">Express Server API</span>
              <span className="status-indicator online">Online</span>
            </div>
            <div className="status-row">
              <span className="status-lbl">AI Inference Engine</span>
              <span className="status-indicator online">Active</span>
            </div>
          </div>

          <div className="system-notes">
            <p>
              Your clinical files and scan histories are stored securely in a local MySQL instance database. 
              Always ensure the backend server and MySQL connection are active before executing screenings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
