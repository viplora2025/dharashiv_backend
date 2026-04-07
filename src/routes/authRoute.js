import express from "express";

import {
  refreshAccessToken,
  logout
} from "../controllers/authController.js";
import { refreshTokenSchema } from "../validations/authValidation.js";
import validate from "../middlewares/validateMiddleware.js";
import { authTokenLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post(
  "/refresh-token",
  authTokenLimiter,
  validate(refreshTokenSchema),
  refreshAccessToken
);
router.post("/logout", authTokenLimiter, validate(refreshTokenSchema), logout);

export default router;
