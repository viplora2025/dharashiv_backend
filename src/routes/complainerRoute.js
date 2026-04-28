// src/routes/complainerRoute.js

import express from "express";
import {
  createComplainer,
  getAllComplainers,
  getComplainerById,
  updateComplainer,
  deleteComplainer,
  getComplainersByAppUser,
  getComplainersByUserAndTaluka,
  getComplainersByTaluka
} from "../controllers/complainerController.js";
import { auth, adminOnly, userOnly, staffOnly, notStaff } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createComplainerSchema,
  updateComplainerSchema,
  complainerQuerySchema
} from "../validations/complainerValidation.js";

const router = express.Router();

/* ================= CREATE ================= */
router.post(
  "/",
  auth,
  userOnly,
  validate(createComplainerSchema),
  createComplainer
);

router.post(
  "/admin",
  auth,
  adminOnly,
  validate(createComplainerSchema),
  createComplainer
);

/* ================= READ (LIST) ================= */
router.get(
  "/",
  auth,
  adminOnly,
  validate(complainerQuerySchema),
  getAllComplainers
);

// Get complainers for the logged-in user
router.get("/my", auth, userOnly, getComplainersByAppUser);

// Get complainers for a specific taluka (Admin/SuperAdmin)
router.get(
  "/by-taluka/:talukaId",
  auth,
  adminOnly,
  validate(complainerQuerySchema),
  getComplainersByTaluka
);

// Get complainers for the logged-in user filtered by taluka
router.get(
  "/my/taluka/:talukaId",
  auth,
  userOnly,
  getComplainersByUserAndTaluka
);

/* ================= READ / UPDATE / DELETE BY ID ================= */
router.get("/:id", auth, notStaff, getComplainerById);

router.put(
  "/:id",
  auth,
  notStaff,
  validate(updateComplainerSchema),
  updateComplainer
);

router.delete("/:id", auth, notStaff, deleteComplainer);

export default router;
