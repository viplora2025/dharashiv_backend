// routes/talukaRoute.js

import express from "express";
import {
  createTaluka,
  getAllTalukas,
  updateTaluka,
  deleteTaluka,
  resetTalukaCounter
} from "../controllers/talukaController.js";

const router = express.Router();

// Create Taluka
router.post("/create", createTaluka);

// Get All
router.get("/get-all", getAllTalukas);

// Update
router.put("/update/:talukaId", updateTaluka);

// Delete
router.delete("/delete/:talukaId", deleteTaluka);

router.put("/reset-counter", resetTalukaCounter);

export default router;
