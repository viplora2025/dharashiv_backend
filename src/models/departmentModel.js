import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    deptId: {
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

    level: {
      type: String,
      enum: ["taluka", "cluster", "village", "town", "district"],
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
