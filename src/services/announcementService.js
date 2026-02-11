import mongoose from "mongoose";
import Announcement from "../models/announcementModel.js";
import cloudinary from "../config/cloudinary.js";
import { generateAnnouncementId } from "../utils/announcementIds.js";
import { io } from "../server.js";

const uploadImageIfPresent = async (file) => {
  if (!file) return null;

  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const upload = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    { folder: "announcements" }
  );

  return upload.secure_url;
};

const emitAnnouncementPublished = (doc) => {
  io.to("users").emit("announcement:published", {
    announcementId: doc._id,
    title: doc.title,
    message: doc.message,
    eventDate: doc.eventDate,
    eventTime: doc.eventTime,
    location: doc.location,
    type: doc.type,
    status: doc.status
  });
};

export const createAnnouncementService = async (req) => {
  const {
    title,
    message,
    eventDate,
    eventTime,
    location,
    type,
    status
  } = req.body;

  if (!req.user?._id) {
    throw new Error("Unauthorized");
  }

  if (!title || !message || !eventDate || !eventTime || !location || !type) {
    throw new Error("Required fields missing");
  }

  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid eventDate");
  }

  const imageUrl = await uploadImageIfPresent(req.file);
  const announcementId = await generateAnnouncementId();

  const doc = await Announcement.create({
    announcementId,
    title,
    message,
    eventDate: parsedDate,
    eventTime,
    location,
    type,
    status: status || "Published",
    imageUrl,
    createdBy: req.user._id
  });

  // Notify only if announcement is published on create
  if (doc.status === "Published") {
    emitAnnouncementPublished(doc);
  }

  return doc;
};

export const updateAnnouncementService = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid announcement id");
  }

  const existing = await Announcement.findById(id);
  if (!existing) {
    throw new Error("Announcement not found");
  }

  const oldStatus = existing.status;
  const updates = { ...req.body };
  delete updates.announcementId;
  delete updates.createdBy;

  if (updates.eventDate) {
    const parsedDate = new Date(updates.eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Invalid eventDate");
    }
    updates.eventDate = parsedDate;
  }

  const imageUrl = await uploadImageIfPresent(req.file);
  if (imageUrl) {
    updates.imageUrl = imageUrl;
  }

  const doc = await Announcement.findByIdAndUpdate(id, updates, { new: true });

  // Notify only on Draft -> Published transition
  if (oldStatus === "Draft" && doc.status === "Published") {
    emitAnnouncementPublished(doc);
  }

  return doc;
};

export const deleteAnnouncementService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid announcement id");
  }

  const doc = await Announcement.findByIdAndDelete(id);
  if (!doc) {
    throw new Error("Announcement not found");
  }

  return true;
};

export const getAnnouncementByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid announcement id");
  }

  const doc = await Announcement.findById(id);
  if (!doc) {
    throw new Error("Announcement not found");
  }

  return doc;
};

export const getAllAnnouncementsService = async () => {
  return await Announcement.find().sort({ eventDate: -1, createdAt: -1 });
};
