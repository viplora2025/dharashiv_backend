// src/routes/notificationRoute.js

import express from "express";
import { auth, adminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";

import {
  getUserNotifications,
  updateReadStatus,
  markAllAsRead,
  clearNotifications,
  deleteNotification,
  createNotification
} from "../controllers/notificationController.js";

import {
  updateReadStatusSchema,
  notificationIdSchema,
  createNotificationSchema
} from "../validations/notificationValidation.js";


const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all notifications for current user
router.get("/", getUserNotifications);

// Mark all as read
router.patch("/mark-all-read", markAllAsRead);

// Clear all notifications
router.delete("/clear-all", clearNotifications);

// Mark specific notification as read/unread
router.patch("/:id/read-status", validate(updateReadStatusSchema), updateReadStatus);

// Delete specific notification
router.delete("/:id", validate(notificationIdSchema), deleteNotification);

// Create a notification (Admin only)
router.post("/", adminOnly, validate(createNotificationSchema), createNotification);

export default router;

