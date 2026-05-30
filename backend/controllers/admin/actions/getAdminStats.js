/**
 * Module: backend/controllers/admin/actions/getAdminStats.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/getAdminStats.js
// Purpose: get Admin Stats
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const User = require('../../../models/User');
const Auction = require('../../../models/Auction');

const getAdminStats = async (_req, res) => {
  try {
    const [totalUsers, totalAuctions, financialSummary, shippingPendingSummary, recentTransactions] = await Promise.all([
      User.countDocuments(),
      Auction.countDocuments(),
      Auction.aggregate([
        { $match: { status: 'closed' } },
        { $group: { _id: null, totalVolume: { $sum: '$currentPrice' } } },
      ]),
      Auction.aggregate([
        { $match: { status: 'paid_shipping_pending' } },
        { $group: { _id: null, fundsInShippingFlow: { $sum: '$currentPrice' } } },
      ]),
      Auction.find({ status: 'closed' })
        .select('title winner currentPrice createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalVolume = financialSummary[0]?.totalVolume || 0;
    const totalCommission = totalVolume * 0.05;
    const totalPayouts = totalVolume - totalCommission;
    const fundsInEscrow = shippingPendingSummary[0]?.fundsInShippingFlow || 0;

    return res.status(200).json({
      totalUsers,
      totalAuctions,
      totalVolume,
      totalCommission,
      totalPayouts,
      fundsInEscrow,
      recentTransactions,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getAdminStats;


