/**
 * Module: backend/controllers/auction/engine.js
 * Purpose: Provides controller-level coordination logic for this backend feature area.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/engine.js
// Purpose: engine
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../models/Auction');
const User = require('../../models/User');
const { sendEmailAsync } = require('../../utils/emailService');
const templates = require('../../utils/emailTemplates');
const {
  appendNextBidder,
  startTurnClock,
  clearRoomActivation,
  assignNextRoomActivator,
} = require('./helpers');

const finalizeOngoingAuction = async (auction, winnerId) => {
  const resolvedWinner = winnerId || auction.winner;
  auction.status = 'completed';
  auction.biddingEndedAt = new Date();
  auction.turnExpiresAt = null;
  auction.currentTurnBidder = null;
  auction.activeBidders = [];
  auction.waitingBidders = [];
  clearRoomActivation(auction);
  if (resolvedWinner) {
    auction.winner = resolvedWinner;
  }
  await auction.save();

  const [seller, winner, registeredUsers] = await Promise.all([
    User.findById(auction.seller).select('email name').lean(),
    resolvedWinner ? User.findById(resolvedWinner).select('email name').lean() : null,
    User.find({ _id: { $in: auction.registrations.map((r) => r.bidder) } }).select('email name').lean(),
  ]);

  if (winner?.email) {
    sendEmailAsync({
      email: winner.email,
      subject: `You won: ${auction.title}`,
      message: templates.auctionWon({
        title: auction.title,
        currentPrice: auction.currentPrice,
        link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
      }),
    });
  }

  if (seller?.email) {
    sendEmailAsync({
      email: seller.email,
      subject: `Auction completed: ${auction.title}`,
      message: templates.itemSold({ title: auction.title, currentPrice: auction.currentPrice }),
    });
  }

  registeredUsers.forEach((participant) => {
    if (!participant?.email) return;
    if (winner?.email && participant.email === winner.email) return;
    sendEmailAsync({
      email: participant.email,
      subject: `Auction closed: ${auction.title}`,
      message: templates.auctionClosedParticipant({
        title: auction.title,
        winnerName: winner?.name || 'Another bidder',
        finalAmount: auction.currentPrice,
      }),
    });
  });
};

const moveToOngoing = async (auction) => {
  const sortedRegistrations = [...auction.registrations].sort((a, b) => a.sequence - b.sequence);

  if (!sortedRegistrations.length) {
    auction.status = 'no_registrations';
    clearRoomActivation(auction);
    await auction.save();

    const seller = await User.findById(auction.seller).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `No registrations: ${auction.title}`,
        message: templates.noRegistrationOutcome({ title: auction.title }),
      });
    }
    return;
  }

  if (sortedRegistrations.length === 1) {
    auction.status = 'completed';
    auction.biddingStartedAt = null;
    auction.biddingEndedAt = new Date();
    auction.winner = sortedRegistrations[0].bidder;
    auction.currentPrice = auction.startingPrice;
    clearRoomActivation(auction);
    await auction.save();
    await finalizeOngoingAuction(auction, auction.winner);
    return;
  }

  const active = sortedRegistrations.slice(0, 2).map((entry) => entry.bidder);
  const waiting = sortedRegistrations.slice(2).map((entry) => entry.bidder);

  auction.status = 'ongoing';
  auction.biddingStartedAt = new Date();
  auction.activeBidders = active;
  auction.waitingBidders = waiting;
  clearRoomActivation(auction);
  appendNextBidder(auction);
  startTurnClock(auction, auction.activeBidders[0]);
  await auction.save();
};

const prepareAuctionRoom = async (auction, now = new Date()) => {
  const sortedRegistrations = [...auction.registrations].sort((a, b) => a.sequence - b.sequence);

  if (!sortedRegistrations.length) {
    auction.status = 'no_registrations';
    clearRoomActivation(auction);
    await auction.save();

    const seller = await User.findById(auction.seller).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `No registrations: ${auction.title}`,
        message: templates.noRegistrationOutcome({ title: auction.title }),
      });
    }

    return { changed: true, terminal: true };
  }

  if (sortedRegistrations.length === 1) {
    auction.status = 'completed';
    auction.biddingStartedAt = null;
    auction.biddingEndedAt = new Date();
    auction.winner = sortedRegistrations[0].bidder;
    auction.currentPrice = auction.startingPrice;
    clearRoomActivation(auction);
    await auction.save();
    await finalizeOngoingAuction(auction, auction.winner);
    return { changed: true, terminal: true };
  }

  const expiresAt = auction.roomActivation?.expiresAt ? new Date(auction.roomActivation.expiresAt) : null;
  const activationExpired = !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= now;

  if (!auction.roomActivation?.isActive || !auction.roomActivation?.currentBidder || activationExpired) {
    assignNextRoomActivator(auction, sortedRegistrations, now);
    await auction.save();
    return { changed: true, terminal: false };
  }

  return { changed: false, terminal: false };
};

const handleGiveUpCore = async ({ auction, bidderId }) => {
  const activeBefore = auction.activeBidders.map(String);
  if (!activeBefore.includes(String(bidderId))) {
    throw new Error('Only active bidders can give up right now');
  }

  auction.activeBidders = auction.activeBidders.filter((id) => String(id) !== String(bidderId));
  if (!auction.gaveUpBidders.some((id) => String(id) === String(bidderId))) {
    auction.gaveUpBidders.push(bidderId);
  }

  appendNextBidder(auction);

  if (auction.activeBidders.length === 0) {
    const fallbackWinner = auction.winner || null;
    if (fallbackWinner) {
      await finalizeOngoingAuction(auction, fallbackWinner);
      return;
    }
    auction.status = 'no_registrations';
    auction.turnExpiresAt = null;
    auction.currentTurnBidder = null;
    await auction.save();
    return;
  }

  if (auction.activeBidders.length === 1 && auction.waitingBidders.length === 0) {
    const winnerId = auction.activeBidders[0];
    if (!auction.winner) {
      auction.winner = winnerId;
      auction.currentPrice = Math.max(auction.currentPrice, auction.startingPrice);
    }
    await finalizeOngoingAuction(auction, auction.winner);
    return;
  }

  const currentTurnStillActive = auction.activeBidders.some(
    (id) => String(id) === String(auction.currentTurnBidder)
  );
  const nextTurnBidder = currentTurnStillActive ? auction.currentTurnBidder : auction.activeBidders[0];

  startTurnClock(auction, nextTurnBidder);
  await auction.save();
};

module.exports = {
  finalizeOngoingAuction,
  moveToOngoing,
  prepareAuctionRoom,
  handleGiveUpCore,
};


