import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true
    },

    complainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainer",
      required: true
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    subDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubDepartment",
      required: true
    },

    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    media: [
      {
        type: { type: String, enum: ["image", "video", "pdf", "audio"], required: true },
        url: { type: String, required: true }
      }
    ],

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open"
    },

    history: [
      {
        message: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" }, // Changed to AppUser for consistency
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
