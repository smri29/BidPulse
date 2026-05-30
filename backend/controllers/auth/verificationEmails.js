/**
 * Module: backend/controllers/auth/verificationEmails.js
 * Purpose: Provides controller-level coordination logic for this backend feature area.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/verificationEmails.js
// Purpose: verification Emails
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const sendEmail = require('../../utils/emailService');
const templates = require('../../utils/emailTemplates');

const sendProfileVerificationOtpEmail = async (user, otp) => {
  await sendEmail({
    email: user.email,
    subject: 'AuctionPulse Profile Verification OTP',
    message: templates.profileVerificationOtp({ otp }),
  });
};

const sendProfileVerificationLinkEmail = async (user, verificationUrl) => {
  await sendEmail({
    email: user.email,
    subject: 'AuctionPulse Profile Verification Link',
    message: templates.profileVerificationLink({ verificationUrl }),
  });
};

module.exports = {
  sendProfileVerificationOtpEmail,
  sendProfileVerificationLinkEmail,
};


