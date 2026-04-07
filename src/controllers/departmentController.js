// src/controllers/departmentController.js

import * as departmentService from "../services/departmentService.js";
import { sendSuccess } from "../utils/response.js";

export const createDepartment = async (req, res, next) => {
  try {
    const dept = await departmentService.createDepartmentService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Department created successfully",
      data: dept
    });
  } catch (err) {
    next(err);
  }
};

export const getAllDepartments = async (req, res, next) => {
  try {
    const depts = await departmentService.getAllDepartmentsService();
    sendSuccess(res, { data: depts });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await departmentService.getDepartmentByIdService(req.params.id);
    sendSuccess(res, { data: dept });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await departmentService.updateDepartmentService(
      req.params.id,
      req.body
    );
    sendSuccess(res, { message: "Department updated successfully", data: dept });
  } catch (err) {
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    await departmentService.deleteDepartmentService(req.params.id);
    sendSuccess(res, { message: "Department deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const resetDepartmentCounter = async (req, res, next) => {
  try {
    await departmentService.resetDepartmentCounterService();
    sendSuccess(res, { message: "Department counter reset successfully" });
  } catch (err) {
    next(err);
  }
};

export const bulkCreateDepartments = async (req, res, next) => {
  try {
    const result = await departmentService.bulkCreateDepartmentsService(
      req.body.departments
    );
    sendSuccess(res, {
      status: 201,
      message: "Bulk creation completed",
      ...result
    });
  } catch (err) {
    next(err);
  }
};
