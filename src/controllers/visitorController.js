// src/controllers/visitorController.js

import * as visitorService from "../services/visitorService.js";
import { sendSuccess } from "../utils/response.js";

export const registerVisitor = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      appUser: req.role === "user" ? req.user._id : null,
      registeredBy: req.role === "admin" || req.role === "superadmin" ? req.user._id : null,
    };

    const visitor = req.role === "user" 
      ? await visitorService.registerVisitorOnlineService(data)
      : await visitorService.registerVisitorOfflineService(data);

    sendSuccess(res, {
      status: 201,
      message: "Visitor registered successfully",
      data: visitor
    });
  } catch (err) {
    next(err);
  }
};

export const getVisitorsByEvent = async (req, res, next) => {
  try {
    const visitors = await visitorService.getVisitorsByEventService(req.params.eventId);
    sendSuccess(res, { data: visitors });
  } catch (err) {
    next(err);
  }
};

export const getVisitorsByAppUser = async (req, res, next) => {
  try {
    const visitors = await visitorService.getVisitorsByAppUserService(req.user._id);
    sendSuccess(res, { data: visitors });
  } catch (err) {
    next(err);
  }
};

export const getVisitorById = async (req, res, next) => {
  try {
    const visitor = await visitorService.getVisitorByIdService(req.params.id);
    sendSuccess(res, { data: visitor });
  } catch (err) {
    next(err);
  }
};

export const deleteVisitor = async (req, res, next) => {
  try {
    await visitorService.deleteVisitorService(req.params.id);
    sendSuccess(res, { message: "Visitor deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const updateVisitorStatus = async (req, res, next) => {
  try {
    const visitor = await visitorService.updateVisitorStatusService(
      req.params.id,
      req.body.status
    );
    sendSuccess(res, { message: "Status updated successfully", data: visitor });
  } catch (err) {
    next(err);
  }
};
