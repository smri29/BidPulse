const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const button = (label, href, background = '#0f6fff') =>
  `<a href="${href}" style="display:inline-block;background:${background};color:#ffffff;padding:13px 20px;border-radius:999px;font-weight:700;text-decoration:none;">${label}</a>`;

const infoPill = (label, value) => `
  <div style="display:inline-block;min-width:160px;margin:0 10px 10px 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;vertical-align:top;">
    <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">${label}</div>
    <div style="font-size:15px;font-weight:700;color:#0f172a;">${value}</div>
  </div>
`;

const wrapEmail = ({ title, subtitle, body, accent = '#0f6fff', footerNote, eyebrow = 'AuctionPulse' }) => {
  return `
    <div style="margin:0;padding:32px 16px;background:#e8eef7;font-family:Arial,sans-serif;color:#111827;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #dbe4f0;box-shadow:0 24px 80px rgba(15,23,42,.12);">
        <div style="padding:22px 28px 0;background:
          radial-gradient(circle at top right, rgba(255,255,255,.18), transparent 35%),
          linear-gradient(135deg, ${accent} 0%, #10203a 58%, #09111f 100%);
          color:#fff;">
          <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.16);font-size:11px;letter-spacing:.14em;text-transform:uppercase;">
            ${eyebrow}
          </div>
          <h1 style="margin:18px 0 10px;font-size:31px;line-height:1.12;max-width:520px;">${title}</h1>
          <p style="margin:0 0 24px;max-width:520px;opacity:.92;font-size:15px;line-height:1.7;">${subtitle}</p>
          <div style="height:10px;background:linear-gradient(90deg, rgba(255,255,255,.34), rgba(255,255,255,0));border-top-left-radius:12px;border-top-right-radius:12px;"></div>
        </div>
        <div style="padding:30px 28px 20px;font-size:15px;line-height:1.72;color:#1f2937;">
          ${body}
        </div>
        <div style="padding:18px 28px 22px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.7;">
          <div style="font-weight:700;color:#0f172a;margin-bottom:4px;">AuctionPulse</div>
          <div>${footerNote || 'Verified, office-inspected, transparent auctions for trusted buyers and sellers.'}</div>
        </div>
      </div>
    </div>
  `;
};

const PROMOTIONAL_CAMPAIGNS = [
  { month: 1, subject: 'January Kickoff: Verified Deals to Start the Year', title: 'January Promotion', subtitle: 'Start the year with office-verified premium listings', body: 'Browse newly verified products and register early to lock your queue advantage this month.', accent: '#2563eb' },
  { month: 2, subject: 'February Spotlight: Limited Upcoming Auctions Open', title: 'February Promotion', subtitle: 'High-interest listings are now open for registration', body: 'Upcoming auctions are filling quickly. Register before windows close and stay ready for live sessions.', accent: '#dc2626' },
  { month: 3, subject: 'March Momentum: Upgrade Season Starts on AuctionPulse', title: 'March Promotion', subtitle: 'Spring inventory refresh with verified electronics and collectibles', body: 'Track your categories, compare history, and register for products that match your upgrade plan.', accent: '#059669' },
  { month: 4, subject: 'April Advantage: Early Registrations Open Stronger Access', title: 'April Promotion', subtitle: 'Queue position matters when live auctions open', body: 'Early registration can improve entry priority. Reserve your spot for upcoming listings now.', accent: '#7c3aed' },
  { month: 5, subject: 'May Drop: New Verified Listings Released', title: 'May Promotion', subtitle: 'Fresh catalog updates are live in upcoming auctions', body: 'Explore newly approved listings and monitor products that align with your budget targets.', accent: '#0f766e' },
  { month: 6, subject: 'June Mid-Year Deals: Join with Confidence', title: 'June Promotion', subtitle: 'Transparent auction flow with real-time visibility', body: 'Join ongoing sessions as a spectator, review history, and prepare your next winning offer.', accent: '#1d4ed8' },
  { month: 7, subject: 'July Priority Access: Best Upcoming Auctions', title: 'July Promotion', subtitle: 'Registration-first strategy for serious buyers', body: 'High-demand products are opening this month. Register early to secure a strong participation sequence.', accent: '#ea580c' },
  { month: 8, subject: 'August Insider List: Top Performing Categories', title: 'August Promotion', subtitle: 'Trending categories are seeing faster completion', body: 'Review category performance from previous bids and position yourself for upcoming opportunities.', accent: '#0f766e' },
  { month: 9, subject: 'September Power Auctions: Verified Listings Expanding', title: 'September Promotion', subtitle: 'More approved inventory and active registration windows', body: 'Shortlist your target listings and register before deadlines to avoid missing prime sessions.', accent: '#0369a1' },
  { month: 10, subject: 'October Premium Cycle: High-Value Auction Week', title: 'October Promotion', subtitle: 'Get ahead with pre-planned registration and budget strategy', body: 'Use previous activity history to set your thresholds and execute smarter live auction decisions.', accent: '#7c2d12' },
  { month: 11, subject: 'November Peak Season: Register for Priority Access', title: 'November Promotion', subtitle: 'Peak inventory demand is now active', body: 'Competition rises this month. Register early and track notifications for each target product.', accent: '#9333ea' },
  { month: 12, subject: 'December Year-End Event: Final Verified Deals', title: 'December Promotion', subtitle: 'Close the year with trusted auction opportunities', body: 'Join year-end sessions and review your annual auction activity in your dashboard.', accent: '#0284c7' },
];

const getPromotionalCampaignByMonth = (month) =>
  PROMOTIONAL_CAMPAIGNS.find((campaign) => campaign.month === month) || PROMOTIONAL_CAMPAIGNS[0];

const templates = {
  welcome: ({ name, clientUrl }) =>
    wrapEmail({
      title: `Welcome to AuctionPulse, ${escapeHtml(name)}!`,
      subtitle: 'Your auction account is ready',
      body: `<p>You are now part of a trusted auction network built around transparent auction flow and verified listings.</p>
             <p style="margin:20px 0 0;">${button('Open AuctionPulse', clientUrl)}</p>`,
      accent: '#0f6fff',
    }),

  emailOtp: ({ otp }) =>
    wrapEmail({
      title: 'Verify Your Email',
      subtitle: 'Use this one-time code to activate registration and participation',
      body: `<p>Your verification code:</p>
             <div style="font-size:30px;font-weight:800;letter-spacing:6px;color:#0f6fff;background:#eff6ff;padding:12px 16px;border-radius:12px;display:inline-block;">${otp}</div>
             <p style="margin-top:14px;">Code expires in 5 minutes.</p>`,
      accent: '#2563eb',
      eyebrow: 'Security',
    }),

  profileVerificationOtp: ({ otp }) =>
    wrapEmail({
      title: 'Verify Your AuctionPulse Profile',
      subtitle: 'Use this one-time code to complete your account verification',
      body: `<p>Your profile verification code:</p>
             <div style="font-size:30px;font-weight:800;letter-spacing:6px;color:#0f6fff;background:#eff6ff;padding:12px 16px;border-radius:12px;display:inline-block;">${otp}</div>
             <p style="margin-top:14px;">Code expires in 5 minutes.</p>`,
      accent: '#2563eb',
      eyebrow: 'Security',
    }),

  profileVerificationLink: ({ verificationUrl }) =>
    wrapEmail({
      title: 'Complete Your Profile Verification',
      subtitle: 'Use the secure link below to confirm your identity details',
      body: `<p>Your profile details are ready for confirmation.</p>
             <p style="margin:20px 0;">${button('Verify My Profile', verificationUrl)}</p>
             <p>This verification link expires in 5 minutes.</p>`,
      accent: '#2563eb',
      eyebrow: 'Security',
    }),

  resetPassword: ({ resetUrl }) =>
    wrapEmail({
      title: 'Reset Your Password',
      subtitle: 'Secure access recovery for your AuctionPulse account',
      body: `<p>We received a request to reset your password.</p>
             <p style="margin:20px 0;">${button('Reset Password', resetUrl, '#7c3aed')}</p>
             <p>This secure link expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>`,
      accent: '#7c3aed',
      eyebrow: 'Security',
    }),

  profileVerified: ({ name, clientUrl }) =>
    wrapEmail({
      title: `Profile Verified, ${escapeHtml(name)}`,
      subtitle: 'Your AuctionPulse account is now ready for auction participation and selling',
      body: `<p>Your profile verification is complete.</p>
             <div style="margin:18px 0 6px;">
               ${infoPill('Status', 'Verified')}
               ${infoPill('Access', 'Auction & Sell Enabled')}
             </div>
             <p style="margin:20px 0 0;">${button('Open AuctionPulse', clientUrl, '#059669')}</p>`,
      accent: '#059669',
      eyebrow: 'Account Update',
    }),

  birthdayWish: ({ name, clientUrl }) => ({
    subject: `Happy Birthday${name ? `, ${name}` : ''}!`,
    html: wrapEmail({
      title: `Happy Birthday${name ? `, ${escapeHtml(name)}` : ''}!`,
      subtitle: 'Wishing you a wonderful year ahead from everyone at AuctionPulse',
      body: `<p>Today is about celebrating you. Thank you for being part of the AuctionPulse community.</p>
             <div style="margin:18px 0 6px;">
               ${infoPill('Occasion', 'Birthday Celebration')}
               ${infoPill('From', 'Team AuctionPulse')}
             </div>
             <p>We hope the year ahead brings you exciting wins, smooth selling, and a lot to celebrate.</p>
             <p style="margin:20px 0 0;">${button('Visit AuctionPulse', clientUrl, '#ec4899')}</p>`,
      accent: '#ec4899',
      eyebrow: 'Celebration',
      footerNote: 'Birthday wishes from AuctionPulse. Enjoy your day and celebrate safely.',
    }),
  }),

  supportCreated: ({ ticketId }) =>
    wrapEmail({
      title: 'Support Ticket Received',
      subtitle: 'Our support team has your request',
      body: `<p>Your ticket ID is <b>${ticketId}</b>.</p><p>We will follow up soon with updates.</p>`,
      accent: '#7c3aed',
      eyebrow: 'Support',
    }),

  supportStatus: ({ ticketId, status }) =>
    wrapEmail({
      title: 'Support Ticket Update',
      subtitle: `Ticket ${ticketId} is now ${status.replace('_', ' ')}`,
      body: `<p>Your support request status changed to <b>${status}</b>.</p>
             <p>Reply to this email if you need additional assistance.</p>`,
      accent: status === 'resolved' ? '#059669' : '#f59e0b',
      eyebrow: 'Support',
    }),

  listingSubmitted: ({ title }) =>
    wrapEmail({
      title: 'Listing Submitted for Verification',
      subtitle: 'Our team will inspect your product before publishing',
      body: `<p><b>${title}</b> has been received.</p><p>Bring the product to the AuctionPulse office for physical verification.</p>`,
      accent: '#0f766e',
      eyebrow: 'Seller Update',
    }),

  listingApproved: ({ title, registrationEndAt }) =>
    wrapEmail({
      title: 'Listing Approved',
      subtitle: 'Your product is now open for participant registration',
      body: `<p><b>${title}</b> is now visible in upcoming auctions.</p>
             <p>Registration closes at: <b>${new Date(registrationEndAt).toLocaleString()}</b></p>`,
      accent: '#059669',
      eyebrow: 'Seller Update',
    }),

  listingDisapproved: ({ title, reason }) =>
    wrapEmail({
      title: 'Listing Disapproved',
      subtitle: title,
      body: `<p>Your listing did not pass verification.</p>
             <p><b>Reason:</b> ${reason}</p>
             <p>You may correct the issue and submit again.</p>`,
      accent: '#b91c1c',
      eyebrow: 'Seller Update',
    }),

  listingConfirmed: ({ title, startingPrice, endTime }) =>
    wrapEmail({
      title: 'Listing Confirmed',
      subtitle: 'Your listing has been accepted',
      body: `<p><b>${title}</b> has been listed successfully.</p>
             <p>Starting price: <b>$${startingPrice}</b><br/>Window closes at: <b>${new Date(endTime).toLocaleString()}</b></p>`,
      accent: '#059669',
      eyebrow: 'Seller Update',
    }),

  outbid: ({ title, amount, link }) =>
    wrapEmail({
      title: 'You Have Been Outbid',
      subtitle: `A new offer was placed on ${title}`,
      body: `<p>Current highest offer: <b>$${amount}</b></p>
             <p style="margin:20px 0 0;">${button('Join the Session', link, '#dc2626')}</p>`,
      accent: '#dc2626',
      eyebrow: 'Auction Alert',
    }),

  biddingStartsSoon: ({ title, startAt, link }) =>
    wrapEmail({
      title: 'Auction Starts in 5 Minutes',
      subtitle: title,
      body: `<p>Registration is closing and your live auction room will open soon.</p>
             <p>Start time: <b>${new Date(startAt).toLocaleString()}</b></p>
             <p style="margin:20px 0 0;">${button('Open Auction Room', link, '#1d4ed8')}</p>`,
      accent: '#1d4ed8',
      eyebrow: 'Auction Alert',
    }),

  noRegistrationOutcome: ({ title }) =>
    wrapEmail({
      title: 'No Participant Registrations Received',
      subtitle: title,
      body: `<p>Your listing did not receive any participant registration.</p>
             <p>You can now withdraw the product ($9.99 fee) or reduce starting amount and relist ($14.99 fee).</p>`,
      accent: '#9a3412',
      eyebrow: 'Seller Update',
    }),

  paymentReceipt: ({ title, amount }) =>
    wrapEmail({
      title: 'Payment Received',
      subtitle: 'AuctionPulse will now handle shipping directly',
      body: `<p>Payment for <b>${title}</b> was successful.</p>
             <p>Amount: <b>$${amount}</b></p>
             <p>Delivery estimate: <b>7-14 days</b>. After delivery, confirm receipt in your dashboard.</p>`,
      accent: '#0f6fff',
      eyebrow: 'Payment',
    }),

  fundsReleased: ({ title, sellerPayout }) =>
    wrapEmail({
      title: 'Funds Released',
      subtitle: `Your sale for ${title} has been completed`,
      body: `<p><b>$${sellerPayout}</b> has been released to your connected payout account.</p>`,
      accent: '#059669',
      eyebrow: 'Payment',
    }),

  sellerPaid: ({ title, grossAmount, sellerPayout, commission }) =>
    wrapEmail({
      title: 'Seller Payout Completed',
      subtitle: `AuctionPulse sale settlement for ${title}`,
      body: `<p>Winning amount: <b>$${grossAmount}</b></p>
             <p>AuctionPulse commission (5%): <b>$${commission}</b></p>
             <p>Final payout sent to seller: <b>$${sellerPayout}</b></p>`,
      accent: '#059669',
      eyebrow: 'Payment',
    }),

  shippingStarted: ({ title, minDays, maxDays, link }) =>
    wrapEmail({
      title: 'Shipping In Progress',
      subtitle: title,
      body: `<p>AuctionPulse has started fulfillment for your winning product.</p>
             <p>Expected delivery window: <b>${minDays}-${maxDays} days</b>.</p>
             <p style="margin:20px 0 0;">${button('Open Order Details', link, '#0369a1')}</p>`,
      accent: '#0369a1',
      eyebrow: 'Shipping',
    }),

  productReceivedConfirmed: ({ title }) =>
    wrapEmail({
      title: 'Order Completed',
      subtitle: title,
      body: '<p>Buyer confirmed product receipt. This auction lifecycle is now closed.</p>',
      accent: '#0f766e',
      eyebrow: 'Shipping',
    }),

  paymentFailed: ({ title, reason, link }) =>
    wrapEmail({
      title: 'Payment Attempt Failed',
      subtitle: title,
      body: `<p>Your payment attempt could not be completed.</p>
             <p><b>Reason:</b> ${reason || 'Payment provider declined or interrupted the transaction.'}</p>
             <p style="margin:20px 0 0;">${button('Return to Auction', link, '#b91c1c')}</p>`,
      accent: '#b91c1c',
      eyebrow: 'Payment',
    }),

  auctionWon: ({ title, currentPrice, link }) =>
    wrapEmail({
      title: 'You Won The Auction!',
      subtitle: title,
      body: `<p>Final winning amount: <b>$${currentPrice}</b></p>
             <p style="margin:20px 0 0;">${button('Proceed to Payment', link, '#7c3aed')}</p>`,
      accent: '#7c3aed',
      eyebrow: 'Auction Result',
    }),

  itemSold: ({ title, currentPrice }) =>
    wrapEmail({
      title: 'Item Sold',
      subtitle: `Your listing ${title} has ended`,
      body: `<p>Final amount: <b>$${currentPrice}</b></p><p>Winner payment is expected next.</p>`,
      accent: '#059669',
      eyebrow: 'Auction Result',
    }),

  auctionClosedParticipant: ({ title, winnerName, finalAmount }) =>
    wrapEmail({
      title: 'Auction Session Closed',
      subtitle: title,
      body: `<p>Final winner: <b>${winnerName}</b></p><p>Winning amount: <b>$${finalAmount}</b></p>`,
      accent: '#374151',
      eyebrow: 'Auction Result',
    }),

  promotionalCampaign: ({ month, name, clientUrl }) => {
    const campaign = getPromotionalCampaignByMonth(month);
    return {
      subject: campaign.subject,
      html: wrapEmail({
        title: `${campaign.title}${name ? ` for ${escapeHtml(name)}` : ''}`,
        subtitle: campaign.subtitle,
        body: `<p>${campaign.body}</p>
               <div style="margin:18px 0 6px;">
                 ${infoPill('Campaign Month', campaign.title.replace(' Promotion', ''))}
                 ${infoPill('Schedule', '5th & 25th')}
               </div>
               <div style="margin:22px 0;padding:18px 18px;background:#0f172a;border-radius:22px;color:#e2e8f0;">
                 <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#93c5fd;">This Month on AuctionPulse</div>
                 <div style="margin-top:10px;font-size:16px;line-height:1.7;">Stay close to active listings, check upcoming registration windows, and keep your account ready for the next opportunity.</div>
               </div>
               <p style="margin:0;">${button('Explore AuctionPulse', clientUrl, campaign.accent)}</p>`,
        accent: campaign.accent,
        eyebrow: 'Promotional Update',
      }),
    };
  },
};

module.exports = templates;
