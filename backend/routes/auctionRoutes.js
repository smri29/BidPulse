const express = require('express');
const {
  getAllAuctions,
  getAuctionById,
  createAuction,
  deleteAuction,
  placeBid // <--- Added this import
} = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);

// Protected Routes
router.post('/', protect, createAuction);
router.delete('/:id', protect, deleteAuction);

// Bidding Route (Added)
router.post('/:id/bid', protect, placeBid);

module.exports = router;