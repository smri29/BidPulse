// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/handleNoRegistrationDecision.js
// Purpose: handle No Registration Decision
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const { getRegistrationEndAt, clearRoomActivation } = require('../helpers');

const handleNoRegistrationDecision = async (req, res) => {
  try {
    const { action, reducedStartingPrice } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (String(auction.seller) !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (auction.status !== 'no_registrations') {
      return res.status(400).json({ message: 'This action is only available when no registrations are found' });
    }

    if (action === 'withdraw') {
      auction.status = 'withdrawn';
      auction.feeSummary.noRegistrationFeeApplied = auction.feeSummary.firstListingWithdrawalFee;
      await auction.save();
      return res.status(200).json({
        message: 'Product withdrawn. Listing fee charged: $9.99',
        fee: auction.feeSummary.firstListingWithdrawalFee,
        auction,
      });
    }

    if (action === 'relist') {
      const newPrice = Number(reducedStartingPrice);
      if (Number.isNaN(newPrice) || newPrice <= 0) {
        return res.status(400).json({ message: 'Provide a valid reduced starting price' });
      }
      if (newPrice >= auction.startingPrice) {
        return res.status(400).json({ message: 'Reduced starting price must be lower than previous starting price' });
      }

      auction.startingPrice = newPrice;
      auction.currentPrice = newPrice;
      auction.status = 'future';
      auction.verificationStatus = 'approved';
      auction.registrationStartAt = new Date();
      auction.registrationEndAt = getRegistrationEndAt(auction.registrationWindowHours);
      auction.biddingStartedAt = null;
      auction.biddingEndedAt = null;
      auction.turnExpiresAt = null;
      auction.currentTurnBidder = null;
      auction.winner = null;
      auction.bids = [];
      auction.registrations = [];
      auction.activeBidders = [];
      auction.waitingBidders = [];
      auction.gaveUpBidders = [];
      auction.reminders.registrationReminderSentAt = null;
      clearRoomActivation(auction);
      auction.feeSummary.noRegistrationFeeApplied = auction.feeSummary.relistFee;

      await auction.save();
      return res.status(200).json({
        message: 'Product re-listed with reduced starting amount. Re-listing fee charged: $14.99',
        fee: auction.feeSummary.relistFee,
        auction,
      });
    }

    return res.status(400).json({ message: 'Action must be either withdraw or relist' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = handleNoRegistrationDecision;


