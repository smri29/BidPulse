const express = require('express');
const {
  getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  placeBid // <--- Added this import
} = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');
const { auctionImageUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

const handleAuctionImageUpload = (req, res, next) => {
  auctionImageUpload.array('images', 3)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Each image must be 5MB or less' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Maximum 3 images are allowed' });
    }
    return res.status(400).json({ message: err.message || 'Invalid image upload' });
  });
};

router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);

// Protected Routes
router.post('/', protect, handleAuctionImageUpload, createAuction);
router.put('/:id', protect, handleAuctionImageUpload, updateAuction);
router.delete('/:id', protect, deleteAuction);

// Bidding Route (Added)
router.post('/:id/bid', protect, placeBid);

module.exports = router;
