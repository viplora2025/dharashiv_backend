// src/validations/announcementValidation.js

import { z } from "zod";

const flatToBilingual = (minLen, label) =>
  z.preprocess(
    (val) => {
      if (typeof val === "string") return { en: val, mr: val };
      return val;
    },
    z.object({
      en: z.string().min(minLen, `English ${label} must be at least ${minLen} characters`),
      mr: z.string().min(minLen, `Marathi ${label} must be at least ${minLen} characters`),
    })
  );

const bilingualStringSchema = flatToBilingual(3, "text");
const bilingualLongTextSchema = flatToBilingual(10, "message");

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
