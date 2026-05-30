// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/index.js
// Purpose: module export index
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

module.exports = {
  getAdminStats: require('./actions/getAdminStats'),
  getAllUsers: require('./actions/getAllUsers'),
  banUser: require('./actions/banUser'),
  deleteUser: require('./actions/deleteUser'),
  getUserHistory: require('./actions/getUserHistory'),
  getAllAuctionsAdmin: require('./actions/getAllAuctionsAdmin'),
  deleteAnyAuction: require('./actions/deleteAnyAuction'),
  sendTestEmail: require('./actions/sendTestEmail'),
  triggerPromotionalCampaign: require('./actions/triggerPromotionalCampaign'),
};


