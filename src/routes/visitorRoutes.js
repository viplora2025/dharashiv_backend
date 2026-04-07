// src/routes/visitorRoutes.js

import express from "express";
import { auth, adminOnly, userOnly, staffOnly } from "../middlewares/authMiddleware.js";
import {
  registerVisitor,
  getVisitorsByEvent,
  getVisitorsByAppUser,
  getVisitorById,
  updateVisitorStatus
} from "../controllers/visitorController.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  registerVisitorSchema,
  updateVisitorStatusSchema
} from "../validations/visitorValidation.js";

const router = express.Router();

/* ================= REGISTRATION ================= */
// Supports both User (Online) and Admin (Offline) registration
router.post(
  "/", 
  auth, 
  validate(registerVisitorSchema), 
  registerVisitor
);

/* ================= LISTINGS ================= */
// Staff/Admin can view all visitors for an event
router.get(
  "/event/:eventId", 
  auth, 
  staffOnly, 
  getVisitorsByEvent
);

// Users can view their own registrations
router.get(
  "/my", 
  auth, 
  userOnly, 
  getVisitorsByAppUser
);

/* ================= DETAILS & STATUS ================= */
router.get("/:id", auth, getVisitorById);

router.patch(
  "/:id/status",
  auth,
  adminOnly,
  validate(updateVisitorStatusSchema),
  updateVisitorStatus
);

export default router;
