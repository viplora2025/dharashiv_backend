import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    appUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },

    appUserId: {
      type: String,
      required: true,
      trim: true,
    },

    feedbackId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
