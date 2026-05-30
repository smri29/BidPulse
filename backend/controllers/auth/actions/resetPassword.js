/**
 * Module: backend/controllers/auth/actions/resetPassword.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/resetPassword.js
// Purpose: reset Password
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { generateToken, hashValue } = require('../authHelpers');

const resetPassword = async (req, res) => {
  const resetPasswordToken = hashValue(req.params.resetToken);

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or token has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = resetPassword;


