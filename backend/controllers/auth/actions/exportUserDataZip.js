// ---------------------------------------------------------------------------
// Module: backend/controllers/auth/actions/exportUserDataZip.js
// Purpose: export User Data Zip
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const archiver = require('archiver');
const { PassThrough } = require('stream');

const User = require('../../../models/User');
const Auction = require('../../../models/Auction');
const SupportTicket = require('../../../models/SupportTicket');

const exportUserDataZip = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, listedAuctions, bidAuctions, supportTickets] = await Promise.all([
      User.findById(userId).select('-password -resetPasswordToken -emailVerificationOTP').lean(),
      Auction.find({ seller: userId }).lean(),
      Auction.find({ 'bids.bidder': userId }).lean(),
      SupportTicket.find({ email: req.user.email }).lean(),
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=AuctionPulse-data-${userId}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      throw err;
    });

    const output = new PassThrough();
    output.pipe(res);
    archive.pipe(output);

    archive.append(JSON.stringify(user, null, 2), { name: 'profile.json' });
    archive.append(JSON.stringify(listedAuctions, null, 2), { name: 'listed_auctions.json' });
    archive.append(JSON.stringify(bidAuctions, null, 2), { name: 'bid_activity.json' });
    archive.append(JSON.stringify(supportTickets, null, 2), { name: 'support_tickets.json' });

    await archive.finalize();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = exportUserDataZip;


