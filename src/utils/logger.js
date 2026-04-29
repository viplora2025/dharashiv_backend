// src/utils/logger.js

import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for console (readable)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0 && metadata.stack === undefined) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (metadata.stack) {
    msg += `\n${metadata.stack}`;
  }
  return msg;
});

// Configure Log Rotation
const fileRotateTransport = (filename, level = "info") => {
  return new winston.transports.DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true, // Compress old logs
    maxSize: "20m",      // Rotate if file > 20MB
    maxFiles: "14d",     // Keep logs for 14 days
    level: level,
  });
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    process.env.NODE_ENV === "production" ? json() : combine(colorize(), consoleFormat)
  ),
  transports: [
    // 🖥️ Console Output (Limited in production implicitly by winston)
    new winston.transports.Console(),

    // 📂 Daily Log Rotation (Production only)
    ...(process.env.NODE_ENV === "production"
      ? [
          fileRotateTransport("error", "error"),
          fileRotateTransport("combined", "info"),
        ]
      : []),
  ],
});

export default logger;
