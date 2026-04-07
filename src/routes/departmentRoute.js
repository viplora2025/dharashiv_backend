// src/routes/departmentRoute.js

import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  resetDepartmentCounter,
  bulkCreateDepartments
} from "../controllers/departmentController.js";
import { auth, superAdminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  bulkDeptSchema
} from "../validations/masterValidation.js";

const router = express.Router();

// Create Department
router.post(
  "/create",
  auth,
  superAdminOnly,
  validate(createDepartmentSchema),
  createDepartment
);

// Bulk Create
router.post(
  "/bulk",
  auth,
  superAdminOnly,
  validate(bulkDeptSchema),
  bulkCreateDepartments
);

// Get All
router.get("/all", auth, getAllDepartments);

// Get by deptId
router.get("/:id", auth, getDepartmentById);

// Update
router.put(
  "/update/:id",
  auth,
  superAdminOnly,
  validate(updateDepartmentSchema),
  updateDepartment
);

// Delete
router.delete("/delete/:id", auth, superAdminOnly, deleteDepartment);

// Reset Counter
router.post("/reset-counter", auth, superAdminOnly, resetDepartmentCounter);

export default router;
