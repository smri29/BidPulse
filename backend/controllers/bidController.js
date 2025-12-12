const Auction = require('../models/Auction');
const User = require('../models/User');

// @desc    Place a new bid
// @route   POST /api/bids/:auctionId
// @access  Private (Bidder)
exports.placeBid = async (req, res) => {
  const { amount } = req.body;
  const { auctionId } = req.params;

  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // 1. Basic Validation
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is closed' });
    }
    if (auction.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }
    if (new Date(auction.endTime) < Date.now()) {
      return res.status(400).json({ message: 'Auction has expired' });
    }
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }

    // 2. Check Blocklist (Seller Restrictions)
    // We need to fetch the seller's user profile to see their 'blockedUsers'
    const seller = await User.findById(auction.seller);
    if (seller.blockedUsers.includes(req.user.id)) {
      return res.status(403).json({ message: 'You have been blocked by this seller' });
    }

    // 3. The "Soft Close" Logic
    // If bid is placed within last 5 minutes (300,000 ms), extend time by 5 minutes
    const timeRemaining = new Date(auction.endTime).getTime() - Date.now();
    if (timeRemaining < 5 * 60 * 1000) {
      auction.endTime = new Date(Date.now() + 5 * 60 * 1000); // Reset clock to 5 mins from NOW
    }

    // 4. Update Auction Data
    auction.currentPrice = amount;
    auction.highestBidder = req.user.id;
    auction.bids.push({
      bidder: req.user.id,
      amount: amount,
      time: Date.now(),
    });

    await auction.save();

    // 5. Real-Time Update (Socket.io)
    // We access the 'io' instance we set in server.js
    const io = req.app.get('socketio');
    io.emit('bid_update', {
      auctionId: auction._id,
      currentPrice: auction.currentPrice,
      highestBidder: req.user.name, // Send name for display
      endTime: auction.endTime,     // Send new time in case of extension
      bids: auction.bids,           // Update history
    });

    res.status(200).json(auction);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bid history for an auction
// @route   GET /api/bids/:auctionId
// @access  Public
exports.getBids = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId)
      .populate('bids.bidder', 'name'); // Only get the name
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.status(200).json(auction.bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};