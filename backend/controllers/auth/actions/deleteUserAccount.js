/**
 * Module: backend/controllers/auth/actions/deleteUserAccount.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/deleteUserAccount.js
// Purpose: delete User Account
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');

const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    return res.json({ message: 'User removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = deleteUserAccount;


