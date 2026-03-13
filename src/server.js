import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config(); // ✅ sabse pehle

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db_config.js";

import socketAuthMiddleware from "./middlewares/socketAuthMiddleware.js";

connectDB();

// 🔹 Create HTTP server from Express app
const server = http.createServer(app);

// 🔹 Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

io.use(socketAuthMiddleware);


// 🔹 Temporary test (sirf check ke liye) Add Room Join Logic
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  const user = socket.user;

  if (!user) {
    console.log("⚠️ No user on socket");
    return;
  }

  /* ================= USER ROOM ================= */
  if (user.role === "user" && user.appUserId) {
    const room = `user:${user.appUserId}`;
    socket.join(room);
    console.log(`👤 User joined room: ${room}`);
  }

  /* ================= ADMIN ROOM ================= */
  if ((user.role === "admin" || user.role === "superadmin") && user.adminId) {
    const room = `admin:${user.adminId}`;
    socket.join(room);
    console.log(`🛠 Admin joined room: ${room}`);
  }

  // ================= TYPING INDICATOR =================
  socket.on("complaint:typing", (data) => {
    const { complaintId, toRole } = data;

    const user = socket.user;
    if (!user) return;

    if (toRole === "admin") {
      io.to(`admin:${user.adminId}`).emit("complaint:typing", {
        complaintId,
        byRole: user.role
      });
    }

    if (toRole === "user") {
      io.to(`user:${user.appUserId}`).emit("complaint:typing", {
        complaintId,
        byRole: user.role
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

// 🔹 IMPORTANT: listen on server, not app
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});

// 🔹 export io for later use (VERY IMPORTANT)
export { io };
