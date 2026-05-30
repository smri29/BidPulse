/**
 * Module: backend/middleware/authMiddleware.js
 * Purpose: Defines Express middleware that enforces shared request handling rules.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const STATIC_ADMIN_DB_ID = '000000000000000000000999';

// ---------------------------------------------------------------------------
// Auth middleware
// protect: verifies JWT and attaches req.user
// authorize: checks req.user.role against allowed roles
// ---------------------------------------------------------------------------

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Bearer token is the only supported API auth mechanism.
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT and hydrate req.user for downstream controllers.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Static admin credentials are handled without a MongoDB user record.
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

      // Regular users are loaded from MongoDB so role and ban state stay current.
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
    // Authorization is role-based after authentication is already complete.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };


