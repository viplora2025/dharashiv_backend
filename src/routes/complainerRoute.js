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
import { auth,adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", auth, createComplainer);
router.get("/", auth, adminOnly, getAllComplainers);
router.get("/by-user/:userId", auth, getComplainersByAppUser);
router.get("/:id", auth,  getComplainerById);
router.put("/:id", auth, updateComplainer);
router.delete("/:id",auth, deleteComplainer);
router.get("/by-user-taluka/:userId/:talukaId", auth, getComplainersByUserAndTaluka);
router.get(
  "/complainers/by-taluka/:talukaId",
  getComplainersByTaluka
);
export default router;
// ==========================
// Get Complainers by User + Taluka (with pagination)
// ==========================   
// http://localhost:5000/api/complainers/by-user-taluka?userId=65b8f1a9c4d123456789abcd&talukaId=65b9a2d7e9f987654321abcd&page=1&limit=10
//GET /api/complainers?page=1&limit=10&talukaId=xxxx
