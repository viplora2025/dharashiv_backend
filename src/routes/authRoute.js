import express from "express";
import { refreshTokens } from "../controllers/authController.js";

const router = express.Router();

// Refresh Token Endpoint
router.post("/refresh", refreshTokens);

export default router;
