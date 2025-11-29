import mongoose from "mongoose";

const talukaSchema = new mongoose.Schema(
  {
    talukaId: {
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Taluka", talukaSchema);
