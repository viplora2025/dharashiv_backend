import { z } from "zod";

export const createFeedbackSchema = z.object({
  body: z.object({
    subject: z.string().min(2, "Subject is required"),
    message: z.string().min(2, "Message is required"),
  }),
});

export const getFeedbacksSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});
