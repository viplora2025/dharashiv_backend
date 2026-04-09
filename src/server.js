import env from "./config/env.js"; // ✅ Load and validate env first
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB, { disconnectDB } from "./config/db_config.js";
import {
  initRedisAdapter,
  shutdownRedisAdapter,
} from "./config/redisAdapter.js";

import socketAuthMiddleware from "./middlewares/socketAuthMiddleware.js";

const { PORT, NODE_ENV } = env;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log("💬 Socket connected:", socket.id);

  const user = socket.user;

  if (!user) {
    console.warn("⚠️ No user attached to socket", socket.id);
    return;
  }

  socket.on("complaint:typing", (data) => {
    if (!data || typeof data !== "object") return;

    const { complaintId, toUserId, toAdminId } = data;

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
    console.log("⚙️ Socket disconnected:", socket.id);
  });
});

const closeHttpServer = () =>
  new Promise((resolve) => {
    if (!server.listening) {
      return resolve();
    }
    server.close((err) => {
      if (err) {
        console.error("❌ Error closing HTTP server:", err.message);
      } else {
        console.log("🛑 HTTP server closed");
      }
      resolve();
    });
  });

let shuttingDown = false;

const shutdownGracefully = async (signal, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.warn(`⚙️ Received ${signal} → shutting down gracefully`);

  const forceExit = setTimeout(() => {
    console.error("❌ Graceful shutdown timed out; forcing exit");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  await closeHttpServer();

  try {
    await shutdownRedisAdapter();
  } catch (err) {
    console.error("❌ Redis adapter shutdown error:", err?.message || err);
  }

  await disconnectDB();

  clearTimeout(forceExit);
  console.log("✅ Shutdown complete");
  process.exit(exitCode);
};

const handleServerError = (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `⚠️ Port ${PORT} is already in use; stop other processes or change PORT.`
    );
    process.exit(1);
  }

  throw error;
};

server.on("error", handleServerError);

const startServer = async () => {
  await initRedisAdapter(io);
  server.listen(PORT, () => {
    console.log(`🚀 [${NODE_ENV}] Server + Socket running on port ${PORT}`);
  });
};

const initialize = async () => {
  await connectDB();
  await startServer();
};

initialize().catch((err) => {
  console.error("❌ Server failed to start:", err?.message || err);
  shutdownGracefully("startServerError", 1);
});

process.on("SIGINT", () => shutdownGracefully("SIGINT"));
process.on("SIGTERM", () => shutdownGracefully("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  shutdownGracefully("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  shutdownGracefully("uncaughtException", 1);
});

export { io };
