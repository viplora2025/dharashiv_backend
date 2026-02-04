// src/services/talukaService.js

import Taluka from "../models/talukaModel.js";
import Counter from "../models/counterModel.js";
import { generateTalukaId } from "../utils/generateIds.js";

/* ================= CREATE TALUKA ================= */
export const createTalukaService = async (name) => {
  if (!name || !name.en || !name.mr) {
    throw new Error("Both English (en) and Marathi (mr) names are required.");
  }

  const talukaId = await generateTalukaId();

  const taluka = await Taluka.create({
    talukaId,
    name: {
      en: name.en,
      mr: name.mr
    }
  });

  return taluka;
};

/* ================= GET ALL TALUKAS ================= */
export const getAllTalukasService = async () => {
  return Taluka.find().sort({ createdAt: -1 });
};

/* ================= UPDATE TALUKA ================= */
export const updateTalukaService = async (talukaId, name) => {
  if (!name || !name.en || !name.mr) {
    throw new Error("Both English (en) and Marathi (mr) names are required.");
  }

  const updated = await Taluka.findOneAndUpdate(
    { talukaId },
    {
      name: {
        en: name.en,
        mr: name.mr
      }
    },
    { new: true }
  );

  if (!updated) {
    throw new Error("Taluka not found");
  }

  return updated;
};

/* ================= DELETE TALUKA ================= */
export const deleteTalukaService = async (talukaId) => {
  const deleted = await Taluka.findOneAndDelete({ talukaId });

  if (!deleted) {
    throw new Error("Taluka not found");
  }

  return true;
};

/* ================= RESET TALUKA COUNTER ================= */
export const resetTalukaCounterService = async () => {
  await Counter.findByIdAndUpdate(
    "talukaId",
    { seq: 0 },
    { upsert: true }
  );

  return true;
};
