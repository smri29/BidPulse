// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/legacyVerification.js
// Purpose: legacy Verification
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const sendVerificationOTP = async (_req, res) =>
  res.status(410).json({ message: 'Use the profile verification flow from the Profile page.' });

const verifyEmailOTP = async (_req, res) =>
  res.status(410).json({ message: 'Use the profile verification flow from the Profile page.' });

module.exports = {
  sendVerificationOTP,
  verifyEmailOTP,
};


