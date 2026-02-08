import {
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService,
  getAnnouncementByIdService,
  getAllAnnouncementsService
} from "../services/announcementService.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createAnnouncement = async (req, res) => {
  try {
    const doc = await createAnnouncementService(req);
    sendSuccess(res, {
      status: 201,
      message: "Announcement created",
      data: doc
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const doc = await updateAnnouncementService(req.params.id, req);
    sendSuccess(res, { message: "Announcement updated", data: doc });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    await deleteAnnouncementService(req.params.id);
    sendSuccess(res, { message: "Announcement deleted" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const doc = await getAnnouncementByIdService(req.params.id);
    sendSuccess(res, { data: doc });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const docs = await getAllAnnouncementsService();
    sendSuccess(res, { data: docs });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};
