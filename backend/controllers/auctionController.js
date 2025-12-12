const Auction = require('../models/Auction');

// @desc    Get all active auctions
// @route   GET /api/auctions
// @access  Public
exports.getAllAuctions = async (req, res) => {
  try {
    // Simple filter: only show active auctions
    const auctions = await Auction.find({ status: 'active' }).sort({ createdAt: -1 });
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
      .populate('seller', 'name email') // Show seller info
      .populate('bids.bidder', 'name'); // Show bidder names in history

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
    const auction = await Auction.create({
      title,
      description,
      category,
      startingPrice,
      endTime,
      images, // Expecting an array of image URL strings for now
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

    // Check if user is seller or admin
    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if bids exist (Optional rule: cannot delete if bidding started)
    if (auction.bids.length > 0) {
      return res.status(400).json({ message: 'Cannot delete auction with active bids' });
    }

    await auction.deleteOne();
    res.status(200).json({ message: 'Auction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};