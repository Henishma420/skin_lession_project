const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'supersecure_telederma_secret_key_123!';

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// @route   POST /api/auth/register
// @desc    Register a user (Patient or Doctor)
router.post('/register', async (req, res) => {
  const { name, email, password, role, bloodType, specialty, skinTypeFocus } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  const userRole = role === 'doctor' ? 'doctor' : 'patient';
  const patientBloodType = userRole === 'patient' ? (bloodType || 'O+') : null;

  try {
    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user with blood_type
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, blood_type) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, userRole, patientBloodType]
    );
    const userId = result.insertId;

    // If role is doctor, create doctor profile with skin type specialisation
    if (userRole === 'doctor') {
      const docSpecialty = specialty || 'Dermatologist';
      const docSkinFocus = skinTypeFocus || 'General Dermatology';
      await db.query(
        'INSERT INTO doctors (id, specialty, skin_type_focus, rating, experience_years, availability, consultation_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, docSpecialty, docSkinFocus, 5.0, 0, 'Available Today', 'Online Consultation']
      );
    }

    // Generate JWT Token
    const token = jwt.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: userRole,
        blood_type: patientBloodType
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    // Check for user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        blood_type: user.blood_type || 'O+'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, blood_type, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // If doctor, fetch profile details as well
    if (user.role === 'doctor') {
      const [doctors] = await db.query('SELECT specialty, skin_type_focus, rating, experience_years, availability, consultation_type FROM doctors WHERE id = ?', [user.id]);
      if (doctors.length > 0) {
        user.profile = doctors[0];
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, password, bloodType, specialty, skinTypeFocus } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    // Check if email is already taken by another user
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    let query = 'UPDATE users SET name = ?, email = ?, blood_type = COALESCE(?, blood_type) WHERE id = ?';
    let params = [name, email, bloodType || null, req.user.id];

    // If password is provided, hash and update it too
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET name = ?, email = ?, password = ?, blood_type = COALESCE(?, blood_type) WHERE id = ?';
      params = [name, email, hashedPassword, bloodType || null, req.user.id];
    }

    await db.query(query, params);

    // If doctor and specialty / skinTypeFocus is updated
    if (specialty || skinTypeFocus) {
      await db.query(
        'UPDATE doctors SET specialty = COALESCE(?, specialty), skin_type_focus = COALESCE(?, skin_type_focus) WHERE id = ?',
        [specialty || null, skinTypeFocus || null, req.user.id]
      );
    }

    // Fetch the updated user details
    const [users] = await db.query('SELECT id, name, email, role, blood_type, created_at FROM users WHERE id = ?', [req.user.id]);
    const updatedUser = users[0];

    // If doctor, fetch profile details as well
    if (updatedUser.role === 'doctor') {
      const [doctors] = await db.query('SELECT specialty, skin_type_focus, rating, experience_years, availability, consultation_type FROM doctors WHERE id = ?', [updatedUser.id]);
      if (doctors.length > 0) {
        updatedUser.profile = doctors[0];
      }
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
