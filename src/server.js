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
import { initNotificationWorker } from "./workers/notificationWorker.js";

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
  initNotificationWorker(io); // 🚀 Start background worker
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

// --- SIGINT handling ---
// On Windows SIGINT can arrive not only from Ctrl+C but also from terminal
// focus changes, sleep/wake, or a parent process exiting. Require two SIGINTs
// within 3s to actually shut down so a stray signal cannot kill the server.
let lastSigint = 0;
process.on("SIGINT", () => {
  const now = Date.now();
  if (now - lastSigint < 3000) {
    console.warn("⚙️ Received SIGINT (confirmed) → shutting down");
    return shutdownGracefully("SIGINT");
  }
  lastSigint = now;
  console.warn(
    "⚙️ Received SIGINT — ignoring (press Ctrl+C again within 3s to actually stop)"
  );
});

process.on("SIGTERM", () => shutdownGracefully("SIGTERM"));

// SIGHUP is sent on Windows when the parent terminal closes — ignore so a
// closed VS Code terminal doesn't take the API down.
process.on("SIGHUP", () => {
  console.warn("⚙️ Received SIGHUP — ignoring; server stays alive");
});

// Log unhandled rejections but keep the server alive. A stray unhandled
// promise should not take down every route.
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled rejection (server kept alive):", reason);
});

// Uncaught exceptions leave the process in an unknown state — exit so the
// supervisor (pm2/nodemon/docker) restarts cleanly.
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  shutdownGracefully("uncaughtException", 1);
});

export { io };
