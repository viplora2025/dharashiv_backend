import mongoose from "mongoose";

export const parsePageLimit = (query) => {
  const pageRaw = query.page ?? "1";
  const limitRaw = query.limit ?? "10";

  const page = Number(pageRaw);
  const limit = Number(limitRaw);

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Invalid page");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Invalid limit");
  }

  return { page, limit };
};

export const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }
};

export const validateComplaintStatus = (status) => {
  const allowed = ["open", "in-progress", "resolved", "closed"];
  if (!allowed.includes(status)) {
    throw new Error("Invalid status");
  }
};
