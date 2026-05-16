const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// User model
// 1. Stores identity, auth, and verification state
// 2. Stores profile data used across buyer/seller/admin dashboards
// 3. Provides helper methods for password reset and verification tokens
// ---------------------------------------------------------------------------

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    x: { type: String, default: '' },
    threads: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  { _id: false }
);

const socialProfileEntrySchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    link: { type: String, default: '' },
  },
  { _id: false }
);

const pendingProfileVerificationSchema = new mongoose.Schema(
  {
    // These values are staged first and copied into the permanent user profile only after verification.
    dob: Date,
    location: { type: String, default: '' },
    mobile: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    idNumber: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    method: {
      type: String,
      enum: ['otp', 'link'],
    },
    otpHash: String,
    otpExpire: Date,
    linkTokenHash: String,
    linkExpire: Date,
    requestedAt: Date,
  },
  { _id: false }
);

const passwordRequirementsMessage =
  'Password must be at least 8 characters, include 1 number, include 1 special character, and have no leading or trailing whitespace';

const passwordValidator = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  if (value !== value.trim()) {
    return false;
  }

  return value.length >= 8 && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  mobile: {
    type: String,
    default: '',
  },
  emergencyContact: {
    type: String,
    default: '',
  },
  bloodGroup: {
    type: String,
    default: '',
  },
  cityState: {
    type: String,
    default: '',
  },
  postalCode: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  occupation: {
    type: String,
    default: '',
  },
  preferredDeliveryAddress: {
    type: String,
    default: '',
  },
  secondaryEmail: {
    type: String,
    default: '',
  },
  medicalNotes: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, passwordRequirementsMessage],
    validate: {
      validator: passwordValidator,
      message: passwordRequirementsMessage,
    },
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'bidder', 'seller', 'admin'],
    default: 'user',
  },
  dob: {
    type: Date,
  },
  location: {
    type: String,
    default: 'Not set',
  },
  address: {
    type: String,
    default: '',
  },
  idType: {
    type: String,
    enum: ['nid', 'passport', 'birth_cert'],
  },
  idNumber: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOTP: String,
  emailVerificationOTPExpire: Date,
  profileVerifiedAt: Date,
  pendingProfileVerification: {
    type: pendingProfileVerificationSchema,
    default: undefined,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  socialLinks: {
    type: socialLinksSchema,
    default: () => ({}),
  },
  socialProfiles: {
    type: [socialProfileEntrySchema],
    default: [],
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  avatarEmoji: {
    type: String,
    default: '',
  },
  stripeAccountId: {
    type: String,
    default: null,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Common admin/reporting filters are indexed because these fields are queried frequently.
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ emailVerified: 1 });

userSchema.pre('save', async function () {
  // Hash only when the password actually changed so profile edits stay cheap.
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // Store only the hash in the database; the raw token is sent to the user.
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateEmailVerificationOTP = function () {
  // Legacy signup OTP flow still exists in the model even though the app now verifies via profile flow.
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationOTPExpire = Date.now() + 5 * 60 * 1000;
  return otp;
};

userSchema.methods.generateProfileVerificationOTP = function () {
  // OTP is hashed before storage so leaked DB data cannot be used directly.
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  if (!this.pendingProfileVerification) {
    this.pendingProfileVerification = {};
  }
  this.pendingProfileVerification.otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  this.pendingProfileVerification.otpExpire = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.generateProfileVerificationLinkToken = function () {
  // Email verification link tokens follow the same hash-before-storage pattern as password resets.
  const token = crypto.randomBytes(20).toString('hex');
  if (!this.pendingProfileVerification) {
    this.pendingProfileVerification = {};
  }
  this.pendingProfileVerification.linkTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  this.pendingProfileVerification.linkExpire = Date.now() + 5 * 60 * 1000;
  return token;
};

module.exports = mongoose.model('User', userSchema);
