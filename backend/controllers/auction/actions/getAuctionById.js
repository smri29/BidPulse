/**
 * Module: backend/controllers/auction/actions/getAuctionById.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/getAuctionById.js
// Purpose: get Auction By Id
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const { getAuctionDetailsById } = require('../viewHelpers');

const getAuctionById = async (req, res) => {
  try {
    const auction = await getAuctionDetailsById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    return res.status(200).json(auction);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getAuctionById;


