// ---------------------------------------------------------------------------
// Module: backend/controllers/payment/index.js
// Purpose: module export index
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const confirmProductReceived = require('./actions/confirmProductReceived');

module.exports = {
  createCheckoutSession: require('./actions/createCheckoutSession'),
  confirmCheckoutSuccess: require('./actions/confirmCheckoutSuccess'),
  reconcileWinnerPayment: require('./actions/reconcileWinnerPayment'),
  confirmProductReceived,
  releaseFunds: confirmProductReceived,
};


