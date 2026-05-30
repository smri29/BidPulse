/**
 * Module: backend/controllers/payment/paymentHelpers.js
 * Purpose: Provides controller-level coordination logic for this backend feature area.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/payment/paymentHelpers.js
// Purpose: payment Helpers
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const { sendEmailAsync } = require('../../utils/emailService');
const templates = require('../../utils/emailTemplates');
const { emitRealtimeNotification } = require('../../sockets/notifications');

const calculatePaymentSplit = (amount) => {
  const totalAmount = Number(amount || 0);
  const commission = Number((totalAmount * 0.05).toFixed(2));
  const sellerPayout = Number((totalAmount - commission).toFixed(2));

  return {
    totalAmount,
    commission,
    sellerPayout,
  };
};

const queuePaymentSuccessEmails = ({ winnerEmail, sellerEmail, title, totalAmount, sellerPayout, commission, auctionId }) => {
  if (winnerEmail) {
    sendEmailAsync({
      email: winnerEmail,
      subject: `Payment Receipt: ${title}`,
      message: templates.paymentReceipt({
        title,
        amount: totalAmount,
      }),
    });
    sendEmailAsync({
      email: winnerEmail,
      subject: `Shipping initiated: ${title}`,
      message: templates.shippingStarted({
        title,
        minDays: 7,
        maxDays: 14,
        link: `${process.env.CLIENT_URL}/auction/${auctionId}`,
      }),
    });
  }

  if (sellerEmail) {
    sendEmailAsync({
      email: sellerEmail,
      subject: `Seller payout update: ${title}`,
      message: templates.sellerPaid({
        title,
        grossAmount: totalAmount.toFixed(2),
        sellerPayout: sellerPayout.toFixed(2),
        commission: commission.toFixed(2),
      }),
    });
  }

  if (process.env.ADMIN_EMAIL) {
    sendEmailAsync({
      email: process.env.ADMIN_EMAIL,
      subject: `Payment completed: ${title}`,
      message: templates.sellerPaid({
        title,
        grossAmount: totalAmount.toFixed(2),
        sellerPayout: sellerPayout.toFixed(2),
        commission: commission.toFixed(2),
      }),
    });
  }
};

module.exports = {
  calculatePaymentSplit,
  queuePaymentSuccessEmails,
  emitRealtimeNotification,
};


