import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/adminModel.js";
import AppUser from "../models/appUserModel.js";

/**
 * Socket.IO Authentication Middleware
 * - JWT verify karta hai
 * - User / Admin identify karta hai
 * - socket pe identity attach karta hai
 * - user/admin ko sahi room me join karwata hai
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    /**
     * Token lene ke 2 supported tareeke:
     * 1) socket.handshake.auth.token   (recommended)
     * 2) Authorization header (fallback)
     */
    let token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authorization token required"));
    }

    // Agar "Bearer xxx" format me aaya ho
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // 🔐 Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // ================= USER =================
    if (decoded.role === "user") {
      const query = { $or: [{ appUserId: decoded.id }] };
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        query.$or.push({ _id: decoded.id });
      }
      const user = await AppUser.findOne(query);

      if (!user) {
        return next(new Error("User not found"));
      }

      // socket identity attach
      socket.user = user;
      socket.role = "user";

      // room join (user specific)
      socket.join(`user:${user.appUserId}`);
      // room join (all users broadcast)
      socket.join("users");
    }

    // ================= STAFF / ADMIN / SUPERADMIN =================
    else if (["staff", "admin", "superadmin"].includes(decoded.role)) {
      const query = { $or: [{ adminId: decoded.id }] };
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        query.$or.push({ _id: decoded.id });
      }
      const admin = await Admin.findOne(query);

      if (!admin) {
        return next(new Error("Admin not found"));
      }

      socket.user = admin;
      socket.role = decoded.role;

      // room join (admin specific)
      socket.join(`admin:${admin.adminId}`);

      // 🏘️ Join Taluka Rooms (for efficient broadcasting)
      if (Array.isArray(admin.assignedTaluka)) {
        admin.assignedTaluka.forEach((talukaId) => {
          socket.join(`taluka:${talukaId.toString()}`);
        });
      }
    }

    // ================= INVALID ROLE =================
    else {
      return next(new Error("Invalid role in token"));
    }

    // ✅ Auth successful
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Access token expired"));
    }

    if (err.name === "JsonWebTokenError") {
      return next(new Error("Invalid access token"));
    }

    return next(new Error("Unauthorized socket connection"));
  }
};

export default socketAuthMiddleware;
