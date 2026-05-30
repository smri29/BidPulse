/**
 * Module: backend/controllers/auction/actions/registerForAuction.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/registerForAuction.js
// Purpose: register For Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');

const registerForAuction = async (req, res) => {
  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before registering.' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'future') {
      return res.status(400).json({ message: 'Registration is only open for future bids' });
    }
    if (Date.now() >= new Date(auction.registrationEndAt).getTime()) {
      return res.status(400).json({ message: 'Registration period has closed' });
    }
    if (String(auction.seller) === req.user.id) {
      return res.status(400).json({ message: 'Seller cannot register as bidder for this item' });
    }

    const alreadyRegistered = auction.registrations.some((entry) => String(entry.bidder) === req.user.id);
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this bid' });
    }

    const sequence = auction.registrations.length + 1;
    auction.registrations.push({
      bidder: req.user.id,
      sequence,
      registeredAt: new Date(),
    });

    await auction.save();

    return res.status(200).json({
      message: 'Registration successful',
      registrationNumber: sequence,
      registrationClosesAt: auction.registrationEndAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = registerForAuction;


