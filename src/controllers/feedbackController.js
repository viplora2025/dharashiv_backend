import * as feedbackService from "../services/feedbackService.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const createFeedback = async (req, res) => {
  try {
    const result = await feedbackService.createFeedbackService(req.body, req.user);
    sendSuccess(res, {
      status: 201,
      message: "Feedback submitted successfully",
      data: result,
    });
  } catch (err) {
    sendError(res, { status: 400, message: err.message });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const result = await feedbackService.getAllFeedbacksService(req.query);
    sendSuccess(res, { data: result });
  } catch (err) {
    sendError(res, { status: 500, message: err.message });
  }
};
