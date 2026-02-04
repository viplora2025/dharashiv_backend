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
      type: String,
      default: "Janta Darbar"
    },

    eventDate: {
      type: Date,
      required: true
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
      type: String,
      trim: true,
      default: null
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
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.ANNOUNCED
    },

    meetingSummary: {
      type: String,
      default: null
    },

    totalVisitorsAttended: {
      type: Number,
      default: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);

