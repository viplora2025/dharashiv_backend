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

/* ================= CREATE COMPLAINT ================= */
export const createComplaint = async (req, res) => {
  try {
    const complaint = await createComplaintService(req);
    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaintId: complaint._id
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ================= GET ALL COMPLAINTS ================= */
export const getAllComplaints = async (req, res) => {
  try {
    let accessibleTalukas = null;

    // 🔒 If Admin, restrict to assigned talukas
    if (req.role === "admin") {
      accessibleTalukas = req.user.assignedTaluka; // Array of ObjectIds
    }

    const { data, totalRecords } = await getAllComplaintsService(
      req.query,
      accessibleTalukas
    );
    const { page = 1, limit = 10 } = req.query;

    res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET COMPLAINT BY ID ================= */
export const getComplaintById = async (req, res) => {
  try {
    const data = await getComplaintByIdService(req.params.id, req);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ================= GET BY COMPLAINER ================= */
export const getComplaintsByComplainer = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getComplaintsByComplainerService(
      req.params.complainerId,
      req,
      page,
      limit
    );

    res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    res.json({ success: true, message: "Complaint status updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ================= PUBLIC TRACK ================= */
export const trackComplaint = async (req, res) => {
  try {
    const data = await trackComplaintService(req.params.complaintId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/* ================= USER MY COMPLAINTS ================= */
export const getMyComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await getComplaintsByUserService(
      req,
      page,
      limit,
      status
    );

    res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / limit),
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ADD CHAT MESSAGE ================= */
export const addChatMessage = async (req, res) => {
  try {
    await addChatMessageService(req.params.id, req);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ================= GET CHAT ================= */
export const getComplaintChat = async (req, res) => {
  try {
    const data = await getComplaintChatService(req.params.id, req);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};




/* ================= RECENT COMPLAINTS ================= */
export const getRecentComplaints = async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const result = await getRecentComplaintsService({
      page: Number(page),
      limit: 20
    });

    res.json({
      success: true,
      page: Number(page),
      limit: 20,
      totalRecords: result.totalRecords,
      totalPages: Math.ceil(result.totalRecords / 20),
      stats: result.stats,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
