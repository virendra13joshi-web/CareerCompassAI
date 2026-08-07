const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public or Authenticated routes
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);

// Student actions
router.get('/student/bookmarks', authMiddleware, companyController.getBookmarks);
router.post('/:id/bookmark', authMiddleware, companyController.bookmarkCompany);
router.delete('/:id/bookmark', authMiddleware, companyController.removeBookmark);
router.post('/:id/apply', authMiddleware, companyController.applyToCompany);

// Admin Routes
router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'logo', maxCount: 1 }]), companyController.createCompany);
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'logo', maxCount: 1 }]), companyController.updateCompany);
router.delete('/:id', authMiddleware, adminMiddleware, companyController.deleteCompany);

module.exports = router;
