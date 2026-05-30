/**
 * Module: backend/controllers/auth/actions/updateUserDetails.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/updateUserDetails.js
// Purpose: update User Details
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { serializeUser } = require('../authHelpers');

const updateUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.mobile = req.body.mobile || user.mobile;
    user.location = req.body.location || user.location;
    user.address = typeof req.body.address === 'string' ? req.body.address : user.address;
    user.emergencyContact =
      typeof req.body.emergencyContact === 'string' ? req.body.emergencyContact : user.emergencyContact;
    user.bloodGroup = typeof req.body.bloodGroup === 'string' ? req.body.bloodGroup : user.bloodGroup;
    user.cityState = typeof req.body.cityState === 'string' ? req.body.cityState : user.cityState;
    user.postalCode = typeof req.body.postalCode === 'string' ? req.body.postalCode : user.postalCode;
    user.gender = typeof req.body.gender === 'string' ? req.body.gender : user.gender;
    user.occupation = typeof req.body.occupation === 'string' ? req.body.occupation : user.occupation;
    user.preferredDeliveryAddress =
      typeof req.body.preferredDeliveryAddress === 'string'
        ? req.body.preferredDeliveryAddress
        : user.preferredDeliveryAddress;
    user.secondaryEmail =
      typeof req.body.secondaryEmail === 'string' ? req.body.secondaryEmail : user.secondaryEmail;
    user.medicalNotes = typeof req.body.medicalNotes === 'string' ? req.body.medicalNotes : user.medicalNotes;
    user.socialLinks = {
      ...user.socialLinks,
      ...(req.body.socialLinks || {}),
    };

    if (Array.isArray(req.body.socialProfiles)) {
      user.socialProfiles = req.body.socialProfiles
        .map((entry) => ({
          name: typeof entry?.name === 'string' ? entry.name.trim() : '',
          link: typeof entry?.link === 'string' ? entry.link.trim() : '',
        }))
        .filter((entry) => entry.name || entry.link);
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    return res.json(serializeUser(updatedUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = updateUserDetails;


