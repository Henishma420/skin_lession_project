import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FaHeartbeat, FaUserCircle, FaSignInAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="app-navbar">
      <Link to="/" className="navbar-brand">
        <FaHeartbeat className="brand-icon" />
        <span>Tele-Derma AI</span>
      </Link>

      <div className="navbar-menu">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/library" className="nav-link">Skin Health</Link>

        {token ? (
          <div className="navbar-user">
            <Link to="/profile" className="nav-link d-flex align-items-center gap-2">
              <FaUserCircle size={20} />
              <span>{user?.name || 'User'}</span>
            </Link>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
            <FaSignInAlt />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
