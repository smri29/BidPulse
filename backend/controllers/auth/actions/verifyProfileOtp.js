/**
 * Module: backend/controllers/auth/actions/verifyProfileOtp.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/verifyProfileOtp.js
// Purpose: verify Profile Otp
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');
const { hashValue, finalizeProfileVerification, serializeUser } = require('../authHelpers');

const verifyProfileOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Profile already verified' });

    const pending = user.pendingProfileVerification;
    if (!pending || pending.method !== 'otp') {
      return res.status(400).json({ message: 'No OTP-based profile verification request was found' });
    }

    const hashedOtp = hashValue(otp);
    if (pending.otpHash !== hashedOtp || !pending.otpExpire || pending.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await finalizeProfileVerification(user);

    sendEmailAsync({
      email: user.email,
      subject: 'AuctionPulse Profile Verified',
      message: templates.profileVerified({ name: user.name, clientUrl: process.env.CLIENT_URL }),
    });

    return res.json({
      message: 'Profile verified successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = verifyProfileOtp;


