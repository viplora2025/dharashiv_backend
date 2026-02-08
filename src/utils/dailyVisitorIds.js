import Counter from "../models/counterModel.js";

export const generateDailyVisitorId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "dailyVisitorId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(6, "0");
  return `DV${padded}`;
};

export const generateDailyVisitorSrNo = async (dayKey) => {
  const counter = await Counter.findByIdAndUpdate(
    `dailyVisitorSrNo:${dayKey}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};
