import Department from "../models/departmentModel.js";
import Counter from "../models/counterModel.js";
import { generateDepartmentId } from "../utils/generateIds.js";


// ==========================
// Create Department
// ==========================
export const createDepartment = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    // Validate name
    if (!name || !name.en || !name.mr) {
      return res.status(400).json({
        message: "Both English (en) and Marathi (mr) names are required."
      });
    }

    // Validate level
    if (!level) {
      return res.status(400).json({ message: "Department level is required." });
    }

    // Generate deptId
    const deptId = await generateDepartmentId();

    const newDept = new Department({
      deptId,
      name,
      level,
      description: description || ""
    });

    await newDept.save();

    res.status(201).json({
      message: "Department created successfully",
      data: newDept
    });

  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Get All Departments
// ==========================
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Departments fetched successfully",
      data: departments
    });

  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Get Department by deptId (string)
// ==========================
export const getDepartmentById = async (req, res) => {
  try {
    const { deptId } = req.params;

    const dept = await Department.findOne({ deptId });

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department fetched successfully",
      data: dept
    });

  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Update Department (by deptId)
// ==========================
export const updateDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { name, level, description } = req.body;

    if (name && (!name.en || !name.mr)) {
      return res.status(400).json({
        message: "Both English (en) and Marathi (mr) names are required."
      });
    }

    const updated = await Department.findOneAndUpdate(
      { deptId },
      { name, level, description },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Delete Department
// ==========================
export const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;

    const deleted = await Department.findOneAndDelete({ deptId });

    if (!deleted) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Reset Department ID Counter
// ==========================
export const resetDepartmentCounter = async (req, res) => {
  try {
    await Counter.findByIdAndUpdate(
      "departmentId",
      { seq: 0 },
      { upsert: true }
    );

    res.status(200).json({
      message: "Department ID counter reset successfully."
    });

  } catch (error) {
    console.error("Error resetting counter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
