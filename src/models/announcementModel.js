import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    announcementId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },
    message: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },
    eventDate: {
      type: Date,
      required: true,
      index: true
    },
    eventTime: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },
    type: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },
    imageUrl: {
      type: String,
      default: null
    },
    imagePublicId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
