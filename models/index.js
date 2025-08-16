const User = require('./User');
const Auction = require('./Auction');
const Bid = require('./Bid');

// Associations
User.hasMany(Auction, { foreignKey: 'sellerId', as: 'auctions' });
Auction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Bid, { foreignKey: 'bidderId', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });

Auction.hasMany(Bid, { foreignKey: 'auctionId', as: 'bids' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

Auction.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

module.exports = { User, Auction, Bid };