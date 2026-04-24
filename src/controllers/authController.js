// src/controllers/authController.js

import {
  refreshAccessTokenService,
  logoutService
} from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

/* ================= REFRESH ACCESS TOKEN (Supports Rotation) ================= */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshAccessTokenService(refreshToken);

    sendSuccess(res, { 
      accessToken, 
      refreshToken: newRefreshToken,
      message: "Token refreshed successfully" 
    });
  } catch (err) {
    next(err); // ⬅️ Handle via global error middleware
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken, allDevices } = req.body;

    await logoutService(refreshToken, allDevices);

    sendSuccess(res, { message: "Logged out successfully" });
  } catch (err) {
    next(err); // ⬅️ Handle via global error middleware
  }
};
