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

const router = express.Router();

router.post("/", auth, adminOnly, upload.single("image"), createAnnouncement);
router.put("/:id", auth, adminOnly, upload.single("image"), updateAnnouncement);
router.delete("/:id", auth, adminOnly, deleteAnnouncement);

router.get("/", auth, getAllAnnouncements);
router.get("/:id", auth, getAnnouncementById);

export default router;
