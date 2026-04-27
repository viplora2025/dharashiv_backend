// src/routes/complaintRoute.js

import express from "express";
import {
  createComplaint,
  createComplaintByAdmin,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  trackComplaint,
  getComplaintsByUser,
  getComplaintsByComplainer,
  getComplaintChat,
  addChatMessage,
  getRecentComplaints,
  forwardToDepartment
} from "../controllers/complaintController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { auth, adminOnly, userOnly, staffOnly, notStaff } from "../middlewares/authMiddleware.js";
// import { complaintCreateLimiter } from "../middlewares/rateLimit.js"; // Removed as per user request
import validate from "../middlewares/validateMiddleware.js";
import {
  createComplaintSchema,
  updateStatusSchema,
  addChatSchema,
  filterComplaintSchema
} from "../validations/complaintValidation.js";

const router = express.Router();

/* ================= CREATE COMPLAINT ================= */
router.post(
  "/",
  auth,
  userOnly,
  upload.fields([
    { name: "voiceNote", maxCount: 1 },
    { name: "attachments", maxCount: 10 }
  ]),
  validate(createComplaintSchema),
  createComplaint
);

/* ============ CREATE COMPLAINT BY ADMIN/SUPERADMIN ============ */
router.post(
  "/admin",
  auth,
  adminOnly,
  upload.fields([
    { name: "voiceNote", maxCount: 1 },
    { name: "attachments", maxCount: 10 }
  ]),
  validate(createComplaintSchema),
  createComplaintByAdmin
);

/* ================= ADMIN / SUPERADMIN ================= */
router.get(
  "/",
  auth,
  adminOnly,
  validate(filterComplaintSchema),
  getAllComplaints
);

router.put(
  "/:id/status", 
  auth, 
  adminOnly, 
  validate(updateStatusSchema), 
  updateComplaintStatus
);

router.get("/recent/list", auth, adminOnly, getRecentComplaints);

router.post("/:id/forward", auth, adminOnly, forwardToDepartment);

/* ================= USER / ADMIN ONLY ROUTES ================= */
// Staff cannot view or manage any complaint content

router.get("/my", auth, userOnly, getComplaintsByUser);

router.get("/by-complainer/:complainerId", auth, notStaff, getComplaintsByComplainer);

router.get("/:id", auth, notStaff, getComplaintById);

/* ================= CHAT (USER / ADMIN ONLY) ================= */
router.post(
  "/:id/chat", 
  auth, 
  notStaff,
  upload.array("media", 5), 
  validate(addChatSchema),
  addChatMessage
);

router.get("/:id/chat", auth, notStaff, getComplaintChat);

/* ================= PUBLIC TRACKING =================== */
router.get("/track/:complaintId", trackComplaint);

export default router;
