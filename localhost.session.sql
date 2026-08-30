-- 1. Switch to the correct database
USE tele_derma_db;

-- 2. View all tables in the database
SHOW TABLES;

-- 3. View all registered users (patients and doctors)
SELECT id, name, email, role, created_at FROM users;

-- 4. View all doctor profiles
SELECT * FROM doctors;

-- 5. View all patients specifically
SELECT id, name, email, created_at FROM users WHERE role = 'patient';

-- 6. View all AI analysis scans
SELECT * FROM analyses;

-- 7. View all appointments
SELECT * FROM appointments;