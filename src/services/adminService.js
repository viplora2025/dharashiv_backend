// src/services/adminService.js

import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import { generateAdminId } from "../utils/generateIds.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import {
  sendWelcomeEmail,
  sendOtpEmail,
  sendPasswordChangedEmail
} from "../utils/email.js";

/* ================= REGISTER ================= */
export const registerAdminService = async (data) => {
  const { name, phone, email, password, role, assignedTaluka } = data;

  const exists = await Admin.findOne({ $or: [{ phone }, { email }] });
  if (exists) throw new Error("Admin already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    adminId: await generateAdminId(),
    name,
    phone,
    email,
    password: hashedPassword,
    role,
    assignedTaluka
  });

  await sendWelcomeEmail(email, name, role);

  return {
    adminId: admin.adminId,
    role: admin.role
  };
};

/* ================= LOGIN ================= */
export const loginAdminService = async ({ email, password }) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");

  const match = await bcrypt.compare(password, admin.password);
  if (!match) throw new Error("Invalid credentials");

  const payload = {
    id: admin.adminId,
    role: admin.role,
    name: admin.name,
    email: admin.email
  };

  return {
    accessToken: await generateAccessToken(payload),
    refreshToken: await generateRefreshToken(payload),
    role: admin.role,
    name: admin.name,
    email: admin.email,
    id: admin.adminId
  };
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPasswordService = async (email) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  admin.otp = otp;
  admin.otpExpiry = Date.now() + 10 * 60 * 1000;

  await admin.save({ validateBeforeSave: false });

  await sendOtpEmail(email, otp);

  return true;
};

/* ================= RESET PASSWORD ================= */
export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const admin = await Admin.findOne({ email, otp });
  if (!admin) throw new Error("Invalid OTP");

  if (admin.otpExpiry < Date.now()) {
    throw new Error("OTP expired");
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  admin.otp = null;
  admin.otpExpiry = null;

  await admin.save();

  await sendPasswordChangedEmail(email);

  return true;
};

/* ================= RESEND OTP ================= */
export const resendOtpService = async (email) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  admin.otp = otp;
  admin.otpExpiry = Date.now() + 10 * 60 * 1000;

  await admin.save();

  await sendOtpEmail(email, otp);

  return true;
};

/* ================= FETCH / UPDATE ================= */
export const getAdminByIdService = async (id) => {
  const admin = await Admin.findById(id).populate("assignedTaluka");
  if (!admin) throw new Error("Admin not found");
  return admin;
};

export const getAdminByPhoneService = async (phone) => {
  const admin = await Admin.findOne({ phone });
  if (!admin) throw new Error("Admin not found");
  return admin;
};

export const getAllAdminsService = async () => {
  return Admin.find().populate("assignedTaluka");
};

export const updateAdminService = async (id, data) => {
  const { name, email, password, role, assignedTaluka } = data;
  const update = {};

  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }
  if (role !== undefined) update.role = role;
  if (assignedTaluka !== undefined) update.assignedTaluka = assignedTaluka;

  if (Object.keys(update).length === 0) {
    throw new Error("No fields provided for update");
  }

  const admin = await Admin.findByIdAndUpdate(id, update, { new: true });
  if (!admin) throw new Error("Admin not found");

  return admin;
};

export const deleteAdminService = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) throw new Error("Admin not found");
  await admin.deleteOne();
  return true;
};
