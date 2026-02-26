const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
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

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ emailVerified: 1 });

userSchema.pre('save', async function () {
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
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationOTPExpire = Date.now() + 5 * 60 * 1000;
  return otp;
};

module.exports = mongoose.model('User', userSchema);
