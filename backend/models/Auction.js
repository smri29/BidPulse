const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Electronics', 'Fashion', 'Art', 'Automotive', 'Real Estate', 'Other'],
  },
  startingPrice: {
    type: Number,
    required: [true, 'Please add a starting price'],
  },
  currentPrice: {
    type: Number,
    default: 0, // Will be updated as bids come in
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time'],
  },
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
  // We embed bids here for simplicity and speed
  bids: [
    {
      bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      amount: { type: Number, required: true },
      time: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['active', 'completed', 'unsold'],
    default: 'active',
  },
  // For images, we will store URLs (String). 
  // We can handle the actual file upload separately.
  images: [
    {
      type: String, 
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to set currentPrice to startingPrice on creation
auctionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.currentPrice = this.startingPrice;
  }
  next();
});

module.exports = mongoose.model('Auction', auctionSchema);