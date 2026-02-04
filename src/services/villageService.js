// src/services/villageService.js

import mongoose from "mongoose";
import Village from "../models/villageModel.js";
import Taluka from "../models/talukaModel.js";
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
    { new: true }
  );

  if (!updated) {
    throw new Error("Village not found");
  }

  return updated;
};

/* ================= DELETE VILLAGE ================= */
export const deleteVillageService = async (villageId) => {
  const deleted = await Village.findOneAndDelete({ villageId });
  if (!deleted) {
    throw new Error("Village not found");
  }

  return true;
};

/* ================= RESET VILLAGE COUNTER ================= */
export const resetVillageCounterService = async () => {
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
