import express from "express";
import cors from "cors";

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




const app = express();

console.log("🔥 app.js loaded");

// ✅ MIDDLEWARES
app.use(
  cors({
    origin: true,
    credentials: true,
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


export default app;
