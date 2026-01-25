import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Counter from "../models/counterModel.js";

const generateComplaintId = async (filedByMongoId, complainerMongoId) => {
  const user = await AppUser.findById(filedByMongoId).select("appUserId");
  const complainer = await Complainer.findById(complainerMongoId).select("complainerId");

  if (!user || !complainer) {
    throw new Error("Invalid AppUser or Complainer");
  }

  const userPart = user.appUserId.slice(-4);
  const compPart = complainer.complainerId.slice(-4);

  const counter = await Counter.findOneAndUpdate(
    { _id: "complaintId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.seq.toString().padStart(3, "0");
  return `CMP-${userPart}-${compPart}-${seq}`;
};

export default generateComplaintId;
