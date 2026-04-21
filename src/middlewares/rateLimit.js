import rateLimit from "express-rate-limit";

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, try later" }
};

export const adminLoginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10
});

// Global API limiter. Generous default so a normal admin session (with
// notification polling + multiple tabs) can't exhaust the bucket. Disabled
// entirely outside production so local work isn't silently throttled, and
// OPTIONS preflight is always skipped so CORS preflight can never be 429'd.
export const globalApiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: (req) =>
    process.env.NODE_ENV !== "production" || req.method === "OPTIONS",
  message: { message: "Too many requests from this IP. Please try again later." }
});

export const adminOtpLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 3
});

export const adminResetLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 5
});

export const userLoginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10
});

export const userRegisterLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 5
});

export const userForgotLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 5
});

export const authTokenLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 30
});

export const complaintCreateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000,
  max: 2
});
