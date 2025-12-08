import mongoose from "mongoose";

const subDepartmentSchema = new mongoose.Schema(
  {
    subDeptId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    parentDept: {
      // reference to Department (category) e.g., Police Department
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    name: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },

    // operational level of this office
    level: {
      type: String,
      enum: ["taluka", "cluster", "village", "town", "district"],
      required: true,
      trim: true
    },

    // optional tie to Taluka (helps queries/filter)
    taluka: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taluka",
      default: null
    },

    // keep minimal here — actual mapping handled in DeptVillageMap
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },

    officerName: { type: String, trim: true },
    officerDesignation: { type: String, trim: true },

    workingHours: {
      open: { type: String, trim: true },   // "09:00"
      close: { type: String, trim: true }   // "18:00"
    },

    // optional geo coords
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  { timestamps: true }
);

export default mongoose.model("SubDepartment", subDepartmentSchema);
