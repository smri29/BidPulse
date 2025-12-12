const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // Needed for Socket.io
const { Server } = require('socket.io');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

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

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});