// src/controllers/villageController.js

import * as villageService from "../services/villageService.js";
import { sendSuccess } from "../utils/response.js";

export const createVillage = async (req, res, next) => {
  try {
    const village = await villageService.createVillageService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Village created successfully",
      data: village
    });
  } catch (err) {
    next(err);
  }
};

export const createMultipleVillages = async (req, res, next) => {
  try {
    const villages = await villageService.createMultipleVillagesService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Villages created successfully",
      data: villages
    });
  } catch (err) {
    next(err);
  }
};

export const getAllVillages = async (req, res, next) => {
  try {
    const villages = await villageService.getAllVillagesService();
    sendSuccess(res, { data: villages });
  } catch (err) {
    next(err);
  }
};

export const getVillageByTaluka = async (req, res, next) => {
  try {
    const villages = await villageService.getVillageByTalukaService(req.params.talukaId);
    sendSuccess(res, { data: villages });
  } catch (err) {
    next(err);
  }
};

export const getVillageByTalukaObjectId = async (req, res, next) => {
  try {
    const villages = await villageService.getVillageByTalukaObjectIdService(req.params.talukaObjectId);
    sendSuccess(res, { data: villages });
  } catch (err) {
    next(err);
  }
};

export const updateVillage = async (req, res, next) => {
  try {
    const village = await villageService.updateVillageService(
      req.params.id,
      req.body.name
    );
    sendSuccess(res, { message: "Village updated successfully", data: village });
  } catch (err) {
    next(err);
  }
};

export const deleteVillage = async (req, res, next) => {
  try {
    await villageService.deleteVillageService(req.params.id);
    sendSuccess(res, { message: "Village deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const resetVillageCounter = async (req, res, next) => {
  try {
    await villageService.resetVillageCounterService();
    sendSuccess(res, { message: "Village counter reset successfully" });
  } catch (err) {
    next(err);
  }
};
