/**
 * Module: backend/routes/bidRoutes.js
 * Purpose: Maps HTTP endpoints to the backend handlers responsible for each route.
 */
const express = require('express');
const { placeBid, getBids } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Legacy route file kept for historical reference; main bidding now flows through /api/auctions/:id/bid.
router.get('/:auctionId', getBids);

// Private: Place bid
router.post('/:auctionId', protect, placeBid);

module.exports = router;
