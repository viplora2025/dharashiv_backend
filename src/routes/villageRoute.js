// routes/villageRoutes.js

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
import { auth, adminOnly,superAdminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Village
router.post("/create", auth, superAdminOnly, createVillage);

// Get All
router.get("/all",auth, getAllVillages);

// Get By Taluka
router.get("/by-taluka/:talukaId", auth, getVillageByTaluka);

// Update Village
router.put("/update/:villageId", auth, superAdminOnly, updateVillage);

// Delete Village
router.delete("/delete/:villageId", auth, superAdminOnly, deleteVillage);

// Reset Counter
router.put("/reset-counter", auth, superAdminOnly, resetVillageCounter);


router.get("/by2-taluka/:talukaObjectId", auth, getVillageByTalukaObjectId);

router.post("/bulk", auth, adminOnly, createMultipleVillages);

export default router;