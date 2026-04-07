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
  const user = await AppUser.findOne({ phone });
  if (!user) throw new Error("User not found");

  return { question: user.secretQuestion };
};

export const resetPasswordService = async ({
  phone,
  answer,
  newPassword
}) => {
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
  const { name, password } = data;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (password) {
    validatePassword(password);
    updateData.password = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No fields provided for update");
  }

  const user = await AppUser.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) throw new Error("User not found");
  return user;
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
  const { name, password } = data;
  const update = {};

  if (name !== undefined) update.name = name;
  if (password) {
    validatePassword(password);
    update.password = await bcrypt.hash(password, 10);
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
