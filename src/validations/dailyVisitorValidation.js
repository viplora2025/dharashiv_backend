// src/validations/dailyVisitorValidation.js

import { z } from "zod";

export const createDailyVisitorSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number").nullable().optional(),
    address: z.string().nullable().optional(),
    reason: z.string().min(3, "Reason must be at least 3 characters"),
    remark: z.string().nullable().optional(),
    visitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid visit date format",
    }).optional(),
  }),
});

export const updateDailyVisitorSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number").nullable().optional(),
    address: z.string().nullable().optional(),
    reason: z.string().min(3, "Reason must be at least 3 characters").optional(),
    remark: z.string().nullable().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
  }),
});

export const dateParamSchema = z.object({
  params: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  }),
});

export const monthYearParamSchema = z.object({
  params: z.object({
    year: z.string().regex(/^\d{4}$/, "Invalid year format"),
    month: z.string().regex(/^(0?[1-9]|1[0-2])$/, "Invalid month (1-12)"),
  }),
});

export const yearParamSchema = z.object({
  params: z.object({
    year: z.string().regex(/^\d{4}$/, "Invalid year format"),
  }),
});
