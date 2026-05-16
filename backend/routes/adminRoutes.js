const express = require('express');
const router = express.Router();
const { 
    getAdminStats, 
    getAllUsers, 
    deleteUser,
    banUser,           
    getAllAuctionsAdmin, 
    deleteAnyAuction,
    getUserHistory,
    sendTestEmail,
    triggerPromotionalCampaign
} = require('../controllers/adminController');
const { adminApproveAuction, adminDisapproveAuction } = require('../controllers/auctionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Every admin route requires both authentication and the admin role.
// These routes expose operational controls over users, auctions, metrics, and campaign tooling.

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
router.put('/auctions/:id/approve', protect, authorize('admin'), adminApproveAuction);
router.put('/auctions/:id/disapprove', protect, authorize('admin'), adminDisapproveAuction);
router.post('/test-email', protect, authorize('admin'), sendTestEmail);
router.post('/promotional/trigger', protect, authorize('admin'), triggerPromotionalCampaign);

module.exports = router;
