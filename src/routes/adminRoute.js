import express from "express";
import {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  resendOtp,
  getAdminById,
  getAdminByPhone,
  getAllAdmins,
  updateAdmin,
  deleteAdmin
} from "../controllers/adminController.js";

import { auth, adminOnly,superAdminOnly, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= AUTH ================= */

// Login (Admin + SuperAdmin)
router.post("/login", loginAdmin);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// Resend OTP
router.post("/resend-otp", resendOtp);

/* ================= ADMIN MANAGEMENT ================= */

// Register Admin (ONLY SUPERADMIN)
router.post("/register",auth, superAdminOnly,registerAdmin);

// Get all admins (SuperAdmin + Admin)
router.get("/", auth, superAdminOnly,getAllAdmins);

// Get admin by MongoDB ID
router.get("/id/:id",auth,getAdminById);

// Get admin by phone
router.get("/phone/:phone",auth,adminOnly,getAdminByPhone);

// Update admin
router.put("/:id",auth,adminOnly,updateAdmin);

// Delete admin (ONLY SUPERADMIN recommended)
router.delete("/:id",auth,superAdminOnly,deleteAdmin);

export default router;
