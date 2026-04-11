import { z } from "zod";

const durationString = z
  .string()
  .regex(/^\d+[smhd]$/, "Duration must end with s/m/h/d (e.g. 30m, 1h)")
  .describe("Human readable duration string");

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      if (typeof value === "number") {
        return value;
      }
      return 4000;
    },
    z.number().int().positive()
  ),

  MONGO_URL: z.string().min(1, "MONGO_URL is required"),

  ACCESS_TOKEN_SECRET: z.string().min(16, "ACCESS_TOKEN_SECRET must be at least 16 characters"),
  REFRESH_TOKEN_SECRET: z.string().min(16, "REFRESH_TOKEN_SECRET must be at least 16 characters"),

  ADMIN_ACCESS_TOKEN_EXPIRE: durationString.default("60m"),
  USER_ACCESS_TOKEN_EXPIRE: durationString.default("30m"),
  ADMIN_REFRESH_TOKEN_EXPIRE: durationString.default("1d"),
  USER_REFRESH_TOKEN_EXPIRE: durationString.default("7d"),

  ADMIN_REFRESH_TOKEN_EXPIRE_DAYS: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      if (typeof value === "number") {
        return value;
      }
      return 1;
    },
    z.number().int().positive()
  ),
  USER_REFRESH_TOKEN_EXPIRE_DAYS: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      if (typeof value === "number") {
        return value;
      }
      return 7;
    },
    z.number().int().positive()
  ),

  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      if (typeof value === "number") {
        return value;
      }
      return undefined;
    },
    z.number().int().positive().optional()
  ),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  CLOUDINARY_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  REDIS_URL: z.string().url().optional(),
});

export const envSchema = baseSchema.refine(
  (env) => {
    const hasCloudinaryUrl = Boolean(env.CLOUDINARY_URL);
    const hasDetailedCreds =
      Boolean(env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(env.CLOUDINARY_API_KEY) &&
      Boolean(env.CLOUDINARY_API_SECRET);

    return hasCloudinaryUrl || hasDetailedCreds;
  },
  {
    message: "Cloudinary credentials are required either via CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET",
    path: ["CLOUDINARY_URL"],
  }
);
