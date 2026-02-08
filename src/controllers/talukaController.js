// src/controllers/talukaController.js

import {
  createTalukaService,
  getAllTalukasService,
  updateTalukaService,
  deleteTalukaService,
  resetTalukaCounterService
} from "../services/talukaService.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* ================= CREATE TALUKA ================= */
export const createTaluka = async (req, res) => {
  try {
    const taluka = await createTalukaService(req.body.name);

    sendSuccess(res, {
      status: 201,
      message: "Taluka created successfully",
      data: taluka
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* ================= GET ALL TALUKAS ================= */
export const getAllTalukas = async (req, res) => {
  try {
    const talukas = await getAllTalukasService();

    sendSuccess(res, {
      status: 200,
      message: "Taluka list fetched successfully",
      data: talukas
    });
  } catch (error) {
    sendError(res, { status: 500, message: "Internal server error" });
  }
};

/* ================= UPDATE TALUKA ================= */
export const updateTaluka = async (req, res) => {
  try {
    const updated = await updateTalukaService(
      req.params.talukaId,
      req.body.name
    );

    sendSuccess(res, {
      status: 200,
      message: "Taluka updated successfully",
      data: updated
    });
  } catch (error) {
    if (error.message === "Taluka not found") {
      return sendError(res, { status: 404, message: error.message });
    }
    sendError(res, { status: 400, message: error.message });
  }
};

/* ================= DELETE TALUKA ================= */
export const deleteTaluka = async (req, res) => {
  try {
    await deleteTalukaService(req.params.talukaId);

    sendSuccess(res, {
      status: 200,
      message: "Taluka deleted successfully"
    });
  } catch (error) {
    if (error.message === "Taluka not found") {
      return sendError(res, { status: 404, message: error.message });
    }
    sendError(res, { status: 500, message: "Internal server error" });
  }
};

/* ================= RESET TALUKA COUNTER ================= */
export const resetTalukaCounter = async (req, res) => {
  try {
    await resetTalukaCounterService();

    sendSuccess(res, {
      status: 200,
      message:
        "Taluka ID counter reset successfully. Next ID will start from TLK001."
    });
  } catch (error) {
    sendError(res, { status: 500, message: "Internal server error" });
  }
};
