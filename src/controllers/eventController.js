// src/controllers/eventController.js

import * as eventService from "../services/eventService.js";
import { sendSuccess } from "../utils/response.js";

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEventService({
      ...req.body,
      createdBy: req.user?._id
    });
    sendSuccess(res, {
      status: 201,
      message: "Event created successfully",
      data: event
    });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEventService(req.params.id, req.body);
    sendSuccess(res, { message: "Event updated successfully", data: event });
  } catch (err) {
    next(err);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const event = await eventService.updateEventStatusService(
      req.params.id,
      req.body.status
    );
    sendSuccess(res, { message: "Event status updated", data: event });
  } catch (err) {
    next(err);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const archivedParam = req.query?.archived;
    let archived;
    if (archivedParam === "true") archived = true;
    else if (archivedParam === "all") archived = "all";
    else archived = false;
    const events = await eventService.getAllEventsService({ archived });
    sendSuccess(res, { data: events });
  } catch (err) {
    next(err);
  }
};

export const archiveEvent = async (req, res, next) => {
  try {
    const event = await eventService.setEventArchivedService(req.params.id, true);
    sendSuccess(res, { message: "Event archived", data: event });
  } catch (err) {
    next(err);
  }
};

export const unarchiveEvent = async (req, res, next) => {
  try {
    const event = await eventService.setEventArchivedService(req.params.id, false);
    sendSuccess(res, { message: "Event unarchived", data: event });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventByIdService(req.params.id);
    sendSuccess(res, { data: event });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEventService(req.params.id);
    sendSuccess(res, { message: "Event deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getLimitedEvents = async (req, res, next) => {
  try {
    const events = await eventService.getLimitedEventsService();
    sendSuccess(res, { data: events });
  } catch (err) {
    next(err);
  }
};
