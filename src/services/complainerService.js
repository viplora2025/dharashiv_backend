import mongoose from "mongoose";
import Complainer from "../models/complainerModel.js";
import AppUser from "../models/appUserModel.js";
import Taluka from "../models/talukaModel.js";
import Village from "../models/villageModel.js";
import { generateComplainerId } from "../utils/generateIds.js";

const hasTalukaAccess = (req, talukaId) => {
  if (req.role !== "admin") return true;

  const assigned = req.user.assignedTaluka || [];
  if (assigned.length === 0) return false;

  return assigned.some((t) => t.toString() === talukaId.toString());
};

// ==========================
// Create Complainer
// ==========================
export const createComplainerService = async ({
  name,
  phone,
  taluka,
  village,
  addedBy
}) => {
  if (!name || !phone || !taluka || !village) {
    throw new Error("Name, phone, taluka and village are required.");
  }

  if (!addedBy) {
    throw new Error("addedBy user is required.");
  }

  if (
    !mongoose.Types.ObjectId.isValid(taluka) ||
    !mongoose.Types.ObjectId.isValid(village) ||
    !mongoose.Types.ObjectId.isValid(addedBy)
  ) {
    throw new Error("Invalid ObjectId provided.");
  }

  const [userDoc, talukaDoc, villageDoc] = await Promise.all([
    AppUser.findById(addedBy).select("_id"),
    Taluka.findById(taluka).select("_id"),
    Village.findById(village).select("_id taluka")
  ]);

  if (!userDoc) throw new Error("Invalid addedBy user.");
  if (!talukaDoc) throw new Error("Taluka not found.");
  if (!villageDoc) throw new Error("Village not found.");
  if (villageDoc.taluka.toString() !== taluka.toString()) {
    throw new Error("Village does not belong to selected taluka.");
  }

  const duplicate = await Complainer.findOne({
    name: name.trim(),
    phone: phone.trim(),
    village,
    addedBy
  });

  if (duplicate) {
    throw new Error(
      "Duplicate complainer detected. Same name, phone and village already exists for this user."
    );
  }

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

// ==========================
// Get All Complainers
// ==========================
export const getAllComplainersService = async (
  query,
  accessibleTalukas = null
) => {
  const { talukaId, page = 1, limit = 10 } = query;

  if (Array.isArray(accessibleTalukas) && accessibleTalukas.length === 0) {
    return { data: [], totalRecords: 0 };
  }

  const filter = {};
  let targetTalukas = [];

  if (talukaId) {
    if (!mongoose.Types.ObjectId.isValid(talukaId)) {
      throw new Error("Invalid talukaId");
    }

    if (accessibleTalukas) {
      const allowed = accessibleTalukas.some(
        (t) => t.toString() === talukaId.toString()
      );
      if (!allowed) throw new Error("Access denied to this Taluka");
    }

    targetTalukas = [talukaId];
  } else if (accessibleTalukas && accessibleTalukas.length > 0) {
    targetTalukas = accessibleTalukas;
  }

  if (targetTalukas.length > 0) {
    filter.taluka = { $in: targetTalukas };
  }

  const skip = (page - 1) * limit;
  const totalRecords = await Complainer.countDocuments(filter);

  const data = await Complainer.find(filter)
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { data, totalRecords };
};

// ==========================
// Get Complainer by Mongo _id
// ==========================
export const getComplainerByIdService = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID");
  }

  const complainer = await Complainer.findById(id)
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");

  if (!complainer) throw new Error("Complainer not found");

  if (
    req.role === "user" &&
    complainer.addedBy?._id?.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed to view this complainer");
  }

  const talukaId = complainer.taluka?._id || complainer.taluka;
  if (req.role === "admin" && !hasTalukaAccess(req, talukaId)) {
    throw new Error("Not allowed to view this complainer");
  }

  return complainer;
};

// ==========================
// Get Complainers by AppUser
// ==========================
export const getComplainersByAppUserService = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  return await Complainer.find({ addedBy: userId })
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");
};

// ==========================
// Update Complainer
// ==========================
export const updateComplainerService = async (id, updateData, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  if (!["user", "admin", "superadmin"].includes(req.role)) {
    throw new Error("Not allowed to update this complainer.");
  }

  const allowedUpdates = {
    name: updateData.name,
    phone: updateData.phone
  };

  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("Only name or phone can be updated.");
  }

  if (allowedUpdates.name !== undefined) {
    allowedUpdates.name = allowedUpdates.name.trim();
  }
  if (allowedUpdates.phone !== undefined) {
    allowedUpdates.phone = allowedUpdates.phone.trim();
  }

  const complainer = await Complainer.findById(id).select("addedBy taluka");
  if (!complainer) {
    throw new Error("Complainer not found.");
  }

  if (
    req.role === "user" &&
    complainer.addedBy.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed to update this complainer.");
  }

  if (req.role === "admin" && !hasTalukaAccess(req, complainer.taluka)) {
    throw new Error("Not allowed to update this complainer.");
  }

  const updated = await Complainer.findByIdAndUpdate(id, allowedUpdates, {
    new: true
  })
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");

  return updated;
};

// ==========================
// Delete Complainer
// ==========================
export const deleteComplainerService = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  if (!["user", "admin", "superadmin"].includes(req.role)) {
    throw new Error("Not allowed to delete this complainer.");
  }

  const complainer = await Complainer.findById(id).select("addedBy taluka");
  if (!complainer) {
    throw new Error("Complainer not found.");
  }

  if (
    req.role === "user" &&
    complainer.addedBy.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed to delete this complainer.");
  }

  if (req.role === "admin" && !hasTalukaAccess(req, complainer.taluka)) {
    throw new Error("Not allowed to delete this complainer.");
  }

  await Complainer.findByIdAndDelete(id);

  return true;
};

// ==========================
// Get Complainers by User + Taluka
// ==========================
export const getComplainersByUserAndTalukaService = async (
  userId,
  talukaId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(talukaId)
  ) {
    throw new Error("Invalid userId or talukaId.");
  }

  const filter = {
    addedBy: userId,
    taluka: talukaId
  };

  const complainers = await Complainer.find(filter)
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone")
    .sort({ createdAt: -1 });

  return {
    totalRecords: complainers.length,
    data: complainers
  };
};

// ==========================
// Get Complainers by Taluka
// ==========================
export const getComplainersByTalukaService = async (
  talukaId,
  page = 1,
  limit = 10
) => {
  if (!mongoose.Types.ObjectId.isValid(talukaId)) {
    throw new Error("Invalid taluka ID.");
  }

  const skip = (page - 1) * limit;
  const filter = { taluka: talukaId };

  const [complainers, totalRecords] = await Promise.all([
    Complainer.find(filter)
      .populate("taluka", "name")
      .populate("village", "name")
      .populate("addedBy", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complainer.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    page,
    limit,
    totalRecords,
    totalPages,
    data: complainers
  };
};
