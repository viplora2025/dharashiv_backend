// src/controllers/complaintController.js

import * as complaintService from "../services/complaintService.js";
import { sendSuccess } from "../utils/response.js";

export const createComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.createComplaintService(req);
    sendSuccess(res, {
      status: 201,
      message: "Complaint registered successfully",
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

export const createComplaintByAdmin = async (req, res, next) => {
  try {
    const complaint = await complaintService.createComplaintByAdminService(req);
    sendSuccess(res, {
      status: 201,
      message: "Complaint registered successfully",
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

export const getAllComplaints = async (req, res, next) => {
  try {
    const accessibleTalukas = req.role === "admin" ? (req.user.assignedTaluka || []) : null;
    const result = await complaintService.getAllComplaintsService(req.query, accessibleTalukas);
    sendSuccess(res, { data: result.data, totalRecords: result.totalRecords });
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintByIdService(req.params.id, req);
    sendSuccess(res, { data: complaint });
  } catch (err) {
    next(err);
  }
};

export const getComplaintsByComplainer = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await complaintService.getComplaintsByComplainerService(
      req.params.complainerId,
      req,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, { data: result.data, totalRecords: result.totalRecords });
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateComplaintStatusService(
      req.params.id,
      req.body.status,
      req
    );
    sendSuccess(res, { message: "Status updated successfully", data: complaint });
  } catch (err) {
    next(err);
  }
};

export const trackComplaint = async (req, res, next) => {
  try {
    const data = await complaintService.trackComplaintService(req.params.complaintId);
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
};

export const getComplaintsByUser = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await complaintService.getComplaintsByUserService(
      req,
      Number(page),
      Number(limit),
      status
    );
    sendSuccess(res, { data: result.data, totalRecords: result.totalRecords });
  } catch (err) {
    next(err);
  }
};

export const addChatMessage = async (req, res, next) => {
  try {
    const result = await complaintService.addChatMessageService(req.params.id, req);
    sendSuccess(res, {
      status: 201,
      message: "Message added successfully",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const getComplaintChat = async (req, res, next) => {
  try {
    const chat = await complaintService.getComplaintChatService(req.params.id, req);
    sendSuccess(res, { data: chat });
  } catch (err) {
    next(err);
  }
};

export const getRecentComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const accessibleTalukas = req.role === "admin" ? (req.user.assignedTaluka || []) : null;
    const result = await complaintService.getRecentComplaintsService({
      page: Number(page),
      limit: Number(limit),
      accessibleTalukas
    });
    sendSuccess(res, { ...result });
  } catch (err) {
    next(err);
  }
};

export const forwardToDepartment = async (req, res, next) => {
  try {
    const result = await complaintService.forwardComplaintToDeptService(req.params.id, req);
    sendSuccess(res, { message: result.message, data: { email: result.email } });
  } catch (err) {
    next(err);
  }
};
