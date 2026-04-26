// src/validations/adminValidation.js

import { z } from "zod";

export const registerAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["staff", "admin", "superadmin"], {
      errorMap: () => ({ message: "Invalid role" }),
    }),
    assignedTaluka: z.array(z.string()).optional(),
  }),
});

export const loginAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});
