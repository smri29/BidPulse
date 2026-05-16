const User = require('../models/User');
const Auction = require('../models/Auction');
const SupportTicket = require('../models/SupportTicket');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const crypto = require('crypto');
const archiver = require('archiver');
const { PassThrough } = require('stream');
const cloudinary = require('../config/cloudinary');
const { validateTurnstileToken } = require('../utils/turnstile');

// ---------------------------------------------------------------------------
// Auth controller responsibilities
// 1. Account creation and login
// 2. Profile verification via OTP or secure link
// 3. Profile edits, avatar upload, and activity export
// 4. Password reset lifecycle
// ---------------------------------------------------------------------------

const generateToken = (id) => {
  // JWT payload only stores the user id; role and profile state are fetched from DB when needed.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const serializeUser = (user) => ({
  // Frontend session state expects a fresh token whenever profile data is returned after auth actions.
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

// Transactional email helpers are split out so the main handlers stay focused on control flow.
const sendProfileVerificationOtpEmail = async (user, otp) => {
  await sendEmail({
    email: user.email,
    subject: 'AuctionPulse Profile Verification OTP',
    message: templates.profileVerificationOtp({ otp }),
  });
};

const sendProfileVerificationLinkEmail = async (user, verificationUrl) => {
  await sendEmail({
    email: user.email,
    subject: 'AuctionPulse Profile Verification Link',
    message: templates.profileVerificationLink({ verificationUrl }),
  });
};

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
        // Face-focused crop produces consistent profile cards across the UI.
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
  // Age calculation is based on year difference and then corrected by month/day boundary.
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
  // Verification promotes staged data into the real profile only after OTP/link proof succeeds.
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

// ---------------------------------------------------------------------------
// Account registration and login
// ---------------------------------------------------------------------------

exports.register = async (req, res) => {
  const { name, email, password, turnstileToken } = req.body;

  try {
    // Prefer Cloudflare/client forwarded IPs when available so Turnstile validation sees the real user origin.
    const remoteip =
      req.headers['cf-connecting-ip'] ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .map((item) => item.trim())
        .find(Boolean) ||
      req.ip;

    // Registration is protected by Turnstile to reduce bot account creation.
    const turnstileValidation = await validateTurnstileToken({
      token: turnstileToken || req.body['cf-turnstile-response'],
      remoteip,
    });

    if (!turnstileValidation.success) {
      return res
        .status(turnstileValidation.status)
        .json({ message: turnstileValidation.message, errorCodes: turnstileValidation.errorCodes });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // New users are created as regular unverified users. They verify later from the profile page.
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      emailVerified: false,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    return res.status(201).json({
      message: 'Account created successfully. Please sign in to continue.',
      accountCreated: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, turnstileToken } = req.body;

  try {
    const remoteip =
      req.headers['cf-connecting-ip'] ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .map((item) => item.trim())
        .find(Boolean) ||
      req.ip;

    // Login is also protected because admin access shares this same endpoint.
    const turnstileValidation = await validateTurnstileToken({
      token: turnstileToken || req.body['cf-turnstile-response'],
      remoteip,
    });

    if (!turnstileValidation.success) {
      return res
        .status(turnstileValidation.status)
        .json({ message: turnstileValidation.message, errorCodes: turnstileValidation.errorCodes });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASS;

    // Static admin login bypasses MongoDB and is meant for single-super-admin control access.
    if (adminEmail && adminPass && email === adminEmail && password === adminPass) {
      return res.json({
        _id: 'static_admin_id_999',
        name: 'Super Admin',
        email: adminEmail,
        role: 'admin',
        emailVerified: true,
        avatarEmoji: '\u{1F6E1}\u{FE0F}',
        createdAt: new Date(),
        token: generateToken('static_admin_id_999'),
      });
    }

    // Password is excluded by default in the model, so login explicitly requests it.
    const user = await User.findOne({ email }).select('+password');

    if (user?.isBanned) {
      return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });
    }

    if (user && (await user.matchPassword(password))) {
      return res.json(serializeUser(user));
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.sendVerificationOTP = async (req, res) => {
  // Legacy signup-verification flow intentionally stays disabled to push all users into profile verification.
  return res.status(410).json({ message: 'Use the profile verification flow from the Profile page.' });
};

exports.verifyEmailOTP = async (req, res) => {
  // Legacy signup-verification flow intentionally stays disabled to push all users into profile verification.
  return res.status(410).json({ message: 'Use the profile verification flow from the Profile page.' });
};

// ---------------------------------------------------------------------------
// Profile verification flow
// ---------------------------------------------------------------------------

exports.startProfileVerification = async (req, res) => {
  try {
    if (req.user.isStaticAdmin) {
      return res.status(400).json({ message: 'Admin account does not require profile verification' });
    }

    const { dob, country, primaryContact, emergencyContact, idNumber, verificationMethod } = req.body;

    // These are the minimum identity attributes required before a user can buy or sell.
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

    // Reuse an existing avatar when present, otherwise require a fresh uploaded image.
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

    // Verification data is staged first so incomplete or unverified profiles never become permanent.
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
      // OTP flow keeps the user in-session and completes verification from the profile page.
      const otp = user.generateProfileVerificationOTP();
      await user.save();

      try {
        await sendProfileVerificationOtpEmail(user, otp);
      } catch (emailError) {
        // If email dispatch fails, clear the staged verification request so the UI can restart cleanly.
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

    // Link flow is useful when the user prefers email-click confirmation instead of manual OTP entry.
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

exports.verifyProfileOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Profile already verified' });

    const pending = user.pendingProfileVerification;
    if (!pending || pending.method !== 'otp') {
      return res.status(400).json({ message: 'No OTP-based profile verification request was found' });
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // OTP must match the stored hash and still be within the expiry window.
    if (
      pending.otpHash !== hashedOtp ||
      !pending.otpExpire ||
      pending.otpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await finalizeProfileVerification(user);

    // Verification success triggers a confirmation email but does not block the API response.
    sendEmailAsync({
      email: user.email,
      subject: 'AuctionPulse Profile Verified',
      message: templates.profileVerified({ name: user.name, clientUrl: process.env.CLIENT_URL }),
    });

    return res.json({
      message: 'Profile verified successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyProfileLink = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    // Secure link verification looks up the user by hashed token rather than exposing the raw token in storage.
    const user = await User.findOne({
      'pendingProfileVerification.linkTokenHash': hashedToken,
      'pendingProfileVerification.linkExpire': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Profile already verified' });
    }

    await finalizeProfileVerification(user);

    sendEmailAsync({
      email: user.email,
      subject: 'AuctionPulse Profile Verified',
      message: templates.profileVerified({ name: user.name, clientUrl: process.env.CLIENT_URL }),
    });

    return res.json({ message: 'Profile verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  // Static admin is synthesized because it does not exist as a MongoDB record.
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

// ---------------------------------------------------------------------------
// Profile maintenance
// ---------------------------------------------------------------------------

exports.updateUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      // Most fields are permissive profile fields. Only provided values replace existing ones.
      user.name = req.body.name || user.name;
      user.mobile = req.body.mobile || user.mobile;
      user.location = req.body.location || user.location;
      user.address = typeof req.body.address === 'string' ? req.body.address : user.address;
      user.emergencyContact =
        typeof req.body.emergencyContact === 'string' ? req.body.emergencyContact : user.emergencyContact;
      user.bloodGroup =
        typeof req.body.bloodGroup === 'string' ? req.body.bloodGroup : user.bloodGroup;
      user.cityState =
        typeof req.body.cityState === 'string' ? req.body.cityState : user.cityState;
      user.postalCode =
        typeof req.body.postalCode === 'string' ? req.body.postalCode : user.postalCode;
      user.gender =
        typeof req.body.gender === 'string' ? req.body.gender : user.gender;
      user.occupation =
        typeof req.body.occupation === 'string' ? req.body.occupation : user.occupation;
      user.preferredDeliveryAddress =
        typeof req.body.preferredDeliveryAddress === 'string'
          ? req.body.preferredDeliveryAddress
          : user.preferredDeliveryAddress;
      user.secondaryEmail =
        typeof req.body.secondaryEmail === 'string' ? req.body.secondaryEmail : user.secondaryEmail;
      user.medicalNotes =
        typeof req.body.medicalNotes === 'string' ? req.body.medicalNotes : user.medicalNotes;
      user.socialLinks = {
        ...user.socialLinks,
        ...(req.body.socialLinks || {}),
      };
      if (Array.isArray(req.body.socialProfiles)) {
        // Social profiles are normalized before save so the UI always receives trimmed values.
        user.socialProfiles = req.body.socialProfiles
          .map((entry) => ({
            name: typeof entry?.name === 'string' ? entry.name.trim() : '',
            link: typeof entry?.link === 'string' ? entry.link.trim() : '',
          }))
          .filter((entry) => entry.name || entry.link);
      }

      if (req.body.password) {
        // Password hashing is still handled centrally by the model pre-save hook.
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return res.json(serializeUser(updatedUser));
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Avatar upload service is not configured in production' });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'AuctionPulse';

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Keep avatar outputs visually consistent across profile, navbar, and admin tables.
          transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

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

exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Activity is grouped from multiple auction perspectives: seller, bidder, and winner.
    const [listedAuctions, placedBidAuctions, wonAuctions] = await Promise.all([
      Auction.find({ seller: userId })
        .select('title currentPrice status createdAt registrationEndAt')
        .sort({ createdAt: -1 })
        .lean(),
      Auction.find({ 'bids.bidder': userId })
        .select('title currentPrice status winner bids createdAt registrationEndAt')
        .sort({ createdAt: -1 })
        .lean(),
      Auction.find({ winner: userId, status: { $in: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed'] } })
        .select('title currentPrice status registrationEndAt createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // A user may appear multiple times in raw bid lookups, so deduplicate by auction id.
    const uniquePlaced = [];
    const seen = new Set();
    for (const auction of placedBidAuctions) {
      if (!seen.has(String(auction._id))) {
        uniquePlaced.push(auction);
        seen.add(String(auction._id));
      }
    }

    const lostAuctions = uniquePlaced.filter(
      (auction) =>
        !['pending_verification', 'future', 'ongoing'].includes(auction.status) &&
        String(auction.winner || '') !== String(userId)
    );

    // feedbackScore is a simple derived metric to give the UI a quick reputation-style indicator.
    const stats = {
      totalListed: listedAuctions.length,
      totalPlacedBids: uniquePlaced.length,
      totalWins: wonAuctions.length,
      totalLosses: lostAuctions.length,
      feedbackScore:
        uniquePlaced.length > 0 ? Math.max(60, Math.round((wonAuctions.length / uniquePlaced.length) * 100)) : 0,
    };

    return res.json({
      stats,
      history: {
        listed: listedAuctions,
        placedBids: uniquePlaced,
        won: wonAuctions,
        lost: lostAuctions,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.exportUserDataZip = async (req, res) => {
  try {
    const userId = req.user.id;

    // The export bundles the key user-owned data domains the platform stores today.
    const [user, listedAuctions, bidAuctions, supportTickets] = await Promise.all([
      User.findById(userId).select('-password -resetPasswordToken -emailVerificationOTP').lean(),
      Auction.find({ seller: userId }).lean(),
      Auction.find({ 'bids.bidder': userId }).lean(),
      SupportTicket.find({ email: req.user.email }).lean(),
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=AuctionPulse-data-${userId}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      throw err;
    });

    const output = new PassThrough();
    output.pipe(res);
    archive.pipe(output);

    // Export data is split by concern so users can inspect it without custom tooling.
    archive.append(JSON.stringify(user, null, 2), { name: 'profile.json' });
    archive.append(JSON.stringify(listedAuctions, null, 2), { name: 'listed_auctions.json' });
    archive.append(JSON.stringify(bidAuctions, null, 2), { name: 'bid_activity.json' });
    archive.append(JSON.stringify(supportTickets, null, 2), { name: 'support_tickets.json' });

    await archive.finalize();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      await user.deleteOne();
      return res.json({ message: 'User removed successfully' });
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Password reset lifecycle
// ---------------------------------------------------------------------------

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate raw token for email and store only the hashed version in MongoDB.
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
      // Roll back reset state if email delivery fails so stale tokens do not remain valid.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  // Incoming reset token from the URL is hashed before lookup to match the DB storage format.
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

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


