// ---------------------------------------------------------------------------
// Module: backend/jobs/registerBackgroundJobs.js
// Purpose: register Background Jobs
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const cron = require('node-cron');

const Auction = require('../models/Auction');
const { sendEmailAsync } = require('../utils/emailService');
const templates = require('../utils/emailTemplates');
const { sendMonthlyPromotionalEmails } = require('../utils/promotionalCampaignService');
const { sendDailyBirthdayEmails } = require('../utils/birthdayEmailService');
const { internalJobs } = require('../controllers/auctionController');

const populateAuctionRealtimeState = (auctionQuery) =>
  auctionQuery
    .populate('seller', 'name email')
    .populate('winner', 'name email')
    .populate('bids.bidder', 'name email')
    .populate('registrations.bidder', 'name email')
    .populate('activeBidders', 'name email')
    .populate('waitingBidders', 'name email')
    .populate('roomActivation.currentBidder', 'name email')
    .populate('roomActivation.openedBy', 'name email');

const registerBackgroundJobs = (io) => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const reminderWindowEnd = new Date(now.getTime() + 5 * 60 * 1000);

      const reminders = await Auction.find({
        status: 'future',
        registrationEndAt: { $gt: now, $lte: reminderWindowEnd },
        'reminders.registrationReminderSentAt': null,
        'registrations.0': { $exists: true },
      }).populate('registrations.bidder', 'email');

      for (const auction of reminders) {
        const minutesUntilStart = Math.max(
          1,
          Math.ceil((new Date(auction.registrationEndAt).getTime() - now.getTime()) / (60 * 1000))
        );
        const recipientEmails = auction.registrations
          .map((entry) => entry.bidder?.email)
          .filter(Boolean);

        recipientEmails.forEach((email) => {
          sendEmailAsync({
            email,
            subject: `AuctionPulse starts in ${minutesUntilStart} minute${minutesUntilStart === 1 ? '' : 's'}: ${auction.title}`,
            message: templates.biddingStartsSoon({
              title: auction.title,
              startAt: auction.registrationEndAt,
              minutesUntilStart,
              link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
            }),
          });
        });

        auction.reminders.registrationReminderSentAt = new Date();
        await auction.save();
      }
    } catch (error) {
      console.error('Cron job error:', error.message);
    }
  });

  cron.schedule('*/5 * * * * *', async () => {
    try {
      const now = new Date();

      const readyToStart = await Auction.find({
        status: 'future',
        registrationEndAt: { $lte: now },
      }).select(
        '_id title seller status registrationEndAt registrationWindowHours startingPrice currentPrice winner currentTurnBidder turnDurationSeconds turnExpiresAt registrations activeBidders waitingBidders gaveUpBidders reminders roomActivation biddingStartedAt biddingEndedAt'
      );

      for (const auction of readyToStart) {
        const result = await internalJobs.prepareAuctionRoom(auction, now);
        if (result?.changed) {
          const refreshed = await populateAuctionRealtimeState(Auction.findById(auction._id));
          io.to(auction._id.toString()).emit('bidUpdated', refreshed || { auctionId: auction._id });
        }
      }

      const expiredTurns = await Auction.find({
        status: 'ongoing',
        currentTurnBidder: { $ne: null },
        turnExpiresAt: { $lte: now },
      }).select('_id currentTurnBidder activeBidders waitingBidders gaveUpBidders winner currentPrice startingPrice status turnDurationSeconds roomActivation');

      for (const auction of expiredTurns) {
        await internalJobs.handleGiveUpCore({
          auction,
          bidderId: auction.currentTurnBidder,
        });
        const refreshed = await populateAuctionRealtimeState(Auction.findById(auction._id));
        io.to(auction._id.toString()).emit('bidUpdated', refreshed || { auctionId: auction._id });
      }
    } catch (error) {
      console.error('Auction engine cron error:', error.message);
    }
  });

  const emailAutomationTimezone = process.env.PROMOTIONAL_EMAIL_TIMEZONE || 'UTC';

  cron.schedule('0 10 5,25 * *', async () => {
    try {
      const now = new Date();
      const stats = await sendMonthlyPromotionalEmails({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        dayOfMonth: now.getDate() >= 25 ? 25 : 5,
      });
      console.log(
        `Promotional email job completed. window=${stats.dayOfMonth}, total=${stats.total}, sent=${stats.sent}, skipped=${stats.skipped}`
      );
    } catch (error) {
      console.error('Promotional email job error:', error.message);
    }
  }, {
    timezone: emailAutomationTimezone,
  });

  cron.schedule('15 10 * * *', async () => {
    try {
      const stats = await sendDailyBirthdayEmails();
      console.log(
        `Birthday email job completed. total=${stats.total}, sent=${stats.sent}, skipped=${stats.skipped}`
      );
    } catch (error) {
      console.error('Birthday email job error:', error.message);
    }
  }, {
    timezone: emailAutomationTimezone,
  });

  setTimeout(async () => {
    try {
      const now = new Date();
      if (![5, 25].includes(now.getDate())) return;
      const stats = await sendMonthlyPromotionalEmails({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        dayOfMonth: now.getDate(),
      });
      console.log(
        `Promotional startup check completed. window=${stats.dayOfMonth}, total=${stats.total}, sent=${stats.sent}, skipped=${stats.skipped}`
      );
    } catch (error) {
      console.error('Promotional startup check error:', error.message);
    }
  }, 15000);

  setTimeout(async () => {
    try {
      const stats = await sendDailyBirthdayEmails();
      if (stats.total > 0) {
        console.log(
          `Birthday startup check completed. total=${stats.total}, sent=${stats.sent}, skipped=${stats.skipped}`
        );
      }
    } catch (error) {
      console.error('Birthday startup check error:', error.message);
    }
  }, 25000);
};

module.exports = {
  registerBackgroundJobs,
};


