import express from "express";

import {
  refreshAccessToken,
  logout
} from "../controllers/authController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/refresh-token", auth, refreshAccessToken);
router.post("/logout", auth, logout);

export default router;
