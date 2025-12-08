import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// routes imports
import { swaggerDocs } from "./swagger/swagger.js";
import appUserRoute from "./routes/appUserRoute.js";
import authRoute from "./routes/authRoute.js";
import talukaRoute from "./routes/talukaRoute.js";
import villageRoute from "./routes/villageRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import complainerRoute from "./routes/complainerRoute.js";
import complaintRoute from "./routes/complaintRoute.js";
import subDepartmentRoute from "./routes/subDepartmentRoute.js";
import mappingRoute from "./routes/mappingRoutes.js";



import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));



// test route
app.get("/", (req, res) => {
  res.send("App is running...");
});
swaggerDocs(app);

// routes 
app.use("/api/appUsers", appUserRoute);
app.use("/api/auth", authRoute);
app.use("/api/talukas", talukaRoute);
app.use("/api/villages", villageRoute);
app.use("/api/departments", departmentRoute);
app.use("/api/complainers", complainerRoute);
app.use("/api/complaints", complaintRoute);
app.use("/api/sub-departments", subDepartmentRoute);
app.use("/api/mappings", mappingRoute);


export default app;
