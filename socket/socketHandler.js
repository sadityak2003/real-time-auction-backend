const jwt = require('jsonwebtoken');
const { User } = require('../models');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  io.use(socketAuth);
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join auction room
    socket.on('joinAuction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`User ${socket.user.username} joined auction ${auctionId}`);
    });

    // Leave auction room
    socket.on('leaveAuction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`User ${socket.user.username} left auction ${auctionId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });
};

module.exports = { handleConnection };