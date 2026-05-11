// src/validations/announcementValidation.js

import { z } from "zod";
import {
  AnnouncementType,
  normalizeAnnouncementTypeKey,
} from "../config/constants.js";

// Free-text bilingual fields (title, message, location): require BOTH en and mr.
// Plain-string input is auto-mirrored only as a fallback so older admin clients
// don't break, but we surface a clear error if either language is missing.
const bilingualText = (minLen, label) =>
  z.preprocess(
    (val) => {
      if (typeof val === "string") return { en: val, mr: val };
      return val;
    },
    z.object({
      en: z
        .string()
        .trim()
        .min(minLen, `English ${label} must be at least ${minLen} characters`),
      mr: z
        .string()
        .trim()
        .min(minLen, `Marathi ${label} must be at least ${minLen} characters`),
    })
  );

const bilingualStringSchema = bilingualText(3, "text");
const bilingualLongTextSchema = bilingualText(1, "message");

// Type is a categorical field. Accept either:
//   - a known code string (e.g. "MEETING", "Public Notice", "sabha")
//     -> resolved to its predefined { en, mr } pair
//   - an explicit { en, mr } object for custom types
// We DO NOT silently duplicate a free English string into the mr field —
// that's exactly what produced "KENDRE" / "SABHA" buttons in the Marathi UI.
const announcementTypeSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const key = normalizeAnnouncementTypeKey(val);
      if (AnnouncementType[key]) return { ...AnnouncementType[key] };
      // Unknown code: leave as-is so the object validator below produces a
      // clear error instead of silently mirroring English into Marathi.
      return val;
    }
    return val;
  },
  z.object(
    {
      en: z.string().trim().min(1, "English type is required"),
      mr: z.string().trim().min(1, "Marathi type is required"),
    },
    {
      invalid_type_error:
        "Type must be a known code (e.g. MEETING, SABHA, PUBLIC_NOTICE) or an object with both 'en' and 'mr' fields",
    }
  )
);

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: bilingualStringSchema,
    message: bilingualLongTextSchema,
    eventDate: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid event date format",
      })
      .optional(),
    eventTime: z.string().optional(),
    location: bilingualStringSchema,
    type: announcementTypeSchema,
    status: z.enum(["Draft", "Published"]).optional(),
  }),
});

export const updateAnnouncementSchema = z.object({
  body: z.object({
    title: bilingualStringSchema.optional(),
    message: bilingualLongTextSchema.optional(),
    eventDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid event date format",
      })
      .optional(),
    eventTime: z.string().min(1, "Event time is required").optional(),
    location: bilingualStringSchema.optional(),
    type: announcementTypeSchema.optional(),
    status: z.enum(["Draft", "Published"]).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
  }),
});
