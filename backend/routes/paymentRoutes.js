const express = require('express');
const { createCheckoutSession, releaseFunds } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkout/:auctionId', protect, createCheckoutSession);
router.post('/create-checkout-session/:auctionId', protect, createCheckoutSession);
router.post('/release/:auctionId', protect, releaseFunds);

module.exports = router;
