// models/adminModel.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true },

    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["superadmin", "admin","staff" ],
      required: true
    },

    assignedTaluka: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Taluka" }
    ],

    otp: String,
    otpExpiry: Date
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
