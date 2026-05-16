const multer = require('multer');

const storage = multer.memoryStorage();

// ---------------------------------------------------------------------------
// Upload middleware
// imageUpload: single avatar/profile image
// auctionImageUpload: up to 3 listing images
// ---------------------------------------------------------------------------

// Files stay in memory because they are streamed immediately to Cloudinary.
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Only image uploads are allowed'));
  },
});

const auctionImageUpload = multer({
  // Auction listings cap uploads at 3 images to keep moderation and rendering manageable.
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Only image uploads are allowed'));
  },
});

module.exports = { imageUpload, auctionImageUpload };
