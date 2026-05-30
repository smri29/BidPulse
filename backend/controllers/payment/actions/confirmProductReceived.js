// ---------------------------------------------------------------------------
// Module: backend/controllers/payment/actions/confirmProductReceived.js
// Purpose: confirm Product Received
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const Auction = require('../../../models/Auction');
const { sendEmailAsync } = require('../../../utils/emailService');
const templates = require('../../../utils/emailTemplates');
const { emitRealtimeNotification } = require('../paymentHelpers');

const confirmProductReceived = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('seller');
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (auction.status !== 'paid_shipping_pending') {
      return res.status(400).json({ message: 'Product receipt can only be confirmed after successful payment' });
    }
    if (auction.shipping?.status === 'received_confirmed') {
      return res.status(400).json({ message: 'Product receipt has already been confirmed' });
    }

    auction.status = 'closed';
    auction.shipping = {
      ...auction.shipping,
      status: 'received_confirmed',
      receivedConfirmedAt: new Date(),
      receivedConfirmedBy: req.user.id,
    };
    await auction.save();

    if (req.user.email) {
      sendEmailAsync({
        email: req.user.email,
        subject: `Order completed: ${auction.title}`,
        message: templates.productReceivedConfirmed({ title: auction.title }),
      });
    }

    if (auction.seller?.email) {
      sendEmailAsync({
        email: auction.seller.email,
        subject: `Buyer confirmed receipt: ${auction.title}`,
        message: templates.productReceivedConfirmed({ title: auction.title }),
      });
    }

    if (process.env.ADMIN_EMAIL) {
      sendEmailAsync({
        email: process.env.ADMIN_EMAIL,
        subject: `AuctionPulse order closed: ${auction.title}`,
        message: templates.productReceivedConfirmed({ title: auction.title }),
      });
    }

    emitRealtimeNotification(
      req,
      {
        type: 'success',
        title: 'Order Completed',
        message: `Winner confirmed product receipt for "${auction.title}"`,
        auctionId: auction._id.toString(),
      },
      {
        userIds: [req.user.id, auction.seller?._id || auction.seller],
        includeAdmins: true,
      }
    );

    sendEmailAsync({
      email: auction.seller.email,
      subject: `Lifecycle closed: ${auction.title}`,
      message: templates.fundsReleased({
        title: auction.title,
        sellerPayout: Number(auction.payment?.sellerPayoutAmount || 0).toFixed(2),
      }),
    });

    return res.status(200).json({ message: 'Product receipt confirmed. Auction lifecycle closed.' });
  } catch (error) {
    console.error('CONFIRM RECEIVED ERROR:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = confirmProductReceived;


