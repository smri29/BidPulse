/**
 * Module: backend/controllers/auction/index.js
 * Purpose: Collects feature-specific controller actions into a single export surface for route files.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/index.js
// Purpose: module export index
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const engine = require('./engine');

module.exports = {
  getAllAuctions: require('./actions/getAllAuctions'),
  getAuctionSummary: require('./actions/getAuctionSummary'),
  getAuctionById: require('./actions/getAuctionById'),
  createAuction: require('./actions/createAuction'),
  updateAuction: require('./actions/updateAuction'),
  deleteAuction: require('./actions/deleteAuction'),
  registerForAuction: require('./actions/registerForAuction'),
  openAuctionRoom: require('./actions/openAuctionRoom'),
  placeBid: require('./actions/placeBid'),
  giveUpBid: require('./actions/giveUpBid'),
  handleNoRegistrationDecision: require('./actions/handleNoRegistrationDecision'),
  adminApproveAuction: require('./actions/adminApproveAuction'),
  adminDisapproveAuction: require('./actions/adminDisapproveAuction'),
  internalJobs: {
    moveToOngoing: engine.moveToOngoing,
    prepareAuctionRoom: engine.prepareAuctionRoom,
    handleGiveUpCore: engine.handleGiveUpCore,
    finalizeOngoingAuction: engine.finalizeOngoingAuction,
  },
};


