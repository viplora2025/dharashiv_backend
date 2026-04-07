// src/services/complainerService.js

import Complainer from "../models/complainerModel.js";
import AppUser from "../models/appUserModel.js";
import Taluka from "../models/talukaModel.js";
import Village from "../models/villageModel.js";
import { generateComplainerId } from "../utils/generateIds.js";

const hasTalukaAccess = (req, talukaId) => {
  if (req.role !== "admin") return true;
  const assigned = req.user.assignedTaluka || [];
  return assigned.some((t) => t.toString() === talukaId.toString());
};

/* ================= CREATE COMPLAINER ================= */
export const createComplainerService = async ({
  name,
  phone,
  taluka,
  village,
  addedBy
}) => {
  if (!addedBy) throw new Error("addedBy user is required");

  const [userDoc, talukaDoc, villageDoc] = await Promise.all([
    AppUser.findById(addedBy).select("_id"),
    Taluka.findById(taluka).select("_id"),
    Village.findById(village).select("_id taluka")
  ]);

  if (!userDoc) throw new Error("Invalid user");
  if (!talukaDoc) throw new Error("Taluka not found");
  if (!villageDoc) throw new Error("Village not found");
  if (villageDoc.taluka.toString() !== taluka.toString()) {
    throw new Error("Village does not belong to selected taluka");
  }

  const duplicate = await Complainer.findOne({
    name: name.trim(),
    phone: phone.trim(),
    village,
    addedBy
  });

  if (duplicate) throw new Error("Duplicate complainer detected");

  const complainerId = await generateComplainerId();

  const complainer = await Complainer.create({
    complainerId,
    name: name.trim(),
    phone: phone.trim(),
    taluka,
    village,
    addedBy
  });

  return complainer;
};

/* ================= GET ALL COMPLAINERS ================= */
export const getAllComplainersService = async (query, accessibleTalukas = null) => {
  const { talukaId, page = 1, limit = 10 } = query;

  if (Array.isArray(accessibleTalukas) && accessibleTalukas.length === 0) {
    return { data: [], totalRecords: 0 };
  }

  const filter = {};
  let targetTalukas = [];

  if (talukaId) {
    if (accessibleTalukas && !accessibleTalukas.some(t => t.toString() === talukaId.toString())) {
      throw new Error("Access denied to this Taluka");
    }
    targetTalukas = [talukaId];
  } else if (accessibleTalukas && accessibleTalukas.length > 0) {
    targetTalukas = accessibleTalukas;
  }

  if (targetTalukas.length > 0) {
    filter.taluka = { $in: targetTalukas };
  }

  const skip = (page - 1) * limit;
  const [data, totalRecords] = await Promise.all([
    Complainer.find(filter)
      .populate("taluka", "name")
      .populate("village", "name")
      .populate("addedBy", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complainer.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

/* ================= GET COMPLAINER BY ID ================= */
export const getComplainerByIdService = async (id, req) => {
  if (req.role === "staff") throw new Error("Staff access denied");

  const complainer = await Complainer.findById(id)
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");

  if (!complainer) throw new Error("Complainer not found");

  if (req.role === "user" && complainer.addedBy?._id?.toString() !== req.user._id.toString()) {
    throw new Error("Not allowed to view this complainer");
  }

  const talukaId = complainer.taluka?._id || complainer.taluka;
  if (req.role === "admin" && !hasTalukaAccess(req, talukaId)) {
    throw new Error("Not allowed to view this complainer");
  }

  return complainer;
};

/* ================= GET COMPLAINERS BY APPUSER ================= */
export const getComplainersByAppUserService = async (userId) => {
  return await Complainer.find({ addedBy: userId })
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");
};

/* ================= UPDATE COMPLAINER ================= */
export const updateComplainerService = async (id, updateData, req) => {
  if (req.role === "staff") throw new Error("Staff access denied");

  const allowedUpdates = {};
  if (updateData.name) allowedUpdates.name = updateData.name.trim();
  if (updateData.phone) allowedUpdates.phone = updateData.phone.trim();

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("Nothing to update");
  }

  const complainer = await Complainer.findById(id).select("addedBy taluka");
  if (!complainer) throw new Error("Complainer not found");

  if (req.role === "user" && complainer.addedBy.toString() !== req.user._id.toString()) {
    throw new Error("Not allowed to update this complainer");
  }

  if (req.role === "admin" && !hasTalukaAccess(req, complainer.taluka)) {
    throw new Error("Not allowed to update this complainer");
  }

  const updated = await Complainer.findByIdAndUpdate(id, allowedUpdates, { new: true })
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");

  return updated;
};

/* ================= DELETE COMPLAINER ================= */
export const deleteComplainerService = async (id, req) => {
  if (req.role === "staff") throw new Error("Staff access denied");

  const complainer = await Complainer.findById(id).select("addedBy taluka");
  if (!complainer) throw new Error("Complainer not found");

  if (req.role === "user" && complainer.addedBy.toString() !== req.user._id.toString()) {
    throw new Error("Not allowed to delete this complainer");
  }

  if (req.role === "admin" && !hasTalukaAccess(req, complainer.taluka)) {
    throw new Error("Not allowed to delete this complainer");
  }

  await Complainer.findByIdAndDelete(id);
  return true;
};

/* ================= GET BY USER + TALUKA ================= */
export const getComplainersByUserAndTalukaService = async (userId, talukaId) => {
  const data = await Complainer.find({ addedBy: userId, taluka: talukaId })
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone")
    .sort({ createdAt: -1 });

  return { totalRecords: data.length, data };
};

/* ================= GET BY TALUKA ================= */
export const getComplainersByTalukaService = async (talukaId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [data, totalRecords] = await Promise.all([
    Complainer.find({ taluka: talukaId })
      .populate("taluka", "name")
      .populate("village", "name")
      .populate("addedBy", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complainer.countDocuments({ taluka: talukaId })
  ]);

  return { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit), data };
};
