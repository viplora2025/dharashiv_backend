// src/routes/announcementRoutes.js

import express from "express";
import { auth, adminOnly } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAllAnnouncements
} from "../controllers/announcementController.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema
} from "../validations/announcementValidation.js";

const router = express.Router();

router.post(
  "/",
  auth,
  adminOnly,
  upload.single("image"),
  validate(createAnnouncementSchema),
  createAnnouncement
);

router.put(
  "/:id",
  auth,
  adminOnly,
  upload.single("image"),
  validate(updateAnnouncementSchema),
  updateAnnouncement
);

router.delete("/:id", auth, adminOnly, deleteAnnouncement);

router.get("/", auth, getAllAnnouncements);
router.get("/:id", auth, getAnnouncementById);

export default router;
