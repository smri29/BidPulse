const jwt = require('jsonwebtoken');
const User = require('../models/User');
const STATIC_ADMIN_DB_ID = '000000000000000000000999';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- FIX: HANDLE STATIC ADMIN ---
      if (decoded.id === 'static_admin_id_999') {
         req.user = {
             id: STATIC_ADMIN_DB_ID,
             _id: STATIC_ADMIN_DB_ID,
             legacyId: 'static_admin_id_999',
             isStaticAdmin: true,
             name: 'Super Admin',
             email: process.env.ADMIN_EMAIL || 'admin@AuctionPulse.local',
             role: 'admin',
             emailVerified: true,
          };
         return next();
      }
      // -------------------------------

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };


