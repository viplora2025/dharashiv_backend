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
  deleteUser
} from "../controllers/appUserController.js";
import { auth, userOnly, staffOnly} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// forgot password
router.post("/forgot/question", getSecretQuestion);
router.post("/forgot/reset", resetPassword);


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


export default router;
