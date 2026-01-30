import Complaint from "../models/complaintModel.js";
import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Counter from "../models/counterModel.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import generateComplaintId from "../utils/generateComplaintId.js";
import Admin from "../models/adminModel.js";
import { io } from "../server.js";
/* ===================================================== */
/* ================= CREATE COMPLAINT ================== */
/* ===================================================== */
export const createComplaintService = async (req) => {
  const { complainer, department, subject, description, specification } =
    req.body;

  if (!complainer || !department || !subject || !description) {
    throw new Error("Required fields missing");
  }

  const filedBy = req.user._id;

  // 🔍 Validate complainer
  const complainerDoc = await Complainer.findById(complainer);
  if (!complainerDoc) {
    throw new Error("Complainer not found");
  }

  if (complainerDoc.addedBy.toString() !== filedBy.toString()) {
    throw new Error("You cannot use this complainer");
  }

  /* 📤 Upload media */
  let media = [];
  if (req.files?.length) {
    media = await Promise.all(
      req.files.map(async (file) => {
        let type = "image";
        let resourceType = "image";

        if (file.mimetype.startsWith("video/")) {
          type = "video";
          resourceType = "auto";
        } else if (file.mimetype.startsWith("audio/")) {
          type = "audio";
          resourceType = "auto";
        } else if (file.mimetype === "application/pdf") {
          type = "pdf";
          resourceType = "raw";
        }

        const upload = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: "complaints",
            resource_type: resourceType
          }
        );

        return {
          type,
          url: upload.secure_url
        };
      })
    );
  }

  /* 🆔 Generate complaint ID */
  const complaintId = await generateComplaintId(filedBy, complainer);

  /* 📝 Create complaint */
  const complaint = await Complaint.create({
    complaintId,
    filedBy,
    complainer,
    department,
    specification,
    subject,
    description,
    media,
    history: [
      {
        message: "Complaint registered",
        by: filedBy,
        byRole: "user",
        timestamp: new Date()
      }
    ]
  });

  /* 🔔 SOCKET NOTIFICATION → TALUKA ADMINS */
  try {
    const talukaId = complainerDoc.taluka;

    const admins = await Admin.find({
      assignedTaluka: talukaId
    });

    admins.forEach((admin) => {
      io.to(`admin:${admin.adminId}`).emit("complaint:new", {
        complaintId: complaint._id,
        subject: complaint.subject,
        talukaId
      });
    });
  } catch (err) {
    // ❗ socket fail hua toh complaint create fail nahi honi chahiye
    console.error("Socket emit failed (complaint:new):", err.message);
  }

  return complaint;
};

/* ===================================================== */
/* ================ GET ALL COMPLAINTS ================= */
/* ===================================================== */
export const getAllComplaintsService = async (query) => {
  const { status, department, filedBy, talukaId, page = 1, limit = 10 } = query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (filedBy) filter.filedBy = filedBy;

  if (talukaId) {
    if (!mongoose.Types.ObjectId.isValid(talukaId)) {
      throw new Error("Invalid talukaId");
    }

    const complainers = await Complainer.find(
      { taluka: talukaId },
      { _id: 1 }
    );

    const ids = complainers.map((c) => c._id);
    if (!ids.length) {
      return { data: [], totalRecords: 0 };
    }

    filter.complainer = { $in: ids };
  }

  const skip = (page - 1) * limit;
  const totalRecords = await Complaint.countDocuments(filter);

  const data = await Complaint.find(filter)
    .select("complaintId subject status createdAt")
    .populate("complainer", "name")
    .populate("department", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { data, totalRecords };
};

/* ===================================================== */
/* =============== GET COMPLAINT BY ID ================= */
/* ===================================================== */
export const getComplaintByIdService = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complaint id");
  }

  const complaint = await Complaint.findById(id)
    .populate("filedBy", "name phone appUserId")
    .populate({
      path: "complainer",
      select: "name complainerId phone",
      populate: [
        { path: "taluka", select: "name" },
        { path: "village", select: "name" }
      ]
    })
    .populate("department", "name")
    .populate({
      path: "history.by",
      select: "name phone appUserId"
    });

  if (!complaint) throw new Error("Complaint not found");

  if (
    req.role === "user" &&
    complaint.filedBy._id.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed to view this complaint");
  }

  return complaint;
};

/* ===================================================== */
/* ========= GET COMPLAINTS BY COMPLAINER =============== */
/* ===================================================== */
export const getComplaintsByComplainerService = async (
  complainerId,
  req,
  page,
  limit
) => {
  const complainer = await Complainer.findById(complainerId);
  if (!complainer) throw new Error("Complainer not found");

  if (
    req.role === "user" &&
    complainer.addedBy.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed for this complainer");
  }

  const filter = { complainer: complainerId };
  const skip = (page - 1) * limit;

  const totalRecords = await Complaint.countDocuments(filter);

  const data = await Complaint.find(filter)
    .select("complaintId subject status createdAt")
    .populate("department", "name")
    .populate("filedBy", "name appUserId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { data, totalRecords };
};

/* ===================================================== */
/* =============== UPDATE COMPLAINT STATUS ============== */
/* ===================================================== */
export const updateComplaintStatusService = async (id, status, req) => {
  const allowedStatuses = ["open", "in-progress", "resolved", "closed"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) throw new Error("Complaint not found");

  if (!["admin", "superadmin"].includes(req.role)) {
    throw new Error("Only admin or superadmin can update status");
  }

  if (complaint.status === status) {
    throw new Error("Complaint already in this status");
  }

  complaint.status = status;
  complaint.history.push({
    message: `Status updated to ${status}`,
    by: req.user._id,
    byRole: req.role,
    timestamp: new Date()
  });

  await complaint.save();
};

/* ===================================================== */
/* ================= PUBLIC TRACKING =================== */
/* ===================================================== */
export const trackComplaintService = async (complaintId) => {
  const complaint = await Complaint.findOne({ complaintId })
    .select("complaintId status subject department history createdAt updatedAt")
    .populate("department", "name");

  if (!complaint) throw new Error("Complaint not found");

  return {
    complaintId: complaint.complaintId,
    subject: complaint.subject,
    status: complaint.status,
    department: complaint.department,
    history: complaint.history.map((h) => ({
      message: h.message,
      byRole: h.byRole,
      timestamp: h.timestamp
    })),
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt
  };
};

/* ===================================================== */
/* ================= USER MY COMPLAINTS ================= */
/* ===================================================== */
export const getComplaintsByUserService = async (req, page, limit, status) => {
  const filter = { filedBy: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const totalRecords = await Complaint.countDocuments(filter);

  const data = await Complaint.find(filter)
    .select("complaintId subject status createdAt updatedAt")
    .populate("complainer", "name")
    .populate("department", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { data, totalRecords };
};

/* ===================================================== */
/* ================= ADD CHAT MESSAGE ================== */
/* ===================================================== */
export const addChatMessageService = async (id, req) => {
  const { message } = req.body;

  if (!message?.trim() && !req.files?.length) {
    throw new Error("Message or media is required");
  }

  const complaint = await Complaint.findById(id).select("history filedBy");
  if (!complaint) throw new Error("Complaint not found");

  if (
    req.role === "user" &&
    complaint.filedBy.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed to chat on this complaint");
  }

  let media = [];
  if (req.files?.length) {
    media = await Promise.all(
      req.files.map(async (file) => {
        const upload = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "complaint-chat", resource_type: "auto" }
        );

        return {
          type: file.mimetype.split("/")[0],
          url: upload.secure_url
        };
      })
    );
  }

  complaint.history.push({
    message: message?.trim() || null,
    media,
    by: req.user._id,
    byRole: req.role,
    timestamp: new Date()
  });

  await complaint.save();
};

/* ===================================================== */
/* ================= GET COMPLAINT CHAT ================= */
/* ===================================================== */
export const getComplaintChatService = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complaint id");
  }

  const complaint = await Complaint.findById(id)
    .select("history filedBy")
    .populate("history.by", "name appUserId");

  if (!complaint) throw new Error("Complaint not found");

  if (
    req.role === "user" &&
    complaint.filedBy.toString() !== req.user._id.toString()
  ) {
    throw new Error("Not allowed to view this chat");
  }

  return complaint.history.map((h) => ({
    message: h.message || null,
    media: h.media || [],
    byRole: h.byRole,
    by: h.by
      ? { _id: h.by._id, name: h.by.name || "Admin" }
      : null,
    timestamp: h.timestamp
  }));
};
