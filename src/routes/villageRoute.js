// routes/villageRoutes.js

import express from "express";
import {
  createVillage,
  getAllVillages,
  getVillageByTaluka,
  updateVillage,
  deleteVillage,
  resetVillageCounter
} from "../controllers/villageController.js";

const router = express.Router();

// Create Village
router.post("/create", createVillage);

// Get All
router.get("/all", getAllVillages);

// Get By Taluka
router.get("/by-taluka/:talukaId", getVillageByTaluka);

// Update Village
router.put("/update/:villageId", updateVillage);

// Delete Village
router.delete("/delete/:villageId", deleteVillage);

// Reset Counter
router.put("/reset-counter", resetVillageCounter);

export default router;
