import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";

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

import errorMiddleware from "./middlewares/errorMiddleware.js";
import { globalApiLimiter } from "./middlewares/rateLimit.js";

const app = express();

console.log("🔥 app.js loaded");

// ✅ CORS MUST BE FIRST — before rate limiter, helmet, or any middleware
// that can short-circuit a request. Otherwise OPTIONS preflight responses
// can be returned (e.g. by the rate limiter) without CORS headers and the
// browser reports net::ERR_FAILED + "No 'Access-Control-Allow-Origin'".
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    return cb(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Explicit preflight handler — guarantees OPTIONS always responds with
// CORS headers even if a later middleware would otherwise intercept.
app.options("*", cors(corsOptions));

// Rate limiter AFTER CORS so preflight can never be 429'd without headers.
app.use("/api", globalApiLimiter);

// ✅ BASIC SECURITY HEADERS (CSP disabled to avoid frontend breakage)
app.use(helmet({ contentSecurityPolicy: false }));

// ✅ Sanitize MongoDB operators from request input
app.use(
  mongoSanitize({
    replaceWith: "_"
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ BASIC TEST ROUTES
app.get("/", (req, res) => {
  res.send("App is running...");
});

app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// ✅ ROUTES (with debug logs)
console.log("➡️ registering routes...");

app.use("/api/appUsers", appUserRoute);
console.log("✔ appUsers route loaded");

app.use("/api/auth", authRoute);
console.log("✔ auth route loaded");

app.use("/api/talukas", talukaRoute);
console.log("✔ talukas route loaded");

app.use("/api/villages", villageRoute);
console.log("✔ villages route loaded");

app.use("/api/departments", departmentRoute);
console.log("✔ departments route loaded");

app.use("/api/complainers", complainerRoute);
console.log("✔ complainers route loaded");

app.use("/api/complaints", complaintRoute);
console.log("✔ complaints route loaded");

app.use("/api/admins", adminRoute);
console.log("✔ admins route loaded");

app.use("/api/events", eventRoutes);
console.log("✔ events route loaded");

app.use("/api/visitors", visitorRoutes);
console.log("✔ visitors route loaded");

app.use("/api/daily-visitors", dailyVisitorRoutes);
console.log("✔ daily visitors route loaded");

app.use("/api/announcements", announcementRoutes);
console.log("✔ announcements route loaded");

app.use("/api/notifications", notificationRoute);
console.log("✔ notifications route loaded");

app.use("/api/journeys", journeyRoutes);
console.log("✔ journeys route loaded");



app.use(errorMiddleware);


export default app;
