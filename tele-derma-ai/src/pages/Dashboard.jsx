import React from 'react';
import { useAuth } from '../utils/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  return <PatientDashboard />;
};

export default Dashboard;
