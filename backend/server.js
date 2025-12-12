const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // Needed for Socket.io
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');

// 1. Load Config
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize App & Socket
const app = express();
const server = http.createServer(app); // Wrap Express with HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development (Frontend will run on 5173)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// 4. Middleware
app.use(cors());
app.use(express.json()); // Allow parsing JSON bodies
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// 5. Test Route (To check if API is working)
app.get('/', (req, res) => {
  res.send('BidPulse API is running...');
});

// 6. Socket.io Connection Logic (Basic Test)
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 7. Make io accessible globally (so we can emit events from controllers)
app.set('socketio', io);

// 8. Start Server
const PORT = process.env.PORT || 5000;

const cron = require('node-cron');
const Auction = require('./models/Auction'); // Make sure to require the model

// Cron Job: Run every minute to check for expired auctions
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Find active auctions that have passed their end time
    const expiredAuctions = await Auction.find({ 
      status: 'active', 
      endTime: { $lt: now } 
    });

    for (const auction of expiredAuctions) {
      if (auction.bids.length > 0) {
        auction.status = 'completed';
        auction.winner = auction.highestBidder;
        // TODO: Send Email to Winner & Seller here later
      } else {
        auction.status = 'unsold';
      }
      await auction.save();
      console.log(`Auction ${auction._id} closed.`);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});