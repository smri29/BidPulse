/**
 * Module: backend/controllers/auth/actions/verifyProfileLink.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/verifyProfileLink.js
// Purpose: verify Profile Link
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');
const { hashValue, finalizeProfileVerification } = require('../authHelpers');

const verifyProfileLink = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = hashValue(token);
    const user = await User.findOne({
      'pendingProfileVerification.linkTokenHash': hashedToken,
      'pendingProfileVerification.linkExpire': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Profile already verified' });
    }

    await finalizeProfileVerification(user);

    sendEmailAsync({
      email: user.email,
      subject: 'AuctionPulse Profile Verified',
      message: templates.profileVerified({ name: user.name, clientUrl: process.env.CLIENT_URL }),
    });

    return res.json({ message: 'Profile verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyProfileLink;


