import express from "express";

import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  trackComplaint,
  getMyComplaints,
  getComplaintsByComplainer,
  getComplaintChat,
  addChatMessage,
  getRecentComplaints
} from "../controllers/complaintController.js";

import upload from "../middlewares/uploadMiddleware.js";
import { auth, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ===================================================== */
/* ================= CREATE COMPLAINT ================== */
/* ===================================================== */
router.post("/complaints",auth,upload.array("media", 5),createComplaint);

/* ===================================================== */
/* ================= ADMIN / SUPERADMIN ================= */
/* ===================================================== */
router.get("/", auth, adminOnly, getAllComplaints);
router.put("/:id/status", auth, adminOnly, updateComplaintStatus);
router.get("/recent/list", auth, adminOnly, getRecentComplaints);

/* ===================================================== */
/* ================= USER ROUTES ======================= */
/* ===================================================== */
router.get("/my", auth, getMyComplaints);
router.get("/by-complainer/:complainerId", auth, getComplaintsByComplainer);
router.get("/:id", auth, getComplaintById);

/* ===================================================== */
/* ================= CHAT ============================== */
/* ===================================================== */
router.post("/:id/chat",auth,upload.array("media", 5),addChatMessage);

router.get("/:id/chat", auth, getComplaintChat);

/* ===================================================== */
/* ================= PUBLIC TRACKING =================== */
/* ===================================================== */
/* ⚠️ MUST be AFTER other routes to avoid conflict */
router.get("/track/:complaintId", trackComplaint);

export default router;
