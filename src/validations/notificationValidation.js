// src/validations/notificationValidation.js

import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    recipientId: z.string().min(1, "Recipient ID is required"),
    recipientType: z.enum(["AppUser", "Admin"], { required_error: "Recipient type is required" }),
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
