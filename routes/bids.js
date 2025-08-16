const express = require('express');
const { Bid, Auction, User } = require('../models');
const auth = require('../middleware/auth');
const redis = require('../config/redis');
const router = express.Router();

// Place a bid
router.post('/', auth, async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    
    const auction = await Auction.findByPk(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Check if auction is active
    const now = new Date();
    if (now < auction.startTime || now > auction.endTime) {
      return res.status(400).json({ error: 'Auction is not active' });
    }
    
    // Get current bid from Redis
    const currentBid = await redis.get(`auction:${auctionId}:currentBid`);
    const currentBidAmount = currentBid ? parseFloat(currentBid) : parseFloat(auction.startingPrice);
    
    // Ensure all values are numbers
    const bidAmount = parseFloat(amount);
    const bidIncrement = parseFloat(auction.bidIncrement);
    const minimumBid = currentBidAmount + bidIncrement;
    
    // Validate bid amount
    if (bidAmount < minimumBid) {
      return res.status(400).json({ 
        error: `Bid must be at least $${minimumBid.toFixed(2)}` 
      });
    }
    
    // Create bid
    const bid = await Bid.create({
      amount: bidAmount,
      bidderId: req.user.id,
      auctionId
    });
    
    // Update current bid in Redis
    await redis.set(`auction:${auctionId}:currentBid`, bidAmount);
    await redis.set(`auction:${auctionId}:highestBidder`, req.user.id);
    
    // Update auction current bid
    auction.currentBid = bidAmount;
    await auction.save();
    
    // Get bid with user info
    const bidWithUser = await Bid.findByPk(bid.id, {
      include: [{ model: User, as: 'bidder', attributes: ['username'] }]
    });
    
    // Emit socket event for new bid
    req.app.get('io').to(`auction:${auctionId}`).emit('newBid', {
      bid: bidWithUser,
      auctionId,
      currentBid: bidAmount
    });
    
    res.status(201).json(bidWithUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;