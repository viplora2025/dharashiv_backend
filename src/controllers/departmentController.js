import {
  createDepartmentService,
  getAllDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
  resetDepartmentCounterService,
  bulkCreateDepartmentsService
} from "../services/departmentService.js";

// ==========================
// Create Department
// ==========================
export const createDepartment = async (req, res) => {
  try {
    const dept = await createDepartmentService(req.body);
    res.status(201).json({
      message: "Department created successfully",
      data: dept
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==========================
// Get All Departments
// ==========================
export const getAllDepartments = async (req, res) => {
  try {
    const depts = await getAllDepartmentsService();
    res.status(200).json({
      message: "Departments fetched successfully",
      data: depts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Get Department by deptId
// ==========================
export const getDepartmentById = async (req, res) => {
  try {
    const dept = await getDepartmentByIdService(req.params.deptId);
    res.status(200).json({
      message: "Department fetched successfully",
      data: dept
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ==========================
// Update Department
// ==========================
export const updateDepartment = async (req, res) => {
  try {
    const updated = await updateDepartmentService(
      req.params.deptId,
      req.body
    );

    res.status(200).json({
      message: "Department updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==========================
// Delete Department
// ==========================
export const deleteDepartment = async (req, res) => {
  try {
    await deleteDepartmentService(req.params.deptId);
    res.status(200).json({
      message: "Department deleted successfully"
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ==========================
// Reset Department Counter
// ==========================
export const resetDepartmentCounter = async (req, res) => {
  try {
    await resetDepartmentCounterService();
    res.status(200).json({
      message: "Department ID counter reset successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const bulkCreateDepartments = async (req, res) => {
  try {
    const { departments } = req.body;

    const result = await bulkCreateDepartmentsService(departments);

    res.status(201).json({
      message: "Bulk department insert completed",
      summary: {
        total: result.total,
        inserted: result.successCount,
        failed: result.failedCount
      },
      data: result
    });

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};



