const express = require('express');
const { placeBid, getBids } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: View history
router.get('/:auctionId', getBids);

// Private: Place bid
router.post('/:auctionId', protect, placeBid);

module.exports = router;