/**
 * Module: backend/routes/authRoutes.js
 * Purpose: Maps HTTP endpoints to the backend handlers responsible for each route.
 */
const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updateUserDetails,
  deleteUserAccount,
  sendVerificationOTP,
  verifyEmailOTP,
  startProfileVerification,
  verifyProfileOtp,
  verifyProfileLink,
  getUserActivity,
  uploadAvatar,
  exportUserDataZip,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();
// Different auth-related actions have different abuse profiles, so each gets its own limiter.
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 60, keyPrefix: 'auth' });
const otpLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'otp' });
const passwordLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'password' });
const handleAvatarUpload = (req, res, next) => {
  imageUpload.single('avatar')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Avatar file is too large. Max size is 5MB.' });
    }
    return res.status(400).json({ message: err.message || 'Invalid avatar upload' });
  });
};

// ---------------------------------------------------------------------------
// Authentication and account routes
// Public: register, login, forgot/reset password
// Private: current user, profile updates, avatar, verification, export, activity
// ---------------------------------------------------------------------------

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.get('/activity', protect, getUserActivity);

router.put('/updatedetails', protect, updateUserDetails);
router.delete('/deleteaccount', protect, deleteUserAccount);
router.post('/send-verification-otp', protect, otpLimiter, sendVerificationOTP);
router.post('/verify-email-otp', protect, otpLimiter, verifyEmailOTP);
router.post('/avatar/upload', protect, handleAvatarUpload, uploadAvatar);
router.post('/profile-verification/start', protect, otpLimiter, handleAvatarUpload, startProfileVerification);
router.post('/profile-verification/verify-otp', protect, otpLimiter, verifyProfileOtp);
router.get('/profile-verification/verify-link/:token', verifyProfileLink);
router.get('/export-data', protect, exportUserDataZip);

router.post('/forgotpassword', passwordLimiter, forgotPassword);
router.put('/resetpassword/:resetToken', passwordLimiter, resetPassword);

module.exports = router;
