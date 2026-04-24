import mongoose from "mongoose";

const appUserSchema = new mongoose.Schema(
  {
    appUserId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },

    // Add this for forgot password
    secretQuestion: {
      type: String,
      required: true
    },
    secretAnswer: {
      type: String,
      required: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("AppUser", appUserSchema);
