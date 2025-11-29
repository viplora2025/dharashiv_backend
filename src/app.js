import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// routes imports
import { swaggerDocs } from "./swagger/swagger.js";
import appUserRoute from "./routes/appUserRoute.js";
import authRoute from "./routes/authRoute.js";
import talukaRoute from "./routes/talukaRoute.js";
import villageRoute from "./routes/villageRoute.js";


dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());



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

export default app;
