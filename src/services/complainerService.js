import mongoose from "mongoose";
import Complainer from "../models/complainerModel.js";
import { generateComplainerId } from "../utils/generateIds.js";

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
  // Required checks
  if (!name || !phone || !taluka || !village) {
    throw new Error("Name, phone, taluka and village are required.");
  }

  if (!addedBy) {
    throw new Error("addedBy user is required.");
  }

  // ObjectId validation
  if (
    !mongoose.Types.ObjectId.isValid(taluka) ||
    !mongoose.Types.ObjectId.isValid(village) ||
    !mongoose.Types.ObjectId.isValid(addedBy)
  ) {
    throw new Error("Invalid ObjectId provided.");
  }

  // 🔒 DUPLICATE CHECK
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
export const getAllComplainersService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [complainers, totalRecords] = await Promise.all([
    Complainer.find()
      .populate("taluka", "name")
      .populate("village", "name")
      .populate("addedBy", "name phone")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Complainer.countDocuments()
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

// ==========================
// Get Complainer by Mongo _id
// ==========================
export const getComplainerByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  const complainer = await Complainer.findById(id)
    .populate("taluka", "name")
    .populate("village", "name")
    .populate("addedBy", "name phone");

  if (!complainer) {
    throw new Error("Complainer not found.");
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
export const updateComplainerService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  // 🔒 Whitelist allowed fields
  const allowedUpdates = {
    name: updateData.name,
    phone: updateData.phone
  };

  // Remove undefined values
  Object.keys(allowedUpdates).forEach(
    key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  // At least one field required
  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error("Only name or phone can be updated.");
  }

  const updated = await Complainer.findByIdAndUpdate(
    id,
    allowedUpdates,
    { new: true }
  );

  if (!updated) {
    throw new Error("Complainer not found.");
  }

  return updated;
};

// ==========================
// Delete Complainer
// ==========================
export const deleteComplainerService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complainer ID.");
  }

  const deleted = await Complainer.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Complainer not found.");
  }

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