const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService'); 

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
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    // Note: We now default to 'user' role so they can Buy AND Sell
    const user = await User.create({
      name,
      email,
      password,
      role: 'user', 
    });

    if (user) {
      // --- EMAIL TRIGGER: WELCOME ---
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to BidPulse! 🚀',
          message: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h1 style="color: #6d28d9;">Welcome, ${user.name}!</h1>
              <p>We are thrilled to have you join <b>BidPulse</b>, the premium real-time auction marketplace.</p>
              <p>Your account has been successfully created. You can now both <b>Bid</b> on items and <b>Sell</b> your own!</p>
              <p>Get started now: <a href="${process.env.CLIENT_URL}" style="color: #6d28d9;">Go to BidPulse</a></p>
            </div>
          `
        });
      } catch (err) {
        console.error("Welcome Email Failed:", err.message);
      }
      // -----------------------------

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt, // <--- FIXED: Include Date
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
    // --- 1. HARDCODED ADMIN CHECK (Bypass DB) ---
    if (email === 'smrizvi.i29@gmail.com' && password === 'admin555@2026') {
        return res.json({
            _id: 'static_admin_id_999',
            name: 'Super Admin',
            email: 'smrizvi.i29@gmail.com',
            role: 'admin',
            createdAt: new Date(), // Admin gets current date
            token: generateToken('static_admin_id_999'),
        });
    }

    // --- 2. Standard User Login (Database Check) ---
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt, // <--- FIXED: Include Date
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