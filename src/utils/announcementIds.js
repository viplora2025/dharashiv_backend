import Counter from "../models/counterModel.js";

export const generateAnnouncementId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "announcementId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(6, "0");
  return `ANN${padded}`;
};
