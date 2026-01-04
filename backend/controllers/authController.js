const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService'); 
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, dob, idType, idNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user', 
      dob,
      idType,
      idNumber
    });

    if (user) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to BidPulse! 🚀',
          message: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h1 style="color: #6d28d9;">Welcome, ${user.name}!</h1>
              <p>We are thrilled to have you join <b>BidPulse</b>.</p>
              <p>Your account is verified with ID: <b>${user.idNumber}</b>.</p>
              <p>Get started now: <a href="${process.env.CLIENT_URL}" style="color: #6d28d9;">Go to BidPulse</a></p>
            </div>
          `
        });
      } catch (err) {
        console.error("Welcome Email Failed:", err.message);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // --- 1. SECURE ADMIN CHECK (Uses .env variables) ---
    // Ensure you add ADMIN_EMAIL and ADMIN_PASS to your backend .env file
    const adminEmail = process.env.ADMIN_EMAIL || 'smrizvi.i29@gmail.com'; // Fallback just in case, but prefer .env
    const adminPass = process.env.ADMIN_PASS || 'admin555@2026';

    if (email === adminEmail && password === adminPass) {
        return res.json({
            _id: 'static_admin_id_999',
            name: 'Super Admin',
            email: adminEmail,
            role: 'admin',
            createdAt: new Date(),
            token: generateToken('static_admin_id_999'),
        });
    }

    // --- 2. Standard User Login ---
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  if (req.user.id === 'static_admin_id_999') {
     return res.status(200).json({
        _id: 'static_admin_id_999',
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        role: 'admin'
     });
  }
  const user = await User.findById(req.user.id);
  res.status(200).json(user);
};

// @desc    Update User Details (Profile)
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // If user sends password, update it
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete User Account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if(user) {
            await user.deleteOne();
            res.json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
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

    const message = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="color: #6d28d9;">Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #6d28d9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
        <p>This link expires in 10 minutes.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'BidPulse Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

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

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};