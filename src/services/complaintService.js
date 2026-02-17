import Complaint from "../models/complaintModel.js";
import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Counter from "../models/counterModel.js";
import Department from "../models/departmentModel.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import generateComplaintId from "../utils/generateComplaintId.js";
import Admin from "../models/adminModel.js";
import { io } from "../server.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { getMediaTypeAndResource } from "../utils/mediaType.js";
import { validateFileSignature } from "../utils/fileSignature.js";

const emitToTalukaAdmins = async (talukaId, eventName, payload) => {
  if (!talukaId) return;

  const admins = await Admin.find({ assignedTaluka: talukaId }).select("adminId");
  admins.forEach((admin) => {
    io.to(`admin:${admin.adminId}`).emit(eventName, payload);
  });
};

const emitComplaintNotification = async ({
  talukaId,
  appUserId,
  adminEvent,
  userEvent,
  payload
}) => {
  if (adminEvent) {
    await emitToTalukaAdmins(talukaId, adminEvent, payload);
  }

  if (userEvent && appUserId) {
    io.to(`user:${appUserId}`).emit(userEvent, payload);
  }
};
/* ===================================================== */
/* ================= CREATE COMPLAINT ================== */
/* ===================================================== */


export const createComplaintService = async (req) => {
  const { complainer, department, subject, description, specification } =
    req.body;

  if (req.role !== "user") {
    throw new Error("Only users can create complaints");
  }

  // ✅ Only complainer is required now
  if (!complainer) {
    throw new Error("Complainer is required");
  }

  const hasText =
    (subject && subject.trim()) || (description && description.trim());

  const hasVoice = !!req.files?.voiceNote?.length;

  if (!hasText && !hasVoice) {
    throw new Error("Either text complaint or voice note is required");
  }

  const filedBy = req.user._id;

  // 🔍 Validate complainer
  const complainerDoc = await Complainer.findById(complainer);
  if (!complainerDoc) throw new Error("Complainer not found");

  if (complainerDoc.addedBy.toString() !== filedBy.toString()) {
    throw new Error("You cannot use this complainer");
  }

  // ✅ Department optional
  let departmentDoc = null;
  if (department) {
    departmentDoc = await Department.findById(department);
    if (!departmentDoc) throw new Error("Department not found");
  }

  /* 📤 Upload attachments */
  let media = [];
  if (req.files?.attachments?.length) {
    media = await Promise.all(
      req.files.attachments.map(async (file) => {
        // 🔐 signature validation
        const ok = validateFileSignature(file);
        if (!ok) throw new Error("File signature mismatch / corrupted file");

        const { type, resource_type } = getMediaTypeAndResource(file.mimetype);

        const upload = await uploadToCloudinary(file.buffer, {
          folder: "complaints/attachments",
          resource_type,
        });

        return {
          type,
          url: upload.secure_url,
        };
      })
    );
  }

  /* 🎙️ Upload voice note (single) */
  let voiceNote = null;

  if (req.files?.voiceNote?.length) {
    const file = req.files.voiceNote[0];

    const ok = validateFileSignature(file);
    if (!ok) throw new Error("File signature mismatch / corrupted file");

    // Voice should always be treated as audio
    const upload = await uploadToCloudinary(file.buffer, {
      folder: "complaints/voice",
      resource_type: "video", // Cloudinary audio works best as video
    });

    voiceNote = {
      url: upload.secure_url,
      format: file.mimetype,
    };
  }

  /* 🆔 Generate complaint ID */
  const complaintId = await generateComplaintId(filedBy, complainer);

  /* 📝 Create complaint */
  const complaint = await Complaint.create({
    complaintId,
    filedBy,
    complainer,
    department: department || null, // ✅ optional
    specification,
    subject: subject?.trim() || null,
    description: description?.trim() || null,
    voiceNote,
    media,
    history: [
      {
        message: voiceNote ? "Voice complaint registered" : "Complaint registered",
        by: filedBy,
        byRole: "user",
        byModel: "AppUser",
        timestamp: new Date(),
      },
    ],
  });

  /* 🔔 SOCKET NOTIFICATION → TALUKA ADMINS */
  try {
    await emitComplaintNotification({
      talukaId: complainerDoc.taluka,
      adminEvent: "complaint:new",
      payload: {
        complaintId: complaint._id,
        subject: complaint.subject || "Voice Complaint",
        status: complaint.status,
        talukaId: complainerDoc.taluka,
        createdAt: complaint.createdAt,
      },
    });
  } catch (err) {
    console.error("Socket emit failed (complaint:new):", err.message);
  }

  return complaint;
};


/* ===================================================== */
/* ================ GET ALL COMPLAINTS ================= */
/* ===================================================== */
export const getAllComplaintsService = async (query, accessibleTalukas = null) => {
  const { status, department, filedBy, talukaId, page = 1, limit = 10 } = query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (filedBy) filter.filedBy = filedBy;

  // Admin with no assigned taluka should see nothing
  if (Array.isArray(accessibleTalukas) && accessibleTalukas.length === 0) {
    return { data: [], totalRecords: 0 };
  }

  // 🌍 Taluka Filter Logic
  let targetTalukas = [];

  // 1️⃣ If a specific taluka is requested
  if (talukaId) {
    if (!mongoose.Types.ObjectId.isValid(talukaId)) {
      throw new Error("Invalid talukaId");
    }

    // 🔒 Access Check: If restricted, ensure requested taluka is allowed
    if (accessibleTalukas) {
      const isAllowed = accessibleTalukas.some(
        (t) => t.toString() === talukaId.toString()
      );
      if (!isAllowed) {
        throw new Error("Access denied to this Taluka");
      }
    }

    targetTalukas = [talukaId];
  }
  // 2️⃣ If no specific taluka, but user is restricted (Admin)
  else if (accessibleTalukas && accessibleTalukas.length > 0) {
    targetTalukas = accessibleTalukas;
  }

  // 🔎 Apply Taluka Filter (if any constraints exist)
  if (targetTalukas.length > 0) {
    const complainers = await Complainer.find(
      { taluka: { $in: targetTalukas } },
      { _id: 1 }
    );

    const ids = complainers.map((c) => c._id);

    // If no complainers found for these talukas, return empty
    if (!ids.length) {
      return { data: [], totalRecords: 0 };
    }

    filter.complainer = { $in: ids };
  }

  const skip = (page - 1) * limit;
  const totalRecords = await Complaint.countDocuments(filter);

  const data = await Complaint.find(filter)
    .select("complaintId subject status createdAt")
    .populate({
      path: "complainer",
      select: "name complainerId phone",
      populate: [
        { path: "taluka", select: "name" },
        { path: "village", select: "name" }
      ]
    })
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

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (assigned.length === 0) {
      throw new Error("Not allowed to view this complaint");
    }

    const talukaId = complaint.complainer?.taluka?._id?.toString();
    const allowed = assigned.some(
      (t) => t.toString() === talukaId
    );
    if (!allowed) {
      throw new Error("Not allowed to view this complaint");
    }
  }

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

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (assigned.length === 0) {
      throw new Error("Not allowed for this complainer");
    }
    const talukaId = complainer.taluka?.toString();
    const allowed = assigned.some(
      (t) => t.toString() === talukaId
    );
    if (!allowed) {
      throw new Error("Not allowed for this complainer");
    }
  }

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

  const complaint = await Complaint.findById(id)
    .populate({
      path: "complainer",
      select: "taluka"
    })
    .populate({
      path: "filedBy",
      select: "appUserId"
    });
  if (!complaint) throw new Error("Complaint not found");

  if (!["admin", "superadmin"].includes(req.role)) {
    throw new Error("Only admin or superadmin can update status");
  }

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (assigned.length === 0) {
      throw new Error("Not allowed to update this complaint");
    }
    const talukaId = complaint.complainer?.taluka?.toString();
    const allowed = assigned.some(
      (t) => t.toString() === talukaId
    );
    if (!allowed) {
      throw new Error("Not allowed to update this complaint");
    }
  }

  if (complaint.status === status) {
    throw new Error("Complaint already in this status");
  }

  complaint.status = status;
  complaint.history.push({
    message: `Status updated to ${status}`,
    by: req.user._id,
    byRole: req.role,
    byModel: "Admin",
    timestamp: new Date()
  });

  await complaint.save();

  try {
    await emitComplaintNotification({
      talukaId: complaint.complainer?.taluka,
      appUserId: complaint.filedBy?.appUserId,
      adminEvent: null,
      userEvent: "complaint:status-updated",
      payload: {
        complaintId: complaint._id,
        status: complaint.status,
        updatedByRole: req.role,
        updatedAt: complaint.updatedAt
      }
    });
  } catch (err) {
    console.error("Socket emit failed (complaint:status-updated):", err.message);
  }
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

  if (req.role === "staff") {
    throw new Error("Staff cannot add chat messages");
  }

  if (!message?.trim() && !req.files?.length) {
    throw new Error("Message or media is required");
  }

  const complaint = await Complaint.findById(id)
    .select("history filedBy complainer")
    .populate({
      path: "filedBy",
      select: "appUserId",
    })
    .populate({
      path: "complainer",
      select: "taluka",
    });

  if (!complaint) throw new Error("Complaint not found");

  // 🔐 Permission checks
  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (assigned.length === 0) throw new Error("Not allowed");

    const talukaId = complaint.complainer?.taluka?.toString();
    const allowed = assigned.some((t) => t.toString() === talukaId);
    if (!allowed) throw new Error("Not allowed");
  }

  if (
    req.role === "user" &&
    (complaint.filedBy?._id?.toString() || complaint.filedBy?.toString()) !== req.user._id.toString()
  ) {
    throw new Error("Not allowed");
  }

  /* 📤 Upload chat media */
  let media = [];
  if (req.files?.length) {
    media = await Promise.all(
      req.files.map(async (file) => {
        // 🔐 signature validation
        const ok = validateFileSignature(file);
        if (!ok) throw new Error("File signature mismatch / corrupted file");

        const { type, resource_type } = getMediaTypeAndResource(file.mimetype);

        const upload = await uploadToCloudinary(file.buffer, {
          folder: "complaint-chat",
          resource_type,
        });

        return {
          type,
          url: upload.secure_url,
        };
      })
    );
  }

  complaint.history.push({
    message: message?.trim() || null,
    media,
    by: req.user._id,
    byRole: req.role,
    byModel: req.role === "user" ? "AppUser" : "Admin",
    timestamp: new Date(),
  });

  await complaint.save();

  const latestMessage = complaint.history[complaint.history.length - 1];

  try {
    const isUserSender = req.role === "user";

    await emitComplaintNotification({
      talukaId: complaint.complainer?.taluka,
      appUserId: complaint.filedBy?.appUserId,
      adminEvent: isUserSender ? "complaint:chat:new" : null,
      userEvent: isUserSender ? null : "complaint:chat:new",
      payload: {
        complaintId: complaint._id,
        byRole: latestMessage.byRole,
        message: latestMessage.message || null,
        mediaCount: Array.isArray(latestMessage.media) ? latestMessage.media.length : 0,
        timestamp: latestMessage.timestamp
      }
    });
  } catch (err) {
    console.error("Socket emit failed (complaint:chat:new):", err.message);
  }

  return complaint;
};

/* ===================================================== */
/* ================= GET COMPLAINT CHAT ================= */
/* ===================================================== */
export const getComplaintChatService = async (id, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid complaint id");
  }

  if (req.role === "staff") {
    throw new Error("Staff cannot access complaint chat");
  }

  const complaint = await Complaint.findById(id)
    .select("history filedBy complainer")
    .populate({
      path: "complainer",
      select: "taluka"
    })
    .populate("history.by", "name appUserId");

  if (!complaint) throw new Error("Complaint not found");

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (assigned.length === 0) {
      throw new Error("Not allowed to view this chat");
    }
    const talukaId = complaint.complainer?.taluka?.toString();
    const allowed = assigned.some(
      (t) => t.toString() === talukaId
    );
    if (!allowed) {
      throw new Error("Not allowed to view this chat");
    }
  }

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

/* ===================================================== */
/* =============== GET RECENT COMPLAINTS ================= */
/* ===================================================== */
export const getRecentComplaintsService = async ({ page, limit, accessibleTalukas = null }) => {
  const skip = (page - 1) * limit;

  // Admin with no assigned taluka should see nothing
  if (Array.isArray(accessibleTalukas) && accessibleTalukas.length === 0) {
    return {
      totalRecords: 0,
      stats: {
        total: 0,
        open: 0,
        "in-progress": 0,
        resolved: 0,
        closed: 0
      },
      data: []
    };
  }

  const filter = {};

  // Apply taluka restriction if provided (Admin)
  if (accessibleTalukas && accessibleTalukas.length > 0) {
    const complainers = await Complainer.find(
      { taluka: { $in: accessibleTalukas } },
      { _id: 1 }
    );

    const ids = complainers.map((c) => c._id);

    if (!ids.length) {
      return {
        totalRecords: 0,
        stats: {
          total: 0,
          open: 0,
          "in-progress": 0,
          resolved: 0,
          closed: 0
        },
        data: []
      };
    }

    filter.complainer = { $in: ids };
  }

  /* ================= STATS ================= */
  const statsAggregation = await Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    total: 0,
    open: 0,
    "in-progress": 0,
    resolved: 0,
    closed: 0
  };

  statsAggregation.forEach((item) => {
    stats[item._id] = item.count;
    stats.total += item.count;
  });

  /* ================= DATA ================= */
  const data = await Complaint.find(filter)
    .sort({ createdAt: -1 }) // 🔥 recent first
    .skip(skip)
    .limit(limit)
    .select("complaintId subject status createdAt complainer")
    .populate({
      path: "complainer",
      select: "name phone taluka village",
      populate: [
        { path: "taluka", select: "name" },
        { path: "village", select: "name" }
      ]
    });

  return {
    totalRecords: stats.total,
    stats,
    data
  };
};
