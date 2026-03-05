const SupportTicket = require('../models/SupportTicket');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');

// @desc    Create support ticket (public)
// @route   POST /api/support/tickets
// @access  Public
exports.createSupportTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      message,
      user: req.user?._id || null,
    });

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
    if (supportEmail) {
      sendEmailAsync({
        email: supportEmail,
        subject: `[RiZBiD Support] ${subject}`,
        message: templates.supportCreated({ ticketId: ticket._id }),
      });
    }

    sendEmailAsync({
      email,
      subject: 'RiZBiD Support Ticket Received',
      message: templates.supportCreated({ ticketId: ticket._id }),
    });

    return res.status(201).json({
      message: 'Support request submitted successfully',
      ticketId: ticket._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Admin list support tickets
// @route   GET /api/support/tickets
// @access  Private/Admin
exports.getSupportTickets = async (req, res) => {
  try {
    const status = req.query.status;
    const query = status && status !== 'all' ? { status } : {};

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Admin update support ticket status
// @route   PUT /api/support/tickets/:id
// @access  Private/Admin
exports.updateSupportTicketStatus = async (req, res) => {
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
        subject: `RiZBiD Support: Ticket ${status.replace('_', ' ')}`,
        message: templates.supportStatus({ ticketId: ticket._id, status }),
      });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

