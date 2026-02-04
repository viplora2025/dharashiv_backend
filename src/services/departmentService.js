import Department from "../models/departmentModel.js";
import Counter from "../models/counterModel.js";
import { generateDepartmentId } from "../utils/generateIds.js";

// ==========================
// Create Department
// ==========================
export const createDepartmentService = async ({ name, description }) => {
  if (!name || !name.en || !name.mr) {
    throw new Error("Department name is required in both English and Marathi.");
  }

  const deptId = await generateDepartmentId();

  const dept = new Department({
    deptId,
    name,
    description: description || ""
  });

  try {
    await dept.save();
    return dept;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Department with same ID already exists.");
    }
    throw new Error("Failed to create department.");
  }
};

// ==========================
// Get All Departments
// ==========================
export const getAllDepartmentsService = async () => {
  try {
    return await Department.find().sort({ createdAt: -1 });
  } catch (err) {
    throw new Error("Failed to fetch departments.");
  }
};

// ==========================
// Get Department by deptId
// ==========================
export const getDepartmentByIdService = async (deptId) => {
  if (!deptId) {
    throw new Error("Department ID is required.");
  }

  const dept = await Department.findOne({ deptId });

  if (!dept) {
    throw new Error("Department not found.");
  }

  return dept;
};

// ==========================
// Update Department
// ==========================
export const updateDepartmentService = async (deptId, { name, description }) => {
  if (name && (!name.en || !name.mr)) {
    throw new Error("Both English and Marathi names are required.");
  }

  const updated = await Department.findOneAndUpdate(
    { deptId },
    { name, description },
    { new: true }
  );

  if (!updated) {
    throw new Error("Department not found for update.");
  }

  return updated;
};

// ==========================
// Delete Department
// ==========================
export const deleteDepartmentService = async (deptId) => {
  const deleted = await Department.findOneAndDelete({ deptId });

  if (!deleted) {
    throw new Error("Department not found for deletion.");
  }

  return true;
};

// ==========================
// Reset Department Counter
// ==========================
export const resetDepartmentCounterService = async () => {
  try {
    await Counter.findByIdAndUpdate(
      "departmentId",
      { seq: 0 },
      { upsert: true }
    );
    return true;
  } catch (err) {
    throw new Error("Failed to reset department ID counter.");
  }
};



export const bulkCreateDepartmentsService = async (departments) => {
  if (!Array.isArray(departments) || departments.length === 0) {
    throw new Error("Departments array is required and cannot be empty.");
  }

  const inserted = [];
  const failed = [];

  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];

    try {
      if (!dept.name || !dept.name.en || !dept.name.mr) {
        throw new Error("English and Marathi names are required.");
      }

      const deptId = await generateDepartmentId();

      const newDept = new Department({
        deptId,
        name: dept.name,
        description: dept.description || ""
      });

      await newDept.save();
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