const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// ─── Dedicated multer config for resume PDFs ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for resume analysis.'), false);
  }
};

const resumeUpload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Routes (all protected)
router.post('/analyze', authMiddleware, resumeUpload.single('resume'), resumeController.analyzeResume);
router.get('/history', authMiddleware, resumeController.getMyReports);
router.get('/:id', authMiddleware, resumeController.getReportById);

module.exports = router;
