// src/validations/complainerValidation.js

import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

export const createComplainerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    taluka: mongoIdSchema,
    village: mongoIdSchema,
  }),
});

export const updateComplainerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  }),
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const complainerQuerySchema = z.object({
  query: z.object({
    talukaId: mongoIdSchema.optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  }),
});
