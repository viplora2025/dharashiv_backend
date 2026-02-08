// src/controllers/appUserController.js

import * as appUserService from "../services/appUserService.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const result = await appUserService.registerUserService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "User registered",
      ...result
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const tokens = await appUserService.loginUserService(req.body);
    sendSuccess(res, { message: "Login successful", ...tokens });
  } catch (err) {
    sendError(res, { status: 401, message: err.message });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const getSecretQuestion = async (req, res) => {
  try {
    const data = await appUserService.getSecretQuestionService(req.body);
    sendSuccess(res, { data });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await appUserService.resetPasswordService(req.body);
    sendSuccess(res, { message: "Password changed successfully" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= PROFILE ================= */
export const getMyProfile = async (req, res) => {
  sendSuccess(res, { data: req.user });
};

export const updateMyProfile = async (req, res) => {
  try {
    const user = await appUserService.updateMyProfileService(
      req.user._id,
      req.body
    );
    sendSuccess(res, { message: "Profile updated", user });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= ADMIN ================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await appUserService.getAllUsersService();
    sendSuccess(res, { data: users });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await appUserService.getUserByIdService(req.params.id);
    sendSuccess(res, { data: user });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};

export const getUserByPhone = async (req, res) => {
  try {
    const user = await appUserService.getUserByPhoneService(req.params.phone);
    sendSuccess(res, { data: user });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await appUserService.updateUserByAdminService(
      req.params.id,
      req.body
    );
    sendSuccess(res, { message: "User updated", user });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await appUserService.deleteUserService(req.params.id);
    sendSuccess(res, { message: "User deleted" });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};
