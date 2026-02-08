// src/controllers/authController.js

import {
  refreshAccessTokenService,
  logoutService
} from "../services/authService.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* ================= REFRESH ACCESS TOKEN ================= */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const newAccessToken =
      await refreshAccessTokenService(refreshToken);

    sendSuccess(res, { accessToken: newAccessToken });
  } catch (err) {
    sendError(res, { status: 403, message: err.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await logoutService(refreshToken);

    sendSuccess(res, { message: "Logged out successfully" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};
