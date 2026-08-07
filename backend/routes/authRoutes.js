const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');

router.post('/register', registerValidation, authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', loginValidation, authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, upload.fields([{ name: 'profile_picture', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), authController.updateProfile);

module.exports = router;
