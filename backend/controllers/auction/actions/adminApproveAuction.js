/**
 * Module: backend/controllers/auction/actions/adminApproveAuction.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/adminApproveAuction.js
// Purpose: admin Approve Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const User = require('../../../models/User');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');
const { clearRoomActivation, getRegistrationEndAt, resolveRegistrationWindowHours } = require('../helpers');

const adminApproveAuction = async (req, res) => {
  try {
    const { registrationWindowDays, registrationWindowMinutes, registrationEndAt } = req.body || {};
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (registrationWindowDays || registrationWindowMinutes) {
      const parsedWindow = resolveRegistrationWindowHours({ registrationWindowDays, registrationWindowMinutes });
      if (!parsedWindow) {
        return res.status(400).json({ message: 'Registration window must be 2 or 5 minutes (test) or one of 1, 5, 8, 10, 15, or 20 days' });
      }
      auction.registrationWindowHours = parsedWindow;
    }

    if (registrationEndAt) {
      const customEnd = new Date(registrationEndAt);
      if (Number.isNaN(customEnd.getTime()) || customEnd <= new Date()) {
        return res.status(400).json({ message: 'Custom registration end time must be a valid future date-time' });
      }
      auction.registrationEndAt = customEnd;
    } else {
      auction.registrationEndAt = getRegistrationEndAt(auction.registrationWindowHours);
    }

    auction.verificationStatus = 'approved';
    auction.status = 'future';
    auction.verifiedAt = new Date();
    auction.verificationNote = '';
    auction.registrationStartAt = new Date();
    clearRoomActivation(auction);

    await auction.save();

    const seller = await User.findById(auction.seller).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `Listing approved: ${auction.title}`,
        message: templates.listingApproved({
          title: auction.title,
          registrationEndAt: auction.registrationEndAt,
        }),
      });
    }

    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = adminApproveAuction;


