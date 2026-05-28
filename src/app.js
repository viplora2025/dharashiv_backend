import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";

import logger from "./utils/logger.js";

// routes
import appUserRoute from "./routes/appUserRoute.js";
import authRoute from "./routes/authRoute.js";
import talukaRoute from "./routes/talukaRoute.js";
import villageRoute from "./routes/villageRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import complainerRoute from "./routes/complainerRoute.js";
import complaintRoute from "./routes/complaintRoute.js";
import adminRoute from "./routes/adminRoute.js";
import eventRoutes from "./routes/eventRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import dailyVisitorRoutes from "./routes/dailyVisitorRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import notificationRoute from "./routes/notificationRoute.js";
import journeyRoutes from "./routes/journeyRoutes.js";
import feedbackRoute from "./routes/feedbackRoute.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";
import { globalApiLimiter } from "./middlewares/rateLimit.js";

const app = express();

logger.info("🔥 app.js loaded");

// =========================
// LOGGER
// =========================
const morganFormat =
  process.env.NODE_ENV === "production" ? "combined" : "dev";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// =========================
// CORS
// =========================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
// =========================
// RATE LIMITER
// =========================
app.use("/api", globalApiLimiter);

// =========================
// SECURITY HEADERS
// =========================
app.use(
  helmet({
    contentSecurityPolicy: false,

    // Prevent image/pdf issues with Cloudinary/CDN
    crossOriginResourcePolicy: false,
  })
);

// =========================
// RESPONSE COMPRESSION
// =========================
app.use(compression());

// =========================
// HTTP PARAMETER POLLUTION
// =========================
app.use(hpp());

// =========================
// MONGO SANITIZE
// =========================
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// =========================
// BODY PARSER
// =========================
app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =========================
// BASIC ROUTES
// =========================
app.get("/", (req, res) => {
  res.send("App is running...");
});

app.get("/test", (req, res) => {
  res.json({
    ok: true,
  });
});

// =========================
// ROUTES
// =========================
logger.info("➡️ registering routes...");

app.use("/api/appUsers", appUserRoute);
logger.info("✔ appUsers route loaded");

app.use("/api/auth", authRoute);
logger.info("✔ auth route loaded");

app.use("/api/talukas", talukaRoute);
logger.info("✔ talukas route loaded");

app.use("/api/villages", villageRoute);
logger.info("✔ villages route loaded");

app.use("/api/departments", departmentRoute);
logger.info("✔ departments route loaded");

app.use("/api/complainers", complainerRoute);
logger.info("✔ complainers route loaded");

app.use("/api/complaints", complaintRoute);
logger.info("✔ complaints route loaded");

app.use("/api/admins", adminRoute);
logger.info("✔ admins route loaded");

app.use("/api/events", eventRoutes);
logger.info("✔ events route loaded");

app.use("/api/visitors", visitorRoutes);
logger.info("✔ visitors route loaded");

app.use("/api/daily-visitors", dailyVisitorRoutes);
logger.info("✔ daily visitors route loaded");

app.use("/api/announcements", announcementRoutes);
logger.info("✔ announcements route loaded");

app.use("/api/notifications", notificationRoute);
logger.info("✔ notifications route loaded");

app.use("/api/feedbacks", feedbackRoute);
logger.info("✔ feedbacks route loaded");

app.use("/api/journeys", journeyRoutes);
logger.info("✔ journeys route loaded");

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use(errorMiddleware);

export default app;