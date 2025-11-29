// controllers/talukaController.js

import Taluka from "../models/talukaModel.js";
import Counter from "../models/counterModel.js";
import { generateTalukaId } from "../utils/generateIds.js";


// ==========================
// Create Taluka (Multi-language)
// ==========================
export const createTaluka = async (req, res) => {
  try {
    const { name } = req.body;

    // name object must contain both en + mr
    if (!name || !name.en || !name.mr) {
      return res.status(400).json({
        message: "Both English (en) and Marathi (mr) names are required."
      });
    }

    const talukaId = await generateTalukaId();

    const newTaluka = new Taluka({
      talukaId,
      name: {
        en: name.en,
        mr: name.mr
      }
    });

    await newTaluka.save();

    res.status(201).json({
      message: "Taluka created successfully",
      data: newTaluka
    });

  } catch (error) {
    console.error("Error creating taluka:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Get All Talukas
// ==========================
export const getAllTalukas = async (req, res) => {
  try {
    const talukas = await Taluka.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Taluka list fetched successfully",
      data: talukas
    });

  } catch (error) {
    console.error("Get talukas error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Update Taluka (Multi-language)
// ==========================
export const updateTaluka = async (req, res) => {
  try {
    const { talukaId } = req.params;
    const { name } = req.body;

    if (!name || !name.en || !name.mr) {
      return res.status(400).json({
        message: "Both English (en) and Marathi (mr) names are required."
      });
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
      return res.status(404).json({ message: "Taluka not found" });
    }

    res.status(200).json({
      message: "Taluka updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Update taluka error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Delete Taluka
// ==========================
export const deleteTaluka = async (req, res) => {
  try {
    const { talukaId } = req.params;

    const deleted = await Taluka.findOneAndDelete({ talukaId });

    if (!deleted) {
      return res.status(404).json({ message: "Taluka not found" });
    }

    res.status(200).json({
      message: "Taluka deleted successfully"
    });

  } catch (error) {
    console.error("Delete taluka error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// ==========================
// Reset Taluka ID Counter
// ==========================
export const resetTalukaCounter = async (req, res) => {
  try {
    await Counter.findByIdAndUpdate(
      "talukaId",
      { seq: 0 },
      { upsert: true }
    );

    res.status(200).json({
      message: "Taluka ID counter reset successfully. Next ID will start from TLK001."
    });

  } catch (error) {
    console.error("Reset counter error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
