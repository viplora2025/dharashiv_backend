import mongoose from "mongoose";
import { VisitorStatus, RegistrationType } from "../config/constants.js";

const visitorSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    visitorName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      default: null
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true
    },

    taluka: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taluka",
      required: true
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
      type: String,
      enum: Object.values(VisitorStatus),
      default: VisitorStatus.REGISTERED
    },
    appUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      default: null
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    registeredAt: {
      type: Date,
      default: Date.now
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
