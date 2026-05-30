// ---------------------------------------------------------------------------
// Module: backend/bootstrap/stripeWebhook.js
// Purpose: stripe Webhook
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const stripe = require('stripe');

const Auction = require('../models/Auction');
const User = require('../models/User');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const { emitNotificationToUsers } = require('../sockets/notifications');

const stripeClient = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;

const applySuccessfulPaymentState = async ({ auction, session, winner, winnerId }) => {
  const totalAmount = Number(auction.currentPrice || 0);
  const commission = Number((totalAmount * 0.05).toFixed(2));
  const sellerPayout = Number((totalAmount - commission).toFixed(2));

  let payoutStatus = 'manual_required';
  if (auction.seller?.stripeAccountId) {
    try {
      await stripeClient.transfers.create({
        amount: Math.round(sellerPayout * 100),
        currency: 'usd',
        destination: auction.seller.stripeAccountId,
      });
      payoutStatus = 'completed';
    } catch (transferError) {
      payoutStatus = 'failed';
      console.error('Seller payout transfer failed:', transferError.message);
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

  if (winner?.email) {
    sendEmailAsync({
      email: winner.email,
      subject: `Payment Receipt: ${auction.title}`,
      message: templates.paymentReceipt({
        title: auction.title,
        amount: totalAmount,
      }),
    });
    sendEmailAsync({
      email: winner.email,
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

  return {
    totalAmount,
    commission,
    sellerPayout,
    winnerId,
  };
};

const registerStripeWebhookRoute = (app, io) => {
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send('Stripe webhook is not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const auctionId = session.metadata?.auctionId;
      const winnerId = session.metadata?.winnerId;

      try {
        const [auction, winner] = await Promise.all([
          Auction.findById(auctionId).populate('seller', 'email stripeAccountId'),
          User.findById(winnerId).select('email name').lean(),
        ]);

        if (!auction || !winner) {
          return res.json({ received: true });
        }

        if (auction.payment?.status === 'paid' || ['paid_shipping_pending', 'closed'].includes(auction.status)) {
          return res.json({ received: true });
        }

        await applySuccessfulPaymentState({ auction, session, winner, winnerId });

        emitNotificationToUsers(
          io,
          [winnerId, auction.seller?._id],
          {
            type: 'success',
            title: 'Payment Completed',
            message: `Payment completed for "${auction.title}". AuctionPulse shipping is now in progress.`,
            auctionId,
          },
          { includeAdmins: true }
        );
      } catch (err) {
        console.error('Error updating auction status:', err.message);
      }
    }

    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;
      const auctionId = session.metadata?.auctionId;
      const winnerId = session.metadata?.winnerId;

      try {
        const [auction, winner] = await Promise.all([
          Auction.findById(auctionId),
          winnerId ? User.findById(winnerId).select('email').lean() : null,
        ]);

        if (auction && auction.payment?.status !== 'paid') {
          auction.payment = {
            ...auction.payment,
            status: 'failed',
            lastFailureAt: new Date(),
            lastFailureReason:
              event.type === 'checkout.session.expired'
                ? 'Checkout session expired before payment completion'
                : 'Payment failed by provider',
          };
          await auction.save();

          if (winner?.email) {
            sendEmailAsync({
              email: winner.email,
              subject: `Payment failed: ${auction.title}`,
              message: templates.paymentFailed({
                title: auction.title,
                reason: auction.payment.lastFailureReason,
                link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
              }),
            });
          }

          if (process.env.ADMIN_EMAIL) {
            sendEmailAsync({
              email: process.env.ADMIN_EMAIL,
              subject: `Payment failed: ${auction.title}`,
              message: templates.paymentFailed({
                title: auction.title,
                reason: auction.payment.lastFailureReason,
                link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
              }),
            });
          }

          emitNotificationToUsers(
            io,
            [winnerId],
            {
              type: 'warning',
              title: 'Payment Failed',
              message: `Payment failed for "${auction.title}". Winner can retry checkout.`,
              auctionId,
            },
            { includeAdmins: true }
          );
        }
      } catch (err) {
        console.error('Error handling payment failure webhook:', err.message);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const auctionId = paymentIntent.metadata?.auctionId;
      const winnerId = paymentIntent.metadata?.winnerId;

      try {
        const [auction, winner] = await Promise.all([
          Auction.findById(auctionId),
          winnerId ? User.findById(winnerId).select('email').lean() : null,
        ]);

        if (auction && auction.payment?.status !== 'paid') {
          const reason =
            paymentIntent.last_payment_error?.message || 'Payment intent failed during processing';

          auction.payment = {
            ...auction.payment,
            status: 'failed',
            lastFailureAt: new Date(),
            lastFailureReason: reason,
          };
          await auction.save();

          if (winner?.email) {
            sendEmailAsync({
              email: winner.email,
              subject: `Payment failed: ${auction.title}`,
              message: templates.paymentFailed({
                title: auction.title,
                reason,
                link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
              }),
            });
          }

          emitNotificationToUsers(
            io,
            [winnerId],
            {
              type: 'warning',
              title: 'Payment Failed',
              message: `Payment failed for "${auction.title}". Winner can retry checkout.`,
              auctionId,
            },
            { includeAdmins: true }
          );
        }
      } catch (err) {
        console.error('Error handling payment intent failure webhook:', err.message);
      }
    }

    return res.json({ received: true });
  });
};

const express = require('express');

module.exports = {
  registerStripeWebhookRoute,
};


