// src/validations/eventValidation.js

import { z } from "zod";
import { EventStatus } from "../config/constants.js";

const allowedStatus = Object.values(EventStatus);

const bilingualStringSchema = z.object({
  en: z.string().min(1, "English text is required"),
  mr: z.string().min(1, "Marathi text is required"),
});

export const createEventSchema = z.object({
  body: z.object({
    title: bilingualStringSchema.optional(), // Default is Janta Darbar
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid event date format",
    }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    address: bilingualStringSchema.optional(),
    maxTokens: z.number().int().positive("Max tokens must be a positive integer").optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: bilingualStringSchema.optional(),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid event date format",
    }).optional(),
    startTime: z.string().min(1, "Start time is required").optional(),
    endTime: z.string().min(1, "End time is required").optional(),
    address: bilingualStringSchema.optional(),
    maxTokens: z.number().int().positive("Max tokens must be a positive integer").optional(),
    status: bilingualStringSchema.optional(),
    meetingSummary: bilingualStringSchema.optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
  }),
});

export const updateEventStatusSchema = z.object({
  body: z.object({
    status: bilingualStringSchema,
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
  }),
});
