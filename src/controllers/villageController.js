// src/controllers/villageController.js

import {
  createVillageService,
  getAllVillagesService,
  getVillageByTalukaService,
  getVillageByTalukaObjectIdService,
  updateVillageService,
  deleteVillageService,
  resetVillageCounterService,
  createMultipleVillagesService
} from "../services/villageService.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* ================= CREATE VILLAGE ================= */
export const createVillage = async (req, res) => {
  try {
    const village = await createVillageService(req.body);

    sendSuccess(res, {
      status: 201,
      message: "Village created successfully",
      data: village
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* ================= GET ALL VILLAGES ================= */
export const getAllVillages = async (req, res) => {
  try {
    const villages = await getAllVillagesService();

    sendSuccess(res, {
      status: 200,
      message: "Village list fetched successfully",
      data: villages
    });
  } catch (error) {
    sendError(res, { status: 500, message: "Internal server error" });
  }
};

/* ================= GET VILLAGES BY TALUKA (STRING ID) ================= */
export const getVillageByTaluka = async (req, res) => {
  try {
    const villages = await getVillageByTalukaService(req.params.talukaId);

    sendSuccess(res, {
      status: 200,
      message: "Villages fetched successfully",
      data: villages
    });
  } catch (error) {
    if (error.message.includes("Taluka not found")) {
      return sendError(res, { status: 404, message: error.message });
    }
    sendError(res, { status: 500, message: "Internal server error" });
  }
};

/* ================= GET VILLAGES BY TALUKA (OBJECT ID) ================= */
export const getVillageByTalukaObjectId = async (req, res) => {
  try {
    const villages =
      await getVillageByTalukaObjectIdService(req.params.talukaObjectId);

    sendSuccess(res, {
      status: 200,
      message: "Villages fetched successfully",
      data: villages
    });
  } catch (error) {
    if (
      error.message === "Invalid Taluka ObjectId" ||
      error.message === "No villages found for this taluka"
    ) {
      return sendError(res, { status: 400, message: error.message });
    }
    sendError(res, { status: 500, message: "Internal server error" });
  }
};

/* ================= UPDATE VILLAGE ================= */
export const updateVillage = async (req, res) => {
  try {
    const updated = await updateVillageService(
      req.params.villageId,
      req.body.name
    );

    sendSuccess(res, {
      status: 200,
      message: "Village updated successfully",
      data: updated
    });
  } catch (error) {
    if (error.message === "Village not found") {
      return sendError(res, { status: 404, message: error.message });
    }
    sendError(res, { status: 400, message: error.message });
  }
};

/* ================= DELETE VILLAGE ================= */
export const deleteVillage = async (req, res) => {
  try {
    await deleteVillageService(req.params.villageId);

    sendSuccess(res, {
      status: 200,
      message: "Village deleted successfully"
    });
  } catch (error) {
    if (error.message === "Village not found") {
      return sendError(res, { status: 404, message: error.message });
    }
    sendError(res, { status: 500, message: "Internal server error" });
  }
};

/* ================= RESET VILLAGE COUNTER ================= */
export const resetVillageCounter = async (req, res) => {
  try {
    await resetVillageCounterService();

    sendSuccess(res, {
      status: 200,
      message: "Village ID counter reset. Next ID will start from VLG001."
    });
  } catch (error) {
    sendError(res, { status: 500, message: "Internal server error" });
  }
};


export const createMultipleVillages = async (req, res) => {
  try {
    const villages = await createMultipleVillagesService(req.body);

    sendSuccess(res, {
      status: 201,
      message: "Villages added successfully",
      count: villages.length,
      data: villages
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};
