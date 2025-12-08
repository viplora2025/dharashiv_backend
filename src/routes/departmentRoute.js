import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  resetDepartmentCounter
} from "../controllers/departmentController.js";

const router = express.Router();

router.post("/create", createDepartment);

// Get All
router.get("/all", getAllDepartments);

// Get by deptId
router.get("/:deptId", getDepartmentById);

router.put("/update/:deptId", updateDepartment);

router.delete("/delete/:deptId", deleteDepartment);

// Reset Counter
router.put("/reset-counter", resetDepartmentCounter);

export default router;
