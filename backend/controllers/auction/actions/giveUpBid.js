// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/giveUpBid.js
// Purpose: give Up Bid
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const { handleGiveUpCore } = require('../engine');
const { emitAuctionUpdate, populateAuctionDetails } = require('../viewHelpers');

const giveUpBid = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (auction.status !== 'ongoing') {
      return res.status(400).json({ message: 'Bid is not currently ongoing' });
    }

    await handleGiveUpCore({ auction, bidderId: req.user.id });

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
    return res.status(400).json({ message: error.message });
  }
};

module.exports = giveUpBid;


