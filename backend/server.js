const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const stripe = require('stripe');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db.js');
const Auction = require('./models/Auction');
const User = require('./models/User');
const { sendEmailAsync, verifyEmailTransport } = require('./utils/emailService');
const templates = require('./utils/emailTemplates');
const { sendMonthlyPromotionalEmails } = require('./utils/promotionalCampaignService');
const { internalJobs } = require('./controllers/auctionController');

const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

const stripeClient = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;
const STATIC_ADMIN_DB_ID = '000000000000000000000999';

const parseAllowedOrigins = () => {
  const baseOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGIN]
    .filter(Boolean)
    .map((origin) => origin.trim());

  const fromList = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set([...baseOrigins, ...fromList]));
};

const allowedOrigins = parseAllowedOrigins();

connectDB();
verifyEmailTransport();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const emitNotificationToUsers = (userIds, payload, options = {}) => {
  const uniqueUserIds = Array.from(
    new Set((Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean).map((id) => String(id)))
  );

  uniqueUserIds.forEach((id) => {
    io.to(`user:${id}`).emit('notification', payload);
  });

  if (options.includeAdmins) {
    io.to('role:admin').emit('notification', payload);
  }
};

app.set('io', io);

// Stripe webhook must run before express.json middleware.
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Stripe webhook is not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const auctionId = session.metadata?.auctionId;
    const winnerId = session.metadata?.winnerId;

    try {
      const [auction, winner] = await Promise.all([
        Auction.findById(auctionId).populate('seller', 'email stripeAccountId'),
        User.findById(winnerId).select('email name').lean(),
      ]);

      if (!auction || !winner) {
        return res.json({ received: true });
      }

      if (auction.payment?.status === 'paid' || ['paid_shipping_pending', 'closed'].includes(auction.status)) {
        return res.json({ received: true });
      }

      const totalAmount = Number(auction.currentPrice || 0);
      const commission = Number((totalAmount * 0.05).toFixed(2));
      const sellerPayout = Number((totalAmount - commission).toFixed(2));

      let payoutStatus = 'manual_required';
      if (auction.seller?.stripeAccountId) {
        try {
          await stripeClient.transfers.create({
            amount: Math.round(sellerPayout * 100),
            currency: 'usd',
            destination: auction.seller.stripeAccountId,
          });
          payoutStatus = 'completed';
        } catch (transferError) {
          payoutStatus = 'failed';
          console.error('Seller payout transfer failed:', transferError.message);
        }
      }

      auction.status = 'paid_shipping_pending';
      auction.payment = {
        ...auction.payment,
        status: 'paid',
        amount: totalAmount,
        stripeSessionId: session.id || auction.payment?.stripeSessionId || '',
        stripePaymentIntentId: String(session.payment_intent || ''),
        paidAt: new Date(),
        lastFailureReason: '',
        lastFailureAt: null,
        sellerPayoutAmount: sellerPayout,
        commissionAmount: commission,
        payoutStatus,
        payoutAt: new Date(),
      };
      auction.shipping = {
        ...auction.shipping,
        status: 'in_transit',
        expectedMinDays: 7,
        expectedMaxDays: 14,
        paidAt: new Date(),
      };
      await auction.save();

      if (winner.email) {
        sendEmailAsync({
          email: winner.email,
          subject: `Payment Receipt: ${auction.title}`,
          message: templates.paymentReceipt({
            title: auction.title,
            amount: totalAmount,
          }),
        });
        sendEmailAsync({
          email: winner.email,
          subject: `Shipping initiated: ${auction.title}`,
          message: templates.shippingStarted({
            title: auction.title,
            minDays: 7,
            maxDays: 14,
            link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
          }),
        });
      }

      if (auction.seller?.email) {
        sendEmailAsync({
          email: auction.seller.email,
          subject: `Seller payout update: ${auction.title}`,
          message: templates.sellerPaid({
            title: auction.title,
            grossAmount: totalAmount.toFixed(2),
            sellerPayout: sellerPayout.toFixed(2),
            commission: commission.toFixed(2),
          }),
        });
      }

      if (process.env.ADMIN_EMAIL) {
        sendEmailAsync({
          email: process.env.ADMIN_EMAIL,
          subject: `Payment completed: ${auction.title}`,
          message: templates.sellerPaid({
            title: auction.title,
            grossAmount: totalAmount.toFixed(2),
            sellerPayout: sellerPayout.toFixed(2),
            commission: commission.toFixed(2),
          }),
        });
      }

      emitNotificationToUsers(
        [winnerId, auction.seller?._id],
        {
        type: 'success',
        title: 'Payment Completed',
        message: `Payment completed for "${auction.title}". RiZBiD shipping is now in progress.`,
        auctionId,
        },
        { includeAdmins: true }
      );
    } catch (err) {
      console.error('Error updating auction status:', err.message);
    }
  }

  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    const auctionId = session.metadata?.auctionId;
    const winnerId = session.metadata?.winnerId;

    try {
      const [auction, winner] = await Promise.all([
        Auction.findById(auctionId),
        winnerId ? User.findById(winnerId).select('email').lean() : null,
      ]);

      if (auction && auction.payment?.status !== 'paid') {
        auction.payment = {
          ...auction.payment,
          status: 'failed',
          lastFailureAt: new Date(),
          lastFailureReason:
            event.type === 'checkout.session.expired'
              ? 'Checkout session expired before payment completion'
              : 'Payment failed by provider',
        };
        await auction.save();

        if (winner?.email) {
          sendEmailAsync({
            email: winner.email,
            subject: `Payment failed: ${auction.title}`,
            message: templates.paymentFailed({
              title: auction.title,
              reason: auction.payment.lastFailureReason,
              link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
            }),
          });
        }

        if (process.env.ADMIN_EMAIL) {
          sendEmailAsync({
            email: process.env.ADMIN_EMAIL,
            subject: `Payment failed: ${auction.title}`,
            message: templates.paymentFailed({
              title: auction.title,
              reason: auction.payment.lastFailureReason,
              link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
            }),
          });
        }

        emitNotificationToUsers(
          [winnerId],
          {
          type: 'warning',
          title: 'Payment Failed',
          message: `Payment failed for "${auction.title}". Winner can retry checkout.`,
          auctionId,
          },
          { includeAdmins: true }
        );
      }
    } catch (err) {
      console.error('Error handling payment failure webhook:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const auctionId = paymentIntent.metadata?.auctionId;
    const winnerId = paymentIntent.metadata?.winnerId;

    try {
      const [auction, winner] = await Promise.all([
        Auction.findById(auctionId),
        winnerId ? User.findById(winnerId).select('email').lean() : null,
      ]);

      if (auction && auction.payment?.status !== 'paid') {
        const reason =
          paymentIntent.last_payment_error?.message || 'Payment intent failed during processing';

        auction.payment = {
          ...auction.payment,
          status: 'failed',
          lastFailureAt: new Date(),
          lastFailureReason: reason,
        };
        await auction.save();

        if (winner?.email) {
          sendEmailAsync({
            email: winner.email,
            subject: `Payment failed: ${auction.title}`,
            message: templates.paymentFailed({
              title: auction.title,
              reason,
              link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
            }),
          });
        }

        emitNotificationToUsers(
          [winnerId],
          {
          type: 'warning',
          title: 'Payment Failed',
          message: `Payment failed for "${auction.title}". Winner can retry checkout.`,
          auctionId,
          },
          { includeAdmins: true }
        );
      }
    } catch (err) {
      console.error('Error handling payment intent failure webhook:', err.message);
    }
  }

  return res.json({ received: true });
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

app.get('/', (_req, res) => {
  res.send('RiZBiD API is running...');
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/ready', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    return res.status(503).json({
      status: 'degraded',
      dependencies: { db: 'down' },
    });
  }

  return res.status(200).json({
    status: 'ready',
    dependencies: { db: 'up' },
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err.message);
  const statusCode = err.statusCode || res.statusCode || 500;
  if (res.headersSent) return;
  res.status(statusCode >= 400 ? statusCode : 500).json({
    message: err.message || 'Internal server error',
  });
});

io.use(async (socket, next) => {
  try {
    const rawAuthToken = socket.handshake?.auth?.token;
    const rawHeader = socket.handshake?.headers?.authorization;
    const headerToken =
      typeof rawHeader === 'string' && rawHeader.startsWith('Bearer ')
        ? rawHeader.slice(7).trim()
        : '';
    const token = rawAuthToken || headerToken;

    if (!token || !process.env.JWT_SECRET) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return next();

    if (decoded.id === 'static_admin_id_999') {
      socket.data.userId = STATIC_ADMIN_DB_ID;
      socket.data.legacyUserId = 'static_admin_id_999';
      socket.data.role = 'admin';
      return next();
    }

    const user = await User.findById(decoded.id).select('role').lean();
    if (user) {
      socket.data.userId = String(decoded.id);
      socket.data.role = user.role || 'user';
    }
  } catch (_error) {
    // Keep socket connection alive for guests; they just won't receive user notifications.
  }
  return next();
});

io.on('connection', (socket) => {
  if (socket.data?.userId) {
    socket.join(`user:${socket.data.userId}`);
  }
  if (socket.data?.legacyUserId) {
    socket.join(`user:${socket.data.legacyUserId}`);
  }
  if (socket.data?.role === 'admin') {
    socket.join('role:admin');
  }

  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
  });

  socket.on('support:join', ({ name, role }) => {
    socket.join('support-room');
    io.to('support-room').emit('support:system', {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message: `${name || 'Guest'} joined support chat`,
      role: role || 'user',
      createdAt: new Date().toISOString(),
    });
  });

  socket.on('support:message', ({ name, message, role }) => {
    if (!message) return;
    io.to('support-room').emit('support:message', {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name || 'Guest',
      message,
      role: role || 'user',
      createdAt: new Date().toISOString(),
    });
  });
});

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() - 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + 5 * 60 * 1000);

    const reminders = await Auction.find({
      status: 'future',
      registrationEndAt: { $gte: reminderWindowStart, $lte: reminderWindowEnd },
      'reminders.registrationReminderSentAt': null,
      'registrations.0': { $exists: true },
    }).populate('registrations.bidder', 'email');

    for (const auction of reminders) {
      const recipientEmails = auction.registrations
        .map((entry) => entry.bidder?.email)
        .filter(Boolean);

      recipientEmails.forEach((email) => {
        sendEmailAsync({
          email,
          subject: `RiZBiD starts in 5 minutes: ${auction.title}`,
          message: templates.biddingStartsSoon({
            title: auction.title,
            startAt: auction.registrationEndAt,
            link: `${process.env.CLIENT_URL}/auction/${auction._id}`,
          }),
        });
      });

      auction.reminders.registrationReminderSentAt = new Date();
      await auction.save();
    }

    const readyToStart = await Auction.find({
      status: 'future',
      registrationEndAt: { $lte: now },
    });

    for (const auction of readyToStart) {
      await internalJobs.moveToOngoing(auction);
      const refreshed = await Auction.findById(auction._id).select('status winner');
      io.to(auction._id.toString()).emit('bidUpdated', { auctionId: auction._id, status: refreshed.status });
    }

    const expiredTurns = await Auction.find({
      status: 'ongoing',
      currentTurnBidder: { $ne: null },
      turnExpiresAt: { $lte: now },
    }).select('_id currentTurnBidder activeBidders waitingBidders gaveUpBidders winner currentPrice startingPrice status turnDurationSeconds');

    for (const auction of expiredTurns) {
      await internalJobs.handleGiveUpCore({
        auction,
        bidderId: auction.currentTurnBidder,
      });
      io.to(auction._id.toString()).emit('bidUpdated', { auctionId: auction._id });
    }
  } catch (error) {
    console.error('Cron job error:', error.message);
  }
});

// Promotional campaign emails: every month on the 15th (repeats every year).
cron.schedule('0 10 15 * *', async () => {
  try {
    const stats = await sendMonthlyPromotionalEmails();
    console.log(
      `Promotional email job completed. total=${stats.total}, sent=${stats.sent}, skipped=${stats.skipped}`
    );
  } catch (error) {
    console.error('Promotional email job error:', error.message);
  }
}, {
  timezone: process.env.PROMOTIONAL_EMAIL_TIMEZONE || 'UTC',
});

// Startup catch-up: if server restarts on the 15th, ensure monthly promo still runs once.
setTimeout(async () => {
  try {
    const now = new Date();
    if (now.getDate() !== 15) return;
    const stats = await sendMonthlyPromotionalEmails({ month: now.getMonth() + 1, year: now.getFullYear() });
    console.log(
      `Promotional startup check completed. total=${stats.total}, sent=${stats.sent}, skipped=${stats.skipped}`
    );
  } catch (error) {
    console.error('Promotional startup check error:', error.message);
  }
}, 15000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log('Graceful shutdown completed.');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
