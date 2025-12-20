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
import { adminVerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected Routes
// Protected Routes

router.post("/", adminVerifyToken, upload.array("media", 10), createComplaint);
router.get("/",adminVerifyToken, getAllComplaints);
router.get("/user/:appUserId", adminVerifyToken, getComplaintsByAppUser);
router.get("/:id",adminVerifyToken, getComplaintById);
router.put("/:id/status", adminVerifyToken, updateComplaintStatus);

// Public Routes
router.get("/track/:complaintId", trackComplaint);

export default router;
