import dotenv from "dotenv";
import mongoose from "mongoose";
import Complaint from "../src/models/complaintModel.js";

dotenv.config();

const run = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set");
  }

  await mongoose.connect(process.env.MONGO_URL, {
    bufferCommands: false
  });

  const complaints = await Complaint.find(
    { "history.byModel": { $exists: false } },
    { history: 1 }
  );

  let updatedCount = 0;

  for (const complaint of complaints) {
    let changed = false;

    for (const entry of complaint.history) {
      if (!entry.byModel) {
        entry.byModel = entry.byRole === "user" ? "AppUser" : "Admin";
        changed = true;
      }
    }

    if (changed) {
      await complaint.save();
      updatedCount += 1;
    }
  }

  console.log(`Backfilled byModel for ${updatedCount} complaints`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Backfill failed:", err.message);
  process.exit(1);
});
