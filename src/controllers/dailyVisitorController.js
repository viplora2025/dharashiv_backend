// src/controllers/dailyVisitorController.js

import {
  createDailyVisitorService,
  updateDailyVisitorService,
  deleteDailyVisitorService,
  getDailyVisitorByIdService,
  getAllDailyVisitorsService,
  getDailyVisitorsByDateService,
  getDailyVisitorsByWeekService,
  getDailyVisitorsByMonthService,
  getDailyVisitorsByYearService
} from "../services/dailyVisitorService.js";
import { parsePageLimit } from "../utils/queryValidation.js";
import { sendSuccess } from "../utils/response.js";

export const createDailyVisitor = async (req, res, next) => {
  try {
    const doc = await createDailyVisitorService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Daily visitor created",
      data: doc
    });
  } catch (err) {
    next(err);
  }
};

export const updateDailyVisitor = async (req, res, next) => {
  try {
    const doc = await updateDailyVisitorService(
      req.params.id,
      req.body
    );
    sendSuccess(res, { message: "Daily visitor updated", data: doc });
  } catch (err) {
    next(err);
  }
};

export const deleteDailyVisitor = async (req, res, next) => {
  try {
    await deleteDailyVisitorService(req.params.id);
    sendSuccess(res, { message: "Daily visitor deleted" });
  } catch (err) {
    next(err);
  }
};

export const getDailyVisitorById = async (req, res, next) => {
  try {
    const doc = await getDailyVisitorByIdService(req.params.id);
    sendSuccess(res, { data: doc });
  } catch (err) {
    next(err);
  }
};

export const getAllDailyVisitors = async (req, res, next) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const result = await getAllDailyVisitorsService(page, limit);
    sendSuccess(res, {
      page,
      limit,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyVisitorsByDate = async (req, res, next) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const result = await getDailyVisitorsByDateService(req.params.date, page, limit);
    sendSuccess(res, {
      page,
      limit,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyVisitorsByWeek = async (req, res, next) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const result = await getDailyVisitorsByWeekService(req.query.date, page, limit);
    sendSuccess(res, {
      page,
      limit,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyVisitorsByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const { page, limit } = parsePageLimit(req.query);
    const result = await getDailyVisitorsByMonthService(year, month, page, limit);
    sendSuccess(res, {
      page,
      limit,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyVisitorsByYear = async (req, res, next) => {
  try {
    const { year } = req.params;
    const { page, limit } = parsePageLimit(req.query);
    const result = await getDailyVisitorsByYearService(year, page, limit);
    sendSuccess(res, {
      page,
      limit,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    next(err);
  }
};
