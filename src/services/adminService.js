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
import {
  validatePassword,
  validatePhone,
  validateEmail
} from "../utils/helpers.js";


/* ================= REGISTER ================= */
export const registerAdminService = async (data) => {
  const { name, phone, email, password, role, assignedTaluka } = data;

  if (!role) throw new Error("Role is required");

  validatePhone(phone);
  validatePassword(password);
  validateEmail(email);

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
  validateEmail(email);
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
  validateEmail(email);
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
  validatePassword(newPassword);

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
  return Admin.findById(id).populate("assignedTaluka");
};

export const getAdminByPhoneService = async (phone) => {
  validatePhone(phone);
  return Admin.findOne({ phone });
};

export const getAllAdminsService = async () => {
  return Admin.find().populate("assignedTaluka");
};

export const updateAdminService = async (id, data) => {
  if (data.password) {
    validatePassword(data.password);
    data.password = await bcrypt.hash(data.password, 10);
  }

  if (data.phone) {
    throw new Error("Phone number change is not allowed");
  }

  const admin = await Admin.findByIdAndUpdate(id, data, { new: true });
  if (!admin) throw new Error("Admin not found");

  return admin;
};

export const deleteAdminService = async (id) => {
  await Admin.findByIdAndDelete(id);
  return true;
};
