// src/validations/announcementValidation.js

import { z } from "zod";

const bilingualStringSchema = z.object({
  en: z.string().min(3, "English text must be at least 3 characters"),
  mr: z.string().min(3, "Marathi text must be at least 3 characters"),
});

const bilingualLongTextSchema = z.object({
  en: z.string().min(10, "English message must be at least 10 characters"),
  mr: z.string().min(10, "Marathi message must be at least 10 characters"),
});

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: bilingualStringSchema,
    message: bilingualLongTextSchema,
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid event date format",
    }),
    eventTime: z.string().min(1, "Event time is required"),
    location: bilingualStringSchema,
    type: bilingualStringSchema,
    status: z.enum(["Draft", "Published"]).optional(),
  }),
});

export const updateAnnouncementSchema = z.object({
  body: z.object({
    title: bilingualStringSchema.optional(),
    message: bilingualLongTextSchema.optional(),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid event date format",
    }).optional(),
    eventTime: z.string().min(1, "Event time is required").optional(),
    location: bilingualStringSchema.optional(),
    type: bilingualStringSchema.optional(),
    status: z.enum(["Draft", "Published"]).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
  }),
});
