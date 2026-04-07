// src/services/dailyVisitorService.js

import DailyVisitor from "../models/dailyVisitorModel.js";
import {
  generateDailyVisitorId,
  generateDailyVisitorSrNo
} from "../utils/dailyVisitorIds.js";

const toDayKey = (date) => {
  const d = new Date(date);
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

  const actualVisitDate = visitDate ? new Date(visitDate) : new Date();
  const dayKey = toDayKey(actualVisitDate);
  
  const [dVisitorId, srNo] = await Promise.all([
    generateDailyVisitorId(),
    generateDailyVisitorSrNo(dayKey)
  ]);

  const doc = await DailyVisitor.create({
    dVisitorId,
    srNo,
    dayKey,
    name: {
      en: name.en,
      mr: name.mr
    },
    phone: phone || null,
    address: address || null,
    reason: {
      en: reason.en,
      mr: reason.mr
    },
    remark: remark || null,
    visitDate: actualVisitDate
  });

  return doc;
};

export const updateDailyVisitorService = async (id, data) => {
  const allowedFields = ["name", "phone", "address", "reason", "remark"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields provided for update");
  }

  const doc = await DailyVisitor.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    throw new Error("Daily visitor not found");
  }

  return doc;
};

export const deleteDailyVisitorService = async (id) => {
  const doc = await DailyVisitor.findById(id);
  if (!doc) {
    throw new Error("Daily visitor not found");
  }
  await doc.deleteOne();
  return true;
};

export const getDailyVisitorByIdService = async (id) => {
  const doc = await DailyVisitor.findById(id);
  if (!doc) {
    throw new Error("Daily visitor not found");
  }
  return doc;
};

export const getAllDailyVisitorsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const filter = {};
  const [data, totalRecords] = await Promise.all([
    DailyVisitor.find(filter)
      .sort({ visitDate: -1, srNo: 1 })
      .skip(skip)
      .limit(Number(limit)),
    DailyVisitor.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

export const getDailyVisitorsByDateService = async (date, page = 1, limit = 10) => {
  const start = startOfDayUtc(date);
  const end = endOfDayUtc(date);
  const filter = { visitDate: { $gte: start, $lte: end } };
  const skip = (page - 1) * limit;

  const [data, totalRecords] = await Promise.all([
    DailyVisitor.find(filter)
      .sort({ srNo: 1 })
      .skip(skip)
      .limit(Number(limit)),
    DailyVisitor.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

export const getDailyVisitorsByWeekService = async (date, page = 1, limit = 10) => {
  const baseDate = date || new Date();
  const { start, end } = getWeekRangeUtc(baseDate);
  const filter = { visitDate: { $gte: start, $lte: end } };
  const skip = (page - 1) * limit;

  const [data, totalRecords] = await Promise.all([
    DailyVisitor.find(filter)
      .sort({ visitDate: 1, srNo: 1 })
      .skip(skip)
      .limit(Number(limit)),
    DailyVisitor.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

export const getDailyVisitorsByMonthService = async (year, month, page = 1, limit = 10) => {
  const y = Number(year);
  const m = Number(month);

  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  const filter = { visitDate: { $gte: start, $lte: end } };
  const skip = (page - 1) * limit;

  const [data, totalRecords] = await Promise.all([
    DailyVisitor.find(filter)
      .sort({ visitDate: 1, srNo: 1 })
      .skip(skip)
      .limit(Number(limit)),
    DailyVisitor.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

export const getDailyVisitorsByYearService = async (year, page = 1, limit = 10) => {
  const y = Number(year);

  const start = new Date(Date.UTC(y, 0, 1));
  const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));

  const filter = { visitDate: { $gte: start, $lte: end } };
  const skip = (page - 1) * limit;

  const [data, totalRecords] = await Promise.all([
    DailyVisitor.find(filter)
      .sort({ visitDate: 1, srNo: 1 })
      .skip(skip)
      .limit(Number(limit)),
    DailyVisitor.countDocuments(filter)
  ]);

  return { data, totalRecords };
};
