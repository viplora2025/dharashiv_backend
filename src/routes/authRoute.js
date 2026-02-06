import express from "express";

import {
  refreshAccessToken,
  logout
} from "../controllers/authController.js";

const router = express.Router();

router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

export default router;
