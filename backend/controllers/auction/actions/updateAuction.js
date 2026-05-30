// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/updateAuction.js
// Purpose: update Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const { uploadAuctionImages, getRegistrationEndAt, resolveRegistrationWindowHours, clearRoomActivation } = require('../helpers');

const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const editableStatuses = ['pending_verification', 'future', 'no_registrations', 'disapproved'];
    if (!editableStatuses.includes(auction.status) && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'This listing can no longer be edited' });
    }

    const { title, description, category, startingPrice } = req.body;
    if (title) auction.title = title;
    if (description) auction.description = description;
    if (category) auction.category = category;

    if (startingPrice) {
      const parsed = Number(startingPrice);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ message: 'Invalid starting price' });
      }
      auction.startingPrice = parsed;
      auction.currentPrice = parsed;
    }

    if (req.body.registrationWindowHours || req.body.registrationWindowDays || req.body.registrationWindowMinutes) {
      const parsedWindow = resolveRegistrationWindowHours(req.body);
      if (!parsedWindow) {
        return res.status(400).json({ message: 'Registration window must be 2 or 5 minutes (test) or one of 1, 5, 8, 10, 15, or 20 days' });
      }
      auction.registrationWindowHours = parsedWindow;
      auction.registrationEndAt = getRegistrationEndAt(parsedWindow);
      clearRoomActivation(auction);
    }

    if (req.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({ message: 'Image upload service is not configured' });
      }
      auction.images = await uploadAuctionImages(req.files);
    }

    await auction.save();
    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = updateAuction;


