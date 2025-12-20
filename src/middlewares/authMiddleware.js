// import jwt from "jsonwebtoken";
// import AppUser from "../models/appUserModel.js";

// export const verifyToken = async (req, res, next) => {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

//     if (!token) return res.status(401).json({ message: "Access token required" });

//     try {
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//         // Fetch user to ensure valid and get ObjectId
//         const user = await AppUser.findOne({ appUserId: decoded.appUserId });

//         if (!user) {
//             return res.status(403).json({ message: "User not found or deactivated" });
//         }

//         // Attach user info to request
//         req.user = {
//             _id: user._id,               // MongoDB ObjectId
//             appUserId: user.appUserId,   // Custom String ID (APP-...)
//             name: user.name,
//             phone: user.phone
//         };

//         next();
//     } catch (err) {
//         console.error("Token verification failed:", err.message);
//         return res.status(403).json({ message: "Invalid or expired token" });
//     }
// };


import jwt from "jsonwebtoken";
import AppUser from "../models/appUserModel.js";
import Admin from "../models/adminModel.js";

/* ================= APP USER TOKEN ================= */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Access token required" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await AppUser.findOne({ appUserId: decoded.appUserId });
    if (!user)
      return res.status(403).json({ message: "User not found or deactivated" });

    req.user = {
      _id: user._id,
      appUserId: user.appUserId,
      name: user.name,
      phone: user.phone,
    };

    next();
  } catch (err) {
    console.error("User token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/* ================= ADMIN TOKEN ================= */
export const adminVerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Access token required" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET // ✅ FIXED
    );

    const admin = await Admin.findOne({ adminId: decoded.adminId });
    if (!admin)
      return res.status(403).json({ message: "Admin not found" });

    req.admin = {
      _id: admin._id,
      adminId: admin.adminId,
      email: admin.email,
    };

    next();
  } catch (err) {
    console.error("Admin token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
