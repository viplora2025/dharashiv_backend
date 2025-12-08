import express from "express";
import {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    trackComplaint,
    getComplaintsByAppUser
} from "../controllers/complaintController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected Routes
// Protected Routes

router.post("/", verifyToken, upload.array("media", 10), createComplaint);
router.get("/", verifyToken, getAllComplaints);
router.get("/user/:appUserId", verifyToken, getComplaintsByAppUser);
router.get("/:id", verifyToken, getComplaintById);
router.put("/:id/status", verifyToken, updateComplaintStatus);

// Public Routes
router.get("/track/:complaintId", trackComplaint);

export default router;
