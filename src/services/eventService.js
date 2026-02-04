import Event from "../models/eventModel.js";
import { generateEventId } from "../utils/generateIds.js";
import mongoose from "mongoose";
export const createEventService = async (data) => {
  try {
    const {
      title, // Add title
      eventDate,
      startTime,
      endTime,
      address,
      maxTokens,
      createdBy
    } = data;

    /* ================= VALIDATION ================= */

    if (!createdBy) {
      throw new Error("Unauthorized: Admin not found in token");
    }

    if (!eventDate) {
      throw new Error("eventDate is required");
    }

    if (!startTime) {
      throw new Error("startTime is required");
    }

    if (!endTime) {
      throw new Error("endTime is required");
    }

    /* ================= CREATE EVENT ================= */

    const eventId = await generateEventId();

    const event = await Event.create({
      eventId,                // auto-generated (EVT000001)
      title: title || "Janta Darbar", // Default if not provided
      eventDate,
      startTime,
      endTime,
      address: address || null,
      maxTokens: maxTokens || 100,
      createdBy               // <-- ObjectId from req.user._id
    });

    return event;

  } catch (error) {
    // ❗ Service always throws, controller handles response
    throw error;
  }
};


/* =========================
   UPDATE EVENT
========================= */
export const updateEventService = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw error;
  }
};

/* =========================
   UPDATE EVENT STATUS
========================= */
import { EventStatus } from "../config/constants.js";

/* =========================
   UPDATE EVENT STATUS
========================= */
export const updateEventStatusService = async (id, status) => {
  try {
    const allowedStatus = Object.values(EventStatus);

    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid event status");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET ALL EVENTS
========================= */
export const getAllEventsService = async () => {
  try {
    return await Event.find().sort({ eventDate: -1 });
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET EVENT BY ID
========================= */
export const getEventByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findById(id);

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  } catch (error) {
    throw error;
  }
};

/* =========================
   DELETE EVENT
========================= */
export const deleteEventService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid event id");
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      throw new Error("Event not found");
    }

    return true;
  } catch (error) {
    throw error;
  }
};



export const getLimitedEventsService = async () => {
  const now = new Date();

  // Ongoing
  const ongoing = await Event.find({
    status: "Ongoing"
  })
    .sort({ eventDate: -1 })
    .limit(1);

  // Future (nearest first)
  const future = await Event.find({
    eventDate: { $gt: now },
    status: { $ne: "Cancelled" }
  })
    .sort({ eventDate: 1 })
    .limit(2);

  // Past (MOST RECENT first)
  const past = await Event.find({
    eventDate: { $lt: now }
  })
    .sort({ eventDate: -1 })
    .limit(3); // 🔥 upto 3 recent past

  let result = [];

  if (ongoing.length) {
    result.push(ongoing[0]);

    if (future.length) {
      result.push(future[0]);
    }

    // fill remaining from past
    const remaining = 3 - result.length;
    if (remaining > 0 && past.length) {
      result.push(...past.slice(0, remaining));
    }
  } else {
    if (future.length >= 2) {
      result.push(future[0], future[1]);
      if (past.length) result.push(past[0]);
    } else if (future.length === 1) {
      result.push(future[0]);
      result.push(...past.slice(0, 2)); // 🔥 2 recent past
    } else {
      result.push(...past.slice(0, 3)); // 🔥 3 recent past
    }
  }

  return result.slice(0, 3);
};

