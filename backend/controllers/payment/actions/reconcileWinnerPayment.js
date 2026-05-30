// ---------------------------------------------------------------------------
// Module: backend/controllers/payment/actions/reconcileWinnerPayment.js
// Purpose: reconcile Winner Payment
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Auction = require('../../../models/Auction');
const { calculatePaymentSplit, emitRealtimeNotification } = require('../paymentHelpers');

const reconcileWinnerPayment = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('seller', 'email stripeAccountId');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (!auction.winner || auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can reconcile payment status' });
    }

    if (auction.status === 'paid_shipping_pending' || auction.status === 'closed' || auction.payment?.status === 'paid') {
      return res.status(200).json({ message: 'Payment already reconciled', auctionStatus: auction.status });
    }

    const sessionId = auction.payment?.stripeSessionId;
    if (!sessionId) {
      return res.status(400).json({ message: 'No checkout session found for this auction' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed yet' });
    }

    const { totalAmount, commission, sellerPayout } = calculatePaymentSplit(auction.currentPrice);

    let payoutStatus = auction.payment?.payoutStatus || 'manual_required';
    if (auction.seller?.stripeAccountId && !auction.payment?.payoutAt) {
      try {
        await stripe.transfers.create({
          amount: Math.round(sellerPayout * 100),
          currency: 'usd',
          destination: auction.seller.stripeAccountId,
        });
        payoutStatus = 'completed';
      } catch (transferError) {
        payoutStatus = 'failed';
        console.error('Seller payout transfer failed (reconcile):', transferError.message);
      }
    }

    auction.status = 'paid_shipping_pending';
    auction.payment = {
      ...auction.payment,
      status: 'paid',
      amount: totalAmount,
      stripeSessionId: session.id || auction.payment?.stripeSessionId || '',
      stripePaymentIntentId: String(session.payment_intent || ''),
      paidAt: auction.payment?.paidAt || new Date(),
      lastFailureReason: '',
      lastFailureAt: null,
      sellerPayoutAmount: sellerPayout,
      commissionAmount: commission,
      payoutStatus,
      payoutAt: auction.payment?.payoutAt || new Date(),
    };
    auction.shipping = {
      ...auction.shipping,
      status: 'in_transit',
      expectedMinDays: 7,
      expectedMaxDays: 14,
      paidAt: auction.shipping?.paidAt || new Date(),
    };
    await auction.save();

    emitRealtimeNotification(
      req,
      {
        type: 'success',
        title: 'Payment Synced',
        message: `Payment synced for "${auction.title}". Shipping is in progress.`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id, auction.seller?._id || auction.seller],
        includeAdmins: true,
      }
    );

    return res.status(200).json({ message: 'Payment reconciled successfully', auctionStatus: auction.status });
  } catch (error) {
    console.error('RECONCILE PAYMENT ERROR:', error.message);
    return res.status(500).json({ message: error.message || 'Failed to reconcile payment' });
  }
};

module.exports = reconcileWinnerPayment;


