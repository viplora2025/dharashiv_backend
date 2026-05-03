// src/middlewares/errorMiddleware.js

import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

/**
 * Global Error Handling Middleware
 * 🛡️ Hardened for Production: Masks technical details for non-operational errors.
 */
const errorMiddleware = (err, req, res, next) => {
  // 1. Initial Logic
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let isOperational = false; // Flag for known, expected errors

  // 2. Map Operational Errors (Known errors we want to show messages for)

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0] || "Entry";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    isOperational = true;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(", ");
    isOperational = true;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token. Please log in again.";
    isOperational = true;
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Your token has expired. Please log in again.";
    isOperational = true;
  }

  // Zod Validation Errors (Zod 4 uses `issues`, Zod 3 used `errors`)
  if (err.name === "ZodError") {
    status = 400;
    const issues = err.issues || err.errors || [];
    message = issues
      .map((e) => {
        // Drop the leading "body"/"query"/"params" wrapper segment so
        // the user sees "Reason must be at least 3 characters" instead of
        // "body.reason: Reason must be at least ...".
        const path = (e.path || []).slice(1).join(".");
        return path ? `${path}: ${e.message}` : e.message;
      })
      .join("; ");
    isOperational = true;
  }

  // Explicitly marked operational errors (if any)
  if (err.isOperational) {
    isOperational = true;
  }

  // 3. Environment Specific Handling
  const environment = process.env.NODE_ENV || "development";

  if (environment === "development") {
    // 💻 Development: Log everything and send full details
    logger.error(`❌ ERROR [DEV]: ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    // For operational errors (validation, auth, etc) prefer the friendly
    // `message` we constructed above over the raw `err.message` (which is
    // a JSON-stringified array for ZodErrors).
    sendError(res, {
      status,
      message: isOperational ? message : (err.message || "Internal Server Error"),
      stack: err.stack,
    });

  } else {
    // 🛡️ Production: Mask unexpected errors
    logger.error(`❌ ERROR [PROD]: ${err.message}`, {
      path: req.path,
      method: req.method,
    });

    // If it's a crash/database failure/programming bug (not operational), mask it.
    const productionMessage = isOperational 
      ? message 
      : "Something went wrong on our end. Please try again later.";

    sendError(res, {
      status,
      message: productionMessage,
    });
  }
};

export default errorMiddleware;
