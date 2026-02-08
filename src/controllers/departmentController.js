import {
  createDepartmentService,
  getAllDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
  resetDepartmentCounterService,
  bulkCreateDepartmentsService
} from "../services/departmentService.js";
import { sendError, sendSuccess } from "../utils/response.js";

// ==========================
// Create Department
// ==========================
export const createDepartment = async (req, res) => {
  try {
    const dept = await createDepartmentService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Department created successfully",
      data: dept
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

// ==========================
// Get All Departments
// ==========================
export const getAllDepartments = async (req, res) => {
  try {
    const depts = await getAllDepartmentsService();
    sendSuccess(res, {
      status: 200,
      message: "Departments fetched successfully",
      data: depts
    });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};

// ==========================
// Get Department by deptId
// ==========================
export const getDepartmentById = async (req, res) => {
  try {
    const dept = await getDepartmentByIdService(req.params.deptId);
    sendSuccess(res, {
      status: 200,
      message: "Department fetched successfully",
      data: dept
    });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
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

    sendSuccess(res, {
      status: 200,
      message: "Department updated successfully",
      data: updated
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

// ==========================
// Delete Department
// ==========================
export const deleteDepartment = async (req, res) => {
  try {
    await deleteDepartmentService(req.params.deptId);
    sendSuccess(res, {
      status: 200,
      message: "Department deleted successfully"
    });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};

// ==========================
// Reset Department Counter
// ==========================
export const resetDepartmentCounter = async (req, res) => {
  try {
    await resetDepartmentCounterService();
    sendSuccess(res, {
      status: 200,
      message: "Department ID counter reset successfully"
    });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};



export const bulkCreateDepartments = async (req, res) => {
  try {
    const { departments } = req.body;

    const result = await bulkCreateDepartmentsService(departments);

    sendSuccess(res, {
      status: 201,
      message: "Bulk department insert completed",
      summary: {
        total: result.total,
        inserted: result.successCount,
        failed: result.failedCount
      },
      data: result
    });

  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};



