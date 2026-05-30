/**
 * Module: backend/config/cloudinary.js
 * Purpose: Defines backend infrastructure configuration used by shared services and runtime setup.
 */
const cloudinary = require('cloudinary').v2;

// Central Cloudinary client used by avatar and auction image upload flows.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
