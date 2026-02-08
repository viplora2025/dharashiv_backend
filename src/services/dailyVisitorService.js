import mongoose from "mongoose";
import DailyVisitor from "../models/dailyVisitorModel.js";
import {
  generateDailyVisitorId,
  generateDailyVisitorSrNo
} from "../utils/dailyVisitorIds.js";

const toDayKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDayUtc = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const endOfDayUtc = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
};

const getWeekRangeUtc = (date) => {
  const d = startOfDayUtc(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday start
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - diff);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

export const createDailyVisitorService = async (data) => {
  const { name, phone, address, reason, remark, visitDate } = data;

  if (!name || !reason) {
    throw new Error("name and reason are required");
  }

  const actualVisitDate = visitDate ? new Date(visitDate) : new Date();
  if (Number.isNaN(actualVisitDate.getTime())) {
    throw new Error("Invalid visitDate");
  }

  const dayKey = toDayKey(actualVisitDate);
  const [dVisitorId, srNo] = await Promise.all([
    generateDailyVisitorId(),
    generateDailyVisitorSrNo(dayKey)
  ]);

  const doc = await DailyVisitor.create({
    dVisitorId,
    srNo,
    dayKey,
    name,
    phone: phone || null,
    address: address || null,
    reason,
    remark: remark || null,
    visitDate: actualVisitDate
  });

  return doc;
};

export const updateDailyVisitorService = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid daily visitor id");
  }

  const updates = { ...data };
  delete updates.dVisitorId;
  delete updates.srNo;
  delete updates.dayKey;
  delete updates.visitDate;

  const doc = await DailyVisitor.findByIdAndUpdate(id, updates, {
    new: true
  });

  if (!doc) {
    throw new Error("Daily visitor not found");
  }

  return doc;
};

export const deleteDailyVisitorService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid daily visitor id");
  }

  const doc = await DailyVisitor.findByIdAndDelete(id);
  if (!doc) {
    throw new Error("Daily visitor not found");
  }

  return true;
};

export const getDailyVisitorByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid daily visitor id");
  }

  const doc = await DailyVisitor.findById(id);
  if (!doc) {
    throw new Error("Daily visitor not found");
  }

  return doc;
};

export const getAllDailyVisitorsService = async () => {
  return await DailyVisitor.find().sort({ visitDate: -1, srNo: 1 });
};

export const getDailyVisitorsByDateService = async (date) => {
  const start = startOfDayUtc(date);
  const end = endOfDayUtc(date);
  return await DailyVisitor.find({
    visitDate: { $gte: start, $lte: end }
  }).sort({ srNo: 1 });
};

export const getDailyVisitorsByWeekService = async (date) => {
  const baseDate = date || new Date();
  const { start, end } = getWeekRangeUtc(baseDate);
  return await DailyVisitor.find({
    visitDate: { $gte: start, $lte: end }
  }).sort({ visitDate: 1, srNo: 1 });
};

export const getDailyVisitorsByMonthService = async (year, month) => {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    throw new Error("Invalid year or month");
  }

  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  return await DailyVisitor.find({
    visitDate: { $gte: start, $lte: end }
  }).sort({ visitDate: 1, srNo: 1 });
};

export const getDailyVisitorsByYearService = async (year) => {
  const y = Number(year);
  if (!Number.isInteger(y)) {
    throw new Error("Invalid year");
  }

  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));

  return await DailyVisitor.find({
    visitDate: { $gte: start, $lte: end }
  }).sort({ visitDate: 1, srNo: 1 });
};
