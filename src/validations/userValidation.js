// src/validations/userValidation.js

import { z } from "zod";

export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    secretQuestion: z.string().min(5, "Secret question required"),
    secretAnswer: z.string().min(1, "Secret answer required"),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
    password: z.string().min(1, "Password required"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
    answer: z.string().min(1, "Answer required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});
