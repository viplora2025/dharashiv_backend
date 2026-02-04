// src/controllers/talukaController.js

import {
  createTalukaService,
  getAllTalukasService,
  updateTalukaService,
  deleteTalukaService,
  resetTalukaCounterService
} from "../services/talukaService.js";

/* ================= CREATE TALUKA ================= */
export const createTaluka = async (req, res) => {
  try {
    const taluka = await createTalukaService(req.body.name);

    res.status(201).json({
      message: "Taluka created successfully",
      data: taluka
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL TALUKAS ================= */
export const getAllTalukas = async (req, res) => {
  try {
    const talukas = await getAllTalukasService();

    res.status(200).json({
      message: "Taluka list fetched successfully",
      data: talukas
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE TALUKA ================= */
export const updateTaluka = async (req, res) => {
  try {
    const updated = await updateTalukaService(
      req.params.talukaId,
      req.body.name
    );

    res.status(200).json({
      message: "Taluka updated successfully",
      data: updated
    });
  } catch (error) {
    if (error.message === "Taluka not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE TALUKA ================= */
export const deleteTaluka = async (req, res) => {
  try {
    await deleteTalukaService(req.params.talukaId);

    res.status(200).json({
      message: "Taluka deleted successfully"
    });
  } catch (error) {
    if (error.message === "Taluka not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= RESET TALUKA COUNTER ================= */
export const resetTalukaCounter = async (req, res) => {
  try {
    await resetTalukaCounterService();

    res.status(200).json({
      message:
        "Taluka ID counter reset successfully. Next ID will start from TLK001."
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
