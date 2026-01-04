const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updateUserDetails, // <--- New Import
  deleteUserAccount  // <--- New Import
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// --- New Profile Routes ---
router.put('/updatedetails', protect, updateUserDetails);
router.delete('/deleteaccount', protect, deleteUserAccount);

// --- Password Reset Routes ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;