// src/routes/journeyRoutes.js

import express from "express";
import { auth, adminOnly } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createJourney,
  updateJourney,
  deleteJourney,
  getJourneyById,
  getAllJourneys
} from "../controllers/journeyController.js";
import {
  createJourneySchema,
  updateJourneySchema
} from "../validations/journeyValidation.js";

const router = express.Router();

/**
 * @route   POST /api/journeys
 * @desc    Create a new journey milestone (Admin Only)
 */
router.post(
  "/",
  auth,
  adminOnly,
  upload.single("image"),
  validate(createJourneySchema),
  createJourney
);

/**
 * @route   PUT /api/journeys/:id
 * @desc    Update a journey milestone (Admin Only)
 */
router.put(
  "/:id",
  auth,
  adminOnly,
  upload.single("image"),
  validate(updateJourneySchema),
  updateJourney
);

/**
 * @route   DELETE /api/journeys/:id
 * @desc    Delete a journey milestone (Admin Only)
 */
router.delete("/:id", auth, adminOnly, deleteJourney);

/**
 * @route   GET /api/journeys
 * @desc    Get all journey milestones (Public/Auth users can view)
 */
router.get("/", auth, getAllJourneys);

/**
 * @route   GET /api/journeys/:id
 * @desc    Get a single journey milestone
 */
router.get("/:id", auth, getJourneyById);

export default router;
