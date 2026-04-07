import mongoose from "mongoose";
import { VisitorStatus, RegistrationType } from "../config/constants.js";

const visitorSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },

    visitorName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      default: null,
      index: true
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
      index: true
    },

    taluka: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taluka",
      required: true,
      index: true
    },

    issue: {
      type: String,
      required: true,
      trim: true
    },

    registrationType: {
      type: String,
      enum: Object.values(RegistrationType),
      required: true
    },

    tokenNo: {
      type: Number,
      required: true
    },

    status: {
      en: { type: String, default: "Registered" },
      mr: { type: String, default: "नोंदणी केली" }
    },
    appUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      default: null,
      index: true
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
      index: true
    },

    registeredAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

// Event-wise unique token number
visitorSchema.index(
  { eventId: 1, tokenNo: 1 },
  { unique: true }
);

export default mongoose.model(
  "Visitor",
  visitorSchema
);
