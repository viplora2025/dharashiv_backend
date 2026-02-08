import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true
    },

    complainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainer",
      required: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    specification: {
      type: String,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    /* 📎 Complaint media (initial attachments) */
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "pdf", "audio"]
        },
        url: {
          type: String
        }
      }
    ],

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open"
    },

    /* ================= CHAT / HISTORY ================= */
    history: [
      {
        message: {
          type: String,
          trim: true   // ❗ no longer required
        },

        media: [
          {
            type: {
              type: String,
              enum: ["image", "video", "pdf", "audio"]
            },
            url: {
              type: String
            }
          }
        ],

        by: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "history.byModel"
        },

        byRole: {
          type: String,
          enum: ["user", "admin", "superadmin"],
          required: true
        },

        byModel: {
          type: String,
          enum: ["AppUser", "Admin"],
          default: function () {
            return this.byRole === "user" ? "AppUser" : "Admin";
          }
        },

        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
