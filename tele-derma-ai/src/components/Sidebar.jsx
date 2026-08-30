import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaTachometerAlt, 
  FaRobot, 
  FaUserMd, 
  FaCalendarAlt, 
  FaCalendarCheck,
  FaFileMedical, 
  FaBookMedical, 
  FaUser, 
  FaSignOutAlt,
  FaClipboardList 
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDoctor = user?.role === 'doctor';

  return (
    <aside className="app-sidebar">
      <div className="sidebar-menu">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        {isDoctor ? (
          <>
            <NavLink 
              to="/appointments" 
              className={({ isActive }) => `sidebar-link ${isActive || (window.location.pathname.startsWith('/appointments/') && !window.location.pathname.includes('/my-appointments')) ? 'active' : ''}`}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
            </NavLink>

            <NavLink 
              to="/patients" 
              className={({ isActive }) => `sidebar-link ${isActive || window.location.pathname.startsWith('/patients/') ? 'active' : ''}`}
            >
              <FaClipboardList />
              <span>My Patients</span>
            </NavLink>

            <NavLink 
              to="/reports" 
              className={({ isActive }) => `sidebar-link ${isActive || window.location.pathname.startsWith('/reports/') ? 'active' : ''}`}
            >
              <FaFileMedical />
              <span>Clinical Reports</span>
            </NavLink>
          </>
        ) : (
          <>
            {user?.role === 'patient' && (
              <NavLink 
                to="/analysis" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FaRobot />
                <span>AI Analysis</span>
              </NavLink>
            )}

            <NavLink 
              to="/doctors" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FaUserMd />
              <span>Doctors</span>
            </NavLink>

            <NavLink 
              to="/appointments" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
            </NavLink>

            <NavLink 
              to="/my-appointments" 
              className={({ isActive }) => `sidebar-link ${isActive || window.location.pathname.startsWith('/appointments/') ? 'active' : ''}`}
            >
              <FaCalendarCheck />
              <span>My Appointments</span>
            </NavLink>

            <NavLink 
              to="/reports" 
              className={({ isActive }) => `sidebar-link ${isActive || window.location.pathname.startsWith('/reports/') ? 'active' : ''}`}
            >
              <FaFileMedical />
              <span>Reports</span>
            </NavLink>

            <NavLink 
              to="/library" 
              className={({ isActive }) => `sidebar-link ${isActive || window.location.pathname.startsWith('/skin-library') ? 'active' : ''}`}
            >
              <FaBookMedical />
              <span>Skin Library</span>
            </NavLink>
          </>
        )}

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FaUser />
          <span>Profile</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
