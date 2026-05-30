/**
 * Module: backend/controllers/auction/viewHelpers.js
 * Purpose: Provides controller-level coordination logic for this backend feature area.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/viewHelpers.js
// Purpose: view Helpers
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../models/Auction');

const populateAuctionDetails = (query) =>
  query
    .populate('seller', 'name email')
    .populate('winner', 'name email')
    .populate('bids.bidder', 'name email')
    .populate('registrations.bidder', 'name email')
    .populate('activeBidders', 'name email')
    .populate('waitingBidders', 'name email')
    .populate('roomActivation.currentBidder', 'name email')
    .populate('roomActivation.openedBy', 'name email');

const getAuctionDetailsById = (auctionId) => populateAuctionDetails(Auction.findById(auctionId));

const emitAuctionUpdate = async (req, auctionId, auctionPayload) => {
  const io = req.app.get('io');
  io.to(String(auctionId)).emit('bidUpdated', auctionPayload);
};

module.exports = {
  populateAuctionDetails,
  getAuctionDetailsById,
  emitAuctionUpdate,
};


