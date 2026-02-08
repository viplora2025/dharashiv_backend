import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db_config.js";

// Connect DB once (safe for Vercel)

await connectDB();


// ❌ NO app.listen()
export default app;
