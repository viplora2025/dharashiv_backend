import mongoose from "mongoose";

const villageSchema = new mongoose.Schema(
  {
    villageId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      en: {
        type: String,
        required: true,
        trim: true
      },
      mr: {
        type: String,
        required: true,
        trim: true
      }
    },

    // Relation to Taluka
    talukaId: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Village", villageSchema);
