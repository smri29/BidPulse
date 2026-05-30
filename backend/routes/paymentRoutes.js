/**
 * Module: backend/routes/paymentRoutes.js
 * Purpose: Maps HTTP endpoints to the backend handlers responsible for each route.
 */
const express = require('express');
const {
  createCheckoutSession,
  releaseFunds,
  confirmProductReceived,
  confirmCheckoutSuccess,
  reconcileWinnerPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All payment routes require authentication because they act on winner-owned order state.
// Two checkout paths exist for compatibility; both point to the same controller.
router.post('/checkout/:auctionId', protect, createCheckoutSession);
router.post('/create-checkout-session/:auctionId', protect, createCheckoutSession);
router.post('/confirm-success', protect, confirmCheckoutSuccess);
router.post('/reconcile/:auctionId', protect, reconcileWinnerPayment);
router.post('/confirm-received/:auctionId', protect, confirmProductReceived);
router.post('/release/:auctionId', protect, releaseFunds);

module.exports = router;
