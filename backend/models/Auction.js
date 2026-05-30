/**
 * Module: backend/models/Auction.js
 * Purpose: Defines a Mongoose data model used to persist this backend domain entity.
 */
const mongoose = require('mongoose');
const MIN_TEST_REGISTRATION_WINDOW_HOURS = 2 / 60;

// ---------------------------------------------------------------------------
// Auction model
// 1. Stores seller-submitted listing data
// 2. Tracks registration order and live-bidding queue state
// 3. Tracks payment, shipping, and lifecycle transitions
// ---------------------------------------------------------------------------

const registrationSchema = new mongoose.Schema(
  {
    // Sequence records registration order, which later drives room-opening priority.
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const bidSchema = new mongoose.Schema(
  {
    // Each bid captures bidder, amount, and the exact moment the offer was placed.
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  { _id: false }
);

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
    registrationWindowHours: {
      type: Number,
      min: MIN_TEST_REGISTRATION_WINDOW_HOURS,
      required: true,
    },
    registrationStartAt: {
      type: Date,
      default: Date.now,
    },
    registrationEndAt: {
      type: Date,
      required: true,
    },
    biddingStartedAt: {
      type: Date,
    },
    biddingEndedAt: {
      type: Date,
    },
    turnDurationSeconds: {
      type: Number,
      default: 20,
    },
    turnExpiresAt: {
      type: Date,
      default: null,
    },
    currentTurnBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
      default: null,
    },
    bids: [bidSchema],
    registrations: [registrationSchema],
    activeBidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    waitingBidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    gaveUpBidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: [
        'pending_verification',
        'future',
        'ongoing',
        'completed',
        'paid_shipping_pending',
        'paid_held_in_escrow',
        'closed',
        'no_registrations',
        'withdrawn',
        'disapproved',
      ],
      default: 'pending_verification',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNote: {
      type: String,
      default: '',
    },
    reminders: {
      registrationReminderSentAt: {
        type: Date,
        default: null,
      },
    },
    roomActivation: {
      // Before a live session starts, registered users receive a short rotating window to open the room.
      isActive: {
        type: Boolean,
        default: false,
      },
      currentBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      currentSequence: {
        type: Number,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      lastAssignedAt: {
        type: Date,
        default: null,
      },
      openedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      openedAt: {
        type: Date,
        default: null,
      },
    },
    feeSummary: {
      // These values are stored on each auction so business rules are snapshot with the listing.
      commissionRate: {
        type: Number,
        default: 0.05,
      },
      firstListingWithdrawalFee: {
        type: Number,
        default: 9.99,
      },
      relistFee: {
        type: Number,
        default: 14.99,
      },
      noRegistrationFeeApplied: {
        type: Number,
        default: 0,
      },
    },
    shippingDetails: {
      name: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    payment: {
      // Payment status tracks checkout creation, success, and failure independently of shipping state.
      status: {
        type: String,
        enum: ['pending', 'checkout_created', 'paid', 'failed'],
        default: 'pending',
      },
      amount: {
        type: Number,
        default: 0,
      },
      stripeSessionId: {
        type: String,
        default: '',
      },
      stripePaymentIntentId: {
        type: String,
        default: '',
      },
      paidAt: {
        type: Date,
        default: null,
      },
      lastFailureAt: {
        type: Date,
        default: null,
      },
      lastFailureReason: {
        type: String,
        default: '',
      },
      sellerPayoutAmount: {
        type: Number,
        default: 0,
      },
      commissionAmount: {
        type: Number,
        default: 0,
      },
      payoutStatus: {
        type: String,
        enum: ['pending', 'completed', 'manual_required', 'failed'],
        default: 'pending',
      },
      payoutAt: {
        type: Date,
        default: null,
      },
    },
    shipping: {
      // Shipping is owned by AuctionPulse after winner payment succeeds.
      status: {
        type: String,
        enum: ['pending_dispatch', 'in_transit', 'received_confirmed'],
        default: 'pending_dispatch',
      },
      expectedMinDays: {
        type: Number,
        default: 7,
      },
      expectedMaxDays: {
        type: Number,
        default: 14,
      },
      paidAt: {
        type: Date,
        default: null,
      },
      receivedConfirmedAt: {
        type: Date,
        default: null,
      },
      receivedConfirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

auctionSchema.index({ status: 1, registrationEndAt: 1 });
auctionSchema.index({ seller: 1, createdAt: -1 });
auctionSchema.index({ winner: 1, createdAt: -1 });
auctionSchema.index({ 'registrations.bidder': 1 });
auctionSchema.index({ createdAt: -1 });

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
