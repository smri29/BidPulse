const express = require('express');
const {
  getAllAuctions,
  getAuctionById,
  createAuction,
  deleteAuction,
} = require('../controllers/auctionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);

// Protected Routes
router.post('/', protect, authorize('seller', 'admin'), createAuction);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteAuction);

module.exports = router;