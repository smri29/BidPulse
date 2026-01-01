const Auction = require('../models/Auction');
const User = require('../models/User'); // Import User model
const sendEmail = require('../utils/emailService'); // Import Email Service

// @desc    Get all auctions
// @route   GET /api/auctions
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new auction
// @route   POST /api/auctions
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

    // --- EMAIL TRIGGER: LISTING SUCCESS ---
    try {
        const seller = await User.findById(req.user._id);
        await sendEmail({
            email: seller.email,
            subject: `Listing Confirmed: ${title}`,
            message: `
                <div style="font-family: Arial, sans-serif;">
                    <h1 style="color: #10b981;">Your Item is Live!</h1>
                    <p>You have successfully listed <b>${title}</b> on BidPulse.</p>
                    <ul>
                        <li><b>Starting Price:</b> $${startingPrice}</li>
                        <li><b>Ends At:</b> ${new Date(endTime).toLocaleString()}</li>
                    </ul>
                    <p>Good luck!</p>
                </div>
            `
        });
    } catch (err) {
        console.error("Listing Email Failed:", err.message);
    }
    // -------------------------------------

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(200).json({ message: 'Auction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place a bid
// @route   POST /api/auctions/:id/bid
exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Validations
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is closed' });
    }
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: 'Bid must be higher than current price' });
    }
    if (auction.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }

    // --- CAPTURE PREVIOUS WINNER FOR OUTBID EMAIL ---
    const previousWinnerId = auction.winner; 
    // -----------------------------------------------

    const newBid = {
      bidder: req.user.id,
      amount: Number(amount),
      time: Date.now(),
    };

    auction.bids.push(newBid);
    auction.currentPrice = amount;
    auction.winner = req.user.id; 

    await auction.save();

    // --- EMAIL TRIGGER: OUTBID ALERT ---
    if (previousWinnerId) {
        try {
            const previousWinner = await User.findById(previousWinnerId);
            // Ensure we don't email if user outbid themselves (rare but possible)
            if (previousWinner && previousWinner._id.toString() !== req.user.id) {
                await sendEmail({
                    email: previousWinner.email,
                    subject: `⚠️ You've been outbid on ${auction.title}`,
                    message: `
                        <div style="font-family: Arial, sans-serif;">
                            <h2 style="color: #ef4444;">Act Fast!</h2>
                            <p>Someone just bid <b>$${amount}</b> on <b>${auction.title}</b>.</p>
                            <p>You are no longer the highest bidder.</p>
                            <p><a href="${process.env.CLIENT_URL}/auction/${auction._id}" style="font-weight: bold; color: #6d28d9;">Bid Again Now</a></p>
                        </div>
                    `
                });
            }
        } catch (err) {
            console.error("Outbid Email Failed:", err.message);
        }
    }
    // -----------------------------------

    // Populate names & Emit
    const updatedAuction = await Auction.findById(req.params.id)
      .populate('seller', 'name')
      .populate('bids.bidder', 'name');

    const io = req.app.get('io');
    io.to(req.params.id).emit('bidUpdated', updatedAuction);

    res.status(200).json(updatedAuction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};