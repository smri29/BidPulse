const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService'); 
const crypto = require('crypto'); // <--- Import Crypto

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
  // Destructure new fields
  const { name, email, password, dob, idType, idNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with all fields
    const user = await User.create({
      name,
      email,
      password,
      role: 'user', 
      dob,       // <--- Save DOB
      idType,    // <--- Save ID Type
      idNumber   // <--- Save ID Number
    });

    if (user) {
      // Welcome Email
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
    // Admin Bypass
    if (email === 'smrizvi.i29@gmail.com' && password === 'admin555@2026') {
        return res.json({
            _id: 'static_admin_id_999',
            name: 'Super Admin',
            email: 'smrizvi.i29@gmail.com',
            role: 'admin',
            createdAt: new Date(),
            token: generateToken('static_admin_id_999'),
        });
    }

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
        email: 'smrizvi.i29@gmail.com',
        role: 'admin'
     });
  }
  const user = await User.findById(req.user.id);
  res.status(200).json(user);
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

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // Save token to DB
    await user.save({ validateBeforeSave: false });

    // Create reset URL
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
  // Hash token from URL to match DB
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    // Find user by token AND check expiration
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or token has expired' });
    }

    // Set new password
    user.password = req.body.password;
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token: generateToken(user._id), // Auto login
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};