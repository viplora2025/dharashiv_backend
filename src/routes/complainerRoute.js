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
import { auth, adminOnly, userOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, userOnly, createComplainer);
router.get("/", auth, adminOnly, getAllComplainers);

router.get("/by-user-taluka/:userId/:talukaId", auth, getComplainersByUserAndTaluka);
router.get("/by-taluka/:talukaId", auth, adminOnly, getComplainersByTaluka);
router.get("/by-user/:userId", auth, getComplainersByAppUser);

router.get("/:id", auth, getComplainerById);
router.put("/:id", auth, updateComplainer);
router.delete("/:id", auth, deleteComplainer);

export default router;
