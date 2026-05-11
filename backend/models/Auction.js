const mongoose = require('mongoose');
const MIN_TEST_REGISTRATION_WINDOW_HOURS = 2 / 60;

const registrationSchema = new mongoose.Schema(
  {
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
      default: 10,
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
    feeSummary: {
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
