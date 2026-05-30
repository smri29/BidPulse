/**
 * Module: backend/controllers/payment/actions/createCheckoutSession.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/payment/actions/createCheckoutSession.js
// Purpose: create Checkout Session
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Auction = require('../../../models/Auction');
const { emitRealtimeNotification } = require('../paymentHelpers');

const createCheckoutSession = async (req, res) => {
  const { shippingAddress } = req.body;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Server Error: Stripe Key Missing' });
    }

    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (!auction.winner) return res.status(400).json({ message: 'Winner not found for this auction' });
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can pay for this auction' });
    }
    if (auction.status === 'paid_shipping_pending' || auction.status === 'closed' || auction.payment?.status === 'paid') {
      return res.status(400).json({ message: 'Payment has already been completed for this auction' });
    }
    if (auction.payment?.status === 'checkout_created') {
      return res.status(409).json({ message: 'A payment session is already active. Complete it or wait for expiration before retrying.' });
    }
    if (auction.status !== 'completed') {
      return res.status(400).json({ message: 'Payment is only available after the auction is completed' });
    }

    if (shippingAddress) {
      auction.shippingDetails = shippingAddress;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: auction.title,
              description: auction.description ? auction.description.substring(0, 400) : 'Auction Item',
            },
            unit_amount: Math.round(auction.currentPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        metadata: {
          auctionId: auction._id.toString(),
          winnerId: req.user.id.toString(),
        },
      },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&auction_id=${auction._id}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auction/${auction._id}`,
      metadata: {
        auctionId: auction._id.toString(),
        winnerId: req.user.id.toString(),
        sellerId: auction.seller.toString(),
      },
    });

    auction.payment = {
      ...auction.payment,
      status: 'checkout_created',
      amount: auction.currentPrice,
      stripeSessionId: session.id,
      lastFailureReason: '',
      lastFailureAt: null,
    };
    await auction.save();

    emitRealtimeNotification(
      req,
      {
        type: 'info',
        title: 'Payment Session Created',
        message: `Checkout started for "${auction.title}"`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id],
        includeAdmins: true,
      }
    );

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    return res.status(500).json({ message: error.message || 'Payment Processing Failed' });
  }
};

module.exports = createCheckoutSession;


