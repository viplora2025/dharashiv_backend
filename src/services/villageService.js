// src/services/villageService.js

import mongoose from "mongoose";
import Village from "../models/villageModel.js";
import Taluka from "../models/talukaModel.js";
import Complainer from "../models/complainerModel.js";
import Complaint from "../models/complaintModel.js";
import Visitor from "../models/visitorModel.js";
import Counter from "../models/counterModel.js";
import { generateVillageId } from "../utils/generateIds.js";

/* ================= CREATE VILLAGE ================= */
export const createVillageService = async ({ name, talukaId }) => {
  if (!name || !name.en || !name.mr) {
    throw new Error("Both English (en) and Marathi (mr) names are required.");
  }

  if (!talukaId) {
    throw new Error("talukaId is required");
  }

  const taluka = await Taluka.findOne({ talukaId });
  if (!taluka) {
    throw new Error("Taluka not found with given talukaId");
  }

  const villageId = await generateVillageId();

  const village = await Village.create({
    villageId,
    name,
    taluka: taluka._id
  });

  return village;
};

/* ================= GET ALL VILLAGES ================= */
export const getAllVillagesService = async () => {
  return Village.find()
    .populate("taluka")
    .sort({ createdAt: -1 });
};

/* ================= GET VILLAGES BY TALUKA (STRING ID) ================= */
export const getVillageByTalukaService = async (talukaId) => {
  const taluka = await Taluka.findOne({ talukaId });
  if (!taluka) {
    throw new Error("Taluka not found with given talukaId");
  }

  return Village.find({ taluka: taluka._id }).populate("taluka");
};

/* ================= GET VILLAGES BY TALUKA (OBJECT ID) ================= */
export const getVillageByTalukaObjectIdService = async (talukaObjectId) => {
  if (!mongoose.Types.ObjectId.isValid(talukaObjectId)) {
    throw new Error("Invalid Taluka ObjectId");
  }

  const villages = await Village.find({
    taluka: talukaObjectId
  }).populate("taluka");

  if (!villages.length) {
    throw new Error("No villages found for this taluka");
  }

  return villages;
};

/* ================= UPDATE VILLAGE ================= */
export const updateVillageService = async (villageId, name) => {
  if (!name || !name.en || !name.mr) {
    throw new Error("English (en) and Marathi (mr) names are required.");
  }

  const updated = await Village.findOneAndUpdate(
    { villageId },
    { name },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new Error("Village not found");
  }

  return updated;
};

/* ================= DELETE VILLAGE ================= */
export const deleteVillageService = async (villageId) => {
  const village = await Village.findOne({ villageId }).select("_id");
  if (!village) {
    throw new Error("Village not found");
  }

  const [complainerCount, visitorCount] = await Promise.all([
    Complainer.countDocuments({ village: village._id }),
    Visitor.countDocuments({ village: village._id })
  ]);

  let complaintCount = 0;
  if (complainerCount > 0) {
    const complainerIds = await Complainer.find(
      { village: village._id },
      { _id: 1 }
    ).lean();
    complaintCount = await Complaint.countDocuments({
      complainer: { $in: complainerIds.map((c) => c._id) }
    });
  }

  if (complainerCount > 0 || complaintCount > 0 || visitorCount > 0) {
    throw new Error("Cannot delete village because dependent records exist");
  }

  const deleted = await Village.findOneAndDelete({ villageId });
  if (!deleted) {
    throw new Error("Village not found");
  }

  return true;
};

/* ================= RESET VILLAGE COUNTER ================= */
export const resetVillageCounterService = async () => {
  const villageCount = await Village.countDocuments();
  if (villageCount > 0) {
    throw new Error("Cannot reset village counter while village records exist");
  }

  await Counter.findByIdAndUpdate(
    "villageId",
    { seq: 0 },
    { upsert: true }
  );

  return true;
};


// src/services/villageService.js

export const createMultipleVillagesService = async ({ talukaId, villages }) => {
  if (!talukaId) {
    throw new Error("talukaId is required");
  }

  if (!Array.isArray(villages) || villages.length === 0) {
    throw new Error("Villages array is required");
  }

  // Find taluka by string ID
  const taluka = await Taluka.findOne({ talukaId });
  if (!taluka) {
    throw new Error("Taluka not found with given talukaId");
  }

  const villageDocs = [];

  for (const v of villages) {
    if (!v.en || !v.mr) {
      throw new Error("Each village must have both en and mr names");
    }

    const villageId = await generateVillageId();

    villageDocs.push({
      villageId,
      name: {
        en: v.en,
        mr: v.mr
      },
      taluka: taluka._id   // ✅ ObjectId (model ke hisaab se)
    });
  }

  // Single DB call (FAST)
  const savedVillages = await Village.insertMany(villageDocs);

  return savedVillages;
};
