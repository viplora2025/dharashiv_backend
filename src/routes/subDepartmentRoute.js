import express from "express";
import {
  createSubDepartment,
  getAllSubDepartments,
  getSubDepartmentById,
  updateSubDepartment,
  deleteSubDepartment
} from "../controllers/subDepartmentController.js";

const router = express.Router();

router.post("/create", createSubDepartment);
router.get("/all", getAllSubDepartments);
router.get("/:subDeptId", getSubDepartmentById);
router.put("/update/:subDeptId", updateSubDepartment);
router.delete("/delete/:subDeptId", deleteSubDepartment);

export default router;
