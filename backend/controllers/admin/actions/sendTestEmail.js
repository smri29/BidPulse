/**
 * Module: backend/controllers/admin/actions/sendTestEmail.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/sendTestEmail.js
// Purpose: send Test Email
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');

const sendTestEmail = async (_req, res) => {
  const targetEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_USERNAME || process.env.EMAIL_USER;

  if (!targetEmail) {
    return res.status(400).json({ message: 'No target email configured. Set ADMIN_EMAIL or SUPPORT_EMAIL.' });
  }

  sendEmailAsync({
    email: targetEmail,
    subject: 'AuctionPulse Email Health Check',
    message: templates.welcome({ name: 'Admin', clientUrl: process.env.CLIENT_URL }),
  });

  return res.json({ message: `Test email queued for ${targetEmail}` });
};

module.exports = sendTestEmail;


