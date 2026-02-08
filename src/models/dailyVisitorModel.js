import mongoose from "mongoose";

const dailyVisitorSchema = new mongoose.Schema(
  {
    dVisitorId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    srNo: {
      type: Number,
      required: true
    },
    dayKey: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: null,
      trim: true
    },
    address: {
      type: String,
      default: null,
      trim: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    remark: {
      type: String,
      default: null,
      trim: true
    },
    visitDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Daily serial uniqueness
dailyVisitorSchema.index({ dayKey: 1, srNo: 1 }, { unique: true });

export default mongoose.model("DailyVisitor", dailyVisitorSchema);
