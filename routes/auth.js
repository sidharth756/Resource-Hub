const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');
const router = express.Router();

// User Registration - Step 1: Send OTP
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'student', department } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT id, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      if (existingUser[0].is_verified) {
        return res.status(400).json({ error: 'User already exists with this email' });
      } else {
        // User exists but not verified, allow re-registration
        await pool.execute('DELETE FROM users WHERE email = ? AND is_verified = FALSE', [email]);
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user (unverified)
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, department, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
      [name, email, hashedPassword, role, department]
    );

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up old OTPs for this email
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Store new OTP
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);
    
    if (!emailResult.success) {
      // If email failed, remove the user and OTP
      await pool.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
      await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.status(201).json({
      message: 'Registration initiated. Please check your email for the OTP verification code.',
      tempUserId: result.insertId,
      email: email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Registration - Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find valid OTP
    const [otpRecords] = await pool.execute(
      'SELECT id, expires_at, used FROM otp_verifications WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    const otpRecord = otpRecords[0];

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check if OTP is already used
    if (otpRecord.used) {
      return res.status(400).json({ error: 'OTP has already been used' });
    }

    // Mark OTP as used
    await pool.execute('UPDATE otp_verifications SET used = TRUE WHERE id = ?', [otpRecord.id]);

    // Verify user account
    const [result] = await pool.execute(
      'UPDATE users SET is_verified = TRUE WHERE email = ?',
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, name, email, role, department FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({
      message: 'Account verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists and is not verified
    const [users] = await pool.execute(
      'SELECT id, name, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = users[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up old OTPs for this email
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Store new OTP
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({
      message: 'New OTP sent successfully. Please check your email.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role, department, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if account is verified
    if (!user.is_verified) {
      return res.status(401).json({ 
        error: 'Account not verified. Please check your email for the verification code.',
        requiresVerification: true,
        email: email
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;