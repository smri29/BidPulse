const Auction = require('../models/Auction');
const User = require('../models/User');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const cloudinary = require('../config/cloudinary');
const { validateTurnstileToken } = require('../utils/turnstile');

const REGISTRATION_WINDOWS = [24, 120, 192, 240, 360, 480];
const REGISTRATION_DAYS = [1, 5, 8, 10, 15, 20];
const TEST_REGISTRATION_MINUTES = [5];

const uploadAuctionImages = async (files) => {
  if (!files?.length) return [];

  const folder = process.env.CLOUDINARY_FOLDER || 'BidPulse';
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
  if (!auction.turnDurationSeconds || auction.turnDurationSeconds < 1) {
    auction.turnDurationSeconds = 10;
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

const finalizeOngoingAuction = async (auction, winnerId) => {
  const resolvedWinner = winnerId || auction.winner;
  auction.status = 'completed';
  auction.biddingEndedAt = new Date();
  auction.turnExpiresAt = null;
  auction.currentTurnBidder = null;
  auction.activeBidders = [];
  auction.waitingBidders = [];
  if (resolvedWinner) {
    auction.winner = resolvedWinner;
  }
  await auction.save();

  const [seller, winner, registeredUsers] = await Promise.all([
    User.findById(auction.seller).select('email name').lean(),
    resolvedWinner ? User.findById(resolvedWinner).select('email name').lean() : null,
    User.find({ _id: { $in: auction.registrations.map((r) => r.bidder) } })
      .select('email name')
      .lean(),
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
    // Single registrant wins automatically; no live bidding session is created.
    auction.status = 'completed';
    auction.biddingStartedAt = null;
    auction.biddingEndedAt = new Date();
    auction.winner = sortedRegistrations[0].bidder;
    auction.currentPrice = auction.startingPrice;
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
  appendNextBidder(auction);
  startTurnClock(auction, auction.activeBidders[0]);
  await auction.save();
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

exports.getAllAuctions = async (req, res) => {
  try {
    const {
      status,
      seller,
      winner,
      includeBids = 'false',
      includeRegistrations = 'false',
      category,
      search,
      page = '1',
      limit = '100',
    } = req.query;

    const query = {};

    if (status) {
      if (status === 'previous') {
        query.status = { $in: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed', 'withdrawn', 'no_registrations', 'disapproved'] };
      } else if (status.includes(',')) {
        query.status = { $in: status.split(',').map((s) => s.trim()) };
      } else {
        query.status = status;
      }
    }

    if (seller) query.seller = seller;
    if (winner) query.winner = winner;
    if (category) query.category = category;
    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
    const skip = (parsedPage - 1) * parsedLimit;

    const projection = {
      ...(includeBids === 'true' ? {} : { bids: 0 }),
      ...(includeRegistrations === 'true' ? {} : { registrations: 0, activeBidders: 0, waitingBidders: 0 }),
    };

    const auctions = await Auction.find(query, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    return res.status(200).json(auctions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAuctionSummary = async (_req, res) => {
  try {
    const grouped = await Auction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus = grouped.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const liveListings = Number(byStatus.ongoing || 0);
    const futureBids = Number(byStatus.future || 0);
    const closed = Number(
      (byStatus.completed || 0) +
      (byStatus.paid_shipping_pending || 0) +
      (byStatus.paid_held_in_escrow || 0) +
      (byStatus.closed || 0)
    );

    const totalListings = Object.values(byStatus).reduce((sum, count) => sum + Number(count || 0), 0);

    return res.status(200).json({
      liveListings,
      futureBids,
      closed,
      totalListings,
      byStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load auction summary' });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('winner', 'name email')
      .populate('bids.bidder', 'name email')
      .populate('registrations.bidder', 'name email')
      .populate('activeBidders', 'name email')
      .populate('waitingBidders', 'name email');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createAuction = async (req, res) => {
  const { title, description, category, startingPrice, turnstileToken } = req.body;

  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before submitting listings.' });
    }

    const remoteip =
      req.headers['cf-connecting-ip'] ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')
        .map((item) => item.trim())
        .find(Boolean) ||
      req.ip;

    const turnstileValidation = await validateTurnstileToken({
      token: turnstileToken || req.body['cf-turnstile-response'],
      remoteip,
    });

    if (!turnstileValidation.success) {
      return res
        .status(turnstileValidation.status)
        .json({ message: turnstileValidation.message, errorCodes: turnstileValidation.errorCodes });
    }

    const parsedWindow = resolveRegistrationWindowHours(req.body);
    if (!parsedWindow) {
      return res.status(400).json({ message: 'Registration window must be 5 minutes (test) or one of 1, 5, 8, 10, 15, or 20 days' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'Image upload service is not configured' });
    }

    if (!req.files?.length) {
      return res.status(400).json({ message: 'Please upload at least 1 image (max 3)' });
    }

    const uploadedImages = await uploadAuctionImages(req.files);

    const auction = await Auction.create({
      title,
      description,
      category,
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      registrationWindowHours: parsedWindow,
      registrationStartAt: new Date(),
      registrationEndAt: getRegistrationEndAt(parsedWindow),
      images: uploadedImages,
      seller: req.user._id,
      status: 'pending_verification',
      verificationStatus: 'pending',
    });

    const seller = await User.findById(req.user._id).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `Listing submitted for verification: ${title}`,
        message: templates.listingSubmitted({ title }),
      });
    }

    return res.status(201).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateAuction = async (req, res) => {
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
        return res.status(400).json({ message: 'Registration window must be 5 minutes (test) or one of 1, 5, 8, 10, 15, or 20 days' });
      }
      auction.registrationWindowHours = parsedWindow;
      auction.registrationEndAt = getRegistrationEndAt(parsedWindow);
    }

    if (req.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({ message: 'Image upload service is not configured' });
      }

      const uploadedImages = await uploadAuctionImages(req.files);
      auction.images = uploadedImages;
    }

    await auction.save();
    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (auction.status === 'ongoing' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete listing during an ongoing bid' });
    }

    await auction.deleteOne();
    return res.status(200).json({ message: 'Listing removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.registerForAuction = async (req, res) => {
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

exports.placeBid = async (req, res) => {
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
      return res.status(400).json({ message: 'Not your turn. Wait for your 10-second turn.' });
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

    const updatedAuction = await Auction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('winner', 'name')
      .populate('bids.bidder', 'name')
      .populate('activeBidders', 'name')
      .populate('waitingBidders', 'name');

    const io = req.app.get('io');
    io.to(req.params.id).emit('bidUpdated', updatedAuction);

    return res.status(200).json(updatedAuction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.giveUpBid = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'ongoing') {
      return res.status(400).json({ message: 'Bid is not currently ongoing' });
    }

    await handleGiveUpCore({ auction, bidderId: req.user.id });

    const updatedAuction = await Auction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('winner', 'name')
      .populate('bids.bidder', 'name')
      .populate('activeBidders', 'name')
      .populate('waitingBidders', 'name');

    const io = req.app.get('io');
    io.to(req.params.id).emit('bidUpdated', updatedAuction);

    return res.status(200).json(updatedAuction);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.handleNoRegistrationDecision = async (req, res) => {
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

exports.adminApproveAuction = async (req, res) => {
  try {
    const { registrationWindowDays, registrationWindowMinutes, registrationEndAt } = req.body || {};
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (registrationWindowDays || registrationWindowMinutes) {
      const parsedWindow = resolveRegistrationWindowHours({ registrationWindowDays, registrationWindowMinutes });
      if (!parsedWindow) {
        return res.status(400).json({ message: 'Registration window must be 5 minutes (test) or one of 1, 5, 8, 10, 15, or 20 days' });
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

exports.adminDisapproveAuction = async (req, res) => {
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

exports.internalJobs = {
  moveToOngoing,
  handleGiveUpCore,
  finalizeOngoingAuction,
};

