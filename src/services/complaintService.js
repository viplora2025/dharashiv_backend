import Complaint from "../models/complaintModel.js";
import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Department from "../models/departmentModel.js";
import mongoose from "mongoose";
import generateComplaintId from "../utils/generateComplaintId.js";
import { storageService } from "./storageService.js";
import { validateFileSignature } from "../utils/fileSignature.js";
import { sendComplaintForwardEmail } from "../utils/email.js";
import { createNotificationService, notifyAdminsService } from "./notificationService.js";
import { addSocketEventJob } from "../queues/notificationQueue.js";


const emitToTalukaAdmins = (talukaId, eventName, payload) => {
  if (!talukaId) return;
  addSocketEventJob(`taluka:${talukaId.toString()}`, eventName, payload);
};

const emitComplaintNotification = async ({
  talukaId,
  appUserId,
  adminEvent,
  userEvent,
  payload,
  persistent = false,
  notificationData = null,
  recipientModel = "AppUser"
}) => {
  if (adminEvent) {
    emitToTalukaAdmins(talukaId, adminEvent, payload);
  }
  if (userEvent && appUserId) {
    addSocketEventJob(`user:${appUserId}`, userEvent, payload);
  }

  // Persistent Notification (Already using queue inside notifyAdminsService / createNotificationService)
  if (persistent && notificationData) {
    try {
      if (recipientModel === "Admin") {
        await notifyAdminsService({
          talukaId,
          ...notificationData
        });
      } else {
        await createNotificationService(notificationData);
      }
    } catch (err) {
      console.error("Failed to queue persistent notification:", err.message);
    }
  }
};



/* ================= CREATE COMPLAINT ================= */
export const createComplaintService = async (req) => {
  const { complainer, department, subject, description, specification } = req.body;

  if (req.role !== "user") {
    throw new Error("Only users can create complaints");
  }

  const hasText = (subject && subject.trim()) || (description && description.trim());
  const hasVoice = !!req.files?.voiceNote?.length;

  if (!hasText && !hasVoice) {
    throw new Error("Either text complaint or voice note is required");
  }

  const filedBy = req.user._id;

  const complainerDoc = await Complainer.findById(complainer);
  if (!complainerDoc) throw new Error("Complainer not found");

  if (complainerDoc.addedBy.toString() !== filedBy.toString()) {
    throw new Error("Access denied to this complainer");
  }

  let uploadedFiles = []; // 🛡️ Tracking for cleanup hooks

  try {
    /* 📤 Upload attachments */
    let media = [];
    if (req.files?.attachments?.length) {
      media = await Promise.all(
        req.files.attachments.map(async (file) => {
          const ok = validateFileSignature(file);
          if (!ok) throw new Error("Corrupted file detected");

          const upload = await storageService.uploadFile(file.buffer, file.mimetype, "complaints/attachments");
          uploadedFiles.push({ publicId: upload.publicId, resourceType: upload.resourceType });

          return { 
            type: upload.type, 
            url: upload.url, 
            publicId: upload.publicId, 
            resourceType: upload.resourceType 
          };
        })
      );
    }

    /* 🎙️ Upload voice note */
    let voiceNote = null;
    if (req.files?.voiceNote?.length) {
      const file = req.files.voiceNote[0];
      const ok = validateFileSignature(file);
      if (!ok) throw new Error("Corrupted voice note detected");

      const upload = await storageService.uploadFile(file.buffer, file.mimetype, "complaints/voice");
      uploadedFiles.push({ publicId: upload.publicId, resourceType: upload.resourceType });

      voiceNote = {
        url: upload.url,
        format: file.mimetype,
        publicId: upload.publicId,
        resourceType: upload.resourceType
      };
    }

    const complaintId = await generateComplaintId(filedBy, complainer);

    const complaint = await Complaint.create({
      complaintId,
      filedBy,
      complainer,
      taluka: complainerDoc.taluka,
      department: department || null,
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
          timestamp: new Date(),
        },
      ],
    });

    // Success! No cleanup needed.
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
        persistent: true,
        recipientModel: "Admin",
        notificationData: {
          title: { 
            en: "New Complaint", 
            mr: "नवीन तक्रार" 
          },
          message: { 
            en: `New complaint ${complaint.complaintId} from ${complainerDoc.name}`, 
            mr: `${complainerDoc.name} कडून नवीन तक्रार ${complaint.complaintId}` 
          },
          type: "complaint_new",
          relatedId: complaint._id
        }
      });
    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }

    return complaint;
  } catch (err) {
    /* 🛡️ FAILURE CLEANUP (Transactional safety for files) */
    console.error("📦 DB/Upload Error - triggering file cleanup hooks...");
    await storageService.deleteMultipleFiles(uploadedFiles);
    throw err;
  }
};

/* ================ GET ALL COMPLAINTS ================= */
export const getAllComplaintsService = async (query, accessibleTalukas = null) => {
  const { status, department, filedBy, talukaId, page = 1, limit = 10 } = query;
  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (filedBy) filter.filedBy = filedBy;

  if (Array.isArray(accessibleTalukas) && accessibleTalukas.length === 0) {
    return { data: [], totalRecords: 0 };
  }

  if (talukaId) {
    if (accessibleTalukas && !accessibleTalukas.some(t => t.toString() === talukaId.toString())) {
      throw new Error("Access denied to this Taluka");
    }
    filter.taluka = talukaId;
  } else if (accessibleTalukas && accessibleTalukas.length > 0) {
    filter.taluka = { $in: accessibleTalukas };
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
    .limit(limit);

  return { data, totalRecords };
};

/* =============== GET COMPLAINT BY ID ================= */
export const getComplaintByIdService = async (id, req) => {
  if (req.role === "staff") throw new Error("Staff access denied to complaints");

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
    .populate({ path: "history.by", select: "name phone appUserId" });

  if (!complaint) throw new Error("Complaint not found");

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (!assigned.some(t => t.toString() === complaint.taluka?.toString())) {
      throw new Error("Access denied to this complaint");
    }
  } else if (req.role === "user") {
    if (complaint.filedBy?._id?.toString() !== req.user._id.toString()) {
      throw new Error("Access denied to this complaint");
    }
  }

  return complaint;
};

/* ========= GET COMPLAINTS BY COMPLAINER =============== */
export const getComplaintsByComplainerService = async (complainerId, req, page, limit) => {
  const complainer = await Complainer.findById(complainerId);
  if (!complainer) throw new Error("Complainer not found");

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (!assigned.some(t => t.toString() === complainer.taluka?.toString())) {
      throw new Error("Access denied for this complainer");
    }
  } else if (req.role === "user") {
    if (complainer.addedBy.toString() !== req.user._id.toString()) {
      throw new Error("Access denied for this complainer");
    }
  }

  const filter = { complainer: complainerId };
  const skip = (page - 1) * limit;
  const [data, totalRecords] = await Promise.all([
    Complaint.find(filter)
      .select("complaintId subject status createdAt")
      .populate("department", "name")
      .populate("filedBy", "name appUserId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

/* =============== UPDATE COMPLAINT STATUS ============== */
export const updateComplaintStatusService = async (id, status, req) => {
  const complaint = await Complaint.findById(id)
    .populate({ path: "complainer", select: "taluka" })
    .populate({ path: "filedBy", select: "appUserId" });

  if (!complaint) throw new Error("Complaint not found");

  if (!["admin", "superadmin"].includes(req.role)) {
    throw new Error("Unauthorized status update");
  }

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (!assigned.some(t => t.toString() === complaint.taluka?.toString())) {
      throw new Error("Access denied for status update");
    }
  }

  if (complaint.status === status) throw new Error("Already in this status");

  complaint.status = status;
  complaint.history.push({
    message: `Status updated to ${status}`,
    by: req.user._id,
    byRole: req.role,
    timestamp: new Date()
  });

  await complaint.save();

  try {
    await emitComplaintNotification({
      talukaId: complaint.taluka,
      appUserId: complaint.filedBy?.appUserId,
      userEvent: "complaint:status-updated",
      payload: {
        complaintId: complaint._id,
        status: complaint.status,
        updatedByRole: req.role,
        updatedAt: complaint.updatedAt
      },
      persistent: true,
      notificationData: {
        recipientId: complaint.filedBy?._id,
        recipientModel: "AppUser",
        title: {

          en: "Complaint Status Updated",
          mr: "तक्रारीची स्थिती अद्ययावत केली"
        },
        message: {
          en: `Your complaint ${complaint.complaintId} status has been updated to ${status}`,
          mr: `तुमच्या तक्रार ${complaint.complaintId} ची स्थिती ${status} वर अद्ययावत केली गेली आहे`
        },
        type: "complaint_status",
        relatedId: complaint._id
      }
    });

  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }
  return complaint;
};

/* ================= PUBLIC TRACKING =================== */
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
    history: complaint.history.map(h => ({
      message: h.message,
      byRole: h.byRole,
      timestamp: h.timestamp
    })),
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt
  };
};

/* ================= USER MY COMPLAINTS ================= */
export const getComplaintsByUserService = async (req, page, limit, status) => {
  const filter = { filedBy: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [data, totalRecords] = await Promise.all([
    Complaint.find(filter)
      .select("complaintId subject status createdAt updatedAt")
      .populate("complainer", "name")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter)
  ]);

  return { data, totalRecords };
};

/* ================= ADD CHAT MESSAGE ================== */
export const addChatMessageService = async (id, req) => {
  if (req.role === "staff") throw new Error("Staff access denied to complaint chat");

  const { message } = req.body;

  if (!message?.trim() && !req.files?.length) throw new Error("Message required");

  const complaint = await Complaint.findById(id)
    .populate({ path: "filedBy", select: "appUserId" });

  if (!complaint) throw new Error("Complaint not found");

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (!assigned.some(t => t.toString() === complaint.taluka?.toString())) {
      throw new Error("Access denied");
    }
  } else if (req.role === "user") {
    if (complaint.filedBy?._id?.toString() !== req.user._id.toString()) {
      throw new Error("Access denied");
    }
  }

  let uploadedFiles = []; // 🛡️ Tracking for cleanup hooks

  try {
    let media = [];
    if (req.files?.length) {
      media = await Promise.all(
        req.files.map(async (file) => {
          const ok = validateFileSignature(file);
          if (!ok) throw new Error("Corrupted file");

          const upload = await storageService.uploadFile(file.buffer, file.mimetype, "complaint-chat");
          uploadedFiles.push({ publicId: upload.publicId, resourceType: upload.resourceType });

          return { 
            type: upload.type, 
            url: upload.url, 
            publicId: upload.publicId, 
            resourceType: upload.resourceType 
          };
        })
      );
    }

    complaint.history.push({
      message: message?.trim() || null,
      media,
      by: req.user._id,
      byRole: req.role,
      timestamp: new Date(),
    });

    await complaint.save();
    const latestMessage = complaint.history[complaint.history.length - 1];

    try {
      const isUserSender = req.role === "user";
      await emitComplaintNotification({
        talukaId: complaint.taluka,
        appUserId: complaint.filedBy?.appUserId,
        adminEvent: isUserSender ? "complaint:chat:new" : null,
        userEvent: isUserSender ? null : "complaint:chat:new",
        payload: {
          complaintId: complaint._id,
          byRole: latestMessage.byRole,
          message: latestMessage.message || null,
          media: latestMessage.media || [],
          timestamp: latestMessage.timestamp
        },
        persistent: true,
        recipientModel: isUserSender ? "Admin" : "AppUser",
        notificationData: {
          recipientId: isUserSender ? null : complaint.filedBy?._id,
          recipientModel: isUserSender ? "Admin" : "AppUser",
          title: {
            en: isUserSender ? "New Message from User" : "New Message from Admin",
            mr: isUserSender ? "वापरकर्त्याकडून नवीन संदेश" : "प्रशासकाकडून नवीन संदेश"
          },
          message: {
            en: `New message on complaint ${complaint.complaintId}`,
            mr: `तक्रार ${complaint.complaintId} वर नवीन संदेश`
          },
          type: "complaint_chat",
          relatedId: complaint._id
        }
      });


    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }
    return complaint;
  } catch (err) {
    /* 🛡️ FAILURE CLEANUP (Transactional safety for files) */
    console.error("📦 DB/Upload Error in Chat - triggering file cleanup hooks...");
    await storageService.deleteMultipleFiles(uploadedFiles);
    throw err;
  }
};

/* ================= GET COMPLAINT CHAT ================= */
export const getComplaintChatService = async (id, req) => {
  if (req.role === "staff") throw new Error("Staff access denied to complaint chat");

  const complaint = await Complaint.findById(id)
    .populate("history.by", "name phone appUserId adminId");

  if (!complaint) throw new Error("Complaint not found");

  if (req.role === "admin") {
    const assigned = req.user.assignedTaluka || [];
    if (!assigned.some(t => t.toString() === complaint.taluka?.toString())) {
      throw new Error("Access denied");
    }
  } else if (req.role === "user") {
    if (complaint.filedBy.toString() !== req.user._id.toString()) {
      throw new Error("Access denied");
    }
  }

  return complaint.history.map(h => ({
    message: h.message || null,
    media: h.media || [],
    byRole: h.byRole,
    by: h.by ? { _id: h.by._id, name: h.by.name || "System" } : null,
    timestamp: h.timestamp
  }));
};

/* =============== GET RECENT COMPLAINTS ================= */
export const getRecentComplaintsService = async ({ page, limit, accessibleTalukas = null }) => {
  const filter = {};
  if (Array.isArray(accessibleTalukas) && accessibleTalukas.length === 0) {
    return { totalRecords: 0, stats: { total: 0, open: 0, "in-progress": 0, resolved: 0, closed: 0 }, data: [] };
  }

  if (accessibleTalukas && accessibleTalukas.length > 0) {
    filter.taluka = { $in: accessibleTalukas };
  }

  const statsAggregation = await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const stats = { total: 0, open: 0, "in-progress": 0, resolved: 0, closed: 0 };
  statsAggregation.forEach(item => {
    stats[item._id] = item.count;
    stats.total += item.count;
  });

  const data = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
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

  return { totalRecords: stats.total, stats, data };
};

/* ================= FORWARD TO DEPT ================== */
export const forwardComplaintToDeptService = async (id, req) => {
  if (!["admin", "superadmin"].includes(req.role)) {
    throw new Error("Unauthorized forwarding");
  }

  const complaint = await Complaint.findById(id)
    .populate({
      path: "complainer",
      select: "name phone",
      populate: [
        { path: "taluka", select: "name" },
        { path: "village", select: "name" }
      ]
    })
    .populate("department", "name email")
    .populate("filedBy", "appUserId");

  if (!complaint) throw new Error("Complaint not found");
  if (!complaint.department) throw new Error("This complaint has no department assigned");
  if (!complaint.department.email) throw new Error("Department has no email address configured");

  // Send the email
  await sendComplaintForwardEmail({
    to: complaint.department.email,
    complaint,
    departmentName: complaint.department.name.en // Preferred English name for email
  });

  const deptNameEn = complaint.department.name.en;
  const deptNameMr = complaint.department.name.mr;

  const chatMessage = `Your complaint has been forwarded to ${deptNameEn} for further action.\nतुमची तक्रार पुढील कार्यवाहीसाठी "${deptNameMr}" कडे पाठवण्यात आली आहे.`;

  // 1. Internal Audit Log
  complaint.history.push({
    message: `System Audit: Forwarded to department email: ${complaint.department.email}`,
    by: req.user._id,
    byRole: req.role,
    timestamp: new Date()
  });

  // 2. User-Facing Chat Message
  complaint.history.push({
    message: chatMessage,
    by: req.user._id,
    byRole: req.role,
    timestamp: new Date()
  });

  await complaint.save();

  // 3. Socket.io Notification (Real-time update for User)
  try {
    const latestMessage = complaint.history[complaint.history.length - 1];
    await emitComplaintNotification({
      talukaId: complaint.taluka,
      appUserId: complaint.filedBy?.appUserId,
      userEvent: "complaint:chat:new",
      payload: {
        complaintId: complaint._id,
        byRole: req.role,
        message: chatMessage,
        media: [],
        timestamp: latestMessage.timestamp
      }
    });
  } catch (err) {
    console.error("Socket emit failed in forwarding:", err.message);
  }

  return { message: "Forwarded successfully", email: complaint.department.email };
};
