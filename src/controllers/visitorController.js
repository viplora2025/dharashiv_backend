import {
  registerVisitorOnlineService,
  registerVisitorOfflineService,
  getVisitorsByEventService,
  getVisitorsByAppUserService,
  getVisitorByIdService,
  updateVisitorStatusService
} from "../services/visitorService.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* =========================
   REGISTER VISITOR
========================= */
export const registerVisitor = async (req, res) => {
  try {
    let visitor;

    // 🟢 ONLINE (AppUser)
    if (req.role === "user") {
      visitor = await registerVisitorOnlineService({
        ...req.body,
        appUser: req.user._id
      });
    }

    // 🔵 OFFLINE (Admin)
    else if (req.role === "admin" || req.role === "superadmin" || req.role === "staff") {
      visitor = await registerVisitorOfflineService({
        ...req.body,
        registeredBy: req.user._id
      });
    } else {
      throw new Error("Unauthorized role");
    }

    sendSuccess(res, {
      status: 201,
      message: "Visitor registered successfully",
      data: visitor
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* =========================
   GET VISITORS BY EVENT
========================= */
export const getVisitorsByEvent = async (req, res) => {
  try {
    const visitors = await getVisitorsByEventService(req.params.eventId);

    sendSuccess(res, {
      count: visitors.length,
      data: visitors
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* =========================
   GET VISITORS BY APP USER
========================= */
export const getVisitorsByAppUser = async (req, res) => {
  try {
    const visitors = await getVisitorsByAppUserService(req.user._id);

    sendSuccess(res, {
      count: visitors.length,
      data: visitors
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};

/* =========================
   GET VISITOR BY ID
========================= */
export const getVisitorById = async (req, res) => {
  try {
    const visitor = await getVisitorByIdService(req.params.id);

    sendSuccess(res, { data: visitor });
  } catch (error) {
    sendError(res, { status: 404, message: error.message });
  }
};



export const updateVisitorStatus = async (req, res) => {
  try {
    // Only admin / superadmin should reach here (route protected)
    const { status } = req.body;

    if (!status) {
      throw new Error("status is required");
    }

    const visitor = await updateVisitorStatusService(
      req.params.id,
      status
    );

    sendSuccess(res, {
      message: "Visitor status updated successfully",
      data: visitor
    });
  } catch (error) {
    sendError(res, { status: 400, message: error.message });
  }
};
