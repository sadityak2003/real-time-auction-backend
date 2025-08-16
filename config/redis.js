const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redis;