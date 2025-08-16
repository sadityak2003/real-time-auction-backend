require("dotenv").config();
const express = require('express');
const { Auction, Bid, User } = require('../models');
const auth = require('../middleware/auth');
const redis = require('../config/redis');
const router = express.Router();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (msg) => {
  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendMail({
  to: 'sadityak2003@gmail.com',
  from: 'sadityak2003@gmail.com',
  subject: 'New Auction Created',
  text: 'A new auction has been created.'
});

// Get all auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      include: [
        { model: User, as: 'seller', attributes: ['username'] },
        { model: Bid, as: 'bids', include: [{ model: User, as: 'bidder', attributes: ['username'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'seller', attributes: ['username'] },
        { 
          model: Bid, 
          as: 'bids', 
          include: [{ model: User, as: 'bidder', attributes: ['username'] }],
          order: [['amount', 'DESC']]
        }
      ]
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Get current bid from Redis
    const currentBid = await redis.get(`auction:${auction.id}:currentBid`);
    if (currentBid) {
      auction.currentBid = parseFloat(currentBid);
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create auction
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, startingPrice, bidIncrement, startTime, duration } = req.body;
    
    const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 1000);
    
    const auction = await Auction.create({
      title,
      description,
      startingPrice,
      bidIncrement,
      startTime: new Date(startTime),
      endTime,
      sellerId: req.user.id,
      currentBid: startingPrice
    });

    // Set initial bid in Redis
    await redis.set(`auction:${auction.id}:currentBid`, startingPrice);

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seller decision on auction
router.post('/:id/decision', auth, async (req, res) => {
  try {
    const { decision } = req.body; // 'accepted', 'rejected', 'counter_offer'
    const auction = await Auction.findByPk(req.params.id);
    
    if (!auction || auction.sellerId !== req.user.id) {
      return res.status(404).json({ error: 'Auction not found or unauthorized' });
    }

    auction.sellerDecision = decision;
    if (decision === 'accepted') {
      auction.status = 'completed';
    }
    if (decision === 'rejected') {
      auction.status = 'rejected';
    }
    if (decision === 'counter_offer') {
      auction.status = 'counter_offer';
    }
    
    await auction.save();
    
    // Emit socket event for seller decision
    req.app.get('io').to(`auction:${auction.id}`).emit('sellerDecision', {
      auctionId: auction.id,
      decision
    });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;