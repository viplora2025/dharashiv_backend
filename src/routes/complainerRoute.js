import express from "express";
import {
    createComplainer,
    getAllComplainers,
    getComplainerById,
    updateComplainer,
    deleteComplainer,
    getComplainersByAppUser
} from "../controllers/complainerController.js";
import { adminVerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", adminVerifyToken, createComplainer);
router.get("/", adminVerifyToken, getAllComplainers);
router.get("/by-user/:userId", adminVerifyToken, getComplainersByAppUser);
router.get("/:id", adminVerifyToken, getComplainerById);
router.put("/:id", adminVerifyToken, updateComplainer);
router.delete("/:id",adminVerifyToken, deleteComplainer);

export default router;
