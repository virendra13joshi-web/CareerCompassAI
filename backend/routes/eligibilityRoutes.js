const express = require('express');
const router = express.Router();
const eligibilityController = require('../controllers/eligibilityController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public: check eligibility (guest can check too, studentId will just be null)
// We use optional auth — attach user if token present but don't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const jwt = require('jsonwebtoken');
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // invalid token — continue as guest
    }
  }
  next();
};

// Check eligibility for a company
router.post('/check', optionalAuth, eligibilityController.checkEligibility);

// Get personal check history (requires auth)
router.get('/history', authMiddleware, eligibilityController.getMyHistory);

module.exports = router;
