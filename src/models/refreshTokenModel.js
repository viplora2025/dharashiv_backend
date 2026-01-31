import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },

    userId: { type: String, required: true }, // appUserId / adminId
    role: {
      type: String,
      enum: ["user", "admin", "superadmin","staff"],
      required: true
    },

    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);
