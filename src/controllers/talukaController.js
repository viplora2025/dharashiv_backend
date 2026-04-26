// src/controllers/talukaController.js

import * as talukaService from "../services/talukaService.js";
import { sendSuccess } from "../utils/response.js";

export const createTaluka = async (req, res, next) => {
  try {
    const taluka = await talukaService.createTalukaService(req.body.name);
    sendSuccess(res, {
      status: 201,
      message: "Taluka created successfully",
      data: taluka
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTalukas = async (req, res, next) => {
  try {
    const talukas = await talukaService.getAllTalukasService();
    sendSuccess(res, { data: talukas });
  } catch (err) {
    next(err);
  }
};

export const updateTaluka = async (req, res, next) => {
  try {
    const taluka = await talukaService.updateTalukaService(
      req.params.id,
      req.body.name
    );
    sendSuccess(res, { message: "Taluka updated successfully", data: taluka });
  } catch (err) {
    next(err);
  }
};

export const deleteTaluka = async (req, res, next) => {
  try {
    await talukaService.deleteTalukaService(req.params.id);
    sendSuccess(res, { message: "Taluka deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const resetTalukaCounter = async (req, res, next) => {
  try {
    await talukaService.resetTalukaCounterService();
    sendSuccess(res, { message: "Taluka counter reset successfully" });
  } catch (err) {
    next(err);
  }
};
