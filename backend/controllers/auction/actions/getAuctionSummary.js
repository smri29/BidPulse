/**
 * Module: backend/controllers/auction/actions/getAuctionSummary.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/getAuctionSummary.js
// Purpose: get Auction Summary
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');

const getAuctionSummary = async (_req, res) => {
  try {
    const grouped = await Auction.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

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

module.exports = getAuctionSummary;


