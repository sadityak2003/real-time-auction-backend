const { Sequelize } = require('sequelize');
require('dotenv').config();
const dns = require("dns");

// Force Node.js to prefer IPv4 first (important for Supabase pooler)
dns.setDefaultResultOrder("ipv4first");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, // Enable logging temporarily for debugging
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
    family: 4 // Force IPv4 for pg connection
  }
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Check if the Auctions table exists
    const tableExists = await sequelize.getQueryInterface().tableExists('Auctions');
    console.log('Auctions table exists:', tableExists);
    
    if (tableExists) {
      const columns = await sequelize.getQueryInterface().describeTable('Auctions');
      console.log('Auctions table columns:', Object.keys(columns));
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;
