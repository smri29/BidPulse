const express = require('express');
const {
  getAllAuctions,
  getAuctionSummary,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  placeBid,
  registerForAuction,
  openAuctionRoom,
  giveUpBid,
  handleNoRegistrationDecision,
} = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');
const { auctionImageUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Auction image parsing is wrapped so clients receive friendly API errors instead of raw Multer errors.
const handleAuctionImageUpload = (req, res, next) => {
  // Normalize Multer errors into clean API responses for the frontend.
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
router.get('/summary/stats', getAuctionSummary);
router.get('/:id', getAuctionById);

// Protected routes cover seller actions and live auction participation.
router.post('/', protect, handleAuctionImageUpload, createAuction);
router.put('/:id', protect, handleAuctionImageUpload, updateAuction);
router.delete('/:id', protect, deleteAuction);

router.post('/:id/register', protect, registerForAuction);
router.post('/:id/open-room', protect, openAuctionRoom);
router.post('/:id/bid', protect, placeBid);
router.post('/:id/give-up', protect, giveUpBid);
router.post('/:id/no-registration-decision', protect, handleNoRegistrationDecision);

module.exports = router;
