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

// 🔹 Temporary test (sirf check ke liye)
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});
io.use(socketAuthMiddleware);
const PORT = process.env.PORT || 4000;

// 🔹 IMPORTANT: listen on server, not app
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});

// 🔹 export io for later use (VERY IMPORTANT)
export { io };
