import Village from "../models/villageModel.js";
import Taluka from "../models/talukaModel.js";
import Counter from "../models/counterModel.js";
import { generateVillageId } from "../utils/generateIds.js";


// ==========================
// Create Village
// ==========================
export const createVillage = async (req, res) => {
  try {
    const { name, talukaId } = req.body;

    // Validate name fields
    if (!name || !name.en || !name.mr) {
      return res.status(400).json({
        message: "Both English (en) and Marathi (mr) names are required."
      });
    }

    // Validate talukaId
    if (!talukaId) {
      return res.status(400).json({ message: "talukaId is required" });
    }

    // Find Taluka by talukaId (string)
    const taluka = await Taluka.findOne({ talukaId: talukaId });
    if (!taluka) {
      return res.status(404).json({
        message: "Taluka not found with given talukaId"
      });
    }

    // Auto-generate villageId
    const villageId = await generateVillageId();

    const newVillage = new Village({
      villageId,
      name,
      taluka: taluka._id   // Store ObjectId
    });

    await newVillage.save();

    res.status(201).json({
      message: "Village created successfully",
      data: newVillage
    });

  } catch (error) {
    console.error("Error creating village:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Get All Villages
// ==========================
export const getAllVillages = async (req, res) => {
  try {
    const villages = await Village.find()
      .populate("taluka") // include taluka info
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Village list fetched successfully",
      data: villages
    });

  } catch (error) {
    console.error("Error fetching villages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Get Villages by Taluka (string talukaId)
// ==========================
export const getVillageByTaluka = async (req, res) => {
  try {
    const { talukaId } = req.params;

    // Find Taluka document by talukaId
    const taluka = await Taluka.findOne({ talukaId });
    if (!taluka) {
      return res.status(404).json({
        message: "Taluka not found with given talukaId"
      });
    }

    const villages = await Village.find({ taluka: taluka._id })
      .populate("taluka");

    res.status(200).json({
      message: "Villages fetched successfully",
      data: villages
    });

  } catch (error) {
    console.error("Error fetching villages by taluka:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Update Village by villageId (string)
// ==========================
export const updateVillage = async (req, res) => {
  try {
    const { villageId } = req.params;
    const { name } = req.body;

    if (!name || !name.en || !name.mr) {
      return res.status(400).json({
        message: "English (en) and Marathi (mr) names are required."
      });
    }

    const updated = await Village.findOneAndUpdate(
      { villageId },
      { name },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Village not found" });
    }

    res.status(200).json({
      message: "Village updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Error updating village:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Delete Village
// ==========================
export const deleteVillage = async (req, res) => {
  try {
    const { villageId } = req.params;

    const deleted = await Village.findOneAndDelete({ villageId });

    if (!deleted) {
      return res.status(404).json({ message: "Village not found" });
    }

    res.status(200).json({
      message: "Village deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting village:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Reset Village ID Counter
// ==========================
export const resetVillageCounter = async (req, res) => {
  try {
    await Counter.findByIdAndUpdate(
      "villageId",
      { seq: 0 },
      { upsert: true }
    );

    res.status(200).json({
      message: "Village ID counter reset. Next ID will start from VLG001."
    });

  } catch (error) {
    console.error("Reset counter error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
