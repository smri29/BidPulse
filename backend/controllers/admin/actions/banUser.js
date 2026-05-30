// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/banUser.js
// Purpose: ban User
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');

const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    await user.save();
    return res.json({ message: `User ${user.isBanned ? 'Banned' : 'Active'}`, isBanned: user.isBanned });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = banUser;


