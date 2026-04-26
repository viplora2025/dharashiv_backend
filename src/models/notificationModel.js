import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel"
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["AppUser", "Admin"]
    },
    title: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },
    message: {
      en: { type: String, required: true, trim: true },
      mr: { type: String, required: true, trim: true }
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
