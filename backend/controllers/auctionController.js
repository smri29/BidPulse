const Auction = require('../models/Auction');
const User = require('../models/User');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const cloudinary = require('../config/cloudinary');

const uploadAuctionImages = async (files) => {
  if (!files?.length) return [];

  const folder = process.env.CLOUDINARY_FOLDER || 'bidpulse';
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

// @desc    Get all auctions
// @route   GET /api/auctions
exports.getAllAuctions = async (req, res) => {
  try {
    const {
      status,
      seller,
      winner,
      includeBids = 'false',
      page = '1',
      limit = '100',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (seller) query.seller = seller;
    if (winner) query.winner = winner;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
    const skip = (parsedPage - 1) * parsedLimit;

    const projection = includeBids === 'true' ? {} : { bids: 0 };

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

// @desc    Get single auction
// @route   GET /api/auctions/:id
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('bids.bidder', 'name');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new auction
// @route   POST /api/auctions
exports.createAuction = async (req, res) => {
  const { title, description, category, startingPrice, endTime } = req.body;

  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before listing auctions.' });
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
      endTime,
      images: uploadedImages,
      seller: req.user._id,
    });

    // Do not block API response on SMTP latency/failure.
    const seller = await User.findById(req.user._id).select('email').lean();
    if (seller?.email) {
      sendEmailAsync({
        email: seller.email,
        subject: `Listing Confirmed: ${title}`,
        message: templates.listingConfirmed({ title, startingPrice, endTime }),
      });
    }

    return res.status(201).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
exports.updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (auction.status !== 'active' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Only active auctions can be edited' });
    }

    const { title, description, category, endTime } = req.body;
    if (title) auction.title = title;
    if (description) auction.description = description;
    if (category) auction.category = category;
    if (endTime) auction.endTime = endTime;

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

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (auction.bids.length > 0 && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete auction with active bids' });
    }

    await auction.deleteOne();
    return res.status(200).json({ message: 'Auction removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Place a bid
// @route   POST /api/auctions/:id/bid
exports.placeBid = async (req, res) => {
  try {
    if (!req.user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before placing bids.' });
    }

    const amount = Number(req.body.amount);
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is closed' });
    }
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }
    if (auction.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }

    const previousWinnerId = auction.winner;

    auction.bids.push({
      bidder: req.user.id,
      amount,
      time: Date.now(),
    });
    auction.currentPrice = amount;
    auction.winner = req.user.id;

    await auction.save();

    if (previousWinnerId) {
      const previousWinner = await User.findById(previousWinnerId).select('email').lean();
      if (previousWinner?.email && String(previousWinnerId) !== req.user.id) {
        sendEmailAsync({
          email: previousWinner.email,
          subject: `You've been outbid on ${auction.title}`,
          message: templates.outbid({
            title: auction.title,
            amount,
            link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
          }),
        });
      }
    }

    const updatedAuction = await Auction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('bids.bidder', 'name');

    const io = req.app.get('io');
    io.to(req.params.id).emit('bidUpdated', updatedAuction);

    return res.status(200).json(updatedAuction);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
