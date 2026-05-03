// src/routes/eventRoutes.js

import express from "express";
import {
  createEvent,
  updateEvent,
  updateEventStatus,
  getAllEvents,
  getEventById,
  deleteEvent,
  getLimitedEvents,
  archiveEvent,
  unarchiveEvent
} from "../controllers/eventController.js";
import { auth, staffOnly, adminOnly, superAdminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema
} from "../validations/eventValidation.js";

const router = express.Router();

// Create Event (staff + admin + superadmin)
router.post(
  "/",
  auth,
  staffOnly,
  validate(createEventSchema),
  createEvent
);

// Get Limited Events (Dashboard)
router.get("/limited/events", auth, getLimitedEvents);

// Get All Events
router.get("/", auth, getAllEvents);

// Get Event By ID
router.get("/:id", auth, getEventById);

// Update Event (Full) (staff + admin + superadmin)
router.put(
  "/:id",
  auth,
  staffOnly,
  validate(updateEventSchema),
  updateEvent
);

// Update Event Status (staff + admin + superadmin)
router.patch(
  "/:id/status",
  auth,
  staffOnly,
  validate(updateEventStatusSchema),
  updateEventStatus
);

// Archive / Unarchive Event (staff + admin + superadmin)
router.patch("/:id/archive", auth, staffOnly, archiveEvent);
router.patch("/:id/unarchive", auth, staffOnly, unarchiveEvent);

// Delete Event (admin + superadmin)
router.delete("/:id", auth, adminOnly, deleteEvent);

export default router;
