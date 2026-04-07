// src/routes/adminRoute.js

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

import {
  auth,
  adminOnly,
  superAdminOnly
} from "../middlewares/authMiddleware.js";
import {
  adminLoginLimiter,
  adminOtpLimiter,
  adminResetLimiter
} from "../middlewares/rateLimit.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  registerAdminSchema,
  loginAdminSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema
} from "../validations/adminValidation.js";

const router = express.Router();

/* ================= AUTH ================= */

// Login
router.post(
  "/login",
  adminLoginLimiter,
  validate(loginAdminSchema),
  loginAdmin
);

// Forgot password (OTP request)
router.post(
  "/forgot-password",
  adminOtpLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

// Reset password (with OTP)
router.post(
  "/reset-password",
  adminResetLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

// Resend OTP
router.post(
  "/resend-otp",
  adminOtpLimiter,
  validate(resendOtpSchema),
  resendOtp
);

/* ================= ADMIN MANAGEMENT ================= */

// Register Admin (ONLY SUPERADMIN)
router.post(
  "/register",
  auth,
  superAdminOnly,
  validate(registerAdminSchema),
  registerAdmin
);

// Get all admins (SuperAdmin only recommended for security)
router.get("/", auth, superAdminOnly, getAllAdmins);

// Get admin by ID
router.get("/id/:id", auth, adminOnly, getAdminById);

// Get admin by phone
router.get("/phone/:phone", auth, adminOnly, getAdminByPhone);

// Update admin
router.put("/:id", auth, adminOnly, updateAdmin);

// Delete admin (ONLY SUPERADMIN)
router.delete("/:id", auth, superAdminOnly, deleteAdmin);

export default router;
