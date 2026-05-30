// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/startProfileVerification.js
// Purpose: start Profile Verification
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const { uploadAvatarImage, isAtLeast18, clearPendingProfileVerification } = require('../authHelpers');
const {
  sendProfileVerificationOtpEmail,
  sendProfileVerificationLinkEmail,
} = require('../verificationEmails');

const startProfileVerification = async (req, res) => {
  try {
    if (req.user.isStaticAdmin) {
      return res.status(400).json({ message: 'Admin account does not require profile verification' });
    }

    const { dob, country, primaryContact, emergencyContact, idNumber, verificationMethod } = req.body;

    if (!dob || !country || !primaryContact || !idNumber || !verificationMethod) {
      return res.status(400).json({ message: 'All required verification fields must be provided' });
    }

    if (!['otp', 'link'].includes(verificationMethod)) {
      return res.status(400).json({ message: 'Verification method must be OTP or link' });
    }

    if (!isAtLeast18(dob)) {
      return res.status(400).json({ message: 'You must be at least 18 years old to verify your profile' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let avatarUrl = user.avatarUrl || '';
    if (req.file) {
      try {
        const uploadResult = await uploadAvatarImage(req.file.buffer);
        avatarUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(503).json({ message: uploadError.message });
      }
    }

    if (!avatarUrl) {
      return res.status(400).json({ message: 'Profile picture is required for verification' });
    }

    user.pendingProfileVerification = {
      dob: new Date(dob),
      location: String(country).trim(),
      mobile: String(primaryContact).trim(),
      emergencyContact: String(emergencyContact || '').trim(),
      idNumber: String(idNumber).trim(),
      avatarUrl,
      method: verificationMethod,
      requestedAt: new Date(),
      otpHash: undefined,
      otpExpire: undefined,
      linkTokenHash: undefined,
      linkExpire: undefined,
    };

    if (verificationMethod === 'otp') {
      const otp = user.generateProfileVerificationOTP();
      await user.save();

      try {
        await sendProfileVerificationOtpEmail(user, otp);
      } catch (emailError) {
        clearPendingProfileVerification(user);
        await user.save();
        return res.status(503).json({ message: `Unable to send verification OTP right now. ${emailError.message}` });
      }

      return res.json({
        message: 'A profile verification OTP has been sent to your primary email address.',
        verificationMethod: 'otp',
        otpExpiresInSeconds: 10 * 60,
      });
    }

    const linkToken = user.generateProfileVerificationLinkToken();
    await user.save();

    const clientUrl = process.env.CLIENT_URL || process.env.CLIENT_APP_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl.replace(/\/$/, '')}/verify-profile/${linkToken}`;

    try {
      await sendProfileVerificationLinkEmail(user, verificationUrl);
    } catch (emailError) {
      clearPendingProfileVerification(user);
      await user.save();
      return res.status(503).json({ message: `Unable to send verification link right now. ${emailError.message}` });
    }

    return res.json({
      message: 'A profile verification link has been sent to your primary email address.',
      verificationMethod: 'link',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = startProfileVerification;


