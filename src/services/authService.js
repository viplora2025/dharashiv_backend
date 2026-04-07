// src/services/authService.js

import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";
import { generateAccessToken } from "../utils/token.js";

/* ================= REFRESH ACCESS TOKEN (With Rotation) ================= */
export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) {
    throw new Error("Invalid refresh token");
  }

  if (stored.expiresAt < Date.now()) {
    await stored.deleteOne();
    throw new Error("Refresh token expired");
  }

  // 1️⃣ Verify the token
  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // 2️⃣ DELETE THE OLD TOKEN (Rotation)
  await stored.deleteOne();

  // 3️⃣ Generate NEW access and refresh tokens
  const payload = {
    id: decoded.id,
    role: decoded.role
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = await generateRefreshToken(payload);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/* ================= LOGOUT ================= */
export const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  await RefreshToken.deleteOne({ token: refreshToken });

  return true;
};
