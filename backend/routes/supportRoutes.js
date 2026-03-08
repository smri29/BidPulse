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

router.post('/tickets', supportTicketLimiter, createSupportTicket);
router.get('/tickets', protect, authorize('admin'), supportAdminLimiter, getSupportTickets);
router.put('/tickets/:id', protect, authorize('admin'), supportAdminLimiter, updateSupportTicketStatus);

module.exports = router;
