// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/createAuction.js
// Purpose: create Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const User = require('../../../models/User');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');
const { validateTurnstileToken } = require('../../../utils/turnstile');
const { uploadAuctionImages, getRegistrationEndAt, resolveRegistrationWindowHours } = require('../helpers');

const createAuction = async (req, res) => {
  const { title, description, category, startingPrice, turnstileToken } = req.body;

  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before submitting listings.' });
    }

    const remoteip =
      req.headers['cf-connecting-ip'] ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .map((item) => item.trim())
        .find(Boolean) ||
      req.ip;

    const turnstileValidation = await validateTurnstileToken({
      token: turnstileToken || req.body['cf-turnstile-response'],
      remoteip,
    });

    if (!turnstileValidation.success) {
      return res
        .status(turnstileValidation.status)
        .json({ message: turnstileValidation.message, errorCodes: turnstileValidation.errorCodes });
    }

    const parsedWindow = resolveRegistrationWindowHours(req.body);
    if (!parsedWindow) {
      return res.status(400).json({ message: 'Registration window must be 2 or 5 minutes (test) or one of 1, 5, 8, 10, 15, or 20 days' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Image upload service is not configured' });
    }
    if (!req.files?.length) {
      return res.status(400).json({ message: 'Please upload at least 1 image (max 3)' });
    }

    const uploadedImages = await uploadAuctionImages(req.files);
    const auction = await Auction.create({
      title,
      description,
      category,
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      registrationWindowHours: parsedWindow,
      registrationStartAt: new Date(),
      registrationEndAt: getRegistrationEndAt(parsedWindow),
      images: uploadedImages,
      seller: req.user._id,
      status: 'pending_verification',
      verificationStatus: 'pending',
    });

    const seller = await User.findById(req.user._id).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `Listing submitted for verification: ${title}`,
        message: templates.listingSubmitted({ title }),
      });
    }

    return res.status(201).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = createAuction;


