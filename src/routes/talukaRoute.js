// src/routes/talukaRoute.js

import express from "express";
import {
  createTaluka,
  getAllTalukas,
  updateTaluka,
  deleteTaluka,
  resetTalukaCounter
} from "../controllers/talukaController.js";
import { auth, superAdminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createTalukaSchema,
  updateTalukaSchema
} from "../validations/masterValidation.js";

const router = express.Router();

// Create Taluka
router.post(
  "/create",
  auth,
  superAdminOnly,
  validate(createTalukaSchema),
  createTaluka
);

// Get All (Available to all authenticated users)
router.get("/get-all", auth, getAllTalukas);

// Update
router.put(
  "/update/:id",
  auth,
  superAdminOnly,
  validate(updateTalukaSchema),
  updateTaluka
);

// Delete
router.delete("/delete/:id", auth, superAdminOnly, deleteTaluka);

// Reset Counter
router.put("/reset-counter", auth, superAdminOnly, resetTalukaCounter);

export default router;
