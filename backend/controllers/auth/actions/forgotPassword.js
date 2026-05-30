/**
 * Module: backend/controllers/auth/actions/forgotPassword.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/forgotPassword.js
// Purpose: forgot Password
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const sendEmail = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'AuctionPulse Password Reset Token',
        message: templates.resetPassword({ resetUrl }),
      });

      return res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = forgotPassword;


