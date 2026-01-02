const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    select: false, // Don't return password by default in queries
  },
  role: {
    type: String,
    // Updated Enum to support Unified 'user' role + legacy roles
    enum: ['user', 'bidder', 'seller', 'admin'], 
    default: 'user', // Default to generic user who can do both
  },
  // For Sellers: Who have they blocked?
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // For Sellers: Their Stripe Account ID to receive money
  stripeAccountId: {
    type: String,
    default: null, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving
// FIXED: Removed 'next' parameter to use modern Async/Await Mongoose pattern
userSchema.pre('save', async function () {
  // If password is not modified, skip hashing
  if (!this.isModified('password')) {
    return;
  }

  // Generate Salt and Hash
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);