const User = require('../models/User');
const BirthdayEmailLog = require('../models/BirthdayEmailLog');
const templates = require('./emailTemplates');
const { sendEmailAsync } = require('./emailService');

// ---------------------------------------------------------------------------
// Birthday email service
// Finds verified users with a matching birthday and ensures one send per year.
// ---------------------------------------------------------------------------

const normalizeDateParts = (date = new Date()) => ({
  day: date.getUTCDate(),
  month: date.getUTCMonth() + 1,
  year: date.getUTCFullYear(),
});

const sendDailyBirthdayEmails = async ({ date, clientUrl, forceSend = false, dryRun = false } = {}) => {
  const effectiveDate = date instanceof Date ? date : new Date(date || Date.now());

  if (Number.isNaN(effectiveDate.getTime())) {
    throw new Error('Invalid date provided for birthday email job');
  }

  const { day, month, year } = normalizeDateParts(effectiveDate);
  const effectiveClientUrl = clientUrl || process.env.CLIENT_URL || 'http://localhost:5173';

  // Birthdays are limited to verified users so the message reflects trusted, completed accounts.
  const recipients = await User.find({
    emailVerified: true,
    email: { $exists: true, $ne: '' },
    dob: { $type: 'date' },
  })
    .select('_id name email dob')
    .lean();

  // Match on UTC month/day so yearly comparisons stay stable across server restarts.
  const matchingRecipients = recipients.filter((recipient) => {
    const dob = new Date(recipient.dob);
    return dob.getUTCDate() === day && dob.getUTCMonth() + 1 === month;
  });

  if (!matchingRecipients.length) {
    return { date: effectiveDate.toISOString(), total: 0, sent: 0, skipped: 0, dryRun };
  }

  const existingLogs = await BirthdayEmailLog.find({
    year,
    user: { $in: matchingRecipients.map((recipient) => recipient._id) },
  })
    .select('user')
    .lean();
  const alreadySent = new Set(existingLogs.map((log) => String(log.user)));

  let sent = 0;
  let skipped = 0;

  for (const recipient of matchingRecipients) {
    const campaign = templates.birthdayWish({
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

    await BirthdayEmailLog.updateOne(
      { user: recipient._id, year },
      {
        $set: {
          birthdaySubject: campaign.subject,
          sentAt: new Date(),
        },
        $setOnInsert: {
          user: recipient._id,
          year,
        },
      },
      { upsert: true }
    );

    sent += 1;
  }

  return {
    date: effectiveDate.toISOString(),
    total: matchingRecipients.length,
    sent,
    skipped,
    dryRun,
    forceSend,
  };
};

module.exports = {
  sendDailyBirthdayEmails,
};
