// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/placeBid.js
// Purpose: place Bid
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const { startTurnClock } = require('../helpers');
const { emitAuctionUpdate, populateAuctionDetails } = require('../viewHelpers');

const placeBid = async (req, res) => {
  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before placing bids.' });
    }

    const amount = Number(req.body.amount);
    if (Number.isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (auction.status !== 'ongoing') {
      return res.status(400).json({ message: 'Bidding is not active for this listing' });
    }
    if (String(auction.seller) === req.user.id) {
      return res.status(400).json({ message: 'Seller can spectate but cannot bid' });
    }

    const isActiveBidder = auction.activeBidders.some((bidderId) => String(bidderId) === req.user.id);
    if (!isActiveBidder) {
      return res.status(403).json({ message: 'You are not in the active bidding turn queue' });
    }

    if (auction.currentTurnBidder && String(auction.currentTurnBidder) !== req.user.id) {
      return res.status(400).json({ message: 'Not your turn. Wait for your 20-second turn.' });
    }
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }

    auction.bids.push({
      bidder: req.user.id,
      amount,
      time: Date.now(),
    });
    auction.currentPrice = amount;
    auction.winner = req.user.id;

    const nextTurnBidder = auction.activeBidders.find((bidderId) => String(bidderId) !== req.user.id);
    if (nextTurnBidder) {
      startTurnClock(auction, nextTurnBidder);
    }

    await auction.save();

    const updatedAuction = await populateAuctionDetails(
      Auction.findById(req.params.id)
        .populate('seller', 'name')
        .populate('winner', 'name')
        .populate('bids.bidder', 'name')
        .populate('activeBidders', 'name')
        .populate('waitingBidders', 'name')
    );

    await emitAuctionUpdate(req, req.params.id, updatedAuction);
    return res.status(200).json(updatedAuction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = placeBid;


