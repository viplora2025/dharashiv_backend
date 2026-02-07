// src/services/appUserService.js

import AppUser from "../models/appUserModel.js";
import bcrypt from "bcryptjs";
import { generateAppUserId } from "../utils/generateIds.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { validatePassword, validatePhone } from "../utils/helpers.js";

/* ================= REGISTER ================= */
export const registerUserService = async ({
  name,
  phone,
  password,
  secretQuestion,
  secretAnswer
}) => {
  if (!name || !phone || !password || !secretQuestion || !secretAnswer) {
    throw new Error("All fields are required");
  }

  validatePhone(phone);
  validatePassword(password);

  const existing = await AppUser.findOne({ phone });
  if (existing) {
    throw new Error("Phone already exists");
  }

  const appUserId = await generateAppUserId();

  const hashedPass = await bcrypt.hash(password, 10);
  const hashedAns = await bcrypt.hash(secretAnswer, 10);

  await AppUser.create({
    appUserId,
    name,
    phone,
    password: hashedPass,
    secretQuestion,
    secretAnswer: hashedAns
  });

  return { appUserId };
};

/* ================= LOGIN ================= */
export const loginUserService = async ({ phone, password }) => {
  if (!phone || !password) {
    throw new Error("Phone and password required");
  }

  validatePhone(phone);

  const user = await AppUser.findOne({ phone });
  if (!user) {
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid password");
  }

  const payload = {
    id: user.appUserId,
    role: "user"
  };

  return {
    accessToken: await generateAccessToken(payload),
    refreshToken: await generateRefreshToken(payload)
  };
};

/* ================= FORGOT PASSWORD ================= */
export const getSecretQuestionService = async ({ phone }) => {
  if (!phone) throw new Error("Phone required");

  validatePhone(phone);

  const user = await AppUser.findOne({ phone });
  if (!user) throw new Error("User not found");

  return { question: user.secretQuestion };
};

export const resetPasswordService = async ({
  phone,
  answer,
  newPassword
}) => {
  if (!phone || !answer || !newPassword) {
    throw new Error("All fields are required");
  }

  validatePhone(phone);
  validatePassword(newPassword);

  const user = await AppUser.findOne({ phone });
  if (!user) throw new Error("User not found");

  const answerMatch = await bcrypt.compare(answer, user.secretAnswer);
  if (!answerMatch) throw new Error("Wrong answer");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return true;
};

/* ================= PROFILE ================= */
export const updateMyProfileService = async (userId, data) => {
  if (data.phone) {
    throw new Error("Phone number cannot be changed");
  }

  const updateData = {};

  if (data.name) updateData.name = data.name;

  if (data.password) {
    validatePassword(data.password);
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return AppUser.findByIdAndUpdate(userId, updateData, { new: true });
};

/* ================= ADMIN ================= */
export const getAllUsersService = async () => {
  return AppUser.find().select("-password -secretAnswer");
};

export const getUserByIdService = async (id) => {
  const user = await AppUser.findById(id).select("-password -secretAnswer");
  if (!user) throw new Error("User not found");
  return user;
};

export const getUserByPhoneService = async (phone) => {
  validatePhone(phone);

  const user = await AppUser.findOne({ phone }).select(
    "-password -secretAnswer"
  );
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserByAdminService = async (id, data) => {
  if (data.phone) {
    throw new Error("Phone number change is not allowed");
  }

  const update = {};
  if (data.name !== undefined) update.name = data.name;

  if (data.password) {
    validatePassword(data.password);
    update.password = await bcrypt.hash(data.password, 10);
  }

  if (Object.keys(update).length === 0) {
    throw new Error("No fields provided for update");
  }

  const user = await AppUser.findByIdAndUpdate(id, update, { new: true });
  if (!user) throw new Error("User not found");

  return user;
};

export const deleteUserService = async (id) => {
  const user = await AppUser.findById(id);
  if (!user) throw new Error("User not found");

  await user.deleteOne();
  return true;
};
