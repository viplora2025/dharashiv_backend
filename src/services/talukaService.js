// src/services/talukaService.js

import Taluka from "../models/talukaModel.js";
import Village from "../models/villageModel.js";
import Complainer from "../models/complainerModel.js";
import Complaint from "../models/complaintModel.js";
import Admin from "../models/adminModel.js";
import Visitor from "../models/visitorModel.js";
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
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new Error("Taluka not found");
  }

  return updated;
};

/* ================= DELETE TALUKA ================= */
export const deleteTalukaService = async (talukaId) => {
  const taluka = await Taluka.findOne({ talukaId }).select("_id");
  if (!taluka) {
    throw new Error("Taluka not found");
  }

  const [villageCount, complainerCount, adminCount, visitorCount] = await Promise.all([
    Village.countDocuments({ taluka: taluka._id }),
    Complainer.countDocuments({ taluka: taluka._id }),
    Admin.countDocuments({ assignedTaluka: taluka._id }),
    Visitor.countDocuments({ taluka: taluka._id })
  ]);

  let complaintCount = 0;
  if (complainerCount > 0) {
    const complainerIds = await Complainer.find(
      { taluka: taluka._id },
      { _id: 1 }
    ).lean();
    complaintCount = await Complaint.countDocuments({
      complainer: { $in: complainerIds.map((c) => c._id) }
    });
  }

  if (
    villageCount > 0 ||
    complainerCount > 0 ||
    complaintCount > 0 ||
    adminCount > 0 ||
    visitorCount > 0
  ) {
    throw new Error("Cannot delete taluka because dependent records exist");
  }

  const deleted = await Taluka.findOneAndDelete({ talukaId });

  if (!deleted) {
    throw new Error("Taluka not found");
  }

  return true;
};

/* ================= RESET TALUKA COUNTER ================= */
export const resetTalukaCounterService = async () => {
  const talukaCount = await Taluka.countDocuments();
  if (talukaCount > 0) {
    throw new Error("Cannot reset taluka counter while taluka records exist");
  }

  await Counter.findByIdAndUpdate(
    "talukaId",
    { seq: 0 },
    { upsert: true }
  );

  return true;
};
