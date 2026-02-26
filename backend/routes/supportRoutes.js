const express = require('express');
const router = express.Router();
const {
  createSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/tickets', createSupportTicket);
router.get('/tickets', protect, authorize('admin'), getSupportTickets);
router.put('/tickets/:id', protect, authorize('admin'), updateSupportTicketStatus);

module.exports = router;
