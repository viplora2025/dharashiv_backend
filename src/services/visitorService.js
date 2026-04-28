// src/services/visitorService.js

import Visitor from "../models/visitorModel.js";
import Event from "../models/eventModel.js";
import { VisitorStatus, RegistrationType, EventStatus } from "../config/constants.js";
import { notifyAdminsService } from "./notificationService.js";


/* =========================
   REGISTER VISITOR (ONLINE)
========================= */
export const registerVisitorOnlineService = async (data) => {
  const { eventId, visitorName, phone, village, taluka, issue, appUser } = data;

  if (!appUser) throw new Error("appUser is required for online registration");

  // 🔢 Atomic Token Generation (blocked for Cancelled/Completed)
  const event = await Event.findOneAndUpdate(
    { _id: eventId, status: { $nin: [EventStatus.CANCELLED, EventStatus.COMPLETED] } },
    { $inc: { lastTokenNo: 1 } },
    { new: true }
  );

  if (!event) {
    const exists = await Event.findById(eventId).select("status");
    if (!exists) throw new Error("Event not found");
    throw new Error("Event is not open for registration");
  }

  const visitor = await Visitor.create({
    eventId,
    visitorName,
    phone,
    village,
    taluka,
    issue,
    registrationType: RegistrationType.ONLINE,
    tokenNo: event.lastTokenNo,
    appUser
  });

  // Notify admins
  notifyAdminsService({
    talukaId: visitor.taluka,
    title: {
      en: "New Visitor Registered",
      mr: "नवीन अभ्यागत नोंदणीकृत"
    },
    message: {
      en: `${visitor.visitorName} has registered for token #${visitor.tokenNo}`,
      mr: `${visitor.visitorName} यांनी टोकन #${visitor.tokenNo} साठी नोंदणी केली आहे`
    },
    type: "visitor_new",
    relatedId: visitor._id
  }).catch(err => console.error("Visitor notification failed:", err.message));

  return visitor;

};

/* =========================
   REGISTER VISITOR (OFFLINE)
========================= */
export const registerVisitorOfflineService = async (data) => {
  const { eventId, visitorName, phone, village, taluka, issue, registeredBy } = data;

  if (!registeredBy) throw new Error("registeredBy is required for offline registration");

  const event = await Event.findOneAndUpdate(
    { _id: eventId, status: { $nin: [EventStatus.CANCELLED, EventStatus.COMPLETED] } },
    { $inc: { lastTokenNo: 1 } },
    { new: true }
  );

  if (!event) {
    const exists = await Event.findById(eventId).select("status");
    if (!exists) throw new Error("Event not found");
    throw new Error("Event is not open for registration");
  }

  const visitor = await Visitor.create({
    eventId,
    visitorName,
    phone,
    village,
    taluka,
    issue,
    registrationType: RegistrationType.OFFLINE,
    tokenNo: event.lastTokenNo,
    registeredBy
  });

  return visitor;
};

/* =========================
   GET ALL VISITORS BY EVENT
========================= */
export const getVisitorsByEventService = async (eventId) => {
  return await Visitor.find({ eventId })
    .populate("village", "name")
    .populate("taluka", "name")
    .sort({ tokenNo: 1 });
};

/* =========================
   GET VISITORS BY APP USER
========================= */
export const getVisitorsByAppUserService = async (appUserId) => {
  return await Visitor.find({ appUser: appUserId })
    .populate("village", "name")
    .populate("taluka", "name")
    .sort({ registeredAt: -1 });
};

/* =========================
   GET VISITOR BY ID
========================= */
export const getVisitorByIdService = async (id) => {
  const visitor = await Visitor.findById(id)
    .populate("village", "name")
    .populate("taluka", "name");

  if (!visitor) throw new Error("Visitor not found");
  return visitor;
};

/* =========================
   DELETE VISITOR
========================= */
export const deleteVisitorService = async (visitorId) => {
  const visitor = await Visitor.findByIdAndDelete(visitorId);
  if (!visitor) throw new Error("Visitor not found");
  return visitor;
};

/* =========================
   UPDATE VISITOR STATUS
========================= */
export const updateVisitorStatusService = async (visitorId, newStatus) => {
  const visitor = await Visitor.findById(visitorId);
  if (!visitor) throw new Error("Visitor not found");

  const currentStatusKey = visitor.status.en;
  const newStatusKey = newStatus.en;

  // 🔒 Allowed transitions logic (comparing English keys)
  const allowedTransitions = {
    [VisitorStatus.REGISTERED]: [VisitorStatus.IN_PROGRESS],
    [VisitorStatus.IN_PROGRESS]: [VisitorStatus.VISITED, VisitorStatus.ABSENT]
  };

  if (!allowedTransitions[currentStatusKey]) {
    throw new Error(`Status cannot be changed from ${currentStatusKey}`);
  }

  if (!allowedTransitions[currentStatusKey].includes(newStatusKey)) {
    throw new Error(`Invalid status transition from ${currentStatusKey} to ${newStatusKey}`);
  }

  visitor.status = newStatus;
  await visitor.save();

  return visitor;
};
