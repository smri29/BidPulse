const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Auction = require('../models/Auction');
const User = require('../models/User');
const sendEmail = require('../utils/emailService'); 

// @desc    Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  console.log("1. Payment Request Received for Auction:", req.params.auctionId);

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Server Error: Stripe Key Missing" });
    }

    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can pay for this auction' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: auction.title,
              description: auction.description ? auction.description.substring(0, 400) : "Auction Item",
            },
            unit_amount: Math.round(auction.currentPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auction/${auction._id}`,
      metadata: {
        auctionId: auction._id.toString(),
        winnerId: req.user.id.toString(),
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: error.message || "Payment Processing Failed" });
  }
};

// @desc    Buyer confirms receipt -> Release funds to Seller
exports.releaseFunds = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('seller');

    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (auction.status !== 'paid_held_in_escrow') {
      return res.status(400).json({ message: 'Funds cannot be released yet' });
    }

    const totalAmount = auction.currentPrice;
    const commission = totalAmount * 0.08;
    const sellerPayout = totalAmount - commission;

    if (auction.seller.stripeAccountId) {
      try {
        await stripe.transfers.create({
          amount: Math.round(sellerPayout * 100),
          currency: 'usd',
          destination: auction.seller.stripeAccountId,
        });
      } catch (stripeError) {
        console.error('Stripe Transfer Failed:', stripeError.message);
      }
    }

    auction.status = 'closed'; 
    await auction.save();

    // --- EMAIL TRIGGER: FUNDS RELEASED (SELLER) ---
    try {
        await sendEmail({
            email: auction.seller.email,
            subject: `Funds Released: ${auction.title}`,
            message: `
                <div style="font-family: Arial, sans-serif;">
                    <h1 style="color: #10b981;">Great News!</h1>
                    <p>The buyer has confirmed receipt of <b>${auction.title}</b>.</p>
                    <p><b>$${sellerPayout.toFixed(2)}</b> has been released to your Stripe account.</p>
                    <p>Thank you for using BidPulse!</p>
                </div>
            `
        });
        console.log("Email notification sent to seller.");
    } catch (emailError) {
        console.error("Email failed:", emailError);
    }
    // ---------------------------------------------

    res.status(200).json({ message: 'Funds released to seller. Transaction complete.' });

  } catch (error) {
    console.error("RELEASE FUNDS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};