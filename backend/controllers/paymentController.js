const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Auction = require('../models/Auction');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');

const emitRealtimeNotification = (req, payload, options = {}) => {
  try {
    const io = req.app.get('io');
    if (!io) return;

    const userIds = Array.from(
      new Set(
        (Array.isArray(options.userIds) ? options.userIds : [options.userIds])
          .filter(Boolean)
          .map((id) => String(id))
      )
    );

    userIds.forEach((id) => {
      io.to(`user:${id}`).emit('notification', payload);
    });

    if (options.includeAdmins) {
      io.to('role:admin').emit('notification', payload);
    }
  } catch (_error) {
    // Ignore socket emission failures for payment flow.
  }
};

// @desc    Create Stripe Checkout Session & Save Shipping Address
exports.createCheckoutSession = async (req, res) => {
  const { shippingAddress } = req.body;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Server Error: Stripe Key Missing" });
    }

    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (!auction.winner) {
      return res.status(400).json({ message: 'Winner not found for this auction' });
    }

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
              description: auction.description ? auction.description.substring(0, 400) : "Auction Item",
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

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ message: error.message || 'Payment Processing Failed' });
  }
};

// @desc    Confirm Stripe success page result (webhook fallback)
exports.confirmCheckoutSuccess = async (req, res) => {
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

    if (!auction.winner) {
      return res.status(400).json({ message: 'Winner not found for this auction' });
    }
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can confirm this payment' });
    }
    if (metadataWinnerId && String(metadataWinnerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Session winner does not match current user' });
    }

    if (auction.payment?.status === 'paid' || ['paid_shipping_pending', 'closed'].includes(auction.status)) {
      return res.status(200).json({ message: 'Payment already confirmed', auctionStatus: auction.status });
    }

    const totalAmount = Number(auction.currentPrice || 0);
    const commission = Number((totalAmount * 0.05).toFixed(2));
    const sellerPayout = Number((totalAmount - commission).toFixed(2));

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

    if (req.user?.email) {
      sendEmailAsync({
        email: req.user.email,
        subject: `Payment Receipt: ${auction.title}`,
        message: templates.paymentReceipt({
          title: auction.title,
          amount: totalAmount,
        }),
      });
      sendEmailAsync({
        email: req.user.email,
        subject: `Shipping initiated: ${auction.title}`,
        message: templates.shippingStarted({
          title: auction.title,
          minDays: 7,
          maxDays: 14,
          link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
        }),
      });
    }

    if (auction.seller?.email) {
      sendEmailAsync({
        email: auction.seller.email,
        subject: `Seller payout update: ${auction.title}`,
        message: templates.sellerPaid({
          title: auction.title,
          grossAmount: totalAmount.toFixed(2),
          sellerPayout: sellerPayout.toFixed(2),
          commission: commission.toFixed(2),
        }),
      });
    }

    if (process.env.ADMIN_EMAIL) {
      sendEmailAsync({
        email: process.env.ADMIN_EMAIL,
        subject: `Payment completed: ${auction.title}`,
        message: templates.sellerPaid({
          title: auction.title,
          grossAmount: totalAmount.toFixed(2),
          sellerPayout: sellerPayout.toFixed(2),
          commission: commission.toFixed(2),
        }),
      });
    }

    emitRealtimeNotification(
      req,
      {
        type: 'success',
        title: 'Payment Completed',
        message: `Payment completed for "${auction.title}". BidPulse shipping is now in progress.`,
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

// @desc    Reconcile payment status for winner (fallback when webhook/success sync lags)
exports.reconcileWinnerPayment = async (req, res) => {
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

    const totalAmount = Number(auction.currentPrice || 0);
    const commission = Number((totalAmount * 0.05).toFixed(2));
    const sellerPayout = Number((totalAmount - commission).toFixed(2));

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

// @desc    Buyer confirms product receipt -> close order lifecycle
exports.confirmProductReceived = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('seller');
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (auction.status !== 'paid_shipping_pending') {
      return res.status(400).json({ message: 'Product receipt can only be confirmed after successful payment' });
    }
    if (auction.shipping?.status === 'received_confirmed') {
      return res.status(400).json({ message: 'Product receipt has already been confirmed' });
    }

    auction.status = 'closed';
    auction.shipping = {
      ...auction.shipping,
      status: 'received_confirmed',
      receivedConfirmedAt: new Date(),
      receivedConfirmedBy: req.user.id,
    };
    await auction.save();

    const winnerEmail = req.user.email;
    if (winnerEmail) {
      sendEmailAsync({
        email: winnerEmail,
        subject: `Order completed: ${auction.title}`,
        message: templates.productReceivedConfirmed({ title: auction.title }),
      });
    }

    if (auction.seller?.email) {
      sendEmailAsync({
        email: auction.seller.email,
        subject: `Buyer confirmed receipt: ${auction.title}`,
        message: templates.productReceivedConfirmed({ title: auction.title }),
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendEmailAsync({
        email: adminEmail,
        subject: `BidPulse order closed: ${auction.title}`,
        message: templates.productReceivedConfirmed({ title: auction.title }),
      });
    }

    emitRealtimeNotification(
      req,
      {
        type: 'success',
        title: 'Order Completed',
        message: `Winner confirmed product receipt for "${auction.title}"`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id, auction.seller?._id || auction.seller],
        includeAdmins: true,
      }
    );

    // Backward compatibility template for external reports still using this name.
    sendEmailAsync({
      email: auction.seller.email,
      subject: `Lifecycle closed: ${auction.title}`,
      message: templates.fundsReleased({
        title: auction.title,
        sellerPayout: Number(auction.payment?.sellerPayoutAmount || 0).toFixed(2),
      }),
    });

    res.status(200).json({ message: 'Product receipt confirmed. Auction lifecycle closed.' });

  } catch (error) {
    console.error('CONFIRM RECEIVED ERROR:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Backward-compatible export name used by existing route import.
exports.releaseFunds = exports.confirmProductReceived;

