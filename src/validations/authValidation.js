// src/validations/authValidation.js

import { z } from "zod";

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token required"),
  }),
});
