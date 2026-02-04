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

/* ================= CREATE VILLAGE ================= */
export const createVillage = async (req, res) => {
  try {
    const village = await createVillageService(req.body);

    res.status(201).json({
      message: "Village created successfully",
      data: village
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL VILLAGES ================= */
export const getAllVillages = async (req, res) => {
  try {
    const villages = await getAllVillagesService();

    res.status(200).json({
      message: "Village list fetched successfully",
      data: villages
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GET VILLAGES BY TALUKA (STRING ID) ================= */
export const getVillageByTaluka = async (req, res) => {
  try {
    const villages = await getVillageByTalukaService(req.params.talukaId);

    res.status(200).json({
      message: "Villages fetched successfully",
      data: villages
    });
  } catch (error) {
    if (error.message.includes("Taluka not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GET VILLAGES BY TALUKA (OBJECT ID) ================= */
export const getVillageByTalukaObjectId = async (req, res) => {
  try {
    const villages =
      await getVillageByTalukaObjectIdService(req.params.talukaObjectId);

    res.status(200).json({
      message: "Villages fetched successfully",
      data: villages
    });
  } catch (error) {
    if (
      error.message === "Invalid Taluka ObjectId" ||
      error.message === "No villages found for this taluka"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE VILLAGE ================= */
export const updateVillage = async (req, res) => {
  try {
    const updated = await updateVillageService(
      req.params.villageId,
      req.body.name
    );

    res.status(200).json({
      message: "Village updated successfully",
      data: updated
    });
  } catch (error) {
    if (error.message === "Village not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE VILLAGE ================= */
export const deleteVillage = async (req, res) => {
  try {
    await deleteVillageService(req.params.villageId);

    res.status(200).json({
      message: "Village deleted successfully"
    });
  } catch (error) {
    if (error.message === "Village not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= RESET VILLAGE COUNTER ================= */
export const resetVillageCounter = async (req, res) => {
  try {
    await resetVillageCounterService();

    res.status(200).json({
      message: "Village ID counter reset. Next ID will start from VLG001."
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


export const createMultipleVillages = async (req, res) => {
  try {
    const villages = await createMultipleVillagesService(req.body);

    res.status(201).json({
      message: "Villages added successfully",
      count: villages.length,
      data: villages
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};