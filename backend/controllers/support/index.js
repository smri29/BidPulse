// ---------------------------------------------------------------------------
// Module: backend/controllers/support/index.js
// Purpose: module export index
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

module.exports = {
  createSupportTicket: require('./actions/createSupportTicket'),
  getSupportTickets: require('./actions/getSupportTickets'),
  updateSupportTicketStatus: require('./actions/updateSupportTicketStatus'),
};


