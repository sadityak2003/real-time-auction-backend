const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const { handleConnection } = require('./socket/socketHandler');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://real-time-auction-frontend-mas-cs.onrender.com'
];

// Socket.IO with multiple origins
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Express CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy: This origin is not allowed.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// Socket connection handling
handleConnection(io);

// Database sync and server start
const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});
