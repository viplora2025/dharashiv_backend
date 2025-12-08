import AppUser from "../models/appUserModel.js";
import { generateAppUserId } from "../utils/generateIds.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, phone, password, secretQuestion, secretAnswer } = req.body;

    if (!name || !phone || !password || !secretQuestion || !secretAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await AppUser.findOne({ phone });
    if (existing) return res.status(409).json({ message: "Phone already exists" }); // 409 Conflict

    const appUserId = await generateAppUserId();

    const hashedPass = await bcrypt.hash(password, 10);
    const hashedAns = await bcrypt.hash(secretAnswer, 10);

    const user = await AppUser.create({
      appUserId,
      name,
      phone,
      password: hashedPass,
      secretQuestion,
      secretAnswer: hashedAns
    });

    res.status(201).json({ message: "User registered", appUserId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) return res.status(400).json({ message: "Phone and password required" });

    const user = await AppUser.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" }); // 401 Unauthorized

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: "Login successful",
      appUserId: user.appUserId,
      _id: user._id, // Useful for linking
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FORGOT PASSWORD → Step 1: check question
export const getSecretQuestion = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const user = await AppUser.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ question: user.secretQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// FORGOT PASSWORD → Step 2: verify answer & reset password
export const resetPassword = async (req, res) => {
  try {
    const { phone, answer, newPassword } = req.body;

    if (!phone || !answer || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await AppUser.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const answerMatch = await bcrypt.compare(answer, user.secretAnswer);
    if (!answerMatch) return res.status(401).json({ message: "Wrong answer" }); // 401 Unauthorized

    const hashedPass = await bcrypt.hash(newPassword, 10);

    user.password = hashedPass;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
