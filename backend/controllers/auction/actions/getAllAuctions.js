// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/getAllAuctions.js
// Purpose: get All Auctions
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');

const getAllAuctions = async (req, res) => {
  try {
    const {
      status,
      seller,
      winner,
      includeBids = 'false',
      includeRegistrations = 'false',
      category,
      search,
      page = '1',
      limit = '100',
    } = req.query;

    const query = {};

    if (status) {
      if (status === 'previous') {
        query.status = { $in: ['completed', 'paid_shipping_pending', 'paid_held_in_escrow', 'closed', 'withdrawn', 'no_registrations', 'disapproved'] };
      } else if (status.includes(',')) {
        query.status = { $in: status.split(',').map((s) => s.trim()) };
      } else {
        query.status = status;
      }
    }

    if (seller) query.seller = seller;
    if (winner) query.winner = winner;
    if (category) query.category = category;
    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
    const skip = (parsedPage - 1) * parsedLimit;

    const projection = {
      ...(includeBids === 'true' ? {} : { bids: 0 }),
      ...(includeRegistrations === 'true' ? {} : { registrations: 0, activeBidders: 0, waitingBidders: 0 }),
    };

    const auctions = await Auction.find(query, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    return res.status(200).json(auctions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getAllAuctions;


