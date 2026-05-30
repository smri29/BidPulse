/**
 * Module: backend/controllers/auth/actions/uploadAvatar.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/uploadAvatar.js
// Purpose: upload Avatar
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { serializeUser, uploadAvatarImage } = require('../authHelpers');

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Avatar upload service is not configured in production' });
    }

    const uploadResult = await uploadAvatarImage(req.file.buffer);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatarUrl = uploadResult.secure_url;
    user.avatarEmoji = '';
    await user.save();

    return res.json({ message: 'Avatar updated', user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = uploadAvatar;


