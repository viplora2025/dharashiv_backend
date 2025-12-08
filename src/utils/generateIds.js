import Counter from "../models/counterModel.js";

export async function generateAppUserId() {
  const counter = await Counter.findByIdAndUpdate(
    "appUserId",           // counter key name
    { $inc: { seq: 1 } }, // increase sequence
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(7, "0");
  return `A${padded}`;   // Example => A0000001
}

// ==========================
// Generate Taluka ID
// ==========================
export async function generateTalukaId() {
  const counter = await Counter.findByIdAndUpdate(
    "talukaId",               // unique key for taluka
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(3, "0");
  return `TLK${padded}`;  // TLK001
}

export async function generateVillageId() {
  const counter = await Counter.findByIdAndUpdate(
    "villageId",               // unique key for village
    { $inc: { seq: 1 } },      // increment sequence
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(4, "0"); // 4 digits → 0001, 0002...
  return `VLG${padded}`;  // Example → VLG0001
}

// =============================
// Generate Department ID
// =============================
export const generateDepartmentId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "departmentId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNum = counter.seq.toString().padStart(4, "0");
  return `DEP${seqNum}`;
};

// =============================
// Generate Complainer ID
// =============================
export const generateComplainerId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "complainerId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNum = counter.seq.toString().padStart(4, "0");
  return `COMP${seqNum}`;
};

// =============================
// Generate SubDepartment ID
// =============================
export const generateSubDeptId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "subDeptId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seqNum = counter.seq.toString().padStart(4, "0");
  return `SUB${seqNum}`;
};
