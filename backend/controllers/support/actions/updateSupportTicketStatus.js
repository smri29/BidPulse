/**
 * Module: backend/controllers/support/actions/updateSupportTicketStatus.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/support/actions/updateSupportTicketStatus.js
// Purpose: update Support Ticket Status
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const SupportTicket = require('../../../models/SupportTicket');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');

const updateSupportTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const previousStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    if (previousStatus !== status) {
      sendEmailAsync({
        email: ticket.email,
        subject: `AuctionPulse Support: Ticket ${status.replace('_', ' ')}`,
        message: templates.supportStatus({ ticketId: ticket._id, status }),
      });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = updateSupportTicketStatus;


