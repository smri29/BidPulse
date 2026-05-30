/**
 * Module: backend/controllers/auction/actions/deleteAuction.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/actions/deleteAuction.js
// Purpose: delete Auction
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');

const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (auction.status === 'ongoing' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete listing during an ongoing bid' });
    }

    await auction.deleteOne();
    return res.status(200).json({ message: 'Listing removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = deleteAuction;


