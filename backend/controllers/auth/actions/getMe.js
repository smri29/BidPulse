// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/getMe.js
// Purpose: get Me
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');

const getMe = async (req, res) => {
  if (req.user.isStaticAdmin) {
    return res.status(200).json({
      _id: 'static_admin_id_999',
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL,
      role: 'admin',
      emailVerified: true,
      avatarEmoji: '\u{1F6E1}\u{FE0F}',
      location: 'Control Room',
      address: '',
    });
  }

  const user = await User.findById(req.user.id);
  return res.status(200).json(user);
};

module.exports = getMe;


