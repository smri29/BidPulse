const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  // --- New Verification Fields ---
  dob: {
    type: Date,
  },
  idType: {
    type: String,
    enum: ['nid', 'passport', 'birth_cert'],
  },
  idNumber: {
    type: String,
  },
  // --- Admin Ban Flag ---
  isBanned: {
    type: Boolean,
    default: false,
  },
  // ----------------------
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  stripeAccountId: {
    type: String,
    default: null, 
  },
  // --- Password Reset Fields ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // -----------------------------
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Generate Password Reset Token ---
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);