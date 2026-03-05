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

router.post('/checkout/:auctionId', protect, createCheckoutSession);
router.post('/create-checkout-session/:auctionId', protect, createCheckoutSession);
router.post('/confirm-success', protect, confirmCheckoutSuccess);
router.post('/reconcile/:auctionId', protect, reconcileWinnerPayment);
router.post('/confirm-received/:auctionId', protect, confirmProductReceived);
router.post('/release/:auctionId', protect, releaseFunds);

module.exports = router;
