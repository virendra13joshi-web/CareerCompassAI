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
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers, and underscores'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required').trim(),
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
