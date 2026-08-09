const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const Student = require('../models/Student');
const { sendEmail } = require('../utils/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already taken
    const existingStudent = await Student.findByUsername(username);
    if (existingStudent) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user — no email verification required, is_verified set to TRUE in model
    await Student.create({
      full_name: username,
      username,
      email: null,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  res.json({ message: 'Email verification is not required. You can log in directly.' });
};

exports.resendVerification = async (req, res) => {
  res.json({ message: 'Email verification is disabled. You can log in directly.' });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const student = await Student.findByUsername(username);

    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!student.password) {
      return res.status(400).json({ message: 'Please login using Google' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(student.id, student.role);
    res.json({ token, user: { id: student.id, full_name: student.full_name, username: student.username, email: student.email, role: student.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    // For demo purposes, if GOOGLE_CLIENT_ID is not configured, we might bypass strict verification
    // But ideally:
    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
        });
        payload = ticket.getPayload();
    } catch(err) {
        // Fallback for demo without real token from frontend
        // Assuming token passed is an email if it's a mock
        payload = { email: req.body.email, name: req.body.name, sub: req.body.googleId }; 
        if(!payload.email) return res.status(400).json({ message: 'Invalid Google Token' });
    }

    const { email, name, sub: google_id } = payload;

    let student = await Student.findByEmail(email);

    if (!student) {
      // Register new user via Google
      const studentId = await Student.create({
        full_name: name,
        email,
        google_id,
      });
      // Auto verify for Google Auth
      await Student.verifyStudent(studentId);
      student = { id: studentId, full_name: name, email };
    }

    const jwtToken = generateToken(student.id, student.role);
    res.json({ token: jwtToken, user: { id: student.id, full_name: student.full_name, email: student.email, role: student.role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findByEmail(email);

    if (!student) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Student.saveResetToken(student.id, resetToken, resetExpire);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please click the link below to reset your password: \n\n ${resetUrl}`;

    await sendEmail(email, 'Password Reset Token', message, `<p>Reset link: <a href="${resetUrl}">${resetUrl}</a></p>`);

    res.json({ message: 'Email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const student = await Student.findByResetToken(token);

    if (!student) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Student.updatePassword(student.id, hashedPassword);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove password and tokens
    delete student.password;
    delete student.verification_token;
    delete student.reset_password_token;
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profileData = { ...req.body };
    
    // Check if files were uploaded
    if (req.files) {
      if (req.files.profile_picture) {
        profileData.profile_picture_url = `/uploads/${req.files.profile_picture[0].filename}`;
      }
      if (req.files.resume) {
        profileData.resume_url = `/uploads/${req.files.resume[0].filename}`;
      }
    }

    await Student.updateProfile(req.user.id, profileData);
    
    const updatedStudent = await Student.findById(req.user.id);
    delete updatedStudent.password;

    res.json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
