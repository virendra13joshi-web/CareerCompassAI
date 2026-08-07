const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const authMiddleware = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

// Helper middleware for optional authentication
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // Invalid token - proceed as unauthenticated
    }
  }
  next();
};

// Routes
router.get('/', optionalAuth, experienceController.getExperiences);
router.get('/:id', optionalAuth, experienceController.getExperienceById);

// Protected routes
router.post('/', authMiddleware, experienceController.createExperience);
router.post('/:id/like', authMiddleware, experienceController.toggleLike);
router.post('/:id/comment', authMiddleware, experienceController.addComment);

module.exports = router;
