/**
 * Module: backend/controllers/support/actions/getSupportTickets.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/support/actions/getSupportTickets.js
// Purpose: get Support Tickets
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const SupportTicket = require('../../../models/SupportTicket');

const getSupportTickets = async (req, res) => {
  try {
    const status = req.query.status;
    const query = status && status !== 'all' ? { status } : {};
    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getSupportTickets;


