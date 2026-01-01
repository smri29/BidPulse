const Auction = require('../models/Auction');
const User = require('../models/User');

// @desc    Get Platform Stats (Admin Only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();

    // Calculate Financials from 'closed' auctions
    const closedAuctions = await Auction.find({ status: 'closed' });
    
    const totalVolume = closedAuctions.reduce((acc, item) => acc + item.currentPrice, 0);
    const totalCommission = totalVolume * 0.08; // 8% Profit
    const totalPayouts = totalVolume - totalCommission; // 92% Sent to Sellers

    // Calculate Money currently held in Escrow
    const escrowAuctions = await Auction.find({ status: 'paid_held_in_escrow' });
    const fundsInEscrow = escrowAuctions.reduce((acc, item) => acc + item.currentPrice, 0);

    res.status(200).json({
      totalUsers,
      totalAuctions,
      totalVolume,
      totalCommission, // Admin Profit
      totalPayouts,
      fundsInEscrow,
      recentTransactions: closedAuctions.slice(0, 5) // Last 5 finished deals
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
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
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