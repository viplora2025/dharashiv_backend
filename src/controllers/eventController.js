
import {
  createEventService,
  updateEventService,
  updateEventStatusService,
  getAllEventsService,
  getEventByIdService,
  deleteEventService,
  getLimitedEventsService
} from "../services/eventService.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createEvent = async (req, res) => {
  try {
    const event = await createEventService({
      ...req.body,
      createdBy: req.user._id   // 🔥 from JWT
    });

    sendSuccess(res, {
      status: 201,
      message: "Event created successfully",
      data: event
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};



/* =========================
   UPDATE EVENT
========================= */
export const updateEvent = async (req, res) => {
  try {
    const event = await updateEventService(
      req.params.id,
      req.body
    );

    sendSuccess(res, {
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* =========================
   UPDATE EVENT STATUS
========================= */
export const updateEventStatus = async (req, res) => {
  try {
    const event = await updateEventStatusService(
      req.params.id,
      req.body.status
    );

    sendSuccess(res, {
      message: "Event status updated",
      data: event
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* =========================
   GET ALL EVENTS
========================= */
export const getAllEvents = async (req, res) => {
  try {
    const events = await getAllEventsService();

    sendSuccess(res, { data: events });
  } catch (error) {
    sendError(res, { status: 500, message: error.message });
  }
};

/* =========================
   GET EVENT BY ID
========================= */
export const getEventById = async (req, res) => {
  try {
    const event = await getEventByIdService(req.params.id);

    sendSuccess(res, { data: event });
  } catch (error) {
    sendError(res, { status: 404, message: error.message });
  }
};

/* =========================
   DELETE EVENT
========================= */
export const deleteEvent = async (req, res) => {
  try {
    await deleteEventService(req.params.id);

    sendSuccess(res, { message: "Event deleted successfully" });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};



export const getLimitedEvents = async (req, res) => {
  try {
    const events = await getLimitedEventsService();

    sendSuccess(res, {
      status: 200,
      count: events.length,
      data: events
    });
  } catch (error) {
    sendError(res, { status: 500, message: error.message });
  }
};
