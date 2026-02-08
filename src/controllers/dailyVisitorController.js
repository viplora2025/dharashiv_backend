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
import { sendError, sendSuccess } from "../utils/response.js";

export const createDailyVisitor = async (req, res) => {
  try {
    const doc = await createDailyVisitorService(req.body);
    sendSuccess(res, {
      status: 201,
      message: "Daily visitor created",
      data: doc
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const updateDailyVisitor = async (req, res) => {
  try {
    const doc = await updateDailyVisitorService(
      req.params.id,
      req.body
    );
    sendSuccess(res, { message: "Daily visitor updated", data: doc });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const deleteDailyVisitor = async (req, res) => {
  try {
    await deleteDailyVisitorService(req.params.id);
    sendSuccess(res, { message: "Daily visitor deleted" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getDailyVisitorById = async (req, res) => {
  try {
    const doc = await getDailyVisitorByIdService(req.params.id);
    sendSuccess(res, { data: doc });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};

export const getAllDailyVisitors = async (req, res) => {
  try {
    const docs = await getAllDailyVisitorsService();
    sendSuccess(res, { data: docs });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};

export const getDailyVisitorsByDate = async (req, res) => {
  try {
    const docs = await getDailyVisitorsByDateService(req.params.date);
    sendSuccess(res, { data: docs });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getDailyVisitorsByWeek = async (req, res) => {
  try {
    const docs = await getDailyVisitorsByWeekService(req.query.date);
    sendSuccess(res, { data: docs });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getDailyVisitorsByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const docs = await getDailyVisitorsByMonthService(year, month);
    sendSuccess(res, { data: docs });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getDailyVisitorsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const docs = await getDailyVisitorsByYearService(year);
    sendSuccess(res, { data: docs });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};
