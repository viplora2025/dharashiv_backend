// src/routes/villageRoute.js

import express from "express";
import {
  createVillage,
  getAllVillages,
  getVillageByTaluka,
  updateVillage,
  deleteVillage,
  resetVillageCounter,
  getVillageByTalukaObjectId,
  createMultipleVillages
} from "../controllers/villageController.js";
import { auth, superAdminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createVillageSchema,
  updateVillageSchema,
  bulkVillageSchema
} from "../validations/masterValidation.js";

const router = express.Router();

// Create Village
router.post(
  "/create",
  auth,
  superAdminOnly,
  validate(createVillageSchema),
  createVillage
);

// Create Multiple Villagers (Bulk)
router.post(
  "/bulk",
  auth,
  superAdminOnly,
  validate(bulkVillageSchema),
  createMultipleVillages
);

// Get All
router.get("/all", auth, getAllVillages);

// Get By Taluka (String ID)
router.get("/by-taluka/:talukaId", auth, getVillageByTaluka);

// Get By Taluka (Object ID)
router.get("/by2-taluka/:talukaObjectId", auth, getVillageByTalukaObjectId);

// Update Village
router.put(
  "/update/:id",
  auth,
  superAdminOnly,
  validate(updateVillageSchema),
  updateVillage
);

// Delete Village
router.delete("/delete/:id", auth, superAdminOnly, deleteVillage);

// Reset Counter
router.put("/reset-counter", auth, superAdminOnly, resetVillageCounter);

export default router;
