const mongoose = require('mongoose');

const promotionalEmailLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    dayOfMonth: {
      type: Number,
      required: true,
      enum: [5, 25],
      index: true,
    },
    campaignSubject: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

promotionalEmailLogSchema.index({ user: 1, year: 1, month: 1, dayOfMonth: 1 }, { unique: true });

module.exports = mongoose.model('PromotionalEmailLog', promotionalEmailLogSchema);
