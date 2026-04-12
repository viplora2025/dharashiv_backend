// src/validations/notificationValidation.js

import { z } from "zod";

const recipientModelSchema = z.enum(["AppUser", "Admin"], {
  required_error: "Recipient type/model is required",
});

export const createNotificationSchema = z.object({
  body: z
    .object({
      recipientId: z.string().min(1, "Recipient ID is required"),
      recipientType: recipientModelSchema.optional(),
      recipientModel: recipientModelSchema.optional(),
      title: z.object({
        en: z.string().min(1, "English title is required"),
        mr: z.string().min(1, "Marathi title is required")
      }),
      message: z.object({
        en: z.string().min(1, "English message is required"),
        mr: z.string().min(1, "Marathi message is required")
      }),
      type: z.string().min(1, "Notification type is required"),
      relatedId: z.string().optional()
    })
    .refine(
      (value) => !!(value.recipientModel || value.recipientType),
      {
        message: "Either recipientModel or recipientType must be provided",
        path: ["recipientModel"]
      }
    )
});

export const updateReadStatusSchema = z.object({
  body: z.object({
    isRead: z.boolean({ required_error: "isRead status is required" })
  }),
  params: z.object({
    id: z.string().min(1, "Notification ID is required")
  })
});

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Notification ID is required")
  })
});
