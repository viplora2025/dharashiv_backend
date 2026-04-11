// src/queues/notificationQueue.js
import { Queue } from "bullmq";
import { redisConnection } from "../config/redisQueueConnection.js";

const NOTIFICATION_QUEUE_NAME = "notification-queue";

/**
 * Main Notification Queue
 */
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs for debugging
  },
});

/**
 * Helper to add single notification to queue
 */
export const addNotificationJob = async (data) => {
  try {
    await notificationQueue.add("single-notification", data);
  } catch (err) {
    console.error("Failed to add job to notification queue:", err.message);
    // Fallback? Since we want "Proper" Redis way, we rely on Redis.
  }
};

/**
 * Helper to add broadcast job (to all users or taluka admins)
 */
export const addBroadcastJob = async (type, data) => {
  try {
    await notificationQueue.add(`broadcast-${type}`, data);
  } catch (err) {
    console.error(`Failed to add ${type} broadcast job:`, err.message);
  }
};

/**
 * Helper to add transient socket event to queue
 */
export const addSocketEventJob = async (room, event, payload) => {
  try {
    await notificationQueue.add("socket-event", { room, event, payload });
  } catch (err) {
    console.error("Failed to add socket event job:", err.message);
  }
};
