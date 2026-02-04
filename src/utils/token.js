import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";

/* ================= ACCESS TOKEN ================= */
export const generateAccessToken = ({ id, role }) => {
  const expiresIn =
    role === "admin" || role === "superadmin"|| role === "staff"
      ? process.env.ADMIN_ACCESS_TOKEN_EXPIRE
      : process.env.USER_ACCESS_TOKEN_EXPIRE;

  return jwt.sign(
    { id, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn }
  );
};

/* ================= REFRESH TOKEN ================= */
export const generateRefreshToken = async ({ id, role }) => {
  const expiresIn =
    role === "admin" || role === "superadmin"||role === "staff"
      ? process.env.ADMIN_REFRESH_TOKEN_EXPIRE
      : process.env.USER_REFRESH_TOKEN_EXPIRE;

  const expireDays =
    role === "admin" || role === "superadmin"||role === "staff"
      ? Number(process.env.ADMIN_REFRESH_TOKEN_EXPIRE_DAYS)
      : Number(process.env.USER_REFRESH_TOKEN_EXPIRE_DAYS);

  const token = jwt.sign(
    { id, role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn }
  );

  await RefreshToken.create({
    token,
    userId: id,
    role,
    expiresAt: new Date(
      Date.now() + expireDays * 24 * 60 * 60 * 1000
    )
  });

  return token;
};
