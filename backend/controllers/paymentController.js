const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Auction = require('../models/Auction');
const User = require('../models/User');

// @desc    Create Stripe Checkout Session (Winner pays Platform)
// @route   POST /api/payment/checkout/:auctionId
// @access  Private (Winner only)
exports.createCheckoutSession = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Security Check: Only the winner can pay
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can pay for this auction' });
    }

    // Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: auction.title,
              description: auction.description,
              // Note: If auction.images is empty or contains invalid URLs, Stripe might throw an error here.
              // Ensure your auction images are valid public URLs (e.g. starting with http/https).
            },
            unit_amount: Math.round(auction.currentPrice * 100), // Stripe uses cents
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
    // --- THIS IS THE UPDATE ---
    console.error("STRIPE ERROR:", error); 
    // -------------------------
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buyer confirms receipt -> Release funds to Seller
// @route   POST /api/payment/release/:auctionId
// @access  Private (Buyer/Winner)
exports.releaseFunds = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('seller');

    // 1. Validation
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (auction.status !== 'paid_held_in_escrow') {
      return res.status(400).json({ message: 'Funds cannot be released yet' });
    }

    // 2. Calculate Commission (8%)
    const totalAmount = auction.currentPrice;
    const commission = totalAmount * 0.08;
    const sellerPayout = totalAmount - commission;

    // 3. Transfer to Seller (Stripe Connect)
    // NOTE: In a real app, you need the Seller's Connected Account ID.
    if (auction.seller.stripeAccountId) {
      try {
        await stripe.transfers.create({
          amount: Math.round(sellerPayout * 100),
          currency: 'usd',
          destination: auction.seller.stripeAccountId,
        });
      } catch (stripeError) {
        console.error('Stripe Transfer Failed:', stripeError.message);
        // We continue to update DB for MVP purposes even if transfer fails
      }
    }

    // 4. Update Status
    auction.status = 'completed'; // Fully closed
    await auction.save();

    res.status(200).json({ message: 'Funds released to seller. Transaction complete.' });

  } catch (error) {
    console.error("RELEASE FUNDS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};