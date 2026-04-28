// src/validations/complaintValidation.js

import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

export const createComplaintSchema = z.object({
  body: z.object({
    complainer: mongoIdSchema,
    department: mongoIdSchema.optional().nullable(),
    specification: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  }),
});

/* 
  Note: Logic for (subject OR description) OR voiceNote 
  is handled in the service because it depends on req.files 
  which Zod doesn't see in the same way.
*/

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["open", "in-progress", "resolved", "closed"], {
      errorMap: () => ({ message: "Status must be open, in-progress, resolved, or closed" }),
    }),
  }),
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const addChatSchema = z.object({
  body: z.object({
    message: z.string().optional().nullable(),
  }),
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const filterComplaintSchema = z.object({
  query: z.object({
    status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
    department: mongoIdSchema.optional(),
    filedBy: mongoIdSchema.optional(),
    talukaId: mongoIdSchema.optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  }),
});

export const trackComplaintsByPhoneSchema = z.object({
  params: z.object({
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  }),
});
