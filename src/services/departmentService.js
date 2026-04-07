// src/services/departmentService.js

import Department from "../models/departmentModel.js";
import Counter from "../models/counterModel.js";
import { generateDepartmentId } from "../utils/generateIds.js";

/* ================= CREATE DEPARTMENT ================= */
export const createDepartmentService = async ({ name, email, description }) => {
  const deptId = await generateDepartmentId();

  const dept = await Department.create({
    deptId,
    name: {
      en: name.en,
      mr: name.mr
    },
    email,
    description: {
      en: description?.en || "",
      mr: description?.mr || ""
    }
  });

  return dept;
};

/* ================= GET ALL DEPARTMENTS ================= */
export const getAllDepartmentsService = async () => {
  return Department.find().sort({ createdAt: -1 });
};

/* ================= GET DEPARTMENT BY DEPTID ================= */
export const getDepartmentByIdService = async (deptId) => {
  const dept = await Department.findOne({ deptId });
  if (!dept) {
    throw new Error("Department not found");
  }
  return dept;
};

/* ================= UPDATE DEPARTMENT ================= */
export const updateDepartmentService = async (deptId, { name, email, description }) => {
  const update = {};

  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (description !== undefined) update.description = description;

  if (Object.keys(update).length === 0) {
    throw new Error("No fields provided for update");
  }

  const updated = await Department.findOneAndUpdate(
    { deptId },
    update,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new Error("Department not found");
  }

  return updated;
};

/* ================= DELETE DEPARTMENT ================= */
export const deleteDepartmentService = async (deptId) => {
  const deleted = await Department.findOneAndDelete({ deptId });
  if (!deleted) {
    throw new Error("Department not found");
  }
  return true;
};

/* ================= RESET COUNTER ================= */
export const resetDepartmentCounterService = async () => {
  await Counter.findByIdAndUpdate(
    "departmentId",
    { seq: 0 },
    { upsert: true }
  );
  return true;
};

/* ================= BULK CREATE ================= */
export const bulkCreateDepartmentsService = async (departments) => {
  const inserted = [];
  const failed = [];

  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    try {
      const deptId = await generateDepartmentId();
      const newDept = await Department.create({
        deptId,
        name: dept.name,
        email: dept.email,
        description: {
          en: dept.description?.en || "",
          mr: dept.description?.mr || ""
        }
      });
      inserted.push(newDept);
    } catch (err) {
      failed.push({
        index: i,
        name: dept?.name || null,
        reason: err.message
      });
    }
  }

  return {
    total: departments.length,
    successCount: inserted.length,
    failedCount: failed.length,
    inserted,
    failed
  };
};
