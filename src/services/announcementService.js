// src/services/announcementService.js

import Announcement from "../models/announcementModel.js";
import { storageService } from "../services/storageService.js";
import { generateAnnouncementId } from "../utils/announcementIds.js";
import { validateFileSignature } from "../utils/fileSignature.js";
import { notifyAllUsersService } from "./notificationService.js";

const uploadImageIfPresent = async (file) => {
  if (!file) return null;

  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const ok = validateFileSignature(file);
  if (!ok) {
    throw new Error("File signature mismatch / corrupted file");
  }

  const uploadResult = await storageService.uploadFile(
    file.buffer,
    file.mimetype,
    "announcements"
  );
  return {
    url: uploadResult.url,
    publicId: uploadResult.publicId
  };
};

const emitAnnouncementPublished = async (doc) => {
  await notifyAllUsersService({
    title: {
      en: doc.title.en,
      mr: doc.title.mr
    },
    message: {
      en: doc.message.en,
      mr: doc.message.mr
    },
    type: "announcement_new",
    relatedId: doc._id
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

  let uploadedFile = null;
  try {
    const uploadResult = await uploadImageIfPresent(req.file);
    if (uploadResult) {
      uploadedFile = uploadResult;
    }

    const announcementId = await generateAnnouncementId();

    const doc = await Announcement.create({
      announcementId,
      title: {
        en: title.en,
        mr: title.mr
      },
      message: {
        en: message.en,
        mr: message.mr
      },
      eventDate: eventDate ? new Date(eventDate) : undefined,
      eventTime,
      location: {
        en: location.en,
        mr: location.mr
      },
      type: {
        en: type.en,
        mr: type.mr
      },
      status: status || "Published",
      imageUrl: uploadedFile?.url || null,
      imagePublicId: uploadedFile?.publicId || null,
      createdBy: req.user._id
    });

    // Notify only if announcement is published on create
    if (doc.status === "Published") {
      emitAnnouncementPublished(doc);
    }

    return doc;
  } catch (err) {
    // 🛡️ Cleanup zombie image if DB write fails
    if (uploadedFile?.publicId) {
      console.log("📦 Cleaning up failed announcement creation image...");
      await storageService.deleteFile(uploadedFile.publicId);
    }
    throw err;
  }
};

export const updateAnnouncementService = async (id, req) => {
  const existing = await Announcement.findById(id);
  if (!existing) {
    throw new Error("Announcement not found");
  }

  const oldStatus = existing.status;
  const oldImagePublicId = existing.imagePublicId;
  
  const { title, message, eventDate, eventTime, location, type, status } = req.body;
  
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (message !== undefined) updates.message = message;
  if (eventDate !== undefined) updates.eventDate = eventDate ? new Date(eventDate) : undefined;
  if (eventTime !== undefined) updates.eventTime = eventTime;
  if (location !== undefined) updates.location = location;
  if (type !== undefined) updates.type = type;
  if (status !== undefined) updates.status = status;

  let newUploadedFile = null;
  try {
    const uploadResult = await uploadImageIfPresent(req.file);
    if (uploadResult) {
      newUploadedFile = uploadResult;
      updates.imageUrl = newUploadedFile.url;
      updates.imagePublicId = newUploadedFile.publicId;
    }

    const doc = await Announcement.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    // 🛡️ Cleanup OLD image if NEW one succeeded
    if (newUploadedFile && oldImagePublicId) {
      console.log("📦 Cleaning up old announcement image after successful update...");
      await storageService.deleteFile(oldImagePublicId);
    }

    // Notify only on Draft -> Published transition
    if (oldStatus === "Draft" && doc.status === "Published") {
      emitAnnouncementPublished(doc);
    }

    return doc;
  } catch (err) {
    // 🛡️ Cleanup NEW image if DB write fails
    if (newUploadedFile?.publicId) {
      console.log("📦 Cleaning up failed announcement update image...");
      await storageService.deleteFile(newUploadedFile.publicId);
    }
    throw err;
  }
};

export const deleteAnnouncementService = async (id) => {
  const doc = await Announcement.findById(id);
  if (!doc) {
    throw new Error("Announcement not found");
  }
  await doc.deleteOne();
  return true;
};

export const getAnnouncementByIdService = async (id, req) => {
  const doc = await Announcement.findById(id);
  if (!doc) {
    throw new Error("Announcement not found");
  }

  if (req.role === "user" && doc.status !== "Published") {
    throw new Error("Announcement not found");
  }

  return doc;
};

export const getAllAnnouncementsService = async (req) => {
  const filter = req.role === "user" ? { status: "Published" } : {};
  return await Announcement.find(filter).sort({ eventDate: -1, createdAt: -1 });
};
