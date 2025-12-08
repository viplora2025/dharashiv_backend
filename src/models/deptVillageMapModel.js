import mongoose from "mongoose";

const deptVillageMapSchema = new mongoose.Schema(
  {
    subDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubDepartment",
      required: true,
      index: true
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
      index: true
    },

    // primary / secondary responsibility
    level: {
      type: String,
      enum: ["primary", "secondary"],
      default: "primary",
      trim: true
    },

    // lower => higher priority (1 highest)
    priority: {
      type: Number,
      default: 1,
      index: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate mapping for same subDept + village
deptVillageMapSchema.index({ subDepartment: 1, village: 1 }, { unique: true });

export default mongoose.model("DeptVillageMap", deptVillageMapSchema);
