// src/services/notificationService.js

import Notification from "../models/notificationModel.js";
import AppUser from "../models/appUserModel.js";
import Admin from "../models/adminModel.js";
import { io } from "../server.js";

/**
 * Create a new notification and emit via socket
 */
export const createNotificationService = async (data) => {
  const { recipientId, recipientModel, title, message, type, relatedId } = data;

  const notification = await Notification.create({
    recipient: recipientId,
    recipientModel,
    title,
    message,
    type,
    relatedId
  });

  // Emit real-time notification via socket
  let socketRoom = "";
  if (recipientModel === "AppUser") {
    const user = await AppUser.findById(recipientId);
    if (user) socketRoom = `user:${user.appUserId}`;
  } else if (recipientModel === "Admin") {
    const admin = await Admin.findById(recipientId);
    if (admin) socketRoom = `admin:${admin.adminId}`;
  }

  if (socketRoom) {
    io.to(socketRoom).emit("notification:new", notification);
  }

  return notification;
};

/**
 * Get notifications for a user/admin
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
 * Notify all admins or specific taluka admins
 */
export const notifyAdminsService = async ({ talukaId, title, message, type, relatedId }) => {
  const query = talukaId ? { assignedTaluka: talukaId } : {};
  const admins = await Admin.find(query);

  const notifications = admins.map(admin => ({
    recipient: admin._id,
    recipientModel: 'Admin',
    title,
    message,
    type,
    relatedId
  }));

  if (notifications.length > 0) {
    const created = await Notification.insertMany(notifications);
    
    // Emit to rooms
    admins.forEach((admin, index) => {
      io.to(`admin:${admin.adminId}`).emit("notification:new", created[index]);
    });
  }
};

/**
 * Notify all app users
 */
export const notifyAllUsersService = async ({ title, message, type, relatedId }) => {
  const users = await AppUser.find({});
  
  const notifications = users.map(user => ({
    recipient: user._id,
    recipientModel: 'AppUser',
    title,
    message,
    type,
    relatedId
  }));

  if (notifications.length > 0) {
    const created = await Notification.insertMany(notifications);
    
    // Emit to users room (or individual rooms)
    users.forEach((user, index) => {
      io.to(`user:${user.appUserId}`).emit("notification:new", created[index]);
    });
  }
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

