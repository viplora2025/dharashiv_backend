import express from "express";
import {
    createComplainer,
    getAllComplainers,
    getComplainerById,
    updateComplainer,
    deleteComplainer,
    getComplainersByAppUser
} from "../controllers/complainerController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createComplainer);
router.get("/", verifyToken, getAllComplainers);
router.get("/by-user/:userId", verifyToken, getComplainersByAppUser);
router.get("/:id", verifyToken, getComplainerById);
router.put("/:id", verifyToken, updateComplainer);
router.delete("/:id", verifyToken, deleteComplainer);

export default router;
