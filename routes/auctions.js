require("dotenv").config();
const express = require("express");
const { Auction, Bid, User } = require("../models");
const auth = require("../middleware/auth");
const redis = require("../config/redis");
const router = express.Router();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (msg) => {
  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

sendMail({
  to: "sadityak2003@gmail.com",
  from: "sadityak2003@gmail.com",
  subject: "New Auction Created",
  text: "A new auction has been created.",
});

// Get all auctions
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      include: [
        { model: User, as: "seller", attributes: ["username"] },
        {
          model: Bid,
          as: "bids",
          include: [{ model: User, as: "bidder", attributes: ["username"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auction by ID
router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        { model: User, as: "seller", attributes: ["username"] },
        {
          model: Bid,
          as: "bids",
          include: [{ model: User, as: "bidder", attributes: ["username"] }],
          order: [["amount", "DESC"]],
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
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
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      startingPrice,
      bidIncrement,
      startTime,
      duration,
    } = req.body;

    const endTime = new Date(
      new Date(startTime).getTime() + duration * 60 * 1000
    );

    const auction = await Auction.create({
      title,
      description,
      startingPrice,
      bidIncrement,
      startTime: new Date(startTime),
      endTime,
      sellerId: req.user.id,
      currentBid: startingPrice,
    });

    // Set initial bid in Redis
    await redis.set(`auction:${auction.id}:currentBid`, startingPrice);

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seller decision on auction
router.post("/:id/decision", auth, async (req, res) => {
  try {
    const { decision } = req.body; // 'accepted', 'rejected', 'counter_offer'
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['email', 'username']
        },
        {
          model: Bid,
          as: 'bids',
          include: [{
            model: User,
            as: 'bidder',
            attributes: ['email', 'username']
          }],
          order: [['amount', 'DESC']]
        }
      ]
    });

    console.log("Auction ID:", req.params.id);
    console.log("User ID:", req.user.id);
    console.log("Decision:", decision);
    console.log(
      "Auction found:",
      auction ? auction.id : null,
      " Seller:",
      auction?.sellerId
    );

    if (!auction || auction.sellerId !== req.user.id) {
      return res
        .status(404)
        .json({ error: "Auction not found or unauthorized" });
    }

    // Set seller decision
    auction.sellerDecision = decision;
    
    if (decision === "accepted") {
      auction.status = "completed";

      // Notify winner via email
      const winner = auction.bids && auction.bids[0]?.bidder;
      if (winner) {
        sendMail({
          to: winner.email,
          from: "sadityak2003@gmail.com",
          subject: "Congratulations! You've won the auction",
          text: `You've won the auction for ${auction.title}.`,
        });
      }
      
      if (auction.seller?.email) {
        sendMail({
          to: auction.seller.email,
          from: "sadityak2003@gmail.com",
          subject: "Auction Completed",
          text: `The auction for ${auction.title} has been completed.`,
        });
      }
    }
    else if (decision === "rejected") {
      auction.status = "rejected"; 

      // Notify highest bidder via email
      const highestBidder = auction.bids && auction.bids[0]?.bidder;
      if (highestBidder) {
        sendMail({
          to: highestBidder.email,
          from: "sadityak2003@gmail.com",
          subject: "Auction Rejected",
          text: `Your bid for ${auction.title} has been rejected.`,
        });
      }

      // Notify seller via email
      if (auction.seller?.email) {
        sendMail({
          to: auction.seller.email,
          from: "sadityak2003@gmail.com",
          subject: "Auction Rejected",
          text: `The auction for ${auction.title} has been rejected.`,
        });
      }
    }
    else if (decision === "counter_offer") {
      auction.status = "counter_offer";

      // Notify highest bidder via email
      const highestBidder = auction.bids && auction.bids[0]?.bidder;
      if (highestBidder) {
        sendMail({
          to: highestBidder.email,
          from: "sadityak2003@gmail.com",
          subject: "Counter Offer Made",
          text: `A counter offer has been made on the auction for ${auction.title}.`,
        });
      }

      // Notify seller via email
      if (auction.seller?.email) {
        sendMail({
          to: auction.seller.email,
          from: "sadityak2003@gmail.com",
          subject: "Counter Offer Made",
          text: `A counter offer has been made on your auction for ${auction.title}.`,
        });
      }
    }
    else if (decision === "cancelled") {
      auction.status = "cancelled";

      // Notify highest bidder via email
      const highestBidder = auction.bids && auction.bids[0]?.bidder;
      if (highestBidder) {
        sendMail({
          to: highestBidder.email,
          from: "sadityak2003@gmail.com",
          subject: "Auction Cancelled",
          text: `The auction for ${auction.title} has been cancelled.`,
        });
      }

      // Notify seller via email
      if (auction.seller?.email) {
        sendMail({
          to: auction.seller.email,
          from: "sadityak2003@gmail.com",
          subject: "Auction Cancelled",
          text: `Your auction for ${auction.title} has been cancelled.`,
        });
      }
    }

    await auction.save();

    // Emit socket event for seller decision
    req.app.get("io").to(`auction:${auction.id}`).emit("sellerDecision", {
      auctionId: auction.id,
      decision,
    });

    res.json(auction);
  } catch (error) {
    console.error("Error in seller decision:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
