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

const connectDB = require('./config/db.js');
const Auction = require('./models/Auction');
const User = require('./models/User');
const { sendEmailAsync, verifyEmailTransport } = require('./utils/emailService');
const templates = require('./utils/emailTemplates');

const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

const stripeClient = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;

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
        Auction.findById(auctionId),
        User.findById(winnerId).select('email').lean(),
      ]);

      if (auction && winner?.email) {
        auction.status = 'paid_held_in_escrow';
        await auction.save();

        sendEmailAsync({
          email: winner.email,
          subject: `Payment Receipt: ${auction.title}`,
          message: templates.paymentReceipt({
            title: auction.title,
            amount: auction.currentPrice,
          }),
        });

        io.emit('notification', {
          message: `Auction "${auction.title}" has been paid for!`,
          auctionId,
        });
      }
    } catch (err) {
      console.error('Error updating auction status:', err.message);
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
  res.send('BidPulse API is running...');
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

io.on('connection', (socket) => {
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

    const expiredAuctions = await Auction.find({
      status: 'active',
      endTime: { $lt: now },
    }).select('_id title currentPrice seller bids status endTime');

    for (const auction of expiredAuctions) {
      if (auction.bids.length === 0) {
        auction.status = 'unsold';
        await auction.save();
        continue;
      }

      const lastBid = auction.bids[auction.bids.length - 1];
      auction.status = 'completed';
      auction.winner = lastBid.bidder;
      await auction.save();

      const [winner, seller] = await Promise.all([
        User.findById(auction.winner).select('email').lean(),
        User.findById(auction.seller).select('email').lean(),
      ]);

      if (winner?.email) {
        sendEmailAsync({
          email: winner.email,
          subject: `You Won! ${auction.title}`,
          message: templates.auctionWon({
            title: auction.title,
            currentPrice: auction.currentPrice,
            link: `${process.env.CLIENT_URL}/dashboard/bidder`,
          }),
        });
      }

      if (seller?.email) {
        sendEmailAsync({
          email: seller.email,
          subject: `Item Sold: ${auction.title}`,
          message: templates.itemSold({
            title: auction.title,
            currentPrice: auction.currentPrice,
          }),
        });
      }

      io.to(auction._id.toString()).emit('auction_ended', {
        auctionId: auction._id,
        winner: auction.winner,
      });
    }
  } catch (error) {
    console.error('Cron job error:', error.message);
  }
});

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
