import Feedback from "../models/feedbackModel.js";
import { generateFeedbackId } from "../utils/generateIds.js";

export const createFeedbackService = async (data, user) => {
  const { subject, message } = data;

  if (!subject?.trim() || !message?.trim()) {
    throw new Error("Subject and message are required");
  }

  const feedbackId = await generateFeedbackId();

  return await Feedback.create({
    appUser: user._id,
    appUserId: user.appUserId,
    feedbackId,
    subject: subject.trim(),
    message: message.trim(),
  });
};

export const getAllFeedbacksService = async ({ page = 1, limit = 20, search = "" } = {}) => {
  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 20;

  const filter = {};
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { subject: regex },
      { message: regex },
      { appUserId: regex },
    ];
  }

  const [total, feedbacks] = await Promise.all([
    Feedback.countDocuments(filter),
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate("appUser", "name phone appUserId"),
  ]);

  return {
    feedbacks,
    meta: {
      page: pageNumber,
      limit: pageSize,
      total,
    },
  };
};
