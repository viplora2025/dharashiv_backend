import Event from "../models/eventModel.js";
import { generateEventId } from "../utils/generateIds.js";
import { notifyAllUsersService } from "./notificationService.js";


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

  // Notify all users persistently
  await notifyAllUsersService({
    title: {
      en: "New Event Announced",
      mr: "नवीन कार्यक्रमाची घोषणा"
    },
    message: {
      en: `${event.title.en} on ${new Date(event.eventDate).toLocaleDateString()}`,
      mr: `${event.title.mr} - ${new Date(event.eventDate).toLocaleDateString()}`
    },
    type: "event_new",
    relatedId: event._id
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

  // Notify all users persistently
  await notifyAllUsersService({
    title: {
      en: `Event Status: ${event.status.en}`,
      mr: `कार्यक्रम स्थिती: ${event.status.mr}`
    },
    message: {
      en: `The status of ${event.title.en} has been updated.`,
      mr: `${event.title.mr} ची स्थिती अपडेट करण्यात आली आहे.`
    },
    type: "event_status_updated",
    relatedId: event._id
  });

  return event;
};


/* ================= GET ALL EVENTS ================= */
export const getAllEventsService = async (options = {}) => {
  const filter = {};
  // Default behaviour: hide archived events from the main listing.
  // Pass { archived: true } to fetch only archived events,
  // or { archived: 'all' } to include both.
  if (options.archived === true) {
    filter.isArchived = true;
  } else if (options.archived !== "all") {
    filter.isArchived = { $ne: true };
  }
  return await Event.find(filter).sort({ eventDate: -1 });
};

/* ================= TOGGLE ARCHIVE ================= */
export const setEventArchivedService = async (id, isArchived) => {
  const update = {
    isArchived: !!isArchived,
    archivedAt: isArchived ? new Date() : null
  };
  const event = await Event.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true
  });
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
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
