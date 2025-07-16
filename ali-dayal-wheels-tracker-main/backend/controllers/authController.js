const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const ActivityLog = require('../models/ActivityLog');

// Helper to get user from JWT (deprecated - use middleware instead)
function getUserIdFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// In-memory store for reset codes (for demo; use DB/cache in production)
const resetCodes = {};

// Setup nodemailer transporter (use env vars in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  return res.status(403).json({ error: 'Registration is disabled. Only authorized users can access this system.' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const allowedEmails = ['qmaxamed766@gmail.com', 'dad@calidayax.com'];
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized: Only authorized users can log in.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Log activity
    await ActivityLog.create({
      user: email,
      action: 'login',
      entity: 'User',
      entityId: user._id,
      details: { email }
    });
    // Only return safe user data (no password, no sensitive info)
    res.json({ 
      token, 
      user: { 
        email: user.email, 
        id: user._id 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    // Use middleware-provided user instead of token parsing
    const userId = req.user._id;
    const { newEmail, password } = req.body;
    const allowedEmails = ['qmaxamed766@gmail.com', 'dad@calidayax.com'];
    if (!allowedEmails.includes(newEmail)) {
      return res.status(403).json({ error: 'Only authorized emails are allowed.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid password' });
    user.email = newEmail;
    await user.save();
    // Log activity
    await ActivityLog.create({
      user: req.user.email,
      action: 'updateEmail',
      entity: 'User',
      entityId: user._id,
      details: { newEmail }
    });
    res.json({ message: 'Email updated successfully', email: user.email });
  } catch (err) {
    console.error('Update email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    // Use middleware-provided user instead of token parsing
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid old password' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    // Log activity
    await ActivityLog.create({
      user: req.user.email,
      action: 'updatePassword',
      entity: 'User',
      entityId: user._id,
      details: {}
    });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const allowedEmails = ['qmaxamed766@gmail.com', 'dad@calidayax.com'];
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized email.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
    // Send email
    await transporter.sendMail({
      from: 'CALI DAYAX <no-reply@calidayax.com>',
      to: email,
      subject: 'CALI DAYAX Password Reset Code',
      text: `Your password reset code is: ${code}`,
    });
    res.json({ message: 'Verification code sent to email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const entry = resetCodes[email];
    if (!entry || entry.code !== code || Date.now() > entry.expires) {
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    delete resetCodes[email];
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 

// Returns the current authenticated user
exports.me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // Only return safe user data
  res.json({
    user: {
      email: req.user.email,
      id: req.user._id
    }
  });
}; 
