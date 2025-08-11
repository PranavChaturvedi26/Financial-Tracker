const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

(async () => {
  await redisClient.connect();
})();

const DEFAULT_EXPIRATION = 900;

const getOrSetCache = async (key, cb, expiration = DEFAULT_EXPIRATION) => {
  try {
    const data = await redisClient.get(key);
    if (data != null) {
      return JSON.parse(data);
    }
    
    const freshData = await cb();
    await redisClient.setEx(key, expiration, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error('Cache error:', error);
    return await cb();
  }
};

const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

module.exports = {
  redisClient,
  getOrSetCache,
  invalidateCache
};