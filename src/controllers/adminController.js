// src/controllers/adminController.js

import * as adminService from "../services/adminService.js";

/* ================= REGISTER ================= */
export const registerAdmin = async (req, res) => {
  try {
    const data = await adminService.registerAdminService(req.body);
    res.status(201).json({
      message: "Admin registered successfully",
      ...data
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginAdmin = async (req, res) => {
  try {
    const data = await adminService.loginAdminService(req.body);
    res.json({ message: "Login successful", ...data });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

/* ================= PASSWORD FLOW ================= */
export const forgotPassword = async (req, res) => {
  try {
    await adminService.forgotPasswordService(req.body.email);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await adminService.resetPasswordService(req.body);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    await adminService.resendOtpService(req.body.email);
    res.json({ message: "OTP resent" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= CRUD ================= */
export const getAdminById = async (req, res) => {
  const admin = await adminService.getAdminByIdService(req.params.id);
  res.json(admin);
};

export const getAdminByPhone = async (req, res) => {
  const admin = await adminService.getAdminByPhoneService(req.params.phone);
  res.json(admin);
};

export const getAllAdmins = async (req, res) => {
  const admins = await adminService.getAllAdminsService();
  res.json(admins);
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
    res.json({ message: "Admin updated", admin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  await adminService.deleteAdminService(req.params.id);
  res.json({ message: "Admin deleted" });
};
