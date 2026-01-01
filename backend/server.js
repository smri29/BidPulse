const express = require('express');
const dotenv = require('dotenv');

// 1. Load Config (MUST BE FIRST)
dotenv.config(); 

const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');
const cron = require('node-cron');
const stripe = require('stripe');

// Import Models
const Auction = require('./models/Auction'); 
const User = require('./models/User'); // <--- ADDED: Needed for finding email addresses

// Import Utilities
const sendEmail = require('./utils/emailService'); // <--- ADDED: Email Service

// Import Routes
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Admin Routes

// Initialize Stripe Client
const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

// 2. Connect to Database
connectDB();

// 3. Initialize App & Socket
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make io accessible in controllers
app.set('io', io);

// 4. STRIPE WEBHOOK (Must be before express.json)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripeClient) return res.status(500).send('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const auctionId = session.metadata.auctionId;
    const winnerId = session.metadata.winnerId;

    try {
      const auction = await Auction.findById(auctionId);
      const winner = await User.findById(winnerId); // Find the buyer

      if (auction && winner) {
        auction.status = 'paid_held_in_escrow';
        await auction.save();
        console.log(`Payment received for Auction ${auctionId}. Funds held in escrow.`);
        
        // --- EMAIL TRIGGER: PAYMENT RECEIPT (BIDDER) ---
        try {
            await sendEmail({
                email: winner.email, 
                subject: `Payment Receipt: ${auction.title}`,
                message: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h1 style="color: #6d28d9;">Payment Successful!</h1>
                        <p>You have successfully paid <b>$${auction.currentPrice}</b> for <b>${auction.title}</b>.</p>
                        <p>Your funds are now held securely in Escrow.</p>
                        <p><b>Next Step:</b> Once you receive the item, please confirm receipt on your dashboard to complete the transaction.</p>
                    </div>
                `
            });
            console.log(`📧 Receipt email sent to ${winner.email}`);
        } catch (emailErr) {
            console.error("Receipt email failed:", emailErr.message);
        }
        // -----------------------------------------------

        io.emit('notification', {
            message: `Auction "${auction.title}" has been paid for!`,
            auctionId: auctionId
        });
      }
    } catch (err) {
      console.error('Error updating auction status:', err);
    }
  }

  res.json({ received: true });
});

// 5. Standard Middleware
app.use(cors());
app.use(express.json()); 

// 6. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 7. Test Route
app.get('/', (req, res) => {
  res.send('BidPulse API is running...');
});

// 8. Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
    console.log(`User ${socket.id} joined room: ${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 9. Cron Job (Checks for expired auctions every minute)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({ 
      status: 'active', 
      endTime: { $lt: now } 
    });

    for (const auction of expiredAuctions) {
      if (auction.bids.length > 0) {
        auction.status = 'completed';
        // Set winner to the last person who bid
        const lastBid = auction.bids[auction.bids.length - 1];
        auction.winner = lastBid.bidder;
        await auction.save();

        // --- EMAIL TRIGGERS: WINNER & SELLER ---
        try {
            const winner = await User.findById(auction.winner);
            const seller = await User.findById(auction.seller);

            // 1. Email Winner
            if (winner) {
                await sendEmail({
                    email: winner.email,
                    subject: '🎉 You Won! ' + auction.title,
                    message: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <h1 style="color: #6d28d9;">Congratulations!</h1>
                            <p>You won the auction for <b>${auction.title}</b> with a final bid of <b>$${auction.currentPrice}</b>.</p>
                            <p><a href="${process.env.CLIENT_URL}/dashboard/bidder" style="font-weight: bold; color: #10b981;">Pay Now to Secure Your Item</a></p>
                        </div>
                    `
                });
            }

            // 2. Email Seller
            if (seller) {
                await sendEmail({
                    email: seller.email,
                    subject: 'Item Sold: ' + auction.title,
                    message: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <h1 style="color: #10b981;">Item Sold!</h1>
                            <p>Your auction for <b>${auction.title}</b> has ended at <b>$${auction.currentPrice}</b>.</p>
                            <p>We are waiting for the buyer to process the payment. You will be notified once funds are secured in Escrow.</p>
                        </div>
                    `
                });
            }
        } catch (err) {
            console.error("Cron Job Emails Failed:", err.message);
        }
        // --------------------------------------

        io.to(auction._id.toString()).emit('auction_ended', {
             auctionId: auction._id,
             winner: auction.winner 
        });
      } else {
        auction.status = 'unsold';
        await auction.save();
        console.log(`Auction ${auction._id} marked as unsold.`);
      }
      console.log(`Auction ${auction._id} closed.`);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// 10. Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});