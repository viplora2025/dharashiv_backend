import mongoose from "mongoose";

import { EventStatus } from "../config/constants.js";

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    title: {
      en: { type: String, default: "Janta Darbar" },
      mr: { type: String, default: "जनता दरबार" }
    },

    eventDate: {
      type: Date,
      required: true,
      index: true
    },

    startTime: {
      type: String,
      required: true
    },

    endTime: {
      type: String,
      required: true
    },

    address: {
      en: { type: String, trim: true, default: null },
      mr: { type: String, trim: true, default: null }
    },

    maxTokens: {
      type: Number,
      default: 100
    },

    // Track the last issued token number for this event
    lastTokenNo: {
      type: Number,
      default: 0
    },

    status: {
      en: { type: String, default: "Announced" },
      mr: { type: String, default: "घोषित" }
    },

    meetingSummary: {
      en: { type: String, default: null },
      mr: { type: String, default: null }
    },

    totalVisitorsAttended: {
      type: Number,
      default: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);

