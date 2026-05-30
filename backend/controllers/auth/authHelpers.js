// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/authHelpers.js
// Purpose: auth Helpers
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const cloudinary = require('../../config/cloudinary');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  emergencyContact: user.emergencyContact,
  bloodGroup: user.bloodGroup,
  cityState: user.cityState,
  postalCode: user.postalCode,
  gender: user.gender,
  occupation: user.occupation,
  preferredDeliveryAddress: user.preferredDeliveryAddress,
  secondaryEmail: user.secondaryEmail,
  medicalNotes: user.medicalNotes,
  role: user.role,
  dob: user.dob,
  location: user.location,
  address: user.address,
  idType: user.idType,
  idNumber: user.idNumber,
  emailVerified: user.emailVerified,
  socialLinks: user.socialLinks,
  socialProfiles: user.socialProfiles,
  avatarUrl: user.avatarUrl,
  avatarEmoji: user.avatarEmoji,
  profileVerifiedAt: user.profileVerifiedAt,
  createdAt: user.createdAt,
  token: generateToken(user._id),
});

const uploadAvatarImage = async (fileBuffer) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Profile image upload service is not configured');
  }

  const folder = process.env.CLOUDINARY_FOLDER || 'AuctionPulse';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

const isAtLeast18 = (dateValue) => {
  const dob = new Date(dateValue);
  if (Number.isNaN(dob.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 18;
};

const clearPendingProfileVerification = (user) => {
  user.pendingProfileVerification = undefined;
};

const finalizeProfileVerification = async (user) => {
  const pending = user.pendingProfileVerification;

  if (!pending?.dob || !pending?.location || !pending?.mobile || !pending?.idNumber || !pending?.avatarUrl) {
    throw new Error('Verification details are incomplete');
  }

  user.dob = pending.dob;
  user.location = pending.location;
  user.mobile = pending.mobile;
  user.emergencyContact = pending.emergencyContact || '';
  user.idNumber = pending.idNumber;
  user.avatarUrl = pending.avatarUrl;
  user.avatarEmoji = '';
  user.emailVerified = true;
  user.profileVerifiedAt = new Date();
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpire = undefined;
  clearPendingProfileVerification(user);
  await user.save();
  return user;
};

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

module.exports = {
  generateToken,
  serializeUser,
  uploadAvatarImage,
  isAtLeast18,
  clearPendingProfileVerification,
  finalizeProfileVerification,
  hashValue,
};


