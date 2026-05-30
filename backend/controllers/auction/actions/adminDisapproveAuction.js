/**
 * Module: backend/controllers/auction/actions/adminDisapproveAuction.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/adminDisapproveAuction.js
// Purpose: admin Disapprove Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const User = require('../../../models/User');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');

const adminDisapproveAuction = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ message: 'Disapproval reason is required (min 5 chars)' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    auction.verificationStatus = 'rejected';
    auction.status = 'disapproved';
    auction.verificationNote = String(reason).trim();
    auction.verifiedAt = new Date();
    await auction.save();

    const seller = await User.findById(auction.seller).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `Listing disapproved: ${auction.title}`,
        message: templates.listingDisapproved({
          title: auction.title,
          reason: auction.verificationNote,
        }),
      });
    }

    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = adminDisapproveAuction;


