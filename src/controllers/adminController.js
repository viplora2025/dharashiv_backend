// src/controllers/adminController.js

import * as adminService from "../services/adminService.js";
import { sendSuccess } from "../utils/response.js";

/* ================= REGISTER (SuperAdmin Only Logic in Routes) ================= */
export const registerAdmin = async (req, res, next) => {
  try {
    const data = await adminService.registerAdminService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Admin registered successfully",
      ...data
    });
  } catch (err) {
    next(err);
  }
};

/* ================= LOGIN ================= */
export const loginAdmin = async (req, res, next) => {
  try {
    const data = await adminService.loginAdminService(req.body);
    sendSuccess(res, { message: "Login successful", ...data });
  } catch (err) {
    next(err);
  }
};

/* ================= PASSWORD FLOW ================= */
export const forgotPassword = async (req, res, next) => {
  try {
    await adminService.forgotPasswordService(req.body.email);
    sendSuccess(res, { message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await adminService.resetPasswordService(req.body);
    sendSuccess(res, { message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    await adminService.resendOtpService(req.body.email);
    sendSuccess(res, { message: "OTP resent" });
  } catch (err) {
    next(err);
  }
};

/* ================= CRUD ================= */
export const getAdminById = async (req, res, next) => {
  try {
    const admin = await adminService.getAdminByIdService(req.params.id);
    sendSuccess(res, { data: admin });
  } catch (err) {
    next(err);
  }
};

export const getAdminByPhone = async (req, res, next) => {
  try {
    const admin = await adminService.getAdminByPhoneService(req.params.phone);
    sendSuccess(res, { data: admin });
  } catch (err) {
    next(err);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdminsService();
    sendSuccess(res, { data: admins });
  } catch (err) {
    next(err);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    // Only superadmin can change role or assignedTaluka
    if (req.role !== "superadmin" && req.body) {
      delete req.body.role;
      delete req.body.assignedTaluka;
    }

    const admin = await adminService.updateAdminService(
      req.params.id,
      req.body
    );
    sendSuccess(res, { message: "Admin updated", admin });
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    await adminService.deleteAdminService(req.params.id);
    sendSuccess(res, { message: "Admin deleted" });
  } catch (err) {
    next(err);
  }
};
