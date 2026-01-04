const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bids: [
      {
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: {
          type: Number,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'unsold', 'paid_held_in_escrow', 'closed'], 
      default: 'active',
    },
    // --- NEW: Shipping Details (Populated upon Checkout) ---
    shippingDetails: {
      name: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  }
);

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;