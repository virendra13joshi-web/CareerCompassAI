const { body, validationResult } = require('express-validator');

// Reusable validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
  });
};

const registerValidation = [
  body('full_name').notEmpty().withMessage('Full name is required').trim().escape(),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const companyValidation = [
  body('company_name').notEmpty().withMessage('Company name is required').trim(),
  body('job_role').notEmpty().withMessage('Job role is required').trim(),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  companyValidation
};
