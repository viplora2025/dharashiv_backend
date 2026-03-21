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
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// 🔹 Temporary test (sirf check ke liye) Add Room Join Logic
io.on("connection", (socket) => {
  // ✅ GLOBAL USERS ROOM (VERY IMPORTANT)

  console.log("🟢 Socket connected:", socket.id);

  const user = socket.user;

  if (!user) {
    console.log("⚠️ No user on socket");
    return;
  }


  // ================= TYPING INDICATOR =================
  socket.on("complaint:typing", (data) => {
    if (!data || typeof data !== "object") return;

    const { complaintId, toUserId, toAdminId } = data;

    console.log("📨 Typing event received:", data);

    if (toAdminId) {
      console.log("➡️ Sending to admin room:", `admin:${toAdminId}`);
    }

    if (toUserId) {
      console.log("➡️ Sending to user room:", `user:${toUserId}`);
    }

    const user = socket.user;
    if (!user) return;

    if (toAdminId) {
      io.to(`admin:${toAdminId}`).emit("complaint:typing", {
        complaintId,
        byRole: user.role,
      });
    }

    if (toUserId) {
      io.to(`user:${toUserId}`).emit("complaint:typing", {
        complaintId,
        byRole: user.role,
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
