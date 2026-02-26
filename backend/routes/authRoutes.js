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
  getUserActivity,
  uploadAvatar,
  setEmojiAvatar,
  exportUserDataZip,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();
const handleAvatarUpload = (req, res, next) => {
  imageUpload.single('avatar')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Avatar file is too large. Max size is 5MB.' });
    }
    return res.status(400).json({ message: err.message || 'Invalid avatar upload' });
  });
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/activity', protect, getUserActivity);

router.put('/updatedetails', protect, updateUserDetails);
router.delete('/deleteaccount', protect, deleteUserAccount);
router.post('/send-verification-otp', protect, sendVerificationOTP);
router.post('/verify-email-otp', protect, verifyEmailOTP);
router.post('/avatar/upload', protect, handleAvatarUpload, uploadAvatar);
router.post('/avatar/emoji', protect, setEmojiAvatar);
router.get('/export-data', protect, exportUserDataZip);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
