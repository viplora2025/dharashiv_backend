// src/queues/notificationQueue.js
import { Queue } from "bullmq";
import { redisConnection, isRedisQueueEnabled } from "../config/redisQueueConnection.js";

const NOTIFICATION_QUEUE_NAME = "notification-queue";

export const notificationQueue = isRedisQueueEnabled
  ? new Queue(NOTIFICATION_QUEUE_NAME, {
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
    })
  : null;

if (!isRedisQueueEnabled) {
  console.warn("⚠️  REDIS_URL not set — notification queue disabled (jobs will be no-ops).");
}

export const addNotificationJob = async (data) => {
  if (!notificationQueue) return;
  try {
    await notificationQueue.add("single-notification", data);
  } catch (err) {
    console.error("Failed to add job to notification queue:", err.message);
  }
};

export const addBroadcastJob = async (type, data) => {
  if (!notificationQueue) return;
  try {
    await notificationQueue.add(`broadcast-${type}`, data);
  } catch (err) {
    console.error(`Failed to add ${type} broadcast job:`, err.message);
  }
};

export const addSocketEventJob = async (room, event, payload) => {
  if (!notificationQueue) return;
  try {
    await notificationQueue.add("socket-event", { room, event, payload });
  } catch (err) {
    console.error("Failed to add socket event job:", err.message);
  }
};
