import mongoose from "mongoose";

const journeySchema = new mongoose.Schema(
  {
    sr: {
      type: Number,
      required: true,
      unique: true,
    },
    years: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Journey", journeySchema);
