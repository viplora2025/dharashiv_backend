
import {
  createEventService,
  updateEventService,
  updateEventStatusService,
  getAllEventsService,
  getEventByIdService,
  deleteEventService,
  getLimitedEventsService
} from "../services/eventService.js";

export const createEvent = async (req, res) => {
  try {
    const event = await createEventService({
      ...req.body,
      createdBy: req.user._id   // 🔥 from JWT
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
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

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
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

    res.json({
      success: true,
      message: "Event status updated",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
   GET ALL EVENTS
========================= */
export const getAllEvents = async (req, res) => {
  try {
    const events = await getAllEventsService();

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
   GET EVENT BY ID
========================= */
export const getEventById = async (req, res) => {
  try {
    const event = await getEventByIdService(req.params.id);

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
   DELETE EVENT
========================= */
export const deleteEvent = async (req, res) => {
  try {
    await deleteEventService(req.params.id);

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



export const getLimitedEvents = async (req, res) => {
  try {
    const events = await getLimitedEventsService();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
