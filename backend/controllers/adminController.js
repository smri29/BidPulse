const Auction = require('../models/Auction');
const User = require('../models/User');

// @desc    Get Platform Stats (Admin Only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();

    // 1. Calculate Financials from 'closed' (successfully sold) auctions
    const closedAuctions = await Auction.find({ status: 'closed' });
    
    // Total money processed through the platform
    const totalVolume = closedAuctions.reduce((acc, item) => acc + item.currentPrice, 0);
    
    // 8% Commission Revenue
    const totalCommission = totalVolume * 0.08; 
    
    // 92% Payouts to Sellers
    const totalPayouts = totalVolume - totalCommission; 

    // 2. Calculate Money currently held in Escrow (Paid but not released)
    const escrowAuctions = await Auction.find({ status: 'paid_held_in_escrow' });
    const fundsInEscrow = escrowAuctions.reduce((acc, item) => acc + item.currentPrice, 0);

    res.status(200).json({
      totalUsers,
      totalAuctions,
      totalVolume,
      totalCommission,
      totalPayouts,
      fundsInEscrow,
      recentTransactions: closedAuctions.slice(0, 5) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Return all users sorted by newest first, exclude passwords
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban or Unban a User
// @route   PUT /api/admin/users/ban/:id
// @access  Private/Admin
exports.banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            // Toggle the ban status
            user.isBanned = !user.isBanned;
            await user.save();
            res.json({ message: `User ${user.isBanned ? 'Banned' : 'Active'}`, isBanned: user.isBanned });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a User (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Specific User Activity Log
// @route   GET /api/admin/users/:id/history
// @access  Private/Admin
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Get User Profile
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Get Auctions Created by this user (Seller History)
    const auctionsCreated = await Auction.find({ seller: userId })
      .select('title currentPrice status createdAt images')
      .sort({ createdAt: -1 });

    // 3. Get Auctions Won by this user (Buyer History)
    const auctionsWon = await Auction.find({ winner: userId })
      .select('title currentPrice status endTime images');

    // 4. Calculate Financials
    const totalEarned = auctionsCreated
        .filter(a => a.status === 'closed' || a.status === 'paid_held_in_escrow')
        .reduce((acc, item) => acc + (item.currentPrice * 0.92), 0); // 92% share

    const totalSpent = auctionsWon
        .reduce((acc, item) => acc + item.currentPrice, 0);

    res.json({
      profile: user,
      stats: {
        itemsListed: auctionsCreated.length,
        itemsWon: auctionsWon.length,
        totalEarned,
        totalSpent
      },
      history: {
        sales: auctionsCreated,
        purchases: auctionsWon
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Auctions (Admin View)
// @route   GET /api/admin/auctions
// @access  Private/Admin
exports.getAllAuctionsAdmin = async (req, res) => {
    try {
        // Fetch ALL auctions, populate seller name/email
        const auctions = await Auction.find({})
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Force Delete Any Auction
// @route   DELETE /api/admin/auctions/:id
// @access  Private/Admin
exports.deleteAnyAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if(auction) {
            await auction.deleteOne();
            res.json({ message: 'Auction removed by Admin' });
        } else {
            res.status(404).json({ message: 'Auction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};