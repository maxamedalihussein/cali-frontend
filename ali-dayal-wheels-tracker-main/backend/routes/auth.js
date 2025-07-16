const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const {
  validateLogin,
  validateEmailUpdate,
  validatePasswordUpdate,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} = require('../middleware/validation');

// Public routes (no auth required)
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, authController.resetPassword);

// Protected routes (auth required)
router.post('/update-email', authMiddleware, validateEmailUpdate, handleValidationErrors, authController.updateEmail);
router.post('/update-password', authMiddleware, validatePasswordUpdate, handleValidationErrors, authController.updatePassword);

// Add this route for persistent login
router.get('/me', authMiddleware, authController.me);

module.exports = router; 