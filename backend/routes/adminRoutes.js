const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { companyValidation } = require('../middleware/validationMiddleware');

// Multer setup for company logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `company-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Stats Overview
router.get('/stats', adminController.getAdminStats);

// Analytics
router.get('/analytics', adminController.getAdminAnalytics);

// Students
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.patch('/students/:id/role', adminController.updateStudentRole);
router.delete('/students/:id', adminController.deleteStudent);

// Companies (admin-scoped with multer)
router.get('/companies', adminController.getAdminCompanies);
router.post('/companies', upload.fields([{ name: 'logo', maxCount: 1 }]), companyValidation, adminController.createAdminCompany);
router.put('/companies/:id', upload.fields([{ name: 'logo', maxCount: 1 }]), companyValidation, adminController.updateAdminCompany);
router.delete('/companies/:id', adminController.deleteAdminCompany);

// Resume Reports
router.get('/reports', adminController.getAllReports);
router.delete('/reports/:id', adminController.deleteReport);

// Interview Experiences
router.get('/experiences', adminController.getAllExperiences);
router.delete('/experiences/:id', adminController.deleteExperience);

// Roadmaps
router.get('/roadmaps', adminController.getAllRoadmaps);
router.delete('/roadmaps/:id', adminController.deleteRoadmap);

// Notifications
router.get('/notifications', adminController.getAllNotifications);
router.post('/notifications/broadcast', adminController.sendBroadcastNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

module.exports = router;
