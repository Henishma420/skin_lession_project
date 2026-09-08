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
  FaClock,
  FaTint,
  FaStethoscope
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
  const [bloodType, setBloodType] = useState('O+');
  const [specialty, setSpecialty] = useState('');
  const [skinTypeFocus, setSkinTypeFocus] = useState('');

  // Status States
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync inputs with user details when component mounts or user details load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBloodType(user.blood_type || 'O+');
      setSpecialty(user.profile?.specialty || 'Dermatologist');
      setSkinTypeFocus(user.profile?.skin_type_focus || 'General Dermatology');
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
      setBloodType(user.blood_type || 'O+');
      setSpecialty(user.profile?.specialty || 'Dermatologist');
      setSkinTypeFocus(user.profile?.skin_type_focus || 'General Dermatology');
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
        password: password || undefined,
        bloodType: user.role === 'patient' ? bloodType : undefined,
        specialty: user.role === 'doctor' ? specialty : undefined,
        skinTypeFocus: user.role === 'doctor' ? skinTypeFocus : undefined
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

              {user?.role === 'patient' && (
                <div className="profile-detail-row">
                  <div className="row-lbl">
                    <FaTint className="text-danger" />
                    <span>Blood Type</span>
                  </div>
                  <div className="row-val">
                    <span style={{ 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      color: '#f87171', 
                      border: '1px solid rgba(239, 68, 68, 0.3)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '6px', 
                      fontWeight: 'bold' 
                    }}>
                      {user?.blood_type || 'O+'}
                    </span>
                  </div>
                </div>
              )}

              {user?.role === 'doctor' && (
                <>
                  <div className="profile-detail-row">
                    <div className="row-lbl">
                      <FaUserMd />
                      <span>Specialization</span>
                    </div>
                    <div className="row-val">{user?.profile?.specialty || 'Dermatologist'}</div>
                  </div>

                  <div className="profile-detail-row">
                    <div className="row-lbl">
                      <FaStethoscope className="text-primary" />
                      <span>Skin Type Focus</span>
                    </div>
                    <div className="row-val">
                      <span style={{ 
                        background: 'rgba(59, 130, 246, 0.15)', 
                        color: '#60a5fa', 
                        border: '1px solid rgba(59, 130, 246, 0.3)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '6px', 
                        fontWeight: 'bold' 
                      }}>
                        {user?.profile?.skin_type_focus || 'General Dermatology'}
                      </span>
                    </div>
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

              {user?.role === 'patient' && (
                <div className="form-group-profile">
                  <label htmlFor="bloodType">Blood Group / Type</label>
                  <div className="input-with-icon-profile">
                    <FaTint className="input-icon-profile text-danger" />
                    <select 
                      id="bloodType" 
                      value={bloodType} 
                      onChange={(e) => setBloodType(e.target.value)} 
                      disabled={isSaving}
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
              )}

              {user?.role === 'doctor' && (
                <>
                  <div className="form-group-profile">
                    <label htmlFor="skinTypeFocus">Skin Type Specialisation</label>
                    <div className="input-with-icon-profile">
                      <FaStethoscope className="input-icon-profile text-primary" />
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
                        disabled={isSaving}
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

                  <div className="form-group-profile">
                    <label htmlFor="specialty">Specialization Title</label>
                    <div className="input-with-icon-profile">
                      <FaUserMd className="input-icon-profile" />
                      <input 
                        type="text" 
                        id="specialty" 
                        value={specialty} 
                        onChange={(e) => setSpecialty(e.target.value)} 
                        disabled={isSaving}
                        placeholder="e.g. Melanoma Specialist"
                      />
                    </div>
                  </div>
                </>
              )}

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
