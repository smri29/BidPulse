// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/getUserActivity.js
// Purpose: get User Activity
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');

const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const [listedAuctions, placedBidAuctions, wonAuctions] = await Promise.all([
      Auction.find({ seller: userId })
        .select('title currentPrice status createdAt registrationEndAt')
        .sort({ createdAt: -1 })
        .lean(),
      Auction.find({ 'bids.bidder': userId })
        .select('title currentPrice status winner bids createdAt registrationEndAt')
        .sort({ createdAt: -1 })
        .lean(),
      Auction.find({
        winner: userId,
        status: { $in: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed'] },
      })
        .select('title currentPrice status registrationEndAt createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const uniquePlaced = [];
    const seen = new Set();
    for (const auction of placedBidAuctions) {
      if (!seen.has(String(auction._id))) {
        uniquePlaced.push(auction);
        seen.add(String(auction._id));
      }
    }

    const lostAuctions = uniquePlaced.filter(
      (auction) =>
        !['pending_verification', 'future', 'ongoing'].includes(auction.status) &&
        String(auction.winner || '') !== String(userId)
    );

    const stats = {
      totalListed: listedAuctions.length,
      totalPlacedBids: uniquePlaced.length,
      totalWins: wonAuctions.length,
      totalLosses: lostAuctions.length,
      feedbackScore:
        uniquePlaced.length > 0 ? Math.max(60, Math.round((wonAuctions.length / uniquePlaced.length) * 100)) : 0,
    };

    return res.json({
      stats,
      history: {
        listed: listedAuctions,
        placedBids: uniquePlaced,
        won: wonAuctions,
        lost: lostAuctions,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getUserActivity;


