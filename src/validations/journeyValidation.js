// src/validations/journeyValidation.js

import { z } from "zod";

const bilingualSchema = z.object({
  en: z.string().min(1, "English field is required").trim(),
  mr: z.string().min(1, "Marathi field is required").trim(),
});

export const createJourneySchema = z.object({
  body: z.object({
    sr: z.preprocess((val) => Number(val), z.number().int().positive()),
    years: z.string().min(1, "Years field is required").trim(),
    title: bilingualSchema,
    description: bilingualSchema,
  }),
});

export const updateJourneySchema = z.object({
  body: z.object({
    sr: z.preprocess((val) => Number(val), z.number().int().positive()).optional(),
    years: z.string().min(1).trim().optional(),
    title: bilingualSchema.optional(),
    description: bilingualSchema.optional(),
  }),
});
