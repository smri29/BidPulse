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
          ${footerNote || 'BidPulse • Secure auctions with escrow confidence'}
        </div>
      </div>
    </div>
  `;
};

const templates = {
  welcome: ({ name, clientUrl }) =>
    wrapEmail({
      title: `Welcome to BidPulse, ${name}!`,
      subtitle: 'Your premium auction account is ready',
      body: `<p>You're now part of a verified, real-time auction network.</p>
             <p><a href="${clientUrl}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Open BidPulse</a> and start exploring exclusive listings.</p>`,
      accent: '#0f6fff',
    }),

  emailOtp: ({ otp }) =>
    wrapEmail({
      title: 'Verify Your Email',
      subtitle: 'Use this one-time code to activate bidding and listing',
      body: `<p>Your verification code:</p>
             <div style="font-size:30px;font-weight:800;letter-spacing:6px;color:#0f6fff;background:#eff6ff;padding:12px 16px;border-radius:12px;display:inline-block;">${otp}</div>
             <p style="margin-top:14px;">Code expires in 5 minutes.</p>`,
      accent: '#2563eb',
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

  listingConfirmed: ({ title, startingPrice, endTime }) =>
    wrapEmail({
      title: 'Listing Confirmed',
      subtitle: 'Your auction is now live',
      body: `<p><b>${title}</b> has been listed successfully.</p>
             <p>Starting price: <b>$${startingPrice}</b><br/>Ends at: <b>${new Date(endTime).toLocaleString()}</b></p>`,
      accent: '#059669',
    }),

  outbid: ({ title, amount, link }) =>
    wrapEmail({
      title: 'You Have Been Outbid',
      subtitle: `A new bid was placed on ${title}`,
      body: `<p>Current highest bid: <b>$${amount}</b></p>
             <p><a href="${link}" style="color:#dc2626;font-weight:700;text-decoration:none;">Place another bid now</a></p>`,
      accent: '#dc2626',
    }),

  paymentReceipt: ({ title, amount }) =>
    wrapEmail({
      title: 'Payment Received',
      subtitle: 'Funds are now held safely in escrow',
      body: `<p>Payment for <b>${title}</b> was successful.</p><p>Amount: <b>$${amount}</b></p>`,
      accent: '#0f6fff',
    }),

  fundsReleased: ({ title, sellerPayout }) =>
    wrapEmail({
      title: 'Funds Released',
      subtitle: `Your sale for ${title} has been completed`,
      body: `<p><b>$${sellerPayout}</b> has been released to your connected payout account.</p>`,
      accent: '#059669',
    }),

  auctionWon: ({ title, currentPrice, link }) =>
    wrapEmail({
      title: 'You Won The Auction!',
      subtitle: title,
      body: `<p>Final winning amount: <b>$${currentPrice}</b></p>
             <p><a href="${link}" style="color:#0f6fff;font-weight:700;text-decoration:none;">Proceed to payment</a></p>`,
      accent: '#7c3aed',
    }),

  itemSold: ({ title, currentPrice }) =>
    wrapEmail({
      title: 'Item Sold',
      subtitle: `Your auction ${title} has ended`,
      body: `<p>Final amount: <b>$${currentPrice}</b></p><p>Buyer payment is awaited in escrow.</p>`,
      accent: '#059669',
    }),
};

module.exports = templates;
