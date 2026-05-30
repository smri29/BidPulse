/**
 * Module: backend/controllers/support/actions/createSupportTicket.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/support/actions/createSupportTicket.js
// Purpose: create Support Ticket
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const SupportTicket = require('../../../models/SupportTicket');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeText = (value) =>
  String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const createSupportTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeText(email).toLowerCase();
    const cleanSubject = sanitizeText(subject);
    const cleanMessage = sanitizeText(message);

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({ message: 'Name must be between 2 and 80 characters' });
    }
    if (cleanSubject.length < 4 || cleanSubject.length > 140) {
      return res.status(400).json({ message: 'Subject must be between 4 and 140 characters' });
    }
    if (cleanMessage.length < 15 || cleanMessage.length > 3000) {
      return res.status(400).json({ message: 'Message must be between 15 and 3000 characters' });
    }

    const ticket = await SupportTicket.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      user: req.user?._id || null,
    });

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
    if (supportEmail) {
      sendEmailAsync({
        email: supportEmail,
        subject: `[AuctionPulse Support] ${cleanSubject}`,
        message: templates.supportCreated({ ticketId: ticket._id }),
      });
    }

    sendEmailAsync({
      email: cleanEmail,
      subject: 'AuctionPulse Support Ticket Received',
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

module.exports = createSupportTicket;


