const Auction = require('../models/Auction');

// @desc    Get all auctions (Active, Completed, Unsold)
// @route   GET /api/auctions
// @access  Public
exports.getAllAuctions = async (req, res) => {
  try {
    // Fetches everything so products don't disappear when timer ends
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('bids.bidder', 'name'); 

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private (Seller only)
exports.createAuction = async (req, res) => {
  const { title, description, category, startingPrice, endTime, images } = req.body;

  try {
    if (req.user.role === 'bidder') {
        return res.status(403).json({ message: 'Only sellers can create auctions' });
    }

    const auction = await Auction.create({
      title,
      description,
      category,
      startingPrice,
      currentPrice: startingPrice, 
      endTime,
      images,
      seller: req.user._id,
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private (Owner/Admin)
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user is owner OR admin
    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Allow Admin to force delete even if bids exist (optional, but safer to block)
    // For now, we keep the safety check:
    if (auction.bids.length > 0 && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete auction with active bids' });
    }

    await auction.deleteOne();
    res.status(200).json({ message: 'Auction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place a bid
// @route   POST /api/auctions/:id/bid
// @access  Private
exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // 1. Validations
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is closed' });
    }

    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }

    if (auction.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }

    // 2. Add Bid to Database
    const newBid = {
      bidder: req.user.id,
      amount: Number(amount),
      time: Date.now(),
    };

    auction.bids.push(newBid);
    auction.currentPrice = amount;
    auction.winner = req.user.id; 

    await auction.save();

    // 3. Populate names
    const updatedAuction = await Auction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('bids.bidder', 'name');

    // 4. Emit Real-Time Update
    const io = req.app.get('io');
    io.to(req.params.id).emit('bidUpdated', updatedAuction);

    res.status(200).json(updatedAuction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};