import express from "express";

import {
  registerUser,
  loginUser,
  getSecretQuestion,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  getUserByPhone,
  updateUserByAdmin,
  deleteUser,
  toggleUserBlock
} from "../controllers/appUserController.js";
import { auth, userOnly, staffOnly } from "../middlewares/authMiddleware.js";
import {
  userLoginLimiter,
  userRegisterLimiter,
  userForgotLimiter
} from "../middlewares/rateLimit.js";
import {
  registerUserSchema,
  loginUserSchema,
  resetPasswordSchema,
} from "../validations/userValidation.js";
import validate from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  userRegisterLimiter,
  validate(registerUserSchema),
  registerUser
);
router.post("/login", userLoginLimiter, validate(loginUserSchema), loginUser);

// forgot password
router.post("/forgot/question", userForgotLimiter, getSecretQuestion);
router.post(
  "/forgot/reset",
  userForgotLimiter,
  validate(resetPasswordSchema),
  resetPassword
);


/* ================= USER ================= */

// My profile
router.get("/me", auth, userOnly, getMyProfile);

// Update my profile
router.put("/me", auth, userOnly, updateMyProfile);

/* ================= ADMIN ================= */

// Get all users
router.get("/", auth, staffOnly, getAllUsers);

// Get user by ID
router.get("/id/:id", auth, staffOnly, getUserById);

// Get user by phone
router.get("/phone/:phone", auth, staffOnly, getUserByPhone);

// Update user
router.put("/:id", auth, staffOnly, updateUserByAdmin);

// Delete user
router.delete("/:id", auth, staffOnly, deleteUser);

// Toggle block user
router.patch("/:id/toggle-block", auth, staffOnly, toggleUserBlock);


export default router;
