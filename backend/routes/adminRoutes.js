const express = require('express');
const router = express.Router();
const { 
    getAdminStats, 
    getAllUsers, 
    deleteUser,
    banUser,           
    getAllAuctionsAdmin, 
    deleteAnyAuction,
    getUserHistory     // <--- New Import
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes: Must be Logged In + Role must be 'admin'

// Stats
router.get('/stats', protect, authorize('admin'), getAdminStats);

// User Management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/ban/:id', protect, authorize('admin'), banUser); // Ban Toggle
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/users/:id/history', protect, authorize('admin'), getUserHistory); // <--- New Route

// Auction Management (Global Control)
router.get('/auctions', protect, authorize('admin'), getAllAuctionsAdmin);
router.delete('/auctions/:id', protect, authorize('admin'), deleteAnyAuction);

module.exports = router;