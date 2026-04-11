// src/workers/notificationWorker.js
import { Worker } from "bullmq";
import { redisConnection } from "../config/redisQueueConnection.js";
import Notification from "../models/notificationModel.js";
import AppUser from "../models/appUserModel.js";
import Admin from "../models/adminModel.js";
import { io } from "../server.js";

const NOTIFICATION_QUEUE_NAME = "notification-queue";

/**
 * Worker Logic for processing notifications
 */
const processNotificationJob = async (job) => {
  const { name, data } = job;
  console.log(`👷 Processing notification job: ${name} (ID: ${job.id})`);

  try {
    if (name === "single-notification") {
      await handleSingleNotification(data);
    } else if (name === "broadcast-all-users") {
      await handleBroadcastAllUsers(data);
    } else if (name === "broadcast-taluka-admins") {
      await handleBroadcastTalukaAdmins(data);
    } else if (name === "socket-event") {
      await handleSocketEvent(data);
    }
  } catch (err) {
    console.error(`❌ Job ${job.id} failed:`, err.message);
    throw err; // Allow BullMQ to retry
  }
};

/**
 * Handle transient socket events (UI updates, typing, etc.)
 */
async function handleSocketEvent(data) {
  const { room, event, payload } = data;
  if (io && room && event) {
    io.to(room).emit(event, payload);
  }
}

/**
 * Single Notification: Save to DB & Emit
 */
async function handleSingleNotification(data) {
  const { recipientId, recipientModel, title, message, type, relatedId } = data;

  // 1. Save to MongoDB
  const notification = await Notification.create({
    recipient: recipientId,
    recipientModel,
    title,
    message,
    type,
    relatedId
  });

  // 2. Resolve Socket Room
  let socketRoom = "";
  if (recipientModel === "AppUser") {
    const user = await AppUser.findById(recipientId);
    if (user) socketRoom = `user:${user.appUserId}`;
  } else if (recipientModel === "Admin") {
    const admin = await Admin.findById(recipientId);
    if (admin) socketRoom = `admin:${admin.adminId}`;
  }

  // 3. Emit
  if (socketRoom && io) {
    io.to(socketRoom).emit("notification:new", notification);
  }
}

/**
 * Broadcast to All Users
 */
async function handleBroadcastAllUsers(data) {
  const { title, message, type, relatedId } = data;
  const users = await AppUser.find({});
  
  if (users.length === 0) return;

  const notificationsData = users.map(user => ({
    recipient: user._id,
    recipientModel: 'AppUser',
    title,
    message,
    type,
    relatedId
  }));

  const created = await Notification.insertMany(notificationsData);

  // Emit individually (Socket.IO + Redis Adapter handles this efficiently)
  if (io) {
    users.forEach((user, index) => {
      io.to(`user:${user.appUserId}`).emit("notification:new", created[index]);
    });
  }
}

/**
 * Broadcast to Taluka Admins
 */
async function handleBroadcastTalukaAdmins(data) {
  const { talukaId, title, message, type, relatedId } = data;
  const query = talukaId ? { assignedTaluka: talukaId } : {};
  const admins = await Admin.find(query);

  if (admins.length === 0) return;

  const notificationsData = admins.map(admin => ({
    recipient: admin._id,
    recipientModel: 'Admin',
    title,
    message,
    type,
    relatedId
  }));

  const created = await Notification.insertMany(notificationsData);

  if (io) {
    admins.forEach((admin, index) => {
      io.to(`admin:${admin.adminId}`).emit("notification:new", created[index]);
    });
  }
}

// Initialize the Worker
export const initNotificationWorker = () => {
  const worker = new Worker(NOTIFICATION_QUEUE_NAME, processNotificationJob, {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs at a time
  });

  worker.on("completed", (job) => {
    console.info(`✅ Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed with error:`, err.message);
  });

  console.log("🚀 Notification Worker initialized and listening...");
  return worker;
};
