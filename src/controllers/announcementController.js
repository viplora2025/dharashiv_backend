// src/controllers/announcementController.js

import {
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService,
  getAnnouncementByIdService,
  getAllAnnouncementsService
} from "../services/announcementService.js";
import { sendSuccess } from "../utils/response.js";

export const createAnnouncement = async (req, res, next) => {
  try {
    const doc = await createAnnouncementService(req);
    sendSuccess(res, {
      status: 201,
      message: "Announcement created",
      data: doc
    });
  } catch (err) {
    next(err);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const doc = await updateAnnouncementService(req.params.id, req);
    sendSuccess(res, { message: "Announcement updated", data: doc });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    await deleteAnnouncementService(req.params.id);
    sendSuccess(res, { message: "Announcement deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAnnouncementById = async (req, res, next) => {
  try {
    const doc = await getAnnouncementByIdService(req.params.id, req);
    sendSuccess(res, { data: doc });
  } catch (err) {
    next(err);
  }
};

export const getAllAnnouncements = async (req, res, next) => {
  try {
    const docs = await getAllAnnouncementsService(req);
    sendSuccess(res, { data: docs });
  } catch (err) {
    next(err);
  }
};
