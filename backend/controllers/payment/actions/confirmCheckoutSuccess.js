/**
 * Module: backend/controllers/payment/actions/confirmCheckoutSuccess.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/payment/actions/confirmCheckoutSuccess.js
// Purpose: confirm Checkout Success
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Auction = require('../../../models/Auction');
const {
  calculatePaymentSplit,
  queuePaymentSuccessEmails,
  emitRealtimeNotification,
} = require('../paymentHelpers');

const confirmCheckoutSuccess = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Server Error: Stripe Key Missing' });
    }

    const { sessionId, auctionId } = req.body || {};
    if (!sessionId || !auctionId) {
      return res.status(400).json({ message: 'sessionId and auctionId are required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Stripe session not found' });
    }
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment is not completed yet for this session' });
    }

    const metadataAuctionId = session.metadata?.auctionId;
    const metadataWinnerId = session.metadata?.winnerId;
    if (metadataAuctionId && String(metadataAuctionId) !== String(auctionId)) {
      return res.status(400).json({ message: 'Session does not match this auction' });
    }

    const auction = await Auction.findById(auctionId).populate('seller', 'email stripeAccountId');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (!auction.winner) return res.status(400).json({ message: 'Winner not found for this auction' });
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can confirm this payment' });
    }
    if (metadataWinnerId && String(metadataWinnerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Session winner does not match current user' });
    }
    if (auction.payment?.status === 'paid' || ['paid_shipping_pending', 'closed'].includes(auction.status)) {
      return res.status(200).json({ message: 'Payment already confirmed', auctionStatus: auction.status });
    }

    const { totalAmount, commission, sellerPayout } = calculatePaymentSplit(auction.currentPrice);

    let payoutStatus = 'manual_required';
    if (auction.seller?.stripeAccountId) {
      try {
        await stripe.transfers.create({
          amount: Math.round(sellerPayout * 100),
          currency: 'usd',
          destination: auction.seller.stripeAccountId,
        });
        payoutStatus = 'completed';
      } catch (transferError) {
        payoutStatus = 'failed';
        console.error('Seller payout transfer failed (success fallback):', transferError.message);
      }
    }

    auction.status = 'paid_shipping_pending';
    auction.payment = {
      ...auction.payment,
      status: 'paid',
      amount: totalAmount,
      stripeSessionId: session.id || auction.payment?.stripeSessionId || '',
      stripePaymentIntentId: String(session.payment_intent || ''),
      paidAt: new Date(),
      lastFailureReason: '',
      lastFailureAt: null,
      sellerPayoutAmount: sellerPayout,
      commissionAmount: commission,
      payoutStatus,
      payoutAt: new Date(),
    };
    auction.shipping = {
      ...auction.shipping,
      status: 'in_transit',
      expectedMinDays: 7,
      expectedMaxDays: 14,
      paidAt: new Date(),
    };
    await auction.save();

    queuePaymentSuccessEmails({
      winnerEmail: req.user?.email,
      sellerEmail: auction.seller?.email,
      title: auction.title,
      totalAmount,
      sellerPayout,
      commission,
      auctionId: auction._id,
    });

    emitRealtimeNotification(
      req,
      {
        type: 'success',
        title: 'Payment Completed',
        message: `Payment completed for "${auction.title}". AuctionPulse shipping is now in progress.`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id, auction.seller?._id || auction.seller],
        includeAdmins: true,
      }
    );

    return res.status(200).json({ message: 'Payment confirmed successfully', auctionStatus: auction.status });
  } catch (error) {
    console.error('CONFIRM CHECKOUT SUCCESS ERROR:', error.message);
    return res.status(500).json({ message: error.message || 'Failed to confirm payment success' });
  }
};

module.exports = confirmCheckoutSuccess;


