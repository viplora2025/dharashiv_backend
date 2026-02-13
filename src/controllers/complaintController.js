import {
  createComplaintService,
  getAllComplaintsService,
  getComplaintByIdService,
  getComplaintsByComplainerService,
  updateComplaintStatusService,
  trackComplaintService,
  getComplaintsByUserService,
  addChatMessageService,
  getComplaintChatService,
  getRecentComplaintsService
} from "../services/complaintService.js";
import {
  parsePageLimit,
  validateComplaintStatus,
  validateObjectId
} from "../utils/queryValidation.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* ================= CREATE COMPLAINT ================= */
export const createComplaint = async (req, res) => {
  try {
    const complaint = await createComplaintService(req);
    sendSuccess(res, {
      status: 201,
      message: "Complaint created successfully",
      id: complaint._id,
      complaintId: complaint.complaintId
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= GET ALL COMPLAINTS ================= */
export const getAllComplaints = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);

    if (req.query.status) {
      validateComplaintStatus(req.query.status);
    }
    if (req.query.department) {
      validateObjectId(req.query.department, "department");
    }
    if (req.query.filedBy) {
      validateObjectId(req.query.filedBy, "filedBy");
    }
    if (req.query.talukaId) {
      validateObjectId(req.query.talukaId, "talukaId");
    }

    let accessibleTalukas = null;

    // 🔒 If Admin, restrict to assigned talukas
    if (req.role === "admin") {
      accessibleTalukas = req.user.assignedTaluka || []; // Array of ObjectIds
    }

    const { data, totalRecords } = await getAllComplaintsService(
      { ...req.query, page, limit },
      accessibleTalukas
    );

    sendSuccess(res, {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data
    });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};

/* ================= GET COMPLAINT BY ID ================= */
export const getComplaintById = async (req, res) => {
  try {
    const data = await getComplaintByIdService(req.params.id, req);
    sendSuccess(res, { data });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= GET BY COMPLAINER ================= */
export const getComplaintsByComplainer = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);

    validateObjectId(req.params.complainerId, "complainerId");
    const result = await getComplaintsByComplainerService(
      req.params.complainerId,
      req,
      page,
      limit
    );

    sendSuccess(res, {
      page: Number(page),
      limit: Number(limit),
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= UPDATE STATUS ================= */
export const updateComplaintStatus = async (req, res) => {
  try {
    await updateComplaintStatusService(
      req.params.id,
      req.body.status,
      req
    );
    sendSuccess(res, { message: "Complaint status updated" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= PUBLIC TRACK ================= */
export const trackComplaint = async (req, res) => {
  try {
    const data = await trackComplaintService(req.params.complaintId);
    sendSuccess(res, { data });
  } catch (err) {
    sendError(res, { status: 404, message: err.message });
  }
};

/* ================= USER MY COMPLAINTS ================= */
export const getMyComplaints = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const { status } = req.query;
    if (status) validateComplaintStatus(status);

    const result = await getComplaintsByUserService(
      req,
      page,
      limit,
      status
    );

    sendSuccess(res, {
      page: Number(page),
      limit: Number(limit),
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};

/* ================= ADD CHAT MESSAGE ================= */
export const addChatMessage = async (req, res) => {
  try {
    await addChatMessageService(req.params.id, req);
    sendSuccess(res, { message: "Message sent successfully" });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

/* ================= GET CHAT ================= */
export const getComplaintChat = async (req, res) => {
  try {
    const data = await getComplaintChatService(req.params.id, req);
    sendSuccess(res, { data });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};




/* ================= RECENT COMPLAINTS ================= */
export const getRecentComplaints = async (req, res) => {
  try {
    const pageRaw = req.query.page ?? "1";
    const page = Number(pageRaw);
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Invalid page");
    }

    let accessibleTalukas = null;
    if (req.role === "admin") {
      accessibleTalukas = req.user.assignedTaluka || [];
    }

    const result = await getRecentComplaintsService({
      page: Number(page),
      limit: 20,
      accessibleTalukas
    });

    sendSuccess(res, {
      page: Number(page),
      limit: 20,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / 20),
      stats: result.stats,
      data: result.data
    });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};
