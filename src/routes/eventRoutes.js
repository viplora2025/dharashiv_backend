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
import { auth, staffOnly, superAdminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema
} from "../validations/eventValidation.js";

const router = express.Router();

// Create Event
router.post(
  "/",
  auth,
  superAdminOnly,
  validate(createEventSchema),
  createEvent
);

// Get Limited Events (Dashboard)
router.get("/limited/events", auth, getLimitedEvents);

// Get All Events
router.get("/", auth, getAllEvents);

// Get Event By ID
router.get("/:id", auth, getEventById);

// Update Event (Full)
router.put(
  "/:id",
  auth,
  superAdminOnly,
  validate(updateEventSchema),
  updateEvent
);

// Update Event Status
router.patch(
  "/:id/status",
  auth,
  staffOnly,
  validate(updateEventStatusSchema),
  updateEventStatus
);

// Archive / Unarchive Event
router.patch("/:id/archive", auth, superAdminOnly, archiveEvent);
router.patch("/:id/unarchive", auth, superAdminOnly, unarchiveEvent);

// Delete Event
router.delete("/:id", auth, superAdminOnly, deleteEvent);

export default router;
