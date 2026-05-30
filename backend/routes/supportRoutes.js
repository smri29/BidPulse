/**
 * Module: backend/routes/supportRoutes.js
 * Purpose: Maps HTTP endpoints to the backend handlers responsible for each route.
 */
const express = require('express');
const router = express.Router();
const {
  createSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

const supportTicketLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 8, keyPrefix: 'support-ticket' });
const supportAdminLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120, keyPrefix: 'support-admin' });

// Ticket creation is public, but ticket management is admin-only.
// Separate rate limits exist because public ticket creation is abuse-sensitive while admin review is high-frequency.
router.post('/tickets', supportTicketLimiter, createSupportTicket);
router.get('/tickets', protect, authorize('admin'), supportAdminLimiter, getSupportTickets);
router.put('/tickets/:id', protect, authorize('admin'), supportAdminLimiter, updateSupportTicketStatus);

module.exports = router;
