// src/validations/masterValidation.js

import { z } from "zod";

export const nameSchema = z.object({
  en: z.string().min(1, "English name is required"),
  mr: z.string().min(1, "Marathi name is required"),
});

/* ================= TALUKA ================= */
export const createTalukaSchema = z.object({
  body: z.object({
    name: nameSchema,
  }),
});

export const updateTalukaSchema = z.object({
  body: z.object({
    name: nameSchema,
  }),
  params: z.object({
    id: z.string().min(1, "Taluka ID is required"),
  }),
});

/* ================= VILLAGE ================= */
export const createVillageSchema = z.object({
  body: z.object({
    name: nameSchema,
    talukaId: z.string().min(1, "Taluka ID is required"),
  }),
});

export const updateVillageSchema = z.object({
  body: z.object({
    name: nameSchema,
  }),
  params: z.object({
    id: z.string().min(1, "Village ID is required"),
  }),
});

export const bulkVillageSchema = z.object({
  body: z.object({
    talukaId: z.string().min(1, "Taluka ID is required"),
    villages: z.array(nameSchema).min(1, "Villages array cannot be empty"),
  }),
});

/* ================= DEPARTMENT ================= */
export const createDepartmentSchema = z.object({
  body: z.object({
    name: nameSchema,
    email: z.string().email("Invalid email address"),
    description: nameSchema.optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: nameSchema.optional(),
    email: z.string().email("Invalid email address").optional(),
    description: nameSchema.optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Department ID is required"),
  }),
});

export const bulkDeptSchema = z.object({
  body: z.object({
    departments: z.array(
      z.object({
        name: nameSchema,
        email: z.string().email("Invalid email address"),
        description: nameSchema.optional(),
      })
    ).min(1, "Departments array cannot be empty"),
  }),
});
