// src/controllers/notificationController.js

import {
  getUserNotificationsService,
  updateReadStatusService,
  markAllAsReadService,
  clearNotificationsService,
  deleteNotificationService,
  createNotificationService
} from "../services/notificationService.js";

import { sendSuccess } from "../utils/response.js";

export const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await getUserNotificationsService(req);
    sendSuccess(res, { data: notifications });
  } catch (err) {
    next(err);
  }
};

export const updateReadStatus = async (req, res, next) => {
  try {
    const { isRead } = req.body;
    const notification = await updateReadStatusService(req.params.id, isRead, req);
    sendSuccess(res, { message: `Notification marked as ${isRead ? 'read' : 'unread'}`, data: notification });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await markAllAsReadService(req);
    sendSuccess(res, { message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

export const clearNotifications = async (req, res, next) => {
  try {
    await clearNotificationsService(req);
    sendSuccess(res, { message: "All notifications cleared" });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await deleteNotificationService(req.params.id, req);
    sendSuccess(res, { message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await createNotificationService(req.body);
    sendSuccess(res, { status: 201, message: "Notification created", data: notification });
  } catch (err) {
    next(err);
  }
};

