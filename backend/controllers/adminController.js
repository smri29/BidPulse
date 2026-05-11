const Auction = require('../models/Auction');
const User = require('../models/User');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const { sendMonthlyPromotionalEmails } = require('../utils/promotionalCampaignService');

// @desc    Get Platform Stats (Admin Only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (_req, res) => {
  try {
    const [totalUsers, totalAuctions, financialSummary, shippingPendingSummary, recentTransactions] = await Promise.all([
      User.countDocuments(),
      Auction.countDocuments(),
      Auction.aggregate([
        { $match: { status: 'closed' } },
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$currentPrice' },
          },
        },
      ]),
      Auction.aggregate([
        { $match: { status: 'paid_shipping_pending' } },
        {
          $group: {
            _id: null,
            fundsInShippingFlow: { $sum: '$currentPrice' },
          },
        },
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

// @desc    Get All Users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Ban or Unban a User
// @route   PUT /api/admin/users/ban/:id
// @access  Private/Admin
exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isBanned = !user.isBanned;
      await user.save();
      return res.json({ message: `User ${user.isBanned ? 'Banned' : 'Active'}`, isBanned: user.isBanned });
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
      return res.json({ message: 'User removed' });
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Specific User Activity Log
// @route   GET /api/admin/users/:id/history
// @access  Private/Admin
exports.getUserHistory = async (req, res) => {
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

// @desc    Get All Auctions (Admin View)
// @route   GET /api/admin/auctions
// @access  Private/Admin
exports.getAllAuctionsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [auctions, total] = await Promise.all([
      Auction.find({})
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Auction.countDocuments(),
    ]);

    return res.json({
      auctions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Force Delete Any Auction
// @route   DELETE /api/admin/auctions/:id
// @access  Private/Admin
exports.deleteAnyAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
      await auction.deleteOne();
      return res.json({ message: 'Auction removed by Admin' });
    }

    return res.status(404).json({ message: 'Auction not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Send admin test email
// @route   POST /api/admin/test-email
// @access  Private/Admin
exports.sendTestEmail = async (_req, res) => {
  const targetEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_USERNAME || process.env.EMAIL_USER;

  if (!targetEmail) {
    return res.status(400).json({ message: 'No target email configured. Set ADMIN_EMAIL or SUPPORT_EMAIL.' });
  }

  sendEmailAsync({
    email: targetEmail,
    subject: 'AuctionPulse Email Health Check',
    message: templates.welcome({ name: 'Admin', clientUrl: process.env.CLIENT_URL }),
  });

  return res.json({ message: `Test email queued for ${targetEmail}` });
};

// @desc    Trigger promotional campaign manually (admin)
// @route   POST /api/admin/promotional/trigger
// @access  Private/Admin
exports.triggerPromotionalCampaign = async (req, res) => {
  try {
    const { month, year, dayOfMonth, dryRun = false, forceSend = false } = req.body || {};

    if (month !== undefined) {
      const parsedMonth = Number(month);
      if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: 'month must be an integer between 1 and 12' });
      }
    }

    if (year !== undefined) {
      const parsedYear = Number(year);
      if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 3000) {
        return res.status(400).json({ message: 'year must be an integer between 2000 and 3000' });
      }
    }

    if (dayOfMonth !== undefined) {
      const parsedDay = Number(dayOfMonth);
      if (!Number.isInteger(parsedDay) || ![5, 25].includes(parsedDay)) {
        return res.status(400).json({ message: 'dayOfMonth must be 5 or 25' });
      }
    }

    const stats = await sendMonthlyPromotionalEmails({
      month,
      year,
      dayOfMonth,
      dryRun: Boolean(dryRun),
      forceSend: Boolean(forceSend),
    });

    return res.status(200).json({
      message: 'Promotional campaign trigger completed',
      stats,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to trigger promotional campaign' });
  }
};


