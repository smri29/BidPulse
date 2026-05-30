/**
 * Module: backend/controllers/auction/actions/openAuctionRoom.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/openAuctionRoom.js
// Purpose: open Auction Room
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const { prepareAuctionRoom, moveToOngoing } = require('../engine');
const { getAuctionDetailsById, emitAuctionUpdate } = require('../viewHelpers');

const openAuctionRoom = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status === 'ongoing') {
      return res.status(200).json(await getAuctionDetailsById(req.params.id));
    }

    if (auction.status !== 'future') {
      return res.status(400).json({ message: 'Auction room cannot be opened for this listing right now' });
    }

    const now = new Date();
    if (now < new Date(auction.registrationEndAt)) {
      return res.status(400).json({ message: 'Registration is still open for this listing' });
    }

    const myRegistration = auction.registrations.find((entry) => String(entry.bidder) === req.user.id);
    if (!myRegistration) {
      return res.status(403).json({ message: 'Only registered participants can open the auction room' });
    }

    await prepareAuctionRoom(auction, now);
    const refreshedAuction = await Auction.findById(req.params.id);

    if (!refreshedAuction || refreshedAuction.status !== 'future') {
      return res.status(200).json(await getAuctionDetailsById(req.params.id));
    }

    if (String(refreshedAuction.roomActivation?.currentBidder || '') !== req.user.id) {
      return res.status(403).json({ message: 'It is not your turn to open the auction room yet' });
    }

    if (
      !refreshedAuction.roomActivation?.expiresAt ||
      new Date(refreshedAuction.roomActivation.expiresAt).getTime() <= now.getTime()
    ) {
      return res.status(409).json({ message: 'Your opening window has expired. Please wait for the next handoff.' });
    }

    refreshedAuction.roomActivation.openedBy = req.user._id;
    refreshedAuction.roomActivation.openedAt = now;
    await moveToOngoing(refreshedAuction);

    const liveAuction = await getAuctionDetailsById(req.params.id);
    await emitAuctionUpdate(req, req.params.id, liveAuction);

    return res.status(200).json(liveAuction);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to open auction room' });
  }
};

module.exports = openAuctionRoom;


