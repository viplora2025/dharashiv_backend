// src/controllers/complainerController.js

import * as complainerService from "../services/complainerService.js";
import { sendSuccess } from "../utils/response.js";

export const createComplainer = async (req, res, next) => {
  try {
    const complainer = await complainerService.createComplainerService({
      ...req.body,
      addedBy: req.user?._id,
      addedByRole: req.role,
    });
    sendSuccess(res, {
      status: 201,
      message: "Complainer registered successfully",
      data: complainer
    });
  } catch (err) {
    next(err);
  }
};

export const getAllComplainers = async (req, res, next) => {
  try {
    const accessibleTalukas = req.role === "admin" ? (req.user.assignedTaluka || []) : null;
    const result = await complainerService.getAllComplainersService(
      req.query,
      accessibleTalukas
    );
    sendSuccess(res, { data: result.data, totalRecords: result.totalRecords });
  } catch (err) {
    next(err);
  }
};

export const getComplainerById = async (req, res, next) => {
  try {
    const complainer = await complainerService.getComplainerByIdService(req.params.id, req);
    sendSuccess(res, { data: complainer });
  } catch (err) {
    next(err);
  }
};

export const getComplainersByAppUser = async (req, res, next) => {
  try {
    const complainers = await complainerService.getComplainersByAppUserService(req.user._id);
    sendSuccess(res, { data: complainers });
  } catch (err) {
    next(err);
  }
};

export const updateComplainer = async (req, res, next) => {
  try {
    const complainer = await complainerService.updateComplainerService(
      req.params.id,
      req.body,
      req
    );
    sendSuccess(res, { message: "Complainer updated successfully", data: complainer });
  } catch (err) {
    next(err);
  }
};

export const deleteComplainer = async (req, res, next) => {
  try {
    await complainerService.deleteComplainerService(req.params.id, req);
    sendSuccess(res, { message: "Complainer deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getComplainersByUserAndTaluka = async (req, res, next) => {
  try {
    const result = await complainerService.getComplainersByUserAndTalukaService(
      req.user._id,
      req.params.talukaId
    );
    sendSuccess(res, { data: result.data, totalRecords: result.totalRecords });
  } catch (err) {
    next(err);
  }
};

export const getComplainersByTaluka = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await complainerService.getComplainersByTalukaService(
      req.params.talukaId,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, { ...result });
  } catch (err) {
    next(err);
  }
};
