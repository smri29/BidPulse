const User = require('../models/User');
const PromotionalEmailLog = require('../models/PromotionalEmailLog');
const templates = require('./emailTemplates');
const { sendEmailAsync } = require('./emailService');

// ---------------------------------------------------------------------------
// Promotional email service
// Picks the campaign month, checks send history, and dispatches/records each send.
// ---------------------------------------------------------------------------

const normalizeMonth = (value) => {
  const month = Number(value);
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  return month;
};

const normalizeYear = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 3000) return null;
  return year;
};

const normalizePromotionalSendDay = (value, fallbackDate = new Date()) => {
  const explicitDay = Number(value);
  if (Number.isInteger(explicitDay) && [5, 25].includes(explicitDay)) {
    return explicitDay;
  }

  return fallbackDate.getDate() >= 25 ? 25 : 5;
};

const sendMonthlyPromotionalEmails = async ({
  month,
  year,
  dayOfMonth,
  clientUrl,
  forceSend = false,
  dryRun = false,
} = {}) => {
  const now = new Date();
  const effectiveMonth = normalizeMonth(month) || now.getMonth() + 1;
  const effectiveYear = normalizeYear(year) || now.getFullYear();
  const effectiveDayOfMonth = normalizePromotionalSendDay(dayOfMonth, now);
  const effectiveClientUrl = clientUrl || process.env.CLIENT_URL || 'http://localhost:5173';

  // Promotional mail intentionally includes all users with an email, not only verified/active ones.
  const recipients = await User.find({
    email: { $exists: true, $ne: '' },
  })
    .select('_id name email')
    .lean();

  if (!recipients.length) {
    return {
      month: effectiveMonth,
      year: effectiveYear,
      dayOfMonth: effectiveDayOfMonth,
      total: 0,
      sent: 0,
      skipped: 0,
      dryRun,
    };
  }

  const existingLogs = await PromotionalEmailLog.find({
    year: effectiveYear,
    month: effectiveMonth,
    dayOfMonth: effectiveDayOfMonth,
    user: { $in: recipients.map((r) => r._id) },
  })
    .select('user')
    .lean();
  const alreadySent = new Set(existingLogs.map((log) => String(log.user)));

  let sent = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    const campaign = templates.promotionalCampaign({
      month: effectiveMonth,
      name: recipient.name,
      clientUrl: effectiveClientUrl,
    });

    const wasSent = alreadySent.has(String(recipient._id));
    if (!forceSend && wasSent) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      sent += 1;
      continue;
    }

    sendEmailAsync({
      email: recipient.email,
      subject: campaign.subject,
      message: campaign.html,
    });

    await PromotionalEmailLog.updateOne(
      { user: recipient._id, year: effectiveYear, month: effectiveMonth, dayOfMonth: effectiveDayOfMonth },
      {
        $set: {
          campaignSubject: campaign.subject,
          sentAt: new Date(),
        },
        $setOnInsert: {
          user: recipient._id,
          year: effectiveYear,
          month: effectiveMonth,
          dayOfMonth: effectiveDayOfMonth,
        },
      },
      { upsert: true }
    );

    sent += 1;
  }

  return {
    month: effectiveMonth,
    year: effectiveYear,
    dayOfMonth: effectiveDayOfMonth,
    total: recipients.length,
    sent,
    skipped,
    dryRun,
    forceSend,
  };
};

module.exports = {
  sendMonthlyPromotionalEmails,
};
