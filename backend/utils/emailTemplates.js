const wrapEmail = ({ title, subtitle, body, accent = '#0f6fff', footerNote }) => {
  return `
    <div style="margin:0;padding:24px;background:#f3f6fb;font-family:Arial,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(120deg,${accent},#0b1220);padding:26px;color:#fff;">
          <h1 style="margin:0;font-size:24px;line-height:1.2;">${title}</h1>
          <p style="margin:8px 0 0;opacity:.9;font-size:14px;">${subtitle}</p>
        </div>
        <div style="padding:24px 22px;font-size:14px;line-height:1.65;color:#1f2937;">
          ${body}
        </div>
        <div style="padding:14px 22px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
          ${footerNote || 'BidPulse - Verified, office-inspected, transparent bidding'}
        </div>
      </div>
    </div>
  `;
};

const PROMOTIONAL_CAMPAIGNS = [
  { month: 1, subject: 'January Kickoff: Verified Deals to Start the Year', title: 'January Promotion', subtitle: 'Start the year with office-verified premium listings', body: 'Browse newly verified products and register early to lock your queue advantage this month.', accent: '#2563eb' },
  { month: 2, subject: 'February Spotlight: Limited Future Bids Open', title: 'February Promotion', subtitle: 'High-interest listings are now open for registration', body: 'Future Bids are filling quickly. Register before windows close and stay ready for live sessions.', accent: '#dc2626' },
  { month: 3, subject: 'March Momentum: Upgrade Season Starts on BidPulse', title: 'March Promotion', subtitle: 'Spring inventory refresh with verified electronics and collectibles', body: 'Track your categories, compare history, and register for products that match your upgrade plan.', accent: '#059669' },
  { month: 4, subject: 'April Advantage: Smart Bidders Register Earlier', title: 'April Promotion', subtitle: 'Queue position matters when live bidding opens', body: 'Early registration can improve bidding entry priority. Reserve your spot for upcoming listings now.', accent: '#7c3aed' },
  { month: 5, subject: 'May Drop: New Verified Listings Released', title: 'May Promotion', subtitle: 'Fresh catalog updates are live in Future Bids', body: 'Explore newly approved listings and monitor products that align with your budget targets.', accent: '#0f766e' },
  { month: 6, subject: 'June Mid-Year Deals: Bid with Confidence', title: 'June Promotion', subtitle: 'Transparent auction flow with real-time visibility', body: 'Join ongoing sessions as a spectator, review history, and prepare your next winning bid.', accent: '#1d4ed8' },
  { month: 7, subject: 'July Priority Access: Best Upcoming Bids', title: 'July Promotion', subtitle: 'Registration-first strategy for serious bidders', body: 'High-demand products are opening this month. Register early to secure strong bidding sequence.', accent: '#ea580c' },
  { month: 8, subject: 'August Insider List: Top Performing Categories', title: 'August Promotion', subtitle: 'Trending categories are seeing faster completion', body: 'Review category performance from previous bids and position yourself for upcoming opportunities.', accent: '#0f766e' },
  { month: 9, subject: 'September Power Bids: Verified Listings Expanding', title: 'September Promotion', subtitle: 'More approved inventory and active registration windows', body: 'Shortlist your target listings and register before deadlines to avoid missing prime sessions.', accent: '#0369a1' },
  { month: 10, subject: 'October Premium Cycle: High-Value Bidding Week', title: 'October Promotion', subtitle: 'Get ahead with pre-planned registration and budget strategy', body: 'Use previous bid history to set your thresholds and execute smarter live bidding decisions.', accent: '#7c2d12' },
  { month: 11, subject: 'November Peak Season: Register for Priority Bids', title: 'November Promotion', subtitle: 'Peak inventory demand is now active', body: 'Competition rises this month. Register early and track notifications for each target product.', accent: '#9333ea' },
  { month: 12, subject: 'December Year-End Event: Final Verified Deals', title: 'December Promotion', subtitle: 'Close the year with trusted bidding opportunities', body: 'Join year-end sessions and review your annual bidding performance in your dashboard.', accent: '#0284c7' },
];

const getPromotionalCampaignByMonth = (month) =>
  PROMOTIONAL_CAMPAIGNS.find((campaign) => campaign.month === month) || PROMOTIONAL_CAMPAIGNS[0];

const templates = {
  welcome: ({ name, clientUrl }) =>
    wrapEmail({
      title: `Welcome to BidPulse, ${name}!`,
      subtitle: 'Your bidding account is ready',
      body: `<p>You are now part of a verified bidding network.</p>
             <p><a href="${clientUrl}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Open BidPulse</a> and explore upcoming bids.</p>`,
      accent: '#0f6fff',
    }),

  emailOtp: ({ otp }) =>
    wrapEmail({
      title: 'Verify Your Email',
      subtitle: 'Use this one-time code to activate registration and bidding',
      body: `<p>Your verification code:</p>
             <div style="font-size:30px;font-weight:800;letter-spacing:6px;color:#0f6fff;background:#eff6ff;padding:12px 16px;border-radius:12px;display:inline-block;">${otp}</div>
             <p style="margin-top:14px;">Code expires in 5 minutes.</p>`,
      accent: '#2563eb',
    }),

  profileVerificationOtp: ({ otp }) =>
    wrapEmail({
      title: 'Verify Your BidPulse Profile',
      subtitle: 'Use this one-time code to complete your account verification',
      body: `<p>Your profile verification code:</p>
             <div style="font-size:30px;font-weight:800;letter-spacing:6px;color:#0f6fff;background:#eff6ff;padding:12px 16px;border-radius:12px;display:inline-block;">${otp}</div>
             <p style="margin-top:14px;">Code expires in 5 minutes.</p>`,
      accent: '#2563eb',
    }),

  profileVerificationLink: ({ verificationUrl }) =>
    wrapEmail({
      title: 'Complete Your Profile Verification',
      subtitle: 'Use the secure link below to confirm your identity details',
      body: `<p>Your profile details are ready for confirmation.</p>
             <p><a href="${verificationUrl}" style="display:inline-block;background:#0f6fff;color:#ffffff;padding:12px 18px;border-radius:12px;font-weight:700;text-decoration:none;">Verify My Profile</a></p>
             <p style="margin-top:14px;">This verification link expires in 5 minutes.</p>`,
      accent: '#2563eb',
    }),

  profileVerified: ({ name, clientUrl }) =>
    wrapEmail({
      title: `Profile Verified, ${name}`,
      subtitle: 'Your BidPulse account is now ready for bidding and selling',
      body: `<p>Your profile verification is complete.</p>
             <p><a href="${clientUrl}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Open BidPulse</a> to start exploring auctions.</p>`,
      accent: '#059669',
    }),

  supportCreated: ({ ticketId }) =>
    wrapEmail({
      title: 'Support Ticket Received',
      subtitle: 'Our support team has your request',
      body: `<p>Your ticket ID is <b>${ticketId}</b>.</p><p>We will follow up soon with updates.</p>`,
      accent: '#7c3aed',
    }),

  supportStatus: ({ ticketId, status }) =>
    wrapEmail({
      title: 'Support Ticket Update',
      subtitle: `Ticket ${ticketId} is now ${status.replace('_', ' ')}`,
      body: `<p>Your support request status changed to <b>${status}</b>.</p>
             <p>Reply to this email if you need additional assistance.</p>`,
      accent: status === 'resolved' ? '#059669' : '#f59e0b',
    }),

  listingSubmitted: ({ title }) =>
    wrapEmail({
      title: 'Listing Submitted for Verification',
      subtitle: 'Our team will inspect your product before publishing',
      body: `<p><b>${title}</b> has been received.</p><p>Bring the product to the BidPulse office for physical verification.</p>`,
      accent: '#0f766e',
    }),

  listingApproved: ({ title, registrationEndAt }) =>
    wrapEmail({
      title: 'Listing Approved',
      subtitle: 'Your product is now open for bidder registration',
      body: `<p><b>${title}</b> is now visible in Future Bids.</p>
             <p>Registration closes at: <b>${new Date(registrationEndAt).toLocaleString()}</b></p>`,
      accent: '#059669',
    }),

  listingDisapproved: ({ title, reason }) =>
    wrapEmail({
      title: 'Listing Disapproved',
      subtitle: title,
      body: `<p>Your listing did not pass verification.</p>
             <p><b>Reason:</b> ${reason}</p>
             <p>You may correct the issue and submit again.</p>`,
      accent: '#b91c1c',
    }),

  listingConfirmed: ({ title, startingPrice, endTime }) =>
    wrapEmail({
      title: 'Listing Confirmed',
      subtitle: 'Your listing has been accepted',
      body: `<p><b>${title}</b> has been listed successfully.</p>
             <p>Starting price: <b>$${startingPrice}</b><br/>Window closes at: <b>${new Date(endTime).toLocaleString()}</b></p>`,
      accent: '#059669',
    }),

  outbid: ({ title, amount, link }) =>
    wrapEmail({
      title: 'You Have Been Outbid',
      subtitle: `A new bid was placed on ${title}`,
      body: `<p>Current highest bid: <b>$${amount}</b></p>
             <p><a href="${link}" style="color:#dc2626;font-weight:700;text-decoration:none;">Join the session</a></p>`,
      accent: '#dc2626',
    }),

  biddingStartsSoon: ({ title, startAt, link }) =>
    wrapEmail({
      title: 'Bidding Starts in 5 Minutes',
      subtitle: title,
      body: `<p>Registration is closing and your bidding room will open soon.</p>
             <p>Start time: <b>${new Date(startAt).toLocaleString()}</b></p>
             <p><a href="${link}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Open bidding room</a></p>`,
      accent: '#1d4ed8',
    }),

  noRegistrationOutcome: ({ title }) =>
    wrapEmail({
      title: 'No Bidder Registrations Received',
      subtitle: title,
      body: `<p>Your listing did not receive any bidder registration.</p>
             <p>You can now withdraw the product ($9.99 fee) or reduce starting amount and relist ($14.99 fee).</p>`,
      accent: '#9a3412',
    }),

  paymentReceipt: ({ title, amount }) =>
    wrapEmail({
      title: 'Payment Received',
      subtitle: 'BidPulse will now handle shipping directly',
      body: `<p>Payment for <b>${title}</b> was successful.</p>
             <p>Amount: <b>$${amount}</b></p>
             <p>Delivery estimate: <b>7-14 days</b>. After delivery, confirm receipt in your dashboard.</p>`,
      accent: '#0f6fff',
    }),

  fundsReleased: ({ title, sellerPayout }) =>
    wrapEmail({
      title: 'Funds Released',
      subtitle: `Your sale for ${title} has been completed`,
      body: `<p><b>$${sellerPayout}</b> has been released to your connected payout account.</p>`,
      accent: '#059669',
    }),

  sellerPaid: ({ title, grossAmount, sellerPayout, commission }) =>
    wrapEmail({
      title: 'Seller Payout Completed',
      subtitle: `BidPulse sale settlement for ${title}`,
      body: `<p>Winning amount: <b>$${grossAmount}</b></p>
             <p>BidPulse commission (5%): <b>$${commission}</b></p>
             <p>Final payout sent to seller: <b>$${sellerPayout}</b></p>`,
      accent: '#059669',
    }),

  shippingStarted: ({ title, minDays, maxDays, link }) =>
    wrapEmail({
      title: 'Shipping In Progress',
      subtitle: title,
      body: `<p>BidPulse has started fulfillment for your winning product.</p>
             <p>Expected delivery window: <b>${minDays}-${maxDays} days</b>.</p>
             <p>After delivery, confirm receipt here: <a href="${link}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Open order details</a></p>`,
      accent: '#0369a1',
    }),

  productReceivedConfirmed: ({ title }) =>
    wrapEmail({
      title: 'Order Completed',
      subtitle: title,
      body: '<p>Buyer confirmed product receipt. This auction lifecycle is now closed.</p>',
      accent: '#0f766e',
    }),

  paymentFailed: ({ title, reason, link }) =>
    wrapEmail({
      title: 'Payment Attempt Failed',
      subtitle: title,
      body: `<p>Your payment attempt could not be completed.</p>
             <p><b>Reason:</b> ${reason || 'Payment provider declined or interrupted the transaction.'}</p>
             <p>Please retry payment from: <a href="${link}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Auction details</a></p>`,
      accent: '#b91c1c',
    }),

  auctionWon: ({ title, currentPrice, link }) =>
    wrapEmail({
      title: 'You Won The Bid!',
      subtitle: title,
      body: `<p>Final winning amount: <b>$${currentPrice}</b></p>
             <p><a href="${link}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Proceed to payment</a></p>`,
      accent: '#7c3aed',
    }),

  itemSold: ({ title, currentPrice }) =>
    wrapEmail({
      title: 'Item Sold',
      subtitle: `Your listing ${title} has ended`,
      body: `<p>Final amount: <b>$${currentPrice}</b></p><p>Winner payment is expected next.</p>`,
      accent: '#059669',
    }),

  auctionClosedParticipant: ({ title, winnerName, finalAmount }) =>
    wrapEmail({
      title: 'Bidding Session Closed',
      subtitle: title,
      body: `<p>Final winner: <b>${winnerName}</b></p><p>Winning amount: <b>$${finalAmount}</b></p>`,
      accent: '#374151',
    }),

  promotionalCampaign: ({ month, name, clientUrl }) => {
    const campaign = getPromotionalCampaignByMonth(month);
    return {
      subject: campaign.subject,
      html: wrapEmail({
        title: `${campaign.title}${name ? ` - Hi ${name}` : ''}`,
        subtitle: campaign.subtitle,
        body: `<p>${campaign.body}</p>
               <p><a href="${clientUrl}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Open BidPulse</a> to explore current opportunities.</p>`,
        accent: campaign.accent,
      }),
    };
  },
};

module.exports = templates;

