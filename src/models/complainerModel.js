import mongoose from "mongoose";

const complainerSchema = new mongoose.Schema(
  {
    complainerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,        // 🔒 mandatory
      trim: true
    },

    taluka: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taluka",
      required: true
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      immutable: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Complainer", complainerSchema);
