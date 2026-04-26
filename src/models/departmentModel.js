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

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    description: {
      en: { type: String, trim: true, default: "" },
      mr: { type: String, trim: true, default: "" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
