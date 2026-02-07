import {
  createComplainerService,
  getAllComplainersService,
  getComplainerByIdService,
  getComplainersByAppUserService,
  updateComplainerService,
  deleteComplainerService,
  getComplainersByUserAndTalukaService,
  getComplainersByTalukaService
} from "../services/complainerService.js";
import { parsePageLimit, validateObjectId } from "../utils/queryValidation.js";

// CREATE
export const createComplainer = async (req, res) => {
  try {
    // 🔒 addedBy always from logged-in user
    const addedBy = req.user?._id;

    const complainer = await createComplainerService({
      name: req.body.name,
      phone: req.body.phone,
      taluka: req.body.taluka,
      village: req.body.village,
      addedBy
    });

    res.status(201).json({
      success: true,
      message: "Complainer created successfully",
      data: complainer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// GET ALL
export const getAllComplainers = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    if (req.query.talukaId) {
      validateObjectId(req.query.talukaId, "talukaId");
    }

    let accessibleTalukas = null;

    // 🔒 Admin restriction
    if (req.role === "admin") {
      accessibleTalukas = req.user.assignedTaluka || [];
    }

    const { data, totalRecords } = await getAllComplainersService(
      { ...req.query, page, limit },
      accessibleTalukas
    );

    res.json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// GET ONE
export const getComplainerById = async (req, res) => {
  try {
    const data = await getComplainerByIdService(req.params.id, req);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


// GET BY USER
export const getComplainersByAppUser = async (req, res) => {
  try {
    if (req.role === "user") {
      const requestedId = req.params.userId;
      const myId = req.user?._id?.toString();
      if (!myId || requestedId != myId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const data = await getComplainersByAppUserService(req.params.userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
export const updateComplainer = async (req, res) => {
  try {
    const data = await updateComplainerService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Complainer updated successfully",
      data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// DELETE
export const deleteComplainer = async (req, res) => {
  try {
    await deleteComplainerService(req.params.id);
    res.status(200).json({
      message: "Complainer deleted successfully"
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};



// ==========================
// Get Complainers by User + Taluka 
// ==========================
export const getComplainersByUserAndTaluka = async (req, res) => {
  try {
    const { userId, talukaId } = req.params;

    if (req.role === "user") {
      const myId = req.user?._id?.toString();
      if (!myId || userId != myId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const data = await getComplainersByUserAndTalukaService(
      userId,
      talukaId
    );

    res.status(200).json({
      success: true,
      ...data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};



// ==========================
// Get Complainers by Taluka (with pagination)
// ==========================
export const getComplainersByTaluka = async (req, res) => {
  try {
    const { talukaId } = req.params;

    validateObjectId(talukaId, "talukaId");
    const { page, limit } = parsePageLimit(req.query);

    const data = await getComplainersByTalukaService(
      talukaId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
