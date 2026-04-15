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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

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

const sendProfileVerificationOtpEmail = async (user, otp) => {
  await sendEmail({
    email: user.email,
    subject: 'BidPulse Profile Verification OTP',
    message: templates.profileVerificationOtp({ otp }),
  });
};

const sendProfileVerificationLinkEmail = async (user, verificationUrl) => {
  await sendEmail({
    email: user.email,
    subject: 'BidPulse Profile Verification Link',
    message: templates.profileVerificationLink({ verificationUrl }),
  });
};

const uploadAvatarImage = async (fileBuffer) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Profile image upload service is not configured');
  }

  const folder = process.env.CLOUDINARY_FOLDER || 'BidPulse';

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

exports.register = async (req, res) => {
  const { name, email, password, turnstileToken } = req.body;

  try {
    const remoteip =
      req.headers['cf-connecting-ip'] ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .map((item) => item.trim())
        .find(Boolean) ||
      req.ip;

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
  return res.status(410).json({ message: 'Use the profile verification flow from the Profile page.' });
};

exports.verifyEmailOTP = async (req, res) => {
  return res.status(410).json({ message: 'Use the profile verification flow from the Profile page.' });
};

exports.startProfileVerification = async (req, res) => {
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

    if (
      pending.otpHash !== hashedOtp ||
      !pending.otpExpire ||
      pending.otpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await finalizeProfileVerification(user);

    sendEmailAsync({
      email: user.email,
      subject: 'BidPulse Profile Verified',
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
      subject: 'BidPulse Profile Verified',
      message: templates.profileVerified({ name: user.name, clientUrl: process.env.CLIENT_URL }),
    });

    return res.json({ message: 'Profile verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
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

exports.updateUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
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

    const folder = process.env.CLOUDINARY_FOLDER || 'BidPulse';

    const uploadResult = await new Promise((resolve, reject) => {
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

    const [user, listedAuctions, bidAuctions, supportTickets] = await Promise.all([
      User.findById(userId).select('-password -resetPasswordToken -emailVerificationOTP').lean(),
      Auction.find({ seller: userId }).lean(),
      Auction.find({ 'bids.bidder': userId }).lean(),
      SupportTicket.find({ email: req.user.email }).lean(),
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=BidPulse-data-${userId}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      throw err;
    });

    const output = new PassThrough();
    output.pipe(res);
    archive.pipe(output);

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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'BidPulse Password Reset Token',
        message: `
          <div style="margin:0;padding:24px;background:#f3f6fb;font-family:Arial,sans-serif;color:#111827;">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
              <div style="background:linear-gradient(120deg,#7c3aed,#0b1220);padding:26px;color:#fff;">
                <h1 style="margin:0;font-size:24px;line-height:1.2;">Reset Your Password</h1>
                <p style="margin:8px 0 0;opacity:.9;font-size:14px;">Secure access recovery for BidPulse</p>
              </div>
              <div style="padding:24px 22px;font-size:14px;line-height:1.65;color:#1f2937;">
                <p>You requested a password reset.</p>
                <p><a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700;">Reset Password</a></p>
                <p>This link expires in 10 minutes.</p>
              </div>
            </div>
          </div>
        `,
      });

      return res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
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


