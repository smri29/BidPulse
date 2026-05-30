// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/deleteAnyAuction.js
// Purpose: delete Any Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');

const deleteAnyAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    await auction.deleteOne();
    return res.json({ message: 'Auction removed by Admin' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = deleteAnyAuction;


