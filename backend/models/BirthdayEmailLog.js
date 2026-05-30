/**
 * Module: backend/models/BirthdayEmailLog.js
 * Purpose: Defines a Mongoose data model used to persist this backend domain entity.
 */
const mongoose = require('mongoose');

const birthdayEmailLogSchema = new mongoose.Schema(
  {
    // Birthday messages are limited to once per user per calendar year.
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
// One birthday email per user per year prevents accidental duplicate greetings.

module.exports = mongoose.model('BirthdayEmailLog', birthdayEmailLogSchema);
