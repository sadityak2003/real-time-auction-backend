const { Sequelize } = require('sequelize');
require('dotenv').config();
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, 
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
    family: 4
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
