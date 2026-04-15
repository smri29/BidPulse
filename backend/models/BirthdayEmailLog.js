const mongoose = require('mongoose');

const birthdayEmailLogSchema = new mongoose.Schema(
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
    birthdaySubject: {
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

birthdayEmailLogSchema.index({ user: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BirthdayEmailLog', birthdayEmailLogSchema);
