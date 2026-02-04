import Counter from "../models/counterModel.js";
import Department from "../models/departmentModel.js";
import Event from "../models/eventModel.js";  

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
// export const generateDepartmentId = async () => {
//   const counter = await Counter.findByIdAndUpdate(
//     "departmentId",
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   const seqNum = counter.seq.toString().padStart(4, "0");
//   return `DEP${seqNum}`;
// };

export const generateDepartmentId = async () => {
  // Increment counter
  let counter = await Counter.findByIdAndUpdate(
    "departmentId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  let deptId = "DEP" + counter.seq.toString().padStart(4, "0");

  // Check if ID already exists
  const exists = await Department.findOne({ deptId }).lean();

  if (!exists) return deptId;

  console.warn(`⚠️ Duplicate detected for ${deptId} — resyncing counter...`);

  // ===== AUTO-FIX: resync counter with DB max deptId =====
  const lastDept = await Department.findOne().sort({ deptId: -1 }).lean();

  const lastSeq = lastDept
    ? parseInt(lastDept.deptId.replace("DEP", ""))
    : 0;

  // Update counter to correct value
  counter = await Counter.findByIdAndUpdate(
    "departmentId",
    { seq: lastSeq + 1 },
    { new: true, upsert: true }
  );

  deptId = "DEP" + counter.seq.toString().padStart(4, "0");

  console.log(`🔧 Counter auto-fixed → Next ID ${deptId}`);

  return deptId;
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




export async function generateAdminId() {
  const counter = await Counter.findByIdAndUpdate(
    "adminId",            // counter key
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(6, "0");
  return `ADM${padded}`; // Example => ADM000001
}


// =============================
// Generate Event ID
// Format: EVT0001
// =============================
export const generateEventId = async () => {
  let counter = await Counter.findByIdAndUpdate(
    "eventId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  let eventId = "EVT" + counter.seq.toString().padStart(6, "0");

  // Safety check (rare case)
  const exists = await Event.findOne({ eventId }).lean();
  if (!exists) return eventId;

  console.warn(`⚠️ Duplicate detected for ${eventId}, resyncing...`);

  // Auto-fix counter from DB
  const lastEvent = await Event.findOne().sort({ eventId: -1 }).lean();
  const lastSeq = lastEvent
    ? parseInt(lastEvent.eventId.replace("EVT", ""))
    : 0;

  counter = await Counter.findByIdAndUpdate(
    "eventId",
    { seq: lastSeq + 1 },
    { new: true, upsert: true }
  );

  eventId = "EVT" + counter.seq.toString().padStart(4, "0");

  return eventId;
};