import dotenv from "dotenv";
import { envSchema } from "./envSchema.js";

dotenv.config();

const validationResult = envSchema.safeParse(process.env);

if (!validationResult.success) {
  console.error("❌ Environment validation failed:");
  console.error(validationResult.error.format());
  process.exit(1);
}

const env = validationResult.data;

Object.entries(env).forEach(([key, value]) => {
  if (value === undefined) return;
  process.env[key] = String(value);
});

console.log("✅ Environment validated and loaded for", env.NODE_ENV);

export default env;
