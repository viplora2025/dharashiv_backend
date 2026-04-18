// src/controllers/journeyController.js

import {
  createJourneyService,
  updateJourneyService,
  deleteJourneyService,
  getJourneyByIdService,
  getAllJourneysService
} from "../services/journeyService.js";
import { sendSuccess } from "../utils/response.js";

export const createJourney = async (req, res, next) => {
  try {
    const doc = await createJourneyService(req);
    sendSuccess(res, {
      status: 201,
      message: "Journey milestone created successfully",
      data: doc
    });
  } catch (err) {
    next(err);
  }
};

export const updateJourney = async (req, res, next) => {
  try {
    const doc = await updateJourneyService(req.params.id, req);
    sendSuccess(res, { 
      message: "Journey milestone updated successfully", 
      data: doc 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteJourney = async (req, res, next) => {
  try {
    await deleteJourneyService(req.params.id);
    sendSuccess(res, { message: "Journey milestone deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getJourneyById = async (req, res, next) => {
  try {
    const doc = await getJourneyByIdService(req.params.id);
    sendSuccess(res, { data: doc });
  } catch (err) {
    next(err);
  }
};

export const getAllJourneys = async (req, res, next) => {
  try {
    const docs = await getAllJourneysService();
    sendSuccess(res, { data: docs });
  } catch (err) {
    next(err);
  }
};
