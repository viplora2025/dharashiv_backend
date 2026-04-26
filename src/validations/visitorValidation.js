// src/validations/visitorValidation.js

import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

const bilingualStringSchema = z.object({
  en: z.string().min(1, "English text is required"),
  mr: z.string().min(1, "Marathi text is required"),
});

export const registerVisitorSchema = z.object({
  body: z.object({
    eventId: mongoIdSchema,
    visitorName: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional().nullable(),
    village: mongoIdSchema,
    taluka: mongoIdSchema,
    issue: z.string().min(3, "Issue must be at least 3 characters"),
    registrationType: z.string().optional(),
  }),
});

export const updateVisitorStatusSchema = z.object({
  body: z.object({
    status: bilingualStringSchema,
  }),
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const visitorQuerySchema = z.object({
  params: z.object({
    eventId: mongoIdSchema.optional(),
    appUserId: mongoIdSchema.optional(),
  }),
});
