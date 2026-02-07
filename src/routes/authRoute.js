import express from "express";

import {
  refreshAccessToken,
  logout
} from "../controllers/authController.js";
import { authTokenLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/refresh-token", authTokenLimiter, refreshAccessToken);
router.post("/logout", authTokenLimiter, logout);

export default router;
