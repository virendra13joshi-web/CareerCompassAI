const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Analytics endpoint
router.get('/', analyticsController.getAnalytics);

module.exports = router;
