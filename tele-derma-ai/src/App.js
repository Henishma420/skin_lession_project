import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import './App.css';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AIAnalysis from './pages/AIAnalysis';
import Doctors from './pages/Doctors';
import Appointment from './pages/Appointment';
import Reports from './pages/Reports';
import Library from './pages/Library';
import SkinConditionDetails from './pages/SkinConditionDetails';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MyAppointments from './pages/MyAppointments';
import AppointmentDetailsPage from './pages/AppointmentDetailsPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import MyPatients from './pages/MyPatients';
import PatientDetailsPage from './pages/PatientDetailsPage';

// Import Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Tele-Derma AI...</p>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout Wrapper to render Sidebar/Navbar conditionally
const AppContent = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Tele-Derma AI...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar />

      <div className="main-layout">
        {/* Navigation Sidebar (rendered only when user is authenticated) */}
        {token && <Sidebar />}

        {/* Content Panel */}
        <main className={`content-panel ${token ? 'authenticated' : 'public'}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/library" element={<Library />} />
            <Route path="/skin-library/:id" element={<SkinConditionDetails />} />

            {/* Protected Clinical Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
            <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
            <Route path="/appointments/:appointmentId" element={<ProtectedRoute><AppointmentDetailsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/reports/:reportId" element={<ProtectedRoute><ReportDetailsPage /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><MyPatients /></ProtectedRoute>} />
            <Route path="/patients/:patientId" element={<ProtectedRoute><PatientDetailsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
