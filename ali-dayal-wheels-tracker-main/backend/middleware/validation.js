const { body, validationResult } = require('express-validator');

// Sanitize and validate login input
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Sanitize and validate email update input
const validateEmailUpdate = [
  body('newEmail')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Sanitize and validate password update input
const validatePasswordUpdate = [
  body('oldPassword')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Old password must be at least 6 characters long'),
  body('newPassword')
    .trim()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Sanitize and validate forgot password input
const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// Sanitize and validate reset password input
const validateResetPassword = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Code must be a 6-digit number'),
  body('newPassword')
    .trim()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Generic validation handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateEmailUpdate,
  validatePasswordUpdate,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
}; 