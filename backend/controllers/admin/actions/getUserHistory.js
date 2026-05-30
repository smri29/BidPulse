// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/getUserHistory.js
// Purpose: get User History
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const Auction = require('../../../models/Auction');

const getUserHistory = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [auctionsCreated, auctionsWon] = await Promise.all([
      Auction.find({ seller: userId })
        .select('title currentPrice status createdAt images')
        .sort({ createdAt: -1 })
        .lean(),
      Auction.find({ winner: userId })
        .select('title currentPrice status registrationEndAt images')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const totalEarned = auctionsCreated
      .filter((a) => a.status === 'closed' || a.status === 'paid_shipping_pending' || a.status === 'paid_held_in_escrow')
      .reduce((acc, item) => acc + item.currentPrice * 0.95, 0);

    const totalSpent = auctionsWon.reduce((acc, item) => acc + item.currentPrice, 0);

    return res.json({
      profile: user,
      stats: {
        itemsListed: auctionsCreated.length,
        itemsWon: auctionsWon.length,
        totalEarned,
        totalSpent,
      },
      history: {
        sales: auctionsCreated,
        purchases: auctionsWon,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getUserHistory;


