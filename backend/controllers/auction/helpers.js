// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/helpers.js
// Purpose: helpers
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const cloudinary = require('../../config/cloudinary');
const {
  REGISTRATION_WINDOWS,
  REGISTRATION_DAYS,
  TEST_REGISTRATION_MINUTES,
  ROOM_OPEN_TIMEOUT_SECONDS,
} = require('./constants');

const uploadAuctionImages = async (files) => {
  if (!files?.length) return [];

  const folder = process.env.CLOUDINARY_FOLDER || 'AuctionPulse';
  const uploads = files.map(
    (file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `${folder}/auctions`,
            resource_type: 'image',
            transformation: [{ width: 1280, height: 1280, crop: 'limit', quality: 'auto:best' }],
          },
          (error, result) => {
            if (error) return reject(error);
            return resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      })
  );

  return Promise.all(uploads);
};

const getRegistrationEndAt = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

const resolveRegistrationWindowHours = ({ registrationWindowHours, registrationWindowDays, registrationWindowMinutes }) => {
  if (
    registrationWindowMinutes !== undefined &&
    registrationWindowMinutes !== null &&
    registrationWindowMinutes !== ''
  ) {
    const parsedMinutes = Number(registrationWindowMinutes);
    if (!TEST_REGISTRATION_MINUTES.includes(parsedMinutes)) return null;
    return parsedMinutes / 60;
  }

  if (registrationWindowDays !== undefined && registrationWindowDays !== null && registrationWindowDays !== '') {
    const parsedDays = Number(registrationWindowDays);
    if (!REGISTRATION_DAYS.includes(parsedDays)) return null;
    return parsedDays * 24;
  }

  const parsedWindow = Number(registrationWindowHours);
  if (!REGISTRATION_WINDOWS.includes(parsedWindow)) return null;
  return parsedWindow;
};

const ensureTurnDefaults = (auction) => {
  if (!auction.turnDurationSeconds || auction.turnDurationSeconds < 1 || auction.turnDurationSeconds === 10) {
    auction.turnDurationSeconds = 20;
  }
};

const appendNextBidder = (auction) => {
  while (auction.activeBidders.length < 2 && auction.waitingBidders.length > 0) {
    const nextBidder = auction.waitingBidders.shift();
    auction.activeBidders.push(nextBidder);
  }
};

const startTurnClock = (auction, bidderId) => {
  ensureTurnDefaults(auction);
  auction.currentTurnBidder = bidderId;
  auction.turnExpiresAt = new Date(Date.now() + auction.turnDurationSeconds * 1000);
};

const clearRoomActivation = (auction) => {
  auction.roomActivation = {
    isActive: false,
    currentBidder: null,
    currentSequence: null,
    expiresAt: null,
    lastAssignedAt: null,
    openedBy: null,
    openedAt: null,
  };
};

const assignNextRoomActivator = (auction, sortedRegistrations, now = new Date()) => {
  const currentSequence = Number(auction.roomActivation?.currentSequence || 0);
  const nextEntry = sortedRegistrations.find((entry) => entry.sequence > currentSequence) || sortedRegistrations[0];

  auction.roomActivation = {
    isActive: true,
    currentBidder: nextEntry.bidder,
    currentSequence: nextEntry.sequence,
    expiresAt: new Date(now.getTime() + ROOM_OPEN_TIMEOUT_SECONDS * 1000),
    lastAssignedAt: now,
    openedBy: null,
    openedAt: null,
  };
};

module.exports = {
  uploadAuctionImages,
  getRegistrationEndAt,
  resolveRegistrationWindowHours,
  ensureTurnDefaults,
  appendNextBidder,
  startTurnClock,
  clearRoomActivation,
  assignNextRoomActivator,
};


