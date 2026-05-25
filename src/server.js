import env from "./config/env.js";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";

import connectDB, {
  disconnectDB,
} from "./config/db_config.js";

import {
  initRedisAdapter,
  shutdownRedisAdapter,
} from "./config/redisAdapter.js";

import { initNotificationWorker } from "./workers/notificationWorker.js";

import logger from "./utils/logger.js";

import socketAuthMiddleware from "./middlewares/socketAuthMiddleware.js";

const { PORT, NODE_ENV } = env;

// =========================
// HTTP SERVER
// =========================
const server = http.createServer(app);

// =========================
// ALLOWED ORIGINS
// =========================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // Add production frontend URL
  // "https://yourdomain.com",
];

// =========================
// SOCKET.IO
// =========================
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      // Allow Flutter apps, Postman, mobile apps
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error("Socket.IO CORS blocked"));
    },

    credentials: true,

    methods: ["GET", "POST"],
  },
});

// =========================
// SOCKET AUTH
// =========================
io.use(socketAuthMiddleware);

// =========================
// SOCKET CONNECTIONS
// =========================
io.on("connection", (socket) => {
  logger.info(`💬 Socket connected: ${socket.id}`);

  const user = socket.user;

  if (!user) {
    logger.warn(`⚠️ No user attached to socket: ${socket.id}`);
    return;
  }

  // =========================
  // USER / ADMIN ROOM JOIN
  // =========================
  if (user._id) {
    socket.join(`user:${user._id}`);
  }

  if (user.role === "admin") {
    socket.join(`admin:${user._id}`);
  }

  // =========================
  // TYPING EVENT
  // =========================
  socket.on("complaint:typing", (data) => {
    if (!data || typeof data !== "object") return;

    const {
      complaintId,
      toUserId,
      toAdminId,
    } = data;

    if (toAdminId) {
      io.to(`admin:${toAdminId}`).emit(
        "complaint:typing",
        {
          complaintId,
          byRole: user.role,
        }
      );
    }

    if (toUserId) {
      io.to(`user:${toUserId}`).emit(
        "complaint:typing",
        {
          complaintId,
          byRole: user.role,
        }
      );
    }
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on("disconnect", () => {
    logger.info(`⚙️ Socket disconnected: ${socket.id}`);
  });
});

// =========================
// CLOSE HTTP SERVER
// =========================
const closeHttpServer = () =>
  new Promise((resolve) => {
    if (!server.listening) {
      return resolve();
    }

    server.close((err) => {
      if (err) {
        logger.error(
          `❌ Error closing HTTP server: ${err.message}`
        );
      } else {
        logger.info("🛑 HTTP server closed");
      }

      resolve();
    });
  });

// =========================
// GRACEFUL SHUTDOWN
// =========================
let shuttingDown = false;

const shutdownGracefully = async (
  signal,
  exitCode = 0
) => {
  if (shuttingDown) return;

  shuttingDown = true;

  logger.warn(
    `⚙️ Received ${signal} → shutting down gracefully`
  );

  const forceExit = setTimeout(() => {
    logger.error(
      "❌ Graceful shutdown timed out; forcing exit"
    );

    process.exit(1);
  }, 10000);

  forceExit.unref();

  // Close HTTP server
  await closeHttpServer();

  // Shutdown Redis adapter
  try {
    await shutdownRedisAdapter();
  } catch (err) {
    logger.error(
      `❌ Redis adapter shutdown error: ${
        err?.message || err
      }`
    );
  }

  // Disconnect DB
  await disconnectDB();

  clearTimeout(forceExit);

  logger.info("✅ Shutdown complete");

  process.exit(exitCode);
};

// =========================
// SERVER ERROR HANDLER
// =========================
const handleServerError = (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      `⚠️ Port ${PORT} already in use`
    );

    process.exit(1);
  }

  throw error;
};

server.on("error", handleServerError);

// =========================
// START SERVER
// =========================
const startServer = async () => {
  // Redis adapter
  await initRedisAdapter(io);

  // Background worker
  initNotificationWorker(io);

  // Start HTTP server
  server.listen(PORT, () => {
    logger.info(
      `🚀 [${NODE_ENV}] Server + Socket running on port ${PORT}`
    );
  });
};

// =========================
// INITIALIZE APP
// =========================
const initialize = async () => {
  await connectDB();

  await startServer();
};

initialize().catch((err) => {
  logger.error(
    `❌ Server failed to start: ${
      err?.message || err
    }`
  );

  shutdownGracefully("startServerError", 1);
});

// =========================
// PROCESS EVENTS
// =========================

// Windows-safe SIGINT handling
let lastSigint = 0;

process.on("SIGINT", () => {
  const now = Date.now();

  if (now - lastSigint < 3000) {
    logger.warn(
      "⚙️ Received SIGINT (confirmed) → shutting down"
    );

    return shutdownGracefully("SIGINT");
  }

  lastSigint = now;

  logger.warn(
    "⚙️ Received SIGINT — press Ctrl+C again within 3s to stop"
  );
});

// Railway / Docker shutdown
process.on("SIGTERM", () => {
  shutdownGracefully("SIGTERM");
});

// Ignore terminal close on Windows
process.on("SIGHUP", () => {
  logger.warn(
    "⚙️ Received SIGHUP — ignoring"
  );
});

// Prevent app crash from unhandled promises
process.on("unhandledRejection", (reason) => {
  logger.error(
    `❌ Unhandled rejection: ${reason}`
  );
});

// Crash safely on uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(
    `❌ Uncaught exception: ${error.message}`,
    {
      stack: error.stack,
    }
  );

  shutdownGracefully(
    "uncaughtException",
    1
  );
});

export { io };