// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/deleteUser.js
// Purpose: delete User
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    return res.json({ message: 'User removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = deleteUser;


