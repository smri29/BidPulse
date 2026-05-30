/**
 * Module: backend/models/SupportTicket.js
 * Purpose: Defines a Mongoose data model used to persist this backend domain entity.
 */
const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    // Public support requests can exist even when there is no authenticated user session.
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ email: 1, createdAt: -1 });
// Queue views usually sort by newest tickets and sometimes narrow by requester email.

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
