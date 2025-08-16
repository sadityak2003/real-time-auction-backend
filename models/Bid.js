const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  bidderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  auctionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  isWinning: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Bid;