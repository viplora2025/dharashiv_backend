import mongoose from "mongoose";

const complainerSchema = new mongoose.Schema(
  {
    complainerId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: null
    },
    taluka: {
      type: String,
      required: true
    },
    village: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Complainer", complainerSchema);
