/**
 * Module: backend/controllers/admin/actions/triggerPromotionalCampaign.js
 * Purpose: Implements one focused controller action so endpoint behavior stays separated by responsibility.
 */
// ---------------------------------------------------------------------------
// Module: backend/controllers/admin/actions/triggerPromotionalCampaign.js
// Purpose: trigger Promotional Campaign
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const { sendMonthlyPromotionalEmails } = require('../../../utils/promotionalCampaignService');

const triggerPromotionalCampaign = async (req, res) => {
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

module.exports = triggerPromotionalCampaign;


