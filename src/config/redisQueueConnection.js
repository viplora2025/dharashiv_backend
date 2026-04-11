// src/config/redisQueueConnection.js
import env from "./env.js";

const REDIS_URL = env.REDIS_URL;

const getRedisConfig = () => {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is required for notification queues");
  }

  // Parse REDIS_URL for BullMQ connection object
  try {
    const url = new URL(REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      username: url.username || undefined,
      tls: url.protocol === "rediss:" ? {} : undefined,
      maxRetriesPerRequest: null, // Critical for BullMQ
    };
  } catch (err) {
    console.error("Failed to parse REDIS_URL:", err.message);
    throw err;
  }
};

export const redisConnection = getRedisConfig();
