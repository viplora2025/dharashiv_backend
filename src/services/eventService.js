// src/services/eventService.js

import Event from "../models/eventModel.js";
import { generateEventId } from "../utils/generateIds.js";
import { io } from "../server.js";
import { EventStatus } from "../config/constants.js";

/* ================= CREATE EVENT ================= */
export const createEventService = async (data) => {
  const {
    title,
    eventDate,
    startTime,
    endTime,
    address,
    maxTokens,
    createdBy
  } = data;

  if (!createdBy) {
    throw new Error("Unauthorized: Admin not found");
  }

  const eventId = await generateEventId();

    const event = await Event.create({
      eventId,
      title,
      eventDate: new Date(eventDate),
      startTime,
      endTime,
      address,
      maxTokens: maxTokens || 100,
      createdBy
    });

  // Notify all connected users
  io.to("users").emit("event:new", {
    eventId: event._id,
    title: {
      en: event.title.en,
      mr: event.title.mr
    },
    eventDate: event.eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    status: {
      en: event.status.en,
      mr: event.status.mr
    }
  });

  return event;
};

/* ================= UPDATE EVENT ================= */
export const updateEventService = async (id, data) => {
  const allowedFields = [
    "title",
    "eventDate",
    "startTime",
    "endTime",
    "address",
    "maxTokens",
    "status",
    "meetingSummary"
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields provided for update");
  }

  if (updates.eventDate) {
    updates.eventDate = new Date(updates.eventDate);
  }

  const event = await Event.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

/* ================= UPDATE EVENT STATUS ================= */
export const updateEventStatusService = async (id, status) => {
  const event = await Event.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!event) {
    throw new Error("Event not found");
  }

  // Notify all connected users
  io.to("users").emit("event:status:updated", {
    eventId: event._id,
    status: {
      en: event.status.en,
      mr: event.status.mr
    }
  });

  return event;
};

/* ================= GET ALL EVENTS ================= */
export const getAllEventsService = async () => {
  return await Event.find().sort({ eventDate: -1 });
};

/* ================= GET EVENT BY ID ================= */
export const getEventByIdService = async (id) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
};

/* ================= DELETE EVENT ================= */
export const deleteEventService = async (id) => {
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    throw new Error("Event not found");
  }
  return true;
};

/* ================= GET LIMITED EVENTS (Dashboard) ================= */
export const getLimitedEventsService = async () => {
  const now = new Date();

  // Ongoing
  const ongoing = await Event.find({ status: "Ongoing" })
    .sort({ eventDate: -1 })
    .limit(1);

  // Future (nearest first)
  const future = await Event.find({
    eventDate: { $gt: now },
    status: { $ne: "Cancelled" }
  })
    .sort({ eventDate: 1 })
    .limit(2);

  // Past (most recent first)
  const past = await Event.find({ eventDate: { $lt: now } })
    .sort({ eventDate: -1 })
    .limit(3);

  let result = [];

  if (ongoing.length) {
    result.push(ongoing[0]);
    if (future.length) result.push(future[0]);
    const remaining = 3 - result.length;
    if (remaining > 0 && past.length) {
      result.push(...past.slice(0, remaining));
    }
  } else {
    // No ongoing event
    if (future.length >= 2) {
      result.push(future[0], future[1]);
      if (past.length) result.push(past[0]);
    } else if (future.length === 1) {
      result.push(future[0]);
      result.push(...past.slice(0, 2));
    } else {
      result.push(...past.slice(0, 3));
    }
  }

  return result.slice(0, 3);
};
