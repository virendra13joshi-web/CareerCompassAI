const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const authMiddleware = require('../middlewares/authMiddleware');

// All roadmap routes are protected
router.post('/generate', authMiddleware, roadmapController.generateRoadmap);
router.get('/active', authMiddleware, roadmapController.getActiveRoadmap);
router.post('/toggle-task', authMiddleware, roadmapController.toggleTask);

module.exports = router;
