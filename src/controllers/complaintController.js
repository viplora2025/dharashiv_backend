import {
  createComplaintService,
  getAllComplaintsService,
  getComplaintByIdService,
  getComplaintsByComplainerService,
  updateComplaintStatusService,
  trackComplaintService,
  getComplaintsByUserService,
  addChatMessageService,
  getComplaintChatService
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
    const { data, totalRecords } = await getAllComplaintsService(req.query);
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



// import Complaint from "../models/complaintModel.js";
// import AppUser from "../models/appUserModel.js";
// import Complainer from "../models/complainerModel.js";
// import Counter from "../models/counterModel.js";
// import Admin from "../models/adminModel.js";
// import cloudinary from "../config/cloudinary.js";
// import mongoose from "mongoose";
// /* ================= GENERATE COMPLAINT ID ================= */
// /*
//  Format: CMP-{USER_LAST4}-{COMPLAINER_LAST4}-{SEQ}
//  Example: CMP-0123-0456-001
// */
// const generateComplaintId = async (filedByMongoId, complainerMongoId) => {
//   const user = await AppUser.findById(filedByMongoId).select("appUserId");
//   const complainer = await Complainer.findById(complainerMongoId).select("complainerId");

//   if (!user || !complainer) {
//     throw new Error("Invalid AppUser or Complainer");
//   }

//   const userPart = user.appUserId.slice(-4);
//   const compPart = complainer.complainerId.slice(-4);

//   const counter = await Counter.findOneAndUpdate(
//     { _id: "complaintId" },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   const seq = counter.seq.toString().padStart(3, "0");

//   return `CMP-${userPart}-${compPart}-${seq}`;
// };


// /* ================= CREATE COMPLAINT (APP USER) ================= */

// export const createComplaint = async (req, res) => {
//   try {
//     const {
//       complainer,
//       department,
//       subject,
//       description,
//       specification
//     } = req.body;

//     if (!complainer || !department || !subject || !description) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields missing"
//       });
//     }

//     const filedBy = req.user._id;

//     /* 🔐 Validate complainer ownership */
//     const complainerDoc = await Complainer.findById(complainer);
//     if (!complainerDoc) {
//       return res.status(404).json({
//         success: false,
//         message: "Complainer not found"
//       });
//     }

//     if (complainerDoc.addedBy.toString() !== filedBy.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "You cannot use this complainer"
//       });
//     }

//     /* 📤 Upload media (parallel) */
//     let media = [];

//     if (req.files?.length) {
//       media = await Promise.all(
//         req.files.map(async (file) => {
//           let type = "image";
//           let resourceType = "image";

//           if (file.mimetype.startsWith("video/")) {
//             type = "video";
//             resourceType = "auto";
//           } else if (file.mimetype.startsWith("audio/")) {
//             type = "audio";
//             resourceType = "auto";
//           } else if (file.mimetype === "application/pdf") {
//             type = "pdf";
//             resourceType = "raw";
//           }

//           const uploadResult = await cloudinary.uploader.upload(
//             `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
//             {
//               folder: "complaints",
//               resource_type: resourceType
//             }
//           );

//           return {
//             type,
//             url: uploadResult.secure_url
//           };
//         })
//       );
//     }

//     /* 🆔 Generate complaint id */
//     const complaintId = await generateComplaintId(filedBy, complainer);

//     /* 📝 Create complaint */
//     const complaint = await Complaint.create({
//       complaintId,
//       filedBy,
//       complainer,
//       department,
//       specification,
//       subject,
//       description,
//       media,
//       history: [
//         {
//           message: "Complaint registered",
//           by: filedBy,
//           byRole: "user",
//           timestamp: new Date()
//         }
//       ]
//     });

//     res.status(201).json({
//       success: true,
//       message: "Complaint created successfully",
//       complaintId: complaint._id
//     });

//   } catch (err) {
//     console.error("Create complaint error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


// ////Change here for taluka??//
// /* ================= GET ALL COMPLAINTS (ADMIN / SUPERADMIN) ================= */
// export const getAllComplaints = async (req, res) => {
//   try {
//     const {
//       status,
//       department,
//       filedBy,
//       talukaId,
//       page = 1,
//       limit = 10
//     } = req.query;

//     const filter = {};

//     if (status) filter.status = status;
//     if (department) filter.department = department;
//     if (filedBy) filter.filedBy = filedBy;

//     /* 🔥 Taluka-wise filter */
//     if (talukaId) {
//       if (!mongoose.Types.ObjectId.isValid(talukaId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid talukaId"
//         });
//       }

//       const complainers = await Complainer.find(
//         { taluka: talukaId },
//         { _id: 1 }
//       );

//       const complainerIds = complainers.map(c => c._id);

//       // If no complainers → no complaints
//       if (complainerIds.length === 0) {
//         return res.json({
//           success: true,
//           page: Number(page),
//           limit: Number(limit),
//           totalRecords: 0,
//           totalPages: 0,
//           data: []
//         });
//       }

//       filter.complainer = { $in: complainerIds };
//     }

//     const skip = (page - 1) * limit;

//     /* 🔢 Total count */
//     const totalRecords = await Complaint.countDocuments(filter);

//     /* 📦 Fetch complaints */
//    const complaints = await Complaint.find(filter)
//   .select("complaintId subject status createdAt")
//   .populate("complainer", "name")
//   .populate("department", "name")
//   .sort({ createdAt: -1 })
//   .skip(skip)
//   .limit(limit);


//     res.json({
//       success: true,
//       page: Number(page),
//       limit: Number(limit),
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / limit),
//       data: complaints
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


// /* ================= GET SINGLE COMPLAINT ================= */
// export const getComplaintById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid complaint id"
//       });
//     }

//     const complaint = await Complaint.findById(id)
//       // ❌ select mat lagao, full doc chahiye (media + history.media)
//       .populate("filedBy", "name phone appUserId")
//       .populate({
//         path: "complainer",
//         select: "name complainerId phone",
//         populate: [
//           { path: "taluka", select: "name" },
//           { path: "village", select: "name" }
//         ]
//       })
//       .populate("department", "name")
//       .populate({
//         path: "history.by",
//         select: "name phone appUserId"
//       });

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found"
//       });
//     }

//     /* 🔐 ACCESS CONTROL */
//     if (req.role === "user") {
//       if (complaint.filedBy._id.toString() !== req.user._id.toString()) {
//         return res.status(403).json({
//           success: false,
//           message: "Not allowed to view this complaint"
//         });
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         _id: complaint._id,
//         complaintId: complaint.complaintId,

//         subject: complaint.subject,
//         description: complaint.description,
//         specification: complaint.specification,
//         status: complaint.status,

//         // 📎 MAIN COMPLAINT MEDIA
//         media: complaint.media || [],

//         filedBy: complaint.filedBy,
//         complainer: complaint.complainer,
//         department: complaint.department,

//         // 💬 CHAT WITH MEDIA
//         history: complaint.history.map(h => ({
//           message: h.message || null,
//           media: h.media || [],
//           by: h.by,
//           byRole: h.byRole,
//           timestamp: h.timestamp
//         })),

//         createdAt: complaint.createdAt,
//         updatedAt: complaint.updatedAt
//       }
//     });

//   } catch (err) {
//     console.error("Get complaint by id error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


// export const getComplaintsByComplainer = async (req, res) => {
//   try {
//     const { complainerId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     // 🔍 Check complainer
//     const complainer = await Complainer.findById(complainerId);
//     if (!complainer) {
//       return res.status(404).json({
//         success: false,
//         message: "Complainer not found"
//       });
//     }

//     // 🔐 Ownership check
//     if (
//       req.role === "user" &&
//       complainer.addedBy.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Not allowed for this complainer"
//       });
//     }

//     const filter = { complainer: complainerId };
//     const skip = (page - 1) * limit;

//     // 🔢 Count
//     const totalRecords = await Complaint.countDocuments(filter);

//     // 📦 Lightweight list data
//     const complaints = await Complaint.find(filter)
//       .select("complaintId subject status createdAt") // 🔥 LIMITED FIELDS
//       .populate("department", "name")
//       .populate("filedBy", "name appUserId")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       page: Number(page),
//       limit: Number(limit),
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / limit),
//       data: complaints
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };






// /* ================= UPDATE STATUS / ADD MESSAGE (ADMIN) ================= */
// export const updateComplaintStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     /* ✅ Validate input */
//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: "Status is required"
//       });
//     }

//     const allowedStatuses = ["open", "in-progress", "resolved", "closed"];
//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value"
//       });
//     }

//     /* 🔍 Find complaint */
//     const complaint = await Complaint.findById(id);
//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found"
//       });
//     }

//     /* 🔐 Role check */
//     if (req.role !== "admin" && req.role !== "superadmin") {
//       return res.status(403).json({
//         success: false,
//         message: "Only admin or superadmin can update status"
//       });
//     }

//     /* 🚫 Avoid unnecessary update */
//     if (complaint.status === status) {
//       return res.status(400).json({
//         success: false,
//         message: "Complaint already in this status"
//       });
//     }

//     /* 🔄 Update status */
//     complaint.status = status;

//     /* 🧾 Add history entry */
//     complaint.history.push({
//       message: `Status updated to ${status}`,
//       by: req.user._id,
//       byRole: req.role,
//       timestamp: new Date()
//     });

//     await complaint.save();

//     return res.json({
//       success: true,
//       message: "Complaint status updated successfully",
//       data: {
//         complaintId: complaint._id,
//         status: complaint.status
//       }
//     });

//   } catch (err) {
//     console.error("Update complaint status error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };



// /* ================= PUBLIC TRACKING (NO LOGIN) ================= */

// export const trackComplaint = async (req, res) => {
//   try {
//     const { complaintId } = req.params;

//     if (!complaintId) {
//       return res.status(400).json({
//         success: false,
//         message: "Complaint ID is required"
//       });
//     }

//     const complaint = await Complaint.findOne({ complaintId })
//       .select(
//         "complaintId status subject department history createdAt updatedAt"
//       )
//       .populate("department", "name");

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found"
//       });
//     }

//     /* 🔒 PUBLIC-SAFE HISTORY (read-only, no sender details) */
//     const publicHistory = complaint.history.map(h => ({
//       message: h.message,
//       byRole: h.byRole,     // user / admin (no name)
//       timestamp: h.timestamp
//     }));

//     res.json({
//       success: true,
//       data: {
//         complaintId: complaint.complaintId,
//         subject: complaint.subject,
//         status: complaint.status,
//         department: complaint.department,
//         history: publicHistory,
//         createdAt: complaint.createdAt,
//         updatedAt: complaint.updatedAt
//       }
//     });

//   } catch (err) {
//     console.error("Track complaint error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong"
//     });
//   }
// };


// /* ================= USER: MY COMPLAINTS ================= */
// export const getComplaintsByAppUser = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       status
//     } = req.query;

//     const filter = {
//       filedBy: req.user._id
//     };

//     // Optional status filter
//     if (status) {
//       filter.status = status;
//     }

//     const skip = (page - 1) * limit;

//     // Total count
//     const totalRecords = await Complaint.countDocuments(filter);

//     // Lightweight list data
//     const complaints = await Complaint.find(filter)
//       .select("complaintId subject status createdAt updatedAt")
//       .populate("complainer", "name")
//       .populate("department", "name")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       page: Number(page),
//       limit: Number(limit),
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / limit),
//       data: complaints
//     });

//   } catch (err) {
//     console.error("Get complaints by app user error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch complaints"
//     });
//   }
// };


// export const addChatMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { message } = req.body;

//     // ❗ At least message OR media required
//     if (!message?.trim() && !req.files?.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Message or media is required"
//       });
//     }

//     const complaint = await Complaint.findById(id)
//       .select("history filedBy");

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found"
//       });
//     }

//     // 🔐 Permission check
//     if (
//       req.role === "user" &&
//       complaint.filedBy.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Not allowed to chat on this complaint"
//       });
//     }

//     /* 📤 Upload media (optional) */
//     let media = [];

//     if (req.files?.length) {
//       media = await Promise.all(
//         req.files.map(async (file) => {
//           let type = "image";
//           let resourceType = "image";

//           if (file.mimetype.startsWith("video/")) {
//             type = "video";
//             resourceType = "auto";
//           } else if (file.mimetype.startsWith("audio/")) {
//             type = "audio";
//             resourceType = "auto";
//           } else if (file.mimetype === "application/pdf") {
//             type = "pdf";
//             resourceType = "raw";
//           }

//           const uploadResult = await cloudinary.uploader.upload(
//             `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
//             {
//               folder: "complaint-chat",
//               resource_type: resourceType
//             }
//           );

//           return {
//             type,
//             url: uploadResult.secure_url
//           };
//         })
//       );
//     }

//     // 📝 Push chat message
//     complaint.history.push({
//       message: message?.trim() || null,
//       media,
//       by: req.user._id,
//       byRole: req.role,
//       timestamp: new Date()
//     });

//     await complaint.save();

//     res.json({
//       success: true,
//       message: "Message sent successfully"
//     });

//   } catch (err) {
//     console.error("Add chat message error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// export const getComplaintChat = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid complaint id"
//       });
//     }

//     const complaint = await Complaint.findById(id)
//       .select("history filedBy")
//       .populate({
//         path: "history.by",
//         select: "name appUserId"
//       });

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found"
//       });
//     }

//     if (
//       req.role === "user" &&
//       complaint.filedBy.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Not allowed to view this chat"
//       });
//     }

//     const chat = complaint.history.map(h => ({
//       message: h.message || null,
//       media: h.media || [],
//       byRole: h.byRole,
//       by: h.by ? {
//         _id: h.by._id,
//         name: h.by.name || "Admin"
//       } : null,
//       timestamp: h.timestamp
//     }));

//     res.json({
//       success: true,
//       data: chat
//     });

//   } catch (err) {
//     console.error("Get complaint chat error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };
