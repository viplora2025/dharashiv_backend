// src/services/notificationService.js

import { addNotificationJob, addBroadcastJob } from "../queues/notificationQueue.js";
import Notification from "../models/notificationModel.js";

/**
 * Create a new notification (Pushed to Queue)
 */
export const createNotificationService = async (data) => {
  await addNotificationJob(data);
  return { status: "queued", message: "Notification is being processed" };
};

/**
 * Get notifications for a user/admin (No change needed - Read only)
 */
export const getUserNotificationsService = async (req) => {
  const recipientId = req.user._id;
  const recipientModel = req.role === "user" ? "AppUser" : "Admin";

  return await Notification.find({
    recipient: recipientId,
    recipientModel: recipientModel
  }).sort({ createdAt: -1 });
};

/**
 * Mark a notification as read or unread
 */
export const updateReadStatusService = async (id, isRead, req) => {
  const recipientId = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: recipientId },
    { isRead },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found or access denied");
  }

  return notification;
};

/**
 * Mark all notifications as read for current user
 */
export const markAllAsReadService = async (req) => {
  const recipientId = req.user._id;
  const recipientModel = req.role === "user" ? "AppUser" : "Admin";

  await Notification.updateMany(
    { recipient: recipientId, recipientModel: recipientModel, isRead: false },
    { isRead: true }
  );

  return true;
};

/**
 * Clear all notifications for current user
 */
export const clearNotificationsService = async (req) => {
  const recipientId = req.user._id;
  const recipientModel = req.role === "user" ? "AppUser" : "Admin";

  await Notification.deleteMany({
    recipient: recipientId,
    recipientModel: recipientModel
  });

  return true;
};

/**
 * Notify all admins or specific taluka admins (Pushed to Queue)
 */
export const notifyAdminsService = async (data) => {
  await addBroadcastJob("taluka-admins", data);
  return { status: "queued" };
};

/**
 * Notify all app users (Pushed to Queue)
 */
export const notifyAllUsersService = async (data) => {
  await addBroadcastJob("all-users", data);
  return { status: "queued" };
};

/**
 * Delete a specific notification
 */
export const deleteNotificationService = async (id, req) => {
  const recipientId = req.user._id;

  const result = await Notification.deleteOne({
    _id: id,
    recipient: recipientId
  });

  if (result.deletedCount === 0) {
    throw new Error("Notification not found or access denied");
  }

  return true;
};

