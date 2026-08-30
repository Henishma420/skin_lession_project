-- Create database
CREATE DATABASE IF NOT EXISTS tele_derma_db;
USE tele_derma_db;

-- Users table (Patients & Doctors)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('patient', 'doctor') NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Profiles table
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY,
  specialty VARCHAR(100) NOT NULL DEFAULT 'Dermatologist',
  rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  experience_years INT NOT NULL DEFAULT 0,
  availability VARCHAR(100) NOT NULL DEFAULT 'Available Today',
  consultation_type VARCHAR(100) NOT NULL DEFAULT 'Online Consultation',
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Scan Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  image_url VARCHAR(255) NULL,
  prediction VARCHAR(100) NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,
  grad_cam_url VARCHAR(255) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  symptoms TEXT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table (Doctor Follow-up opinion on AI Scan)
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_id INT NOT NULL,
  doctor_id INT NOT NULL,
  doctor_opinion VARCHAR(255) NOT NULL,
  prescription TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Doctors as referenced in the PDF:
-- First create their user accounts (passwords are hashed 'password123' using bcrypt)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
(201, 'Dr. Priya Sharma', 'priya.sharma@telederma.com', '$2a$10$iKpxp7K0d8t2q4KkEqhNvuB05oHh7P6gZ2F2D0aBfO/eBwFzFj/9q', 'doctor'),
(202, 'Dr. Rahul Menon', 'rahul.menon@telederma.com', '$2a$10$iKpxp7K0d8t2q4KkEqhNvuB05oHh7P6gZ2F2D0aBfO/eBwFzFj/9q', 'doctor');

-- Insert their doctor profiles
INSERT IGNORE INTO doctors (id, specialty, rating, experience_years, availability, consultation_type) VALUES 
(201, 'Dermatologist', 4.8, 8, 'Available Today', 'In-Person Consultation'),
(202, 'Dermatologist', 4.9, 12, 'Available Tomorrow', 'Online Consultation');
