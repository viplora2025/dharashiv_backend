// src/controllers/adminController.js

import * as adminService from "../services/adminService.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* ================= REGISTER ================= */
export const registerAdmin = async (req, res) => {
  try {
    const data = await adminService.registerAdminService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Admin registered successfully",
      ...data
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginAdmin = async (req, res) => {
  try {
    const data = await adminService.loginAdminService(req.body);
    sendSuccess(res, { message: "Login successful", ...data });
  } catch (err) {
    sendError(res, { status: 401, message: err.message });
  }
};

/* ================= PASSWORD FLOW ================= */
export const forgotPassword = async (req, res) => {
  try {
    await adminService.forgotPasswordService(req.body.email);
    sendSuccess(res, { message: "OTP sent to email" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await adminService.resetPasswordService(req.body);
    sendSuccess(res, { message: "Password reset successful" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    await adminService.resendOtpService(req.body.email);
    sendSuccess(res, { message: "OTP resent" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= CRUD ================= */
export const getAdminById = async (req, res) => {
  try {
    const admin = await adminService.getAdminByIdService(req.params.id);
    sendSuccess(res, { data: admin });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getAdminByPhone = async (req, res) => {
  try {
    const admin = await adminService.getAdminByPhoneService(req.params.phone);
    sendSuccess(res, { data: admin });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdminsService();
    sendSuccess(res, { data: admins });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    // Only superadmin can change role or assignedTaluka
    if (req.role !== "superadmin") {
      delete req.body.role;
      delete req.body.assignedTaluka;
    }

    const admin = await adminService.updateAdminService(
      req.params.id,
      req.body
    );
    sendSuccess(res, { message: "Admin updated", admin });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    await adminService.deleteAdminService(req.params.id);
    sendSuccess(res, { message: "Admin deleted" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};
