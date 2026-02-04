// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import AppUser from "../models/appUserModel.js";

/* ================= AUTH (USER + STAFF + ADMIN + SUPERADMIN) ================= */
export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    /* ================= APP USER ================= */
    if (decoded.role === "user") {
      const user = await AppUser.findOne({
        appUserId: decoded.id
      });

      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      req.user = user;
      req.role = "user";
    }

    /* ================= STAFF / ADMIN / SUPERADMIN ================= */
    else if (["staff", "admin", "superadmin"].includes(decoded.role)) {
      const admin = await Admin.findOne({
        adminId: decoded.id
      });

      if (!admin) {
        return res.status(403).json({ message: "Admin not found" });
      }

      req.user = admin;
      req.role = decoded.role;
    }

    /* ================= INVALID ROLE ================= */
    else {
      return res.status(403).json({ message: "Invalid role in token" });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
};

/* ================= SUPERADMIN ONLY ================= */
export const superAdminOnly = (req, res, next) => {
  if (req.role !== "superadmin") {
    return res.status(403).json({ message: "SuperAdmin only" });
  }
  next();
};

/* ================= ADMIN + SUPERADMIN ================= */
export const adminOnly = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/* ================= STAFF + ADMIN + SUPERADMIN ================= */
export const staffOnly = (req, res, next) => {
  if (!["staff", "admin", "superadmin"].includes(req.role)) {
    return res.status(403).json({ message: "Staff access only" });
  }
  next();
};

/* ================= USER ONLY ================= */
export const userOnly = (req, res, next) => {
  if (req.role !== "user") {
    return res.status(403).json({ message: "User access only" });
  }
  next();
};
