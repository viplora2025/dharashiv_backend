import Visitor from "../models/visitorModel.js";
import Event from "../models/eventModel.js";
import mongoose from "mongoose";
import { VisitorStatus, RegistrationType } from "../config/constants.js";

/* =========================
   REGISTER VISITOR (ONLINE)
========================= */
export const registerVisitorOnlineService = async (data) => {
  try {
    const {
      eventId,
      visitorName,
      phone,
      village,
      taluka,
      issue,
      appUser
    } = data;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid eventId");
    }

    if (!visitorName || !village || !taluka || !issue) {
      throw new Error("Required fields missing");
    }

    if (!appUser) {
      throw new Error("appUser is required for online registration");
    }

    // 🔢 Atomic Token Generation
    const event = await Event.findOneAndUpdate(
      { _id: eventId },
      { $inc: { lastTokenNo: 1 } },
      { new: true }
    );

    if (!event) {
      throw new Error("Event not found");
    }

    const nextTokenNo = event.lastTokenNo;

    const visitor = await Visitor.create({
      eventId,
      visitorName,
      phone,
      village,
      taluka,
      issue,
      registrationType: RegistrationType.ONLINE,
      tokenNo: nextTokenNo,
      appUser
    });

    return visitor;
  } catch (error) {
    throw error;
  }
};

/* =========================
   REGISTER VISITOR (OFFLINE)
========================= */
export const registerVisitorOfflineService = async (data) => {
  try {
    const {
      eventId,
      visitorName,
      phone,
      village,
      taluka,
      issue,
      registeredBy
    } = data;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid eventId");
    }

    if (!visitorName || !village || !taluka || !issue) {
      throw new Error("Required fields missing");
    }

    if (!registeredBy) {
      throw new Error("registeredBy is required for offline registration");
    }

    // 🔢 Atomic Token Generation
    const event = await Event.findOneAndUpdate(
      { _id: eventId },
      { $inc: { lastTokenNo: 1 } },
      { new: true }
    );

    if (!event) {
      throw new Error("Event not found");
    }

    const nextTokenNo = event.lastTokenNo;

    const visitor = await Visitor.create({
      eventId,
      visitorName,
      phone,
      village,
      taluka,
      issue,
      registrationType: RegistrationType.OFFLINE,
      tokenNo: nextTokenNo,
      registeredBy
    });

    return visitor;
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET ALL VISITORS BY EVENT
   (registration sequence)
========================= */
export const getVisitorsByEventService = async (eventId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid eventId");
    }

    return await Visitor.find({ eventId })
      .sort({ tokenNo: 1 }); // sequence wise
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET VISITORS BY APP USER
========================= */
export const getVisitorsByAppUserService = async (appUserId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(appUserId)) {
      throw new Error("Invalid appUserId");
    }

    return await Visitor.find({ appUser: appUserId })
      .sort({ registeredAt: -1 });
  } catch (error) {
    throw error;
  }
};

/* =========================
   GET VISITOR BY MONGO ID
========================= */
export const getVisitorByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid visitor id");
    }

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      throw new Error("Visitor not found");
    }

    return visitor;
  } catch (error) {
    throw error;
  }
};



export const updateVisitorStatusService = async (visitorId, newStatus) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      throw new Error("Invalid visitor id");
    }

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      throw new Error("Visitor not found");
    }

    const currentStatus = visitor.status;

    // 🔒 Allowed transitions
    const allowedTransitions = {
      [VisitorStatus.REGISTERED]: [VisitorStatus.IN_PROGRESS],
      [VisitorStatus.IN_PROGRESS]: [VisitorStatus.VISITED, VisitorStatus.ABSENT]
    };

    if (!allowedTransitions[currentStatus]) {
      throw new Error(
        `Status cannot be changed once it is ${currentStatus}`
      );
    }

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Invalid status change from ${currentStatus} to ${newStatus}`
      );
    }

    visitor.status = newStatus;
    await visitor.save();

    return visitor;
  } catch (error) {
    throw error;
  }
};
