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

import { auth, adminOnly,superAdminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", auth, superAdminOnly, createDepartment);

// Get All
router.get("/all",auth ,getAllDepartments);

// Get by deptId
router.get("/:deptId", auth, getDepartmentById);

router.put("/update/:deptId", auth, superAdminOnly, updateDepartment);

router.delete("/delete/:deptId", auth, superAdminOnly, deleteDepartment);

// Reset Counter
router.post("/reset-counter", auth, superAdminOnly, resetDepartmentCounter);

router.post("/bulk", auth, superAdminOnly, bulkCreateDepartments);

export default router;
