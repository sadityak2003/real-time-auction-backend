const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auction = sequelize.define('Auction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  bidIncrement: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00
  },
  currentBid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'ended', 'completed', 'cancelled', 'rejected', 'counter_offer'),
    defaultValue: 'pending'
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  sellerDecision: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'counter_offer'),
    allowNull: true
  }
});

module.exports = Auction;