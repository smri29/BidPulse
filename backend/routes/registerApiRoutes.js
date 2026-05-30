// ---------------------------------------------------------------------------
// Module: backend/routes/registerApiRoutes.js
// Purpose: register Api Routes
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const authRoutes = require('./authRoutes');
const auctionRoutes = require('./auctionRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const supportRoutes = require('./supportRoutes');

const registerApiRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/auctions', auctionRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/support', supportRoutes);
};

module.exports = {
  registerApiRoutes,
};


